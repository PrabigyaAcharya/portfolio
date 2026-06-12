# todo.md — build plan

Work the phases in order; each ends with a checkpoint that must pass before moving on. Read the relevant skill (`.claude/skills/*/SKILL.md`) before starting any phase — CLAUDE.md says which. Anything marked `TODO(prabigya)` is content only the human can supply; build around placeholders and keep a running list of them in `HANDOFF.md`.

## Phase 0 — Scaffold
- [ ] Init monorepo per CLAUDE.md layout: `site/` (Astro 5 + MDX, static output), `worker/` (Hono + MCP SDK + wrangler), `shared/` (zod schemas), `scripts/`, `content/`, `lab-agent/`
- [ ] `shared/schema.ts`: zod schemas for site, publications, now, cv, eval questions (content-schema skill has the shapes)
- [ ] Seed `content/` with placeholder files that validate (2 fake publications, 2 fake posts, now/cv/site yaml) — obviously fake text, `TODO(prabigya)` everywhere
- [ ] CI-style check scripts: `npm run check` in site, vitest in worker, content validation script
- [ ] **Checkpoint:** `astro dev` serves an unstyled page listing validated content; all checks pass

## Phase 1 — Design system
- [ ] `tokens.css` exactly per notebook-design skill (paper + lamplight); self-host Newsreader + IBM Plex Mono
- [ ] Base layout component: page grid with margin column, header (name + mono nav), footer (theme toggle, MCP line), hairline rules
- [ ] Theme: inline pre-paint script, `paper / lamplight` toggle, `prefers-color-scheme` fallback, reduced-motion support
- [ ] Responsive collapse of margin column at 820px
- [ ] **Checkpoint:** screenshot both themes at 1280px and 360px; run the design skill's self-check list

## Phase 2 — Core pages
- [ ] `/` homepage: intro, mono "now:" line, selected work (flagged in publications.yaml), recent notebook entries, MCP footer
- [ ] `/research`: publications grouped by year, thread filter (CSS `:target` or tiny JS), full entry component (summary, `<details>` abstract, bibtex copy, margin backstory)
- [ ] `/now`, `/cv` (HTML from cv.yaml), `/colophon` (stub copy for now), custom 404
- [ ] CV PDF: Typst template + `scripts/build-cv.ts`, linked from `/cv`
- [ ] **Checkpoint:** every page renders with JS disabled; both themes pass contrast

## Phase 3 — The notebook (blog)
- [ ] Content collection for `content/notebook/`; post page with KaTeX (only when `math: true`), Shiki dual-theme code blocks, image+caption handling
- [ ] Footnotes → margin sidenotes (rehype plugin + alignment JS enhancement + `<details>` mobile fallback) — the hard one, budget time
- [ ] Index with tag filters, reading time, "last tended" stamps; RSS + sitemap
- [ ] Pagefind search wired to `/` keypress; `j`/`k`/`Enter` list navigation
- [ ] **Checkpoint:** publish a real test post exercising math, code, figures, and 3+ sidenotes; verify sidenote alignment and mobile collapse

## Phase 4 — Machine surfaces (static half)
- [ ] `.md` twin endpoints for every page (`/research.md`, `/notebook/[slug].md`, …)
- [ ] Build-time JSON: `/api/publications.json`, `notebook.json`, `now.json`, `cv.json`, `site.json` with `schema_version`
- [ ] `scripts/build-llms.ts` → `/llms.txt`; OG image generation per page/post
- [ ] Sync invariant tests from the content-schema skill (incl. `PROD_GUARD` TODO check)
- [ ] **Checkpoint:** `curl` every machine surface; llms.txt links all resolve

## Phase 5 — Worker + MCP server
- [ ] Worker scaffold: Hono routing, D1 (`schema.sql`), KV bindings, secrets documented in `worker/README`
- [ ] Content bundling step (content/ → worker via shared schemas)
- [ ] MCP server at `/mcp` (Streamable HTTP) with the read-only tools: list/get publications, search_my_work, notebook tools, get_cv/now/bio, get_lab_status
- [ ] **Checkpoint:** connect from Claude Desktop/Code via `claude mcp add` against `wrangler dev`; every tool returns sane output and helpful errors on bad input

## Phase 6 — Agent features
- [ ] Guestbook: D1 table, `sign_guestbook`/`get_guestbook` tools, validation + rate limits, moderation endpoint + admin script, `/colophon` (or `/agents`) ledger rendering
- [ ] Eval: questions.yaml, scoring engine (exact/numeric/judged) reading `EVAL_ANSWERS` secret, `take_eval`/`submit_eval`/`get_leaderboard`, attempt limits, public leaderboard table
- [ ] Telemetry: `/ingest/lab` (bearer auth, zod, staleness→idle), KV ring buffer for sparkline, `/api/lab.json`, `lab-agent/report.py` + README (cron setup, public-run_name warning), homepage strip (build snapshot + 60s polling)
- [ ] Worker test suite per the agent-layer skill's list
- [ ] **Checkpoint:** end-to-end demo of all three with `wrangler dev` + a fake `report.py` payload; sign the guestbook from a real MCP client

## Phase 7 — Ask-this-notebook
- [ ] Keyword retrieval over bundled content (shared with search_my_work)
- [ ] `/api/ask`: grounded prompt with delimited user input, haiku-class model, 400 token cap, per-IP + global rate limits, friendly over-budget message
- [ ] Frontend ask-box per design skill (ruled-line input, serif answer, mono source citations, mailto fallback when JS off or budget exceeded)
- [ ] Prompt-injection and limit tests
- [ ] **Checkpoint:** ask 10 varied questions; verify grounding (it must decline things not in content/), citations, and rate limiting

## Phase 8 — Polish & hardening
- [ ] Colophon final copy: how the site works, MCP connect instructions, keyboard shortcuts, privacy posture (hashed IPs, no analytics), leaderboard honesty note
- [ ] Accessibility pass: focus order, skip link, sidenote semantics (`role="doc-footnote"` / aria), alt text audit, contrast in both themes
- [ ] Performance: font subsetting, zero JS on content pages except declared enhancements, Lighthouse ≥ 95 across the board
- [ ] Security pass: re-read the agent-layer skill's threat model and verify every rule is implemented; secrets audit
- [ ] **Checkpoint:** full build green with `PROD_GUARD=1` failing on remaining TODOs → produce `HANDOFF.md` listing every `TODO(prabigya)` with file/line

## Phase 9 — Launch (human in the loop)
- [ ] Prabigya fills real content (publications, cv, now, bio, eval questions+answers secret, 2–3 starter posts)
- [ ] Deploy worker (`wrangler deploy`, set all secrets) and site (Cloudflare Pages); staging URL review in both themes
- [ ] Install `report.py` on the workstation; confirm live telemetry
- [ ] **STOP — ask before touching DNS.** Then: point prabigya.com.np, verify /mcp, llms.txt, RSS on the live domain, submit sitemap
- [ ] Post-launch smoke test: connect via MCP from a fresh machine, sign the guestbook, submit one eval attempt, ask the ask-box one question
