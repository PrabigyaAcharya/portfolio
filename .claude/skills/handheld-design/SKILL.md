---
name: handheld-design
description: The complete visual design system for this portfolio — a retro handheld console. Covers the shell/bezel/LCD palette, the three typefaces, materials (grain, LCD inset, domed buttons), motion, the Screen layout and LCD primitives, and what to keep out. Use this skill whenever writing or editing any HTML, CSS, Astro component, page layout, or visual element in site/, including small tweaks like spacing, link styles, or adding a new page. Also use it when reviewing visual output or screenshots.
---

# Handheld design system

The site is a handheld console. `/` shows the device floating on a warm-grey ground; clicking it "switches it on". Every other page is the handheld's screen filling the window: a lilac **bezel** framing an unlit olive **LCD**, a tab strip inside the screen, and printed lettering on the shell. The palette and layout are borrowed from an original-model handheld; **the trademarks are not** — no brand names, logos or slogans from real hardware, ever.

Source handoff: `handoff/DESIGN.md` and `handoff/reference/*.html` (the reference HTML uses a canvas runtime — `<sc-if>`, `{{holes}}` — ignore that; the markup and CSS are the spec).

## Tokens (`site/src/styles/tokens.css`)

Every colour goes through a token; never put a raw hex in a component. The only exceptions are the extrusion-face colour ramp (computed from `--shell-edge-near/far` with `color-mix`) and the Shiki theme object in `astro.config.mjs`, which can't read CSS variables.

| token | hex | use |
|---|---|---|
| `--shell` | `#d3cfc7` | page ground, device body |
| `--shell-edge-near` → `--shell-edge-far` | `#cbc6be` → `#9b968e` | 13 extrusion faces, front to back |
| `--bezel` | `#9a94ab` | screen surround |
| `--screen` | `#aaa82c` | unlit LCD — the ground for all reading |
| `--screen-edge` | `#8f8d24` | LCD inner ring; tab hover ground |
| `--screen-ink` | `#2f3317` | **all** text on the LCD (5.2:1 on `--screen`) |
| `--screen-lit` / `--screen-lit-ink` | `#9bbc0f` / `#0f380f` | landing hover "powered on" state only |
| `--print-blue` | `#2b35a6` | lettering printed on the shell (6.2:1 on `--shell`) |
| `--print-blue-deep` | `#1b2275` | lettering on the **bezel** — plain blue is only 3.3:1 there |
| `--magenta` (+ `-hi/-lo/-shadow/-letter`) | `#b2386f` | A/B buttons, top pinstripe |
| `--lozenge` (+ `-shadow`) | `#a9a4ae` | select/start buttons, key hints; idle LED |
| `--pad` | `#2a2a2d` | d-pad |
| `--led` | `#c23a2b` | battery light — lit only while the lab is training |

One palette only. There is no dark mode and no theme toggle; don't add one.

Contrast rules: reading text on the LCD is always `--screen-ink` on `--screen` (or inverted). `--screen-ink-soft` is for placeholders only (2.6:1). Never put blue or magenta text on the LCD or on `--screen-deep`. Verify any new pairing (4.5:1 body, 3:1 large).

## Typography

- **Silkscreen** 400/700 (`--font-lcd`) — LCD headings (`h1`, `h2`), the tab strip, buttons, dates and small on-screen labels. **Never body copy.**
- **Jost** italic 600/700 (`--font-print`) — anything "printed on the shell": wordmark, bezel status line, key hints, Switch off, landing hint.
- **Public Sans** 400/500/600 (`--font-body`) — all reading text, 16–17px, line-height 1.5–1.65. `h3` and row titles are Public Sans 600.
- Code uses the system monospace stack (`--font-code`).

## Materials and shapes

- Device and bezel corners are large bottom-right only: `--radius-device` (`16px 16px 84px 16px`), `--radius-bezel` (`14px 14px 72px 14px`).
- Shell grain: `--shell-grain`. LCD inset: `--lcd-inset`. Bezel bevel: `--bezel-bevel` plus a `0 6px 0 --shell-shadow` hard drop.
- Pinstripe under the bezel top edge: 3px magenta over 3px blue (`.pinstripe`).
- On the LCD, rules are 3px solid ink (`--rule-ink`); left-rule blocks are 4px (`.ink-rule`). No hairlines, no shadows, no rounded corners inside the screen.
- D-pad arms are ribbed with `repeating-linear-gradient` and have a centre dimple; A/B are domed (radial highlight at 35% 28%, 4px hard shadow, engraved letters).

## Layout

- `/` — `src/pages/index.astro` + `src/components/Handheld.astro`. The device is one `<a href="/home">`; everything on it is `aria-hidden` decoration. A visually-hidden nav lists the routes for crawlers.
- Everything else uses `src/layouts/Screen.astro` with an `active` tab prop. The tabs are real `<a>` links to real routes (`/home /research /notebook /now /cv /ask`). Pages outside the tab set either light their parent tab (colophon → CV, posts → Notebook) or none (404).
- Desktop: the window never scrolls; the LCD scrolls internally. ≤700px: the window scrolls, the bezel becomes a thin border, tabs wrap, key hints hide.
- Content sits in `.view` (max 980px); prose in `.prose` (68ch).

## LCD primitives (`global.css`)

Use these before inventing anything:

- `.lcd-display` — giant Silkscreen name with a 5px hard `--screen-deep` shadow (Home, 404 only).
- `.lcd-lede`, `.lcd-small`, `.lcd-label` — large lede, 15px secondary, Silkscreen 11px label.
- `.lcd-btn` — 3px ink outline button; also used on `<summary>` for `<details>` toggles (abstract, BibTeX), which keeps them working without JS.
- `.lcd-rows` > `li` > `a.lcd-row` (`.row-main/.row-title/.row-sub/.row-meta`) — ruled list rows for posts and links.
- `.ink-list` — ruled plain list. `.chip-list`, `.tag` — 2px outlined Silkscreen chips.
- `.lcd-input` — bottom-ruled input, no box.
- `.cursor.blink` — block cursor.

## Motion and interaction

- Landing swivel: `rotateY(-32deg) rotateX(8deg)` ↔ flat, keyframes 0–12% angled, 42–66% flat, 10s, `cubic-bezier(.45,0,.15,1)`, infinite; perspective 1400px. Idle float `translateY(0 → -8px)` 7s. Hover/focus lights the screen in `steps(3,end)` and pauses the swivel. **No scale or lift on hover.**
- On the LCD, hovers **invert ink and screen in 2 stepped frames** (`--step-invert`), never smooth fades. The active tab is permanently inverted.
- The block cursor blinks with `steps(1,end)`.
- Landing → screen uses a cross-document View Transition on `view-transition-name: lcd` (CSS only).
- `prefers-reduced-motion`: kill the idle float, the blink, the stepped transitions and the view transition. The swivel may stay. Below 700px the device faces the viewer with no swivel.
- Keyboard (Screen.astro): ← → previous/next tab, Enter → Ask (focuses the input when already there), Esc → Home. Ignored while typing, with modifiers, or when Enter lands on a link/button/summary. Document changes in the colophon.
- Focus: 3px `--print-blue` outline on the shell, 3px ink outline inside the LCD; LCD controls show focus by inverting.

## Keep out

- No brand lettering or slogans from real hardware.
- No emoji, no generic SaaS card grids, no gradient washes outside the materials above, no drop-shadow cards on the LCD.
- No second accent colour on the screen — the LCD is monochrome. Code highlighting is monochrome too (weight/italic/underline only).
- Don't hardcode personal copy in components; it comes from `content/` (see the content-schema skill).

## Self-check before finishing any visual task

Screenshot at 1440×900 and 390×844 (and 360px wide), and compare against `handoff/reference/`. Check: does it still read as one physical device? Is every on-screen colour ink or screen? Does it work with JS disabled (tabs navigate, `<details>` open, Ask falls back to mailto)? Is anything a stock web component wearing a costume? Remove one thing.
