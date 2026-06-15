# DESIGN.md — prabigya.com.np UI Revamp

> A reference document for Claude Code to execute a full UI overhaul.
> Inspiration source: pragma.ooo (structural confidence, typographic hierarchy, code-flavoured nav)
> Tone target: **paper / lamplight** — warm, quiet, scholarly. No glitch, no neon. Think a well-typeset research journal, not a terminal.

---

## 1. Design Philosophy

The current site has the right bones (code-syntax nav, MCP hook, notebook structure) but the execution is flat — everything sits at the same visual weight, the best features (Ask This Notebook, MCP colophon) are buried at the bottom, and the colour palette lacks warmth.

The pragma.ooo site earns its confidence from three things:
1. **Radical typographic hierarchy** — one thing is very large, everything else steps down deliberately.
2. **Structural negative space** — sections breathe; the grid is felt even when invisible.
3. **Code-as-navigation metaphor** carried consistently through every nav element.

We keep all three but swap the cold monochrome / glitch aesthetic for a warm paper palette.

---

## 2. Colour Palette

Replace the current colours entirely. Use CSS custom properties throughout.

```css
:root {
  /* Backgrounds */
  --bg-page:        #F5F0E8;   /* warm off-white, aged paper */
  --bg-surface:     #EDE8DC;   /* slightly darker for cards / insets */
  --bg-ink-wash:    #E2DBCc;   /* used for subtle section dividers */

  /* Ink / Text */
  --ink-primary:    #1A1610;   /* near-black with warm undertone */
  --ink-secondary:  #5C5347;   /* mid-tone warm brown for metadata */
  --ink-muted:      #9A8F82;   /* timestamps, labels, captions */

  /* Accent — a single restrained amber */
  --accent:         #B85C00;   /* used sparingly: links on hover, active nav, highlight */
  --accent-subtle:  #F0E6D3;   /* background tint for highlighted blocks */

  /* Code / Syntax nav */
  --code-keyword:   #7A5C3A;   /* struct, contract, enum keywords */
  --code-bracket:   #9A8F82;   /* { } punctuation in nav */
  --code-index:     #B85C00;   /* {0}, {1} index numbers */

  /* Borders */
  --border-light:   #D8D0C0;
  --border-medium:  #B8AFA0;
}
```

Dark mode (prefers-color-scheme: dark):
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-page:       #1A1610;
    --bg-surface:    #221E16;
    --bg-ink-wash:   #2A2520;
    --ink-primary:   #EDE8DC;
    --ink-secondary: #B8AFA0;
    --ink-muted:     #7A7060;
    --accent:        #D4843A;
    --accent-subtle: #2A2010;
    --code-keyword:  #C4A87A;
    --code-bracket:  #7A7060;
    --code-index:    #D4843A;
    --border-light:  #2E2820;
    --border-medium: #40382C;
  }
}
```

---

## 3. Typography

```css
/* Import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-serif:  'EB Garamond', Georgia, serif;       /* body, headings */
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace; /* nav, code, labels */
}
```

### Scale (use these exactly — do not invent intermediate sizes)

| Role                        | Size         | Weight | Font   | Colour              |
|-----------------------------|--------------|--------|--------|---------------------|
| Hero name (h1)              | clamp(3rem, 8vw, 6rem) | 500 | serif | --ink-primary |
| Hero tagline                | 1.25rem      | 400    | serif  | --ink-secondary     |
| Section heading (h2)        | 1.75rem      | 500    | serif  | --ink-primary       |
| Paper title (publication)   | 1.1rem       | 500    | serif  | --ink-primary       |
| Body / abstract             | 1rem / 1.7 lh| 400    | serif  | --ink-secondary     |
| Mono label / nav keyword    | 0.75rem      | 500    | mono   | --code-keyword      |
| Mono index {N}              | 0.75rem      | 500    | mono   | --code-index        |
| Timestamp / metadata        | 0.8rem       | 400    | mono   | --ink-muted         |
| Caption / aside             | 0.85rem      | 400    | serif italic | --ink-muted   |

### Rules
- **No bold on serif body text** — use weight 500 only for headings and titles.
- Section comment labels (`// selected work`, `// recent writing`) stay in mono, 0.75rem, --ink-muted. These are decorators, not headings.
- The `contract Menu { }`, `struct Focus { }`, `enum Links { }` nav structure must remain, rendered in mono. Keyword tokens in --code-keyword, index numbers in --code-index, link text in --ink-primary on rest, --accent on hover/active.

---

## 4. Layout & Grid

```css
.page-container {
  max-width: 720px;       /* narrow column — scholarly, focused */
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Two-column layout on wider screens for home page only */
@media (min-width: 900px) {
  .home-grid {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 4rem;
    align-items: start;
  }
}
```

The sidebar (260px) on home holds: nav, links, location, lab status, MCP invite line.
The main column holds: hero, selected work, notebook, ask-box.

---

## 5. Page Structure — Home (/)

Rearrange sections in this exact order, top to bottom:

### 5.1 Header / Nav
```
contract Menu {
  {0} home   {1} research   {2} notebook   {3} now   {4} cv   {5} colophon
}
```
- Single horizontal line on desktop, stacked on mobile.
- No logo image. The site name in the nav IS the logo.
- Sticky on scroll, but fade background to --bg-surface/90 with backdrop-blur(8px) when scrolled past 80px. Do not show a full opaque bar.

### 5.2 Hero Block (PROMOTE — currently undersized)
This is the highest-priority change. The hero must be bold.

```
prabigya =v1.0;                    ← mono, small, --ink-muted, top of block

Prabigya Acharya                   ← giant serif, clamp(3rem, 8vw, 6rem)

AI researcher working on           ← serif 1.25rem, --ink-secondary
privacy-preserving NLP,
computer vision, and 3D reconstruction.

now: Building AI Solutions at Cyberensic    ← mono badge, --accent, small
● lab active / idle                         ← live status dot
```

Add 6–8rem of vertical breathing room above and below the hero text. The name should be the first thing anyone sees and it should feel large.

### 5.3 ASK THIS NOTEBOOK — MOVE TO TOP (major change)
Currently buried at the bottom. **Move it immediately below the hero**, above selected work.

Render as a prominent inset card:

```
┌─────────────────────────────────────────────┐
│  // ask this notebook                        │
│                                             │
│  [________________________] [ask →]          │
│                                             │
│  powered by MCP · or  email directly        │
└─────────────────────────────────────────────┘
```

Styling:
- Background: --bg-surface, border: 1px solid --border-light, border-radius: 4px
- The comment label `// ask this notebook` in mono --ink-muted
- Input: full-width, serif, 1rem, background transparent, border-bottom only (1px --border-medium), no box. On focus: border-bottom shifts to --accent.
- Button `ask →`: mono 0.8rem, --accent colour, no fill, just text with arrow. On hover: underline.
- Below the input, one line: `powered by MCP · or email directly` in --ink-muted italic serif 0.85rem. "email directly" links to mailto.

### 5.4 Selected Work

```
// selected work
selected_work {
  [paper card]
  [paper card]
  all publications →
}
```

Each paper card:
- No box / no card border. Use a thin left-rule (2px --border-light) with padding-left: 1rem.
- On hover: left-rule shifts to --accent.
- Authors line: mono 0.75rem --ink-muted
- Title: serif 1.1rem 500 --ink-primary
- Venue: mono 0.75rem --ink-muted
- Abstract: collapsed by default. Show a "abstract ▸" toggle in mono --ink-muted. On click, expand inline with smooth height transition.
- BibTeX: same toggle pattern.
- Remove the copy button from plain sight — put it inside the expanded bibtex block as a small mono link.

### 5.5 Recent Writing (Notebook)

```
// recent writing
notebook {
  [post row]
  [post row]
  [post row]
  all posts →
}
```

Each post row (no cards, no borders):
- Title: serif 1rem 500 --ink-primary, link colour
- Subtitle/excerpt: serif 0.9rem --ink-secondary, one line, clipped with ellipsis
- Date: mono 0.8rem --ink-muted, right-aligned on same line as title on desktop
- On hover: title shifts to --accent

Use a subtle hairline (1px --border-light) between rows. No background, no box-shadow.

### 5.6 Sidebar (desktop only, 260px right column)

Top of sidebar:
```
enum Links {
  github
  scholar
  email
}

location Kathmandu, Nepal

research
  Privacy-preserving NLP
  3D Vision & Reconstruction
```

Bottom of sidebar (this is the MCP invite — MAKE IT VISIBLE):
```
┌──────────────────────────────┐
│  § this site speaks MCP      │
│  claude mcp add prabigya     │
│  https://prabigya.com.np/mcp │
│  [copy]                      │
└──────────────────────────────┘
```
- Small inset box, --bg-ink-wash background, mono 0.7rem, --ink-secondary
- The `§` glyph in --accent
- `[copy]` is a button, mono --accent, no border

On mobile, sidebar content collapses into the footer area below the main content.

### 5.7 Footer
Minimal. One line:
```
© Prabigya Acharya · 2026        colophon
```
Mono 0.75rem --ink-muted. "colophon" links to /colophon. No social icons repeated here.

---

## 6. Component Details

### Navigation (all pages)
The code-syntax structure from pragma.ooo is one of your site's best features. Keep and tighten it:

```
contract Menu {
  {0} home  {1} research  {2} notebook  {3} now  {4} cv  {5} colophon
}
```

- Render keyword (`contract`, `struct`, `enum`) in --code-keyword mono
- Curly brackets `{ }` in --code-bracket
- Index numbers `{0}` in --code-index
- Nav link text: --ink-primary, no underline at rest
- Active page: --accent, with a subtle underline
- Hover: --accent
- All in monospace, 0.75rem, uppercase is optional but keep consistent with current choice

### Section Comment Labels
All `// section name` labels:
- Mono 0.75rem --ink-muted
- Margin-bottom: 0.25rem (tight above the block name)
- The `selected_work {` / `notebook {` / closing `}` in mono --code-bracket

### Lab Status Indicator
```html
<span class="lab-status">
  <span class="dot"></span>
  lab <span class="status-word">idle</span>
</span>
```
- Dot: 6px circle. Green (#4A7C59) if active, amber (#B85C00) if idle, grey (#9A8F82) if unknown.
- Mono 0.75rem
- Pull this live from MCP if possible; otherwise hardcode current state.

---

## 7. Interaction & Motion

Keep motion minimal and meaningful:

```css
/* Global transition baseline */
*, *::before, *::after {
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

/* Abstract/bibtex expand */
.expandable-content {
  overflow: hidden;
  transition: max-height 300ms ease-out;
}

/* Ask box focus */
.ask-input {
  transition: border-color 150ms ease;
}
.ask-input:focus {
  border-bottom-color: var(--accent);
  outline: none;
}
```

No parallax, no scroll animations, no entrance effects. The page should feel instant and calm.

---

## 8. Other Pages

### /research
- Same narrow 720px column
- Publications listed chronologically (newest first), each as the same left-rule card from home
- Add a small filter row at top: `all · NLP · computer vision · 3D` — mono 0.75rem, clicking highlights --accent

### /notebook
- List of posts, same row pattern as home
- Add tag filter above: `all · research · 3D · music · ...`
- Each post page: serif body at 1.1rem / 1.8 line-height, max-width 660px, generous margins

### /cv
- Render as a clean typeset document within the page (not a PDF link)
- Use a two-column definition list pattern: left = mono label (role, org, date), right = serif content
- Print stylesheet: hide nav, render cleanly at A4

### /now
- Single column, diary-like. Serif 1.1rem body. Very little chrome.

### /colophon
- This page should be richer — it's where you explain the MCP magic
- Add a short diagram or ASCII art showing how the MCP server works
- Highlight the `claude mcp add prabigya https://prabigya.com.np/mcp` command in a proper code block (--bg-surface, mono, copy button)

---

## 9. What to Remove / Simplify

- **Remove** the `prabigya =v1.0;` version string from the hero — move it above the name as a tiny mono label if desired, but don't let it compete with the name.
- **Remove** duplicate social links in both nav and footer — keep them only in the sidebar/footer, not both.
- **Simplify** the abstract display — the current full abstract on the home page is too long. Show 2 sentences + "read more" toggle.
- **Do not** add any background textures, grain overlays, or noise effects. The paper feel comes purely from the colour palette and typography, not from CSS filters.
- **Do not** add hero images, avatars, or profile photos — the name at scale is the identity.

---

