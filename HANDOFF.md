# HANDOFF.md — what Prabigya needs to fill in before launch

This file is derived from `TODO(prabigya)` markers in the codebase.
Run `PROD_GUARD=1 npx tsx scripts/check-invariants.ts` to see all blockers.

---

## Content (required before any page looks real)

All content lives in `content/`. Edit these files directly — the site, API, MCP, and llms.txt all rebuild from them.

### content/site.yaml
- **line 2** — `tagline`: one humble sentence about your research focus
- **line 3** — `location`: city / country (e.g. "Kathmandu, Nepal")
- **line 5** — `links.github`: your GitHub username (no @, no URL — just the handle)
- **line 6** — `links.scholar`: your Google Scholar profile URL
- **line 7** — `links.email`: your email address (also used in ask-box fallback mailto)
- **line 8** — `links.linkedin`: your LinkedIn username
- **line 12** — `research_threads[0].name`: your primary research theme (e.g. "efficient transformers")
- **line 13** — `research_threads[0].blurb`: 1–2 sentences in your voice describing the theme

### content/publications.yaml
Replace both placeholder entries with your real publications. Each entry needs:
- `id`, `title`, `authors`, `venue`, `year`, `thread`, `selected`, `summary`, `abstract`, `backstory`, `links`, `bibtex`
See the schema at `.claude/skills/content-schema/SKILL.md`.

### content/now.yaml
- `working_on`: list of current projects (appears on homepage)
- `reading`: list of current reads
- `open_to`: collaborations or roles you're open to

### content/cv.yaml
Replace placeholder education, positions, skills, service, and awards entries with your real CV data.

### content/eval/questions.yaml
Replace both placeholder questions with 10 real questions drawn from your research domain.
**Answers must NOT go in this file** — they go in the `EVAL_ANSWERS` worker secret (see below).
Keep one `exact` type and one `judged` type as examples; add more as needed.

### content/notebook/hello-notebook.md
- **line 10** — Replace placeholder post body with your real first notebook post.

### site/src/pages/research.astro
- **line 13** — Brief framing of your research approach (1–2 sentences in your voice).

### site/src/pages/colophon.astro
- **Margin note "source"** — Add link to your public GitHub repo once it's public.
- **Margin note "email"** — Add your real email address.

### site/src/components/AskBox.astro
- **line 7** — Replace `TODO(prabigya)@example.com` in the form `action` attribute with your real email.

### worker/src/askbox.ts
- **lines 97, 170, 188, 227, 268** — Replace `TODO(prabigya)@example.com` in `mailto` fields with your real email. These appear in the ask-box error messages when the API budget is exceeded.

---

## Secrets (required before deploying the worker)

Set all of these via `wrangler secret put <NAME>` — **never put them in wrangler.toml or the repo**.

| Secret | How to get it |
|---|---|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) — set a hard spend cap on the key |
| `TELEMETRY_TOKEN` | Any random secret string; also set as `TELEMETRY_TOKEN` in `lab-agent/.env` |
| `EVAL_ANSWERS` | JSON object: `{"q01":{"answer":"exact-answer"},"q02":{"rubric":"judged rubric text"},...}` — 10 entries matching eval/questions.yaml IDs |
| `ADMIN_TOKEN` | Any random secret; used to approve/reject guestbook entries at `/admin/guestbook` |
| `IP_SALT` | Any random secret string; used to hash IP addresses for rate limiting |

---

## Deploy steps

1. **Create D1 database:**
   ```bash
   cd worker && wrangler d1 create portfolio
   ```
   Copy the `database_id` from the output and update `wrangler.toml`.

2. **Create KV namespace:**
   ```bash
   cd worker && wrangler kv:namespace create KV
   ```
   Copy the `id` from the output and update `wrangler.toml`.

3. **Apply database schema:**
   ```bash
   cd worker && wrangler d1 execute portfolio --file=schema.sql
   ```

4. **Set all secrets:**
   ```bash
   wrangler secret put ANTHROPIC_API_KEY
   wrangler secret put TELEMETRY_TOKEN
   wrangler secret put EVAL_ANSWERS
   wrangler secret put ADMIN_TOKEN
   wrangler secret put IP_SALT
   ```

5. **Deploy the worker:**
   ```bash
   cd worker && npm run bundle-content && wrangler deploy
   ```

6. **Build and deploy the site:**
   ```bash
   cd site && npm run build
   npx wrangler pages deploy dist
   ```

7. **Install lab-agent on your workstation** (see `lab-agent/README.md`).

8. **STOP — ask before touching DNS.** Do not change DNS records until you have confirmed the site and worker are serving correctly at the Cloudflare Pages / Workers URLs.

---

## Verifying the machine layer

After deploy, check:
- `https://your-worker.workers.dev/health` → `{"status":"ok"}`
- `https://your-worker.workers.dev/api/lab.json` → `{"status":"idle",...}`
- MCP connect: `claude mcp add prabigya https://your-worker.workers.dev/mcp`
- Ask-box: POST `https://your-worker.workers.dev/api/ask` with `{"question":"what are your research interests?"}`
