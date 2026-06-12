# CLAUDE.md — Prabigya's research notebook portfolio

## What this project is

A personal site for an AI researcher/engineer, built as a **research notebook with a machine-readable layer**. Two audiences, one source of truth:

1. **Humans** get a quiet, typographically serious site: publications with personal margin notes, a markdown blog ("the notebook"), CV, now page, colophon.
2. **AI agents** get the same content as structured data: an MCP server, `llms.txt`, JSON endpoints, and markdown versions of every page.

Three signature features live on top: a **live lab telemetry strip** (what's training on my workstation right now), an **agent guestbook** (AI agents that connect via MCP can sign it), and an **agent eval leaderboard** (a 10-question personal benchmark agents can attempt; scores are public).

## Non-negotiable principles

- **Single source of truth.** All content lives in `content/` as YAML + markdown. The website, the MCP server, the JSON API, the CV PDF, and llms.txt are all *renderings* of the same files. Never duplicate content into a component or the worker.
- **Static-first, server-rendered.** The current site is a client-rendered SPA that is invisible to crawlers and agents — this rebuild exists partly to fix that. Every page must render meaningful HTML with JavaScript disabled. JS is allowed only for progressive enhancement (telemetry polling, ask-box, keyboard nav, theme toggle).
- **Restraint is the design.** No hero animations, no cards with shadows, no parallax, no gradients. If a feature needs visual flair to feel cool, it is the wrong feature. Read `.claude/skills/notebook-design/SKILL.md` before writing any CSS or page layout.
- **Placeholders are loud.** You do not know Prabigya's real publications, bio, or research focus. Wherever real personal content is needed, insert clearly marked `TODO(prabigya): ...` placeholders with realistic *structure* but obviously fake text (e.g. "Paper title goes here"). Never invent plausible-sounding papers, affiliations, or biography — fake-but-plausible is worse than obviously-fake.
- **The machine layer is a first-class product.** Treat the MCP server and JSON API with the same care as the visible site: versioned schemas, helpful error messages, rate limits.

## Tech stack (decided — don't relitigate)

| Layer | Choice | Notes |
|---|---|---|
| Site | **Astro 5**, static output, MDX | Content collections for blog + data |
| Styling | **Vanilla CSS** with custom properties | No Tailwind, no UI kit. Tokens in `src/styles/tokens.css` |
| Math / code | remark-math + rehype-katex; Astro's built-in Shiki | KaTeX CSS self-hosted |
| Search | **Pagefind** (build-time, client-side) | |
| Dynamic backend | **One Cloudflare Worker** using **Hono** | Serves `/mcp`, `/api/*`, telemetry ingest, ask-box |
| MCP | `@modelcontextprotocol/sdk`, **Streamable HTTP** transport at `/mcp` | |
| Storage | **Cloudflare D1** (guestbook, leaderboard, eval attempts) + **KV** (telemetry latest-state, rate limiting) | |
| Ask-box LLM | Anthropic API from the worker; key as a Worker secret | Hard rate limits; see agent-layer skill |
| CV PDF | **Typst** template compiled at build time from `content/cv.yaml` | Fallback: Playwright print-to-PDF if Typst is unavailable in CI |
| OG images | astro-og-canvas (or satori) at build time | One per page/post |
| Hosting | Cloudflare Pages (site) + Workers (backend), deployed via `wrangler` | Custom domain: prabigya.com.np |

Monorepo layout:

```
/
├── CLAUDE.md
├── todo.md
├── content/                  # SINGLE SOURCE OF TRUTH
│   ├── publications.yaml
│   ├── cv.yaml
│   ├── now.yaml
│   ├── site.yaml              # name, tagline, links, MCP blurb
│   ├── eval/questions.yaml    # the 10-question agent benchmark (answers NOT in repo — see skill)
│   └── notebook/              # blog posts, *.md / *.mdx
├── site/                     # Astro app
│   ├── src/pages/ ...
│   ├── src/styles/tokens.css
│   └── public/llms.txt        # generated at build, do not hand-edit
├── worker/                   # Cloudflare Worker (Hono + MCP)
│   ├── src/index.ts
│   ├── src/mcp.ts
│   ├── src/guestbook.ts  src/evalrunner.ts  src/telemetry.ts  src/askbox.ts
│   ├── schema.sql             # D1 schema
│   └── wrangler.toml
├── lab-agent/                 # tiny script that runs on the workstation
│   └── report.py              # polls nvidia-smi + training logs, POSTs to worker
└── scripts/                   # build helpers (llms.txt gen, typst build, og images)
```

## Skills — read before working

- `.claude/skills/notebook-design/SKILL.md` — the full visual system (type, color, margin notes, dark "lamplight" mode). **Read before any HTML/CSS work.**
- `.claude/skills/content-schema/SKILL.md` — exact YAML/frontmatter schemas and the rules for keeping site/MCP/API in sync. **Read before touching anything in `content/` or any code that consumes it.**
- `.claude/skills/mcp-and-agent-layer/SKILL.md` — MCP tools, guestbook, eval leaderboard, telemetry protocol, ask-box, and all the security/abuse rules. **Read before touching `worker/` or `lab-agent/`.**

## Commands

```bash
# site
cd site && npm run dev          # local dev
cd site && npm run build        # builds site, llms.txt, og images, pagefind index, CV pdf
# worker
cd worker && npx wrangler dev   # local worker (binds D1 + KV locally)
cd worker && npx wrangler deploy
cd worker && npx wrangler d1 execute portfolio --file=schema.sql
# checks — run before declaring any task done
cd site && npm run check        # astro check + tsc
cd worker && npm test           # vitest for tool handlers + scoring
```

## Definition of done (every feature)

1. Works with JavaScript disabled, or degrades to something sensible (telemetry strip shows last-known JSON rendered at build; ask-box shows a mailto fallback).
2. Looks correct in both paper (light) and lamplight (dark) mode.
3. Readable at 360px wide; margin notes collapse per the design skill.
4. Any new content type is exposed in **all four** machine surfaces: page HTML, `.md` twin, `/api/*.json`, MCP tool. The content-schema skill has the checklist.
5. `npm run check` and worker tests pass.
6. No real-sounding fabricated personal facts anywhere.

## Things you must NOT do

- Do not add a CMS, database for content, React/Vue islands for static content, or any analytics that requires a cookie banner.
- Do not commit secrets. Worker secrets via `wrangler secret put` (`ANTHROPIC_API_KEY`, `TELEMETRY_TOKEN`, `EVAL_ANSWERS` or answer-hash salt).
- Do not let the ask-box or MCP server return anything not derived from `content/` (no open-ended chat).
- Do not deploy DNS changes; stop and ask the user before anything that affects the live domain.
