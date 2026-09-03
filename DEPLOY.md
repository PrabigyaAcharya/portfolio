# Deploying — Dokploy (site) + Cloudflare (worker)

The site and the machine layer deploy to two different places, and only one of
them is containerized:

| Piece | Where it runs | How it deploys |
|---|---|---|
| `site/` — the static Astro build | **Docker container on your VPS, via Dokploy** | Dokploy builds `Dockerfile` from this repo |
| `worker/` — MCP, guestbook, eval, ask-box, telemetry | **Cloudflare Workers** (unchanged) | `wrangler deploy`, from GitHub Actions |
| `lab-agent/` | your workstation | unchanged — POSTs to the worker |

The worker is deliberately **not** dockerized: it is bound to Cloudflare D1 and
KV (`worker/wrangler.toml`), which have no self-hosted equivalent. Moving it
into a container would mean replacing both datastores. It keeps deploying to
Cloudflare exactly as before.

Because the site no longer sits behind Cloudflare Pages, nginx inside the
container reverse-proxies the dynamic paths to the worker, so the browser and
MCP clients still see a single origin (`https://prabigya.com.np/mcp`, as
`content/site.yaml` advertises). Proxied paths: `/mcp`, `/api/ask`,
`/api/guestbook*`, `/api/eval*`, `/api/leaderboard.json`, `/api/lab.json`.
Everything else is served straight off disk.

## Files added

```
Dockerfile                    # multi-stage: node build → nginx serve
docker/nginx.conf.template    # ${WORKER_ORIGIN} substituted at container start
.dockerignore
docker-compose.yml            # local verification (and optional Dokploy compose mode)
```

The build context is the **repo root**, not `site/` — the site build reads
`content/` (`site/src/lib/content.ts`) and generates `llms.txt` via
`scripts/build-llms.ts` before `astro build`.

## Verify locally first

```bash
docker compose up --build          # → http://localhost:8080
```

Check: the home page renders, `/research.md` comes back as markdown,
`/api/publications.json` is served from disk, and `/api/lab.json` falls back to
the build-time snapshot when the worker is unreachable.

Or without compose:

```bash
docker build -t portfolio-site --build-arg SITE_URL=https://prabigya.com.np .
docker run --rm -p 8080:80 -e WORKER_ORIGIN=https://<your-worker>.workers.dev portfolio-site
```

## Dokploy setup

1. **Project → Create Application.** Name it `portfolio-site`.
2. **Provider → GitHub**, pick this repo, branch `main`.
   Enable *Auto Deploy* if you want every push to redeploy (see CI note below).
3. **Build Type → `Dockerfile`.**
   - Dockerfile path: `Dockerfile`
   - Build context / path: `.` (the repo root — important, see above)
4. **Build arguments:**

   | Name | Value |
   |---|---|
   | `SITE_URL` | `https://prabigya.com.np` |

   This is baked in at build time (canonical URLs, sitemap, RSS, `llms.txt`), so
   changing it requires a rebuild, not a restart.
5. **Environment variables:**

   | Name | Value |
   |---|---|
   | `WORKER_ORIGIN` | `https://<your-worker>.workers.dev` (no trailing slash) |

   Get the exact hostname from `npx wrangler deployments list` in `worker/`, or
   the Cloudflare dashboard. If you'd rather use a custom subdomain
   (`https://api.prabigya.com.np`), point `WORKER_ORIGIN` at that instead.
6. **Domains → Add domain:**
   - Host: `prabigya.com.np` (add `www.prabigya.com.np` too if you want it)
   - Container port: **80**
   - HTTPS: on, certificate provider **Let's Encrypt**
7. **Deploy.** First build takes a few minutes (`npm ci` + Astro); later builds
   reuse the dependency layer as long as no manifest changed.

### DNS

I have not touched DNS. For Dokploy to issue a certificate, `prabigya.com.np`
must have an **A record pointing at the VPS**. If the record currently points at
your old static host or is proxied through Cloudflare (orange cloud), update it
yourself — and if you keep the Cloudflare proxy on, set SSL/TLS mode to **Full
(strict)** so Traefik's certificate is accepted.

### CI

`.github/workflows/deploy.yml` now:
- still runs `astro check` + worker tests on every push to `main`,
- still deploys the worker to Cloudflare,
- replaces the old `scp site/dist → VPS` job with a Dokploy deploy trigger.

If you set a repository secret `DOKPLOY_DEPLOY_WEBHOOK` (Dokploy →
Application → Deployments → Webhook URL), the deploy only fires **after** checks
pass. Without the secret the job is a no-op and Dokploy's own auto-deploy on
push takes over — in which case a red build still deploys, so prefer the
webhook and leave Dokploy auto-deploy off.

The old `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` / `VPS_PORT` secrets are no
longer used and can be deleted.

## One caveat worth knowing

The worker rate-limits per client IP via `CF-Connecting-IP`
(`worker/src/index.ts:172`, `worker/src/guestbook.ts:156`). With nginx proxying,
Cloudflare sees **your VPS** as the client, so every visitor now shares one
rate-limit bucket — the ask-box and guestbook limits become global instead of
per-user.

Two ways to fix it, whenever you want:
- have the worker prefer `X-Forwarded-For` when the request carries a shared
  secret header that only your nginx sets, or
- point the browser at the worker's own hostname instead of proxying (CORS is
  already configured for `https://prabigya.com.np`) — but then the advertised
  MCP endpoint in `content/site.yaml` has to change too.

Say the word and I'll wire up the first one.
