# Design Revamp — Pragma-Inspired Todo

Inspiration: Pragma (Web3 Research Fund) — dark terminal aesthetic, all-monospace, left sidebar as code structure, sections styled as code blocks.

Review this list and cross off / annotate anything before I start implementing.

---

## 1. Color System

- [ ] **Default to dark (lamplight) theme.** The dark mode becomes the primary look; paper (light) is the toggle option. Update the inline pre-paint script to default to lamplight instead of matching system preference.
- [ ] **Update lamplight tokens** to closer match Pragma's warmth: background `#1B1813` (already there), but verify the text/rule palette reads as "warm terminal" not generic dark.
- [ ] Add a `--paper-code` token: a slightly lighter surface (`#232019` range) for content blocks/code-area sections — same role as Pragma's slightly-lighter section backgrounds.

---

## 2. Layout — Left Sidebar Navigation

**Biggest structural change.** Replace the top `<Header>` bar with a fixed left sidebar.

- [ ] Create a new `Sidebar.astro` component (~180px wide, fixed position).
- [ ] Nav rendered as code syntax:
  ```
  contract Menu {
    {0} home
    {1} research
    {2} notebook
    {3} now
    {4} cv
    {5} colophon
  }
  ```
  Numbers in `{curly}` are indices, are clickable and on hover underlines the section from left to right. Nav items are the links. Active page gets accent color.
- [ ] Social/contact links at bottom of sidebar as:
  ```
  enum Links {
    github
    email
    scholar
  }
  ```
- [ ] Update the `.page` grid: add a third column for the sidebar or switch to `sidebar + main + margin` layout. On mobile, sidebar collapses to a hamburger or a top strip.
- [ ] Remove `Header.astro` from the layout (or keep it as mobile-only fallback).

---

## 3. Typography — All Monospace

- [ ] **Remove Newsreader.** Drop the serif font entirely. The site becomes single-voice: IBM Plex Mono throughout.
- [ ] Update `global.css` body/heading font-family to `'IBM Plex Mono'` only.
- [ ] Headings: monospace, larger sizes (h1 at 2.2–2.8rem), weight stays 400–500 (mono bold looks too heavy).
- [ ] Remove `font-feature-settings: "onum"` (oldstyle numerals) — not relevant for mono.
- [ ] Update the Google Fonts import to drop Newsreader (or self-host only Plex Mono).

> **Note:** This breaks the CLAUDE.md two-voice (serif = human, mono = machine) design principle. The tradeoff: the site loses the "research notebook" warmth but gains a stronger "researcher's terminal" identity. Your call — flag if you want to reconsider.

---

## 4. Homepage Hero

- [ ] Add a version tag above the name: `prabigya =v1.0;` (or similar) in accent color, small mono — same as Pragma's `pragma =v0.7.0 =v0.0;`.
- [ ] Name as large (2.5rem+) mono headline.
- [ ] Tagline split so one line (the most distinctive phrase) renders in `--accent` color, the rest in `--ink`.
- [ ] Remove the `.page-lede` max-width constraint — let the headline breathe full-column.

---

## 5. Section Structure as Code Blocks

- [ ] Content sections get a subtle dark background (`--paper-code`), a top `// comment` label, and `{` / `}` bracket wrappers. Example:
  ```
  // Selected Work
  Publications {

    ...entries...

  }
  ```
- [ ] Section labels become code-comment style: `// research`, `// notebook` — lowercase, accent or muted color, no letter-spacing tweak needed (mono already has character spacing).
- [ ] Outer `{` and `}` rendered as faint accent or ghost-color text at the start/end of each block.

---

## 6. Publications — Year Accordion

- [ ] Year section headers become collapsible: `[+] 2024` / `[-] 2024`.
- [ ] `[+]` / `[-]` prefix in `--accent` color; year in `--ink`.
- [ ] Clicking the header toggles the publication list (JS progressive enhancement; default open for most recent year, closed for older).
- [ ] Full-width `1px solid var(--rule)` separators between each year row.
- [ ] Publication entries: more data-dense. Author line plain, title below it with key domain terms (NLP, Gaussian splatting, etc.) in accent color if feasible.
- [ ] Remove `pub-entry` border-bottom between individual papers within a year — use indentation/spacing instead.

---

## 7. Navigation Breadcrumb

- [ ] Add a breadcrumb line at the top of each page's main content area:
  ```
  prabigya / research
  prabigya / notebook / post-title
  ```
  Separator ` / ` in muted color, page name plain mono.
- [ ] Replaces the current page `<h1>` as the page identifier (h1 still exists semantically but visually the breadcrumb does the orientation job).

---

## 8. Tags / Subject Pills

- [ ] Keep the bordered rectangle tag style but add a `Primary subjects:` label line above them (code-label style) on the research page.
- [ ] Tags: `font-family: mono`, `border: 1px solid var(--rule)`, no border-radius — already mostly there, just ensure the label line is added.

---

## 9. Ask Box — Terminal Prompt Style

- [ ] Restyle the ask input as a terminal prompt: prefix `> ` or `$ ` in accent color, then the text input field inline.
- [ ] Answer renders inside a code-block-style container (`--paper-code` background, hairline border).
- [ ] "thinking…" indicator stays as mono text (already is).

---

## 10. Footer

- [ ] Minimal footer: just the MCP line and copyright, both mono, same style as now.
- [ ] Or: move footer content into sidebar bottom — keeping the main area clean.

---

## 11. Telemetry Strip

- [ ] Keep the telemetry strip but restyle as: `lab: training · run_name · loss 0.0312` — inline mono, no separate label element, just a single code-style line in the sidebar or below the hero.

---

## Things NOT changing

- All functionality: MCP server, guestbook, eval, ask-box, telemetry, RSS.
- Static-first (JS only for progressive enhancement).
- The accent color (`#8A3B22` paper / `#D08562` lamplight) — already close to Pragma's orange-red.
- Content YAML single source of truth.
- Two-column prose + margin grid (may adjust proportions for sidebar).
- `llms.txt`, JSON API, markdown twins.

---

## Open questions for you to decide

1. **Remove serif entirely?** Or keep Newsreader for prose body text only (blog posts) and use mono for all UI/navigation? -> Yes
2. **Sidebar on mobile:** hamburger menu, or collapse to a horizontal top strip? ->Hamburger
3. **Dark-first by default?** Or still respect system preference? -> Respect system defaults
4. **Year accordion default state:** most recent year open, older collapsed? Or all open? -> The most recent one open
5. **Code block section wrappers:** literal `{` `}` characters on screen, or just the visual background + comment label? -> Characters on screen
