# syntax=docker/dockerfile:1
#
# Builds the Astro site (static) and serves it with nginx.
#
# Build context MUST be the repo root: the site build reads ../content
# (see site/src/lib/content.ts) and runs scripts/build-llms.ts as a prebuild step.
#
#   docker build -t portfolio-site --build-arg SITE_URL=https://prabigya.com.np .

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Manifests first: this layer is cached until dependencies actually change.
# All workspace manifests are needed for `npm ci` to validate the lockfile.
COPY package.json package-lock.json ./
COPY site/package.json    site/package.json
COPY shared/package.json  shared/package.json
COPY worker/package.json  worker/package.json

# Only the site workspace + root devDeps (tsx, used by the prebuild step).
# Skips wrangler/vitest, which have no place in a static build.
RUN npm ci --workspace @portfolio/site --include-workspace-root --no-audit --no-fund

# content/ is the single source of truth — the site renders from it directly.
COPY content ./content
COPY scripts ./scripts
COPY site    ./site

# Baked into the build: canonical URLs, sitemap, RSS, llms.txt.
ARG SITE_URL=https://prabigya.com.np
ENV SITE_URL=${SITE_URL}

RUN npm run build --workspace @portfolio/site

# ── Stage 2: serve ────────────────────────────────────────────────────────────
# Named `production` because that is the build target Dokploy passes by default.
FROM nginx:1.27-alpine AS production

# Origin of the Cloudflare Worker that backs the dynamic routes
# (/mcp, /api/ask, guestbook, leaderboard, eval, live telemetry).
# Override per-environment in Dokploy. No trailing slash.
ENV WORKER_ORIGIN=https://portfolio-worker.workers.dev
# Restrict envsubst to our own variable so nginx's $uri/$host survive untouched.
ENV NGINX_ENVSUBST_FILTER=WORKER_ORIGIN

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/site/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
