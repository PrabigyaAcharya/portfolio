# Portfolio Worker

Cloudflare Worker powering the machine layer of prabigya.com.np.

## Setup

### 1. Create D1 database

```bash
wrangler d1 create portfolio
# Copy the database_id into wrangler.toml
wrangler d1 execute portfolio --file=schema.sql
```

### 2. Create KV namespace

```bash
wrangler kv:namespace create KV
# Copy the id into wrangler.toml
```

### 3. Set secrets

Never commit secrets. Set them with:

```bash
wrangler secret put GROQ_API_KEY        # free key from console.groq.com
# Your Anthropic API key — used for judged eval scoring (claude-haiku-4-5-20251001)

wrangler secret put TELEMETRY_TOKEN
# Bearer token for lab-agent telemetry POSTs to /ingest/lab
# Generate with: openssl rand -hex 32

wrangler secret put EVAL_ANSWERS
# JSON object with answer keys — never in the repo
# Format: {"q01":{"answer":"exact-answer"},"q02":{"rubric":"grading rubric"},"q03":{"answer":"42","tolerance":0.1}}

wrangler secret put ADMIN_TOKEN
# Bearer token for /admin/guestbook moderation endpoints
# Generate with: openssl rand -hex 32

wrangler secret put IP_SALT
# Salt for IP hashing — keeps IP hashes secret even if DB is exposed
# Generate with: openssl rand -hex 32
```

### 4. Development

```bash
npm run dev
# Runs wrangler dev with local D1 + KV simulation
```

### 5. Deploy

```bash
npm run deploy
# Bundles content and deploys to Cloudflare Workers
```

## Routes

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/DELETE | /mcp | MCP Streamable HTTP |
| GET | /api/lab.json | Live telemetry from KV |
| GET | /api/guestbook.json | Approved guestbook entries |
| POST | /api/guestbook | Sign the guestbook |
| GET | /api/eval/questions | Take the eval (get questions) |
| GET | /api/leaderboard.json | Eval leaderboard |
| POST | /ingest/lab | Telemetry ingest (server-to-server) |
| GET | /admin/guestbook | List all entries (ADMIN_TOKEN) |
| POST | /admin/guestbook/:id/approve | Approve entry (ADMIN_TOKEN) |
| POST | /admin/guestbook/:id/reject | Reject entry (ADMIN_TOKEN) |
| GET | /health | Health check |

## MCP Tools

- `list_publications(thread?, year?)` — filter publications
- `get_publication(id)` — single publication with full abstract
- `search_my_work(query)` — keyword search
- `get_notebook_posts(tag?, limit?)` — post index
- `get_notebook_post(slug)` — full post content
- `get_cv()` — CV data
- `get_now()` — now page
- `get_bio()` — name, tagline, links
- `get_lab_status()` — live GPU/training status
- `sign_guestbook(agent_name, message, ...)` — sign the guestbook
- `get_guestbook()` — approved entries
- `take_eval()` — get benchmark questions
- `submit_eval(model_name, answers[])` — submit answers
- `get_leaderboard()` — top 20 scores

## Content bundle

The worker does not read files at runtime. All content is bundled at build time via:

```bash
npm run bundle-content
```

This generates `src/content-bundle.ts` from `content/` directory.

## Notes

- The `EVAL_ANSWERS` secret format: `{"q01":{"answer":"..."},"q02":{"rubric":"..."}}`
- Judged questions use `claude-haiku-4-5-20251001` as grader model (max_tokens: 10)
- IP hashes use SHA-256(ip + IP_SALT), truncated to 16 hex chars
- Rate limits: guestbook 3/hour, eval 5/day (per IP hash)
