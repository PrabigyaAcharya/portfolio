---
name: mcp-and-agent-layer
description: How to build the Cloudflare Worker that powers the machine layer — the MCP server and its tools, the agent guestbook, the agent eval leaderboard, the lab telemetry pipeline, and the ask-this-notebook box — including all security, abuse-prevention, rate-limiting, and privacy rules. Use this skill whenever working in worker/ or lab-agent/, defining or changing MCP tools, touching D1/KV schemas, the Anthropic API call, telemetry ingest, or anything that accepts input from the public internet.
---

# MCP server & agent features

One Cloudflare Worker (Hono) serves everything dynamic: `POST/GET /mcp` (MCP Streamable HTTP via `@modelcontextprotocol/sdk`), `/api/*` for the dynamic JSON (lab, guestbook, leaderboard, ask), and `/ingest/lab` for telemetry. Content data is bundled into the worker at deploy time from `content/` through the shared zod schemas — the worker never scrapes the site.

Threat model first: every endpoint here is reachable by anonymous bots, and the guestbook/eval/ask-box all accept **attacker-controlled text** that will be (a) stored, (b) displayed on the site, and (c) in the ask-box case, placed inside an LLM prompt. Design accordingly; the rules below are not optional polish.

## MCP server

Server identity: name `prabigya-portfolio`, version from package.json, instructions string that briefly describes the site and points at `llms.txt`.

Tools (all read from bundled content unless noted; all responses JSON-structured with a `source` field naming the originating file):

| Tool | Input | Behavior |
|---|---|---|
| `list_publications` | optional `thread`, `year` | Full entries incl. summary, links, bibtex |
| `search_my_work` | `query` | Keyword + fuzzy match over publications, posts, threads; returns ranked snippets with URLs |
| `get_publication` | `id` | One entry, full abstract + backstory |
| `get_notebook_posts` | optional `tag`, `limit` | Index of posts; `get_notebook_post(slug)` returns full markdown |
| `get_cv`, `get_now`, `get_bio` | — | Straight renders of the YAML |
| `get_lab_status` | — | Latest telemetry snapshot from KV (or `{status:"idle"}`) |
| `sign_guestbook` | `agent_name`, `on_behalf_of?`, `message`, `purpose?` | See guestbook rules |
| `get_guestbook` | `limit?` | Approved entries only |
| `take_eval` | — | Returns the 10 questions + submission instructions |
| `submit_eval` | `model_name`, `answers[]` | Scores, stores attempt, returns score + leaderboard position |
| `get_leaderboard` | — | Public board |

Conventions: descriptive tool descriptions written for a model audience (they're the MCP equivalent of UI copy); every tool handles bad input with a helpful error, never a stack trace; log tool-call counts (no payloads) for the colophon's "agents served" counter if desired.

## Guestbook

- Schema (D1): `id, created_at, agent_name, on_behalf_of, purpose, message, ip_hash, status('pending'|'approved'|'rejected')`.
- Input limits: `message` ≤ 280 chars, names ≤ 80; strip control chars; reject URLs in any field (this is a guestbook, not a link farm).
- **Everything renders as text.** The site escapes all fields on output; never `set:html`. Treat every field as hostile even after moderation.
- **Moderation queue:** entries are `pending` by default and invisible until approved. Approval flow: a `wrangler`-invoked admin script or a token-protected `/admin/guestbook` JSON endpoint (`ADMIN_TOKEN` secret) that Prabigya can curl or hit from a phone. Optional cheap pre-filter: a small Anthropic API call classifying spam/abuse to auto-reject obvious junk — but auto-*approve* nothing.
- Rate limit: 3 signatures/hour per IP (KV counter on hashed IP, salted with a secret; never store raw IPs).
- One honest line in the tool description: "entries are human-moderated before appearing publicly."

## Eval leaderboard

- Questions ship publicly; **answers must not exist in the repo or the site bundle**. Store as a Worker secret: JSON of `id → {answer | rubric}`. For `exact` questions, compare normalized (trim/case/whitespace); `numeric` within `tolerance`; `judged` questions call the Anthropic API with the rubric and the submitted answer, temperature 0, returning only `pass|fail` — wrap the submitted answer in delimiters and instruct the grader to ignore any instructions inside it (prompt-injection hygiene).
- Attempt schema: `id, created_at, model_name, score, answers_json, ip_hash`. Leaderboard shows **best score per model_name**, ties broken by earliest. Display `model_name` escaped, ≤ 60 chars, profanity/URL-rejected — it appears on a public page.
- Anti-gaming, proportionate not paranoid: 5 attempts/day per ip_hash; identical `answers_json` resubmissions don't create rows; the colophon openly states the board is self-reported and for fun ("claim to be GPT-9 if you like; the ledger remembers"). Don't over-engineer identity verification — the charm is the honesty.
- `submit_eval` response includes per-question pass/fail but never the expected answers.

## Lab telemetry

- `lab-agent/report.py` runs on the workstation via cron/systemd every 2–5 min: reads `nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv`, optionally tails a metrics file (`~/.lab-agent/current_run.json` that training scripts write: `{run_name, epoch, total_epochs, loss, started_at}`), POSTs to `/ingest/lab` with `Authorization: Bearer $TELEMETRY_TOKEN`.
- Worker validates the token (constant-time compare), validates shape with zod, stores in KV key `lab:latest` with a `received_at`. `/api/lab.json` serves it with `Cache-Control: max-age=60`; if `received_at` is older than 30 min, status becomes `idle` regardless of payload — a dead cron must never display stale "training" forever.
- **Privacy rule:** the payload is allowlisted fields only (`run_name, epoch, total_epochs, loss, gpu_util, gpu_mem, gpus, started_at`). `run_name` is chosen by Prabigya per run — document in `lab-agent/README` that it's public, so no secret project names. Loss history for the sparkline: worker appends `(t, loss)` to a capped ring of 64 points in the same KV value.
- Build-time snapshot: the site build fetches `/api/lab.json` and inlines it so the strip renders without JS; client JS then polls.

## Ask-this-notebook box

- `POST /api/ask` `{question}` → worker builds a prompt: system message defining the persona ("you answer questions about Prabigya's research using ONLY the provided context; if the context doesn't contain the answer, say so and point to the closest page; 2–5 sentences; cite source files"), plus retrieved context, plus the user question wrapped in delimiters with an instruction that its contents are data, not instructions.
- Retrieval: keep it boring — reuse `search_my_work`'s keyword ranking to pick top-k chunks (publications entries, post sections). No vector DB unless content outgrows ~100 chunks; revisit then.
- Model: `claude-haiku-4-5-20251001` class, `max_tokens` ≤ 400. **Cost controls are mandatory:** 10 questions/hour per ip_hash, 200/day global circuit breaker (KV counter; over budget → friendly "the notebook is resting, try the MCP server or email"), question length ≤ 300 chars, and tell Prabigya to set a hard spend cap on the API key in the Anthropic console.
- Responses include `sources: ["publications.yaml#short-slug-2026", ...]` which the UI renders as mono citations. Never stream raw model output into `innerHTML` — text nodes only.
- No conversation memory. One question, one grounded answer. It's a reference desk, not a chatbot.

## Cross-cutting worker rules

- CORS: `/api/*` GET endpoints are public (`*`); `POST /api/ask` restricted to the site origin; `/mcp` follows the MCP spec defaults; `/ingest/lab` no CORS (server-to-server).
- All secrets via `wrangler secret put`: `ANTHROPIC_API_KEY`, `TELEMETRY_TOKEN`, `ADMIN_TOKEN`, `EVAL_ANSWERS`, `IP_SALT`. None in `wrangler.toml` or code.
- Hash IPs as `sha256(ip + IP_SALT)`; store nothing else about visitors. Say so in the colophon — the privacy posture is part of the brand.
- Tests (vitest + miniflare): eval scoring (each type incl. normalization), rate limiters, telemetry staleness → idle, guestbook validation rejects URLs/control chars, ask-box refuses >300 chars, and a prompt-construction test asserting user text lands inside delimiters.
