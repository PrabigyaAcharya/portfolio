---
name: content-schema
description: The exact schemas for everything in content/ (publications.yaml, cv.yaml, now.yaml, site.yaml, eval questions, notebook posts) and the synchronization rules that keep the website, MCP server, JSON API, llms.txt, and CV PDF rendering from the same files. Use this skill whenever creating or editing files in content/, writing any code that reads content (Astro pages, worker tools, build scripts), adding a new content type or field, or generating the markdown/JSON/llms.txt machine surfaces.
---

# Content schemas & sync rules

Everything user-visible derives from `content/`. If you find yourself hardcoding a publication title in a component or a worker handler, you are making a mistake — add it to the schema instead.

Validate all YAML with **zod** schemas defined once in a shared package (`shared/schema.ts`) imported by *both* the Astro site and the worker. The build fails loudly on invalid content. Never let the two sides define their own types for the same data.

All personal facts are placeholders until Prabigya fills them in. Use `TODO(prabigya)` markers and structurally-realistic but obviously fake values ("Paper title goes here", year `0000` is invalid — use a real-shaped year with a TODO comment). Never invent plausible papers, venues, or biography.

## `content/site.yaml`

```yaml
name: "Prabigya Acharya"
tagline: "TODO(prabigya): one humble sentence about your research"
location: "TODO(prabigya)"
links: { github: "...", scholar: "...", email: "...", linkedin: "..." }   # all TODO
mcp_endpoint: "https://prabigya.com.np/mcp"
research_threads:            # used to group /research and power search_my_work
  - id: thread-1
    name: "TODO(prabigya): research theme"
    blurb: "TODO(prabigya): 1–2 sentences in your voice"
```

## `content/publications.yaml`

A list, newest first. Fields:

```yaml
- id: short-slug-2026            # stable forever; used in URLs, BibTeX key, MCP
  title: "TODO(prabigya)"
  authors: ["P. Acharya", "TODO Coauthor"]   # exact display order
  venue: "TODO(prabigya): venue / workshop / preprint"
  year: 2026
  thread: thread-1                # must match a research_threads id
  summary: "TODO(prabigya): one plain-language sentence — 'In one sentence: …'"
  abstract: |
    TODO(prabigya): full abstract
  backstory: "TODO(prabigya): optional margin note — how it came about, what failed"
  links: { pdf: "", arxiv: "", code: "", poster: "" }   # omit empty keys
  bibtex: |                       # verbatim; key must equal id
    @inproceedings{short-slug-2026, ... }
```

Rendering rules: `summary` is always visible; `abstract` behind `<details>`; `backstory` in the margin; missing `links` keys simply don't render (no dead `[code]`).

## `content/notebook/*.md(x)`

```yaml
---
title: "Post title"
date: 2026-06-10          # ISO, required
updated: 2026-06-12       # optional → renders "last tended"
tags: [tag-one, tag-two]
summary: "One sentence used in lists, RSS, OG image, and llms.txt"
draft: false              # drafts excluded from EVERY surface, including JSON/MCP
math: false               # true loads KaTeX CSS on that page only
---
```

Body conventions: footnotes `[^n]` become margin sidenotes (design skill owns the rendering). Images live next to the post in a folder named after the slug, require alt text, and get captions from the markdown title attribute, rendered mono: `fig. 1 — caption`.

## `content/now.yaml` and `content/cv.yaml`

`now.yaml`: `updated:` date plus short lists (`working_on`, `reading`, `open_to`), each item one line. Renders the `/now` page, the mono "now:" line on the homepage, and the MCP `get_now` tool.

`cv.yaml`: sections (`education`, `positions`, `publications: from-publications-yaml`, `skills`, `service`, `awards`) with `org / role / start / end / details[]` entries. One file renders both the `/cv` page and the Typst PDF (`scripts/build-cv.ts` → `cv.typ` → `prabigya-acharya-cv.pdf` in `public/`). The PDF must contain a footnote: "Generated from the same data as prabigya.com.np/cv".

## `content/eval/questions.yaml`

Ten questions for the agent benchmark. **Only questions and scoring metadata live in the repo — never the expected answers** (the repo is public; answers go in a Worker secret, see the mcp-and-agent-layer skill):

```yaml
- id: q01
  question: "TODO(prabigya): a hard question from your research domain"
  type: exact | numeric | judged     # judged = LLM-graded against a rubric secret
  tolerance: 0.05                    # numeric only
```

## Machine surfaces — the four-surface rule

Any content type must be exposed on all four surfaces. When adding or changing a field, walk this checklist:

1. **HTML page** (Astro) — human rendering.
2. **Markdown twin** — every content page is also available at the same path with `.md` appended (`/research.md`, `/notebook/slug.md`). Implement as Astro endpoints that render content to clean markdown: no nav, no footer, front-matter-style header with canonical URL. Agents and `curl` users get exactly the page content.
3. **JSON API** (served by the worker, generated at build into `site/public/api/` for the static ones): `/api/publications.json`, `/api/notebook.json` (index + per-post), `/api/now.json`, `/api/cv.json`, `/api/site.json`. Stable field names matching the YAML; add `schema_version: 1` at the top level and bump on breaking changes.
4. **MCP tool** — the worker imports the same zod-validated data (bundled at deploy time from `content/` via a build step in `worker/`; the worker never fetches the website at runtime).

Plus the two aggregate surfaces, regenerated on every build:
- **`/llms.txt`** — generated by `scripts/build-llms.ts`: site purpose, link list of all pages with their `.md` twins, JSON endpoints, MCP connect instructions.
- **RSS** (`/notebook/rss.xml`) and **sitemap.xml**.

## Sync invariants (test these)

Write vitest checks that fail the build when:
- a `publications.yaml` entry's `bibtex` key ≠ its `id`, or `thread` references a nonexistent thread;
- any page exists without its `.md` twin, or any non-draft post is missing from `/api/notebook.json`;
- llms.txt references a URL that the build didn't emit;
- any string containing `TODO(prabigya)` would ship to production (`PROD_GUARD=1` build flag turns these into errors; in dev they're warnings so work can proceed).
