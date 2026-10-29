---
name: notebook-design
description: The complete visual design system for this portfolio — typography, color tokens, layout grid, margin notes, dark "lamplight" mode, and component rules. Use this skill whenever writing or editing any HTML, CSS, Astro component, page layout, or visual element in site/, including small tweaks like spacing, link styles, or adding a new page. Also use it when reviewing visual output or screenshots.
---

# Notebook design system

The site reads like a well-kept lab notebook: warm paper, one good serif, ink, a single accent the color of dried red ink, and a monospace voice reserved for anything machine-facing. The aesthetic risk is **restraint executed precisely** — the design succeeds through typography, spacing, and the margin-note system, never through decoration.

A warning before you start: "cream background + serif + terracotta accent" is currently the most common AI-generated design cliché. This brief deliberately lives in that neighborhood, so what separates it from the cliché is execution: the working margin column, ledger-style hairlines, date stamps, the mono machine layer, and zero decorative elements. If you find yourself adding a gradient, a card shadow, a rounded "feature card", or a big friendly hero — stop; that's the template leaking in.

## Tokens (`site/src/styles/tokens.css`)

```css
:root {
  /* paper mode */
  --paper: #FAF7F0;        /* page background */
  --paper-raised: #F3EEE3; /* code blocks, telemetry strip bg */
  --ink: #211E18;          /* primary text */
  --ink-soft: #46412F;     /* secondary text, summaries */
  --ink-faint: #7A7260;    /* metadata, margin notes */
  --ink-ghost: #A39A82;    /* date stamps, hints */
  --rule: #E2DBCB;         /* hairlines, borders */
  --accent: #8A3B22;       /* links, [pdf] [code], live dot — dried red ink */
  --accent-press: #6E2F1B; /* hover/active */
  --max-prose: 64ch;
  --margin-col: 11.5rem;
  --gutter: 1.5rem;
}
:root[data-theme="lamplight"] {
  --paper: #1B1813;        /* dark paper, NOT black */
  --paper-raised: #242019;
  --ink: #E8E2D4;
  --ink-soft: #C9C1AD;
  --ink-faint: #968D77;
  --ink-ghost: #6E6755;
  --rule: #3A342A;
  --accent: #D08562;       /* accent lightens in the dark; verify ≥4.5:1 on --paper */
  --accent-press: #E09A78;
}
```

Rules for tokens:
- Never introduce a raw hex value in a component; every color goes through a token.
- Both themes ship day one. Theme = `data-theme` on `<html>`, set by an inline script before paint (reads `localStorage`, falls back to `prefers-color-scheme`). Toggle lives in the footer, labeled `paper / lamplight`, mono, 12px.
- Verify contrast in **both** themes whenever you add a token pairing (4.5:1 body, 3:1 large/metadata).

## Typography

- **Serif (body & headings):** Newsreader (variable, self-hosted woff2, `font-display: swap`). Body 17px/1.65 desktop, 16px mobile. Headings use weight 500 with `text-wrap: balance`; never bold-heavy (no 700).
- **Mono (machine voice):** IBM Plex Mono, 0.78em relative to context. Used for: dates, nav, section labels (letter-spaced 0.14em, lowercase or small-caps via `font-variant-caps`), link-actions like `[pdf] [bibtex]`, the MCP footer, telemetry, code.
- **No sans-serif anywhere.** The two-voice system (serif = human, mono = machine) is a core concept; a third voice dilutes it.
- Real typographic niceties: `font-feature-settings` for oldstyle numerals in prose (`"onum"`), tabular lining numerals in telemetry/leaderboard (`"tnum" , "lnum"`), real em dashes, `hanging-punctuation: first` where supported.

## Layout & the margin system

Every content page uses one grid:

```css
.page { display: grid; grid-template-columns: minmax(0, var(--max-prose)) var(--margin-col); gap: var(--gutter); }
```

- **Main column:** prose, publication entries, post body.
- **Margin column:** date stamps, sidenotes, per-paper backstories, footnote bodies. Margin text: serif italic 13px `--ink-faint`; stamps: mono 11px `--ink-ghost`. No borders or backgrounds on margin notes — position *is* the styling.
- **Sidenotes:** footnotes in markdown (`[^1]`) render in the margin aligned with their reference (superscript number in `--accent`). Implement with a rehype plugin + CSS; at `max-width: 820px` the margin column disappears and sidenotes become `<details>` disclosures inline ("¹ ⌄"). This is the site's signature mechanic — budget real time to get alignment right (anchor each note to its ref with `position: absolute` within a shared positioning context, then resolve overlaps top-down with a few lines of JS as progressive enhancement; unstyled stacking is the no-JS fallback).
- Hairlines (`1px solid var(--rule)`) separate sections like ledger rules. No other borders. `border-radius: 0` everywhere except the telemetry sparkline container (2px, barely perceptible).

## Component rules

- **Publication entry:** serif title → author line (Prabigya's name underlined with `text-decoration-color: var(--rule)`) → one-sentence summary in `--ink-soft` → mono action row `[pdf] [arXiv] [code] [bibtex ⌄]`. BibTeX expands via `<details>` into a `--paper-raised` block with a copy button (JS enhancement; selectable text is the fallback). Backstory goes in the margin.
- **Links:** in prose, `--accent` with `text-underline-offset: 3px`, underline `--rule` turning `--accent` on hover. Mono action links get square brackets in the content, no underline.
- **Telemetry strip:** mono header `lab · live` + status dot (CSS circle: `--accent` when training, `--ink-ghost` when idle — never green/red). Sparkline is inline SVG, single 1.5px `--accent` stroke, no axes, no chart library. Renders from build-time snapshot JSON; client JS polls `/api/lab.json` every 60s and swaps values with no animation beyond a 200ms opacity ease.
- **Guestbook & leaderboard:** typeset as ledgers — mono date column, serif entry text, hairline between rows. The leaderboard is a plain `<table>` with tabular numerals. No medals, no avatars, no badges.
- **Ask-box:** a single input rendered as a ruled line on paper (bottom-border only), mono placeholder `ask this notebook…`, answer appears below as serif prose with mono source citations like `→ publications.yaml`. No chat bubbles, no avatars, no streaming spinner (use the text `thinking…` in mono).
- **Code blocks:** `--paper-raised` background, hairline border, Shiki theme customized to the token palette (build both theme variants).

## Motion & interaction

- Allowed motion: opacity/transform ≤200ms on `<details>` open, theme change, telemetry refresh. Everything else: none. Respect `prefers-reduced-motion` (kill all transitions).
- Keyboard: `j`/`k` move a subtle left-margin caret (`–` in `--accent`) through entries on list pages, `Enter` opens, `/` focuses Pagefind search, `t` toggles theme. Document these in the colophon. Visible `:focus-visible` outline: 1px solid `--accent`, offset 2px.
- Hovers may only change color, never size or shadow.

## Page inventory & voice

`/` (intro + selected work + recent notebook + telemetry + MCP footer) · `/research` (all publications, by year) · `/notebook` + `/notebook/[slug]` · `/now` · `/cv` (+ PDF link) · `/colophon` (how the site works, MCP instructions, guestbook + leaderboard live here or at `/agents`) · 404 ("this page isn't in the notebook").

Copy register: first person, lowercase mono labels, sentence case headings, no exclamation marks, no marketing verbs ("leverage", "passionate"). The MCP footer is one line: `§ this site speaks MCP — claude mcp add prabigya https://prabigya.com.np/mcp` with a copy affordance.

## Self-check before finishing any visual task

Render both themes at 1280px and 360px (screenshot if the environment allows). Ask: does anything look like a SaaS template component? Is there exactly one accent color in view? Do margin notes align with their references? Would this page survive printing on actual paper? Remove one thing (Chanel rule) — there is almost always one element too many.
