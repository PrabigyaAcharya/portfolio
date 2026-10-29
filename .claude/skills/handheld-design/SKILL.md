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

Two shells, one screen. The grey handheld is the light theme; the **black edition** is dark mode. Shell, bezel, lettering and button tokens are `light-dark(grey, black)` pairs in `tokens.css`, so they follow `color-scheme`: the system preference by default, overridden by `[data-theme="light"|"dark"]` on `<html>`. The LCD tokens are not paired; `.lcd` and `.dev-lcd` set `color-scheme: light`, so the screen is the same olive glass in both. The page behind the device is `--ground` (equal to `--shell` in grey, darker than the shell in black so the device still separates from it).

- The only switch is the **A button on the landing handheld** (label "Theme"): a real `<button data-theme-toggle aria-pressed>` with `aria-label="Dark mode"`. It renders `disabled`, and its script enables it, so without JS the shell just follows the system. The inside view has no toggle. The choice is stored in `localStorage.theme` and applied before paint on every page by an inline script in `Base.astro`. A button can't sit inside a link, so the device body is a `<div>`. The link is an absolutely positioned `.device-link` layer under the decoration, the decoration is `pointer-events: none`, and `.dev-controls` and `.dev-bottom` sit at `translateZ(1px)` with `pointer-events: auto` on their links and button, so the controls win the hit test.
- Any new shell-side colour must be a `light-dark()` pair; check both shells before calling a change done.

Contrast rules: reading text on the LCD is always `--screen-ink` on `--screen` (or inverted). `--screen-ink-soft` is for placeholders only (2.6:1). Never put blue or magenta text on the LCD or on `--screen-deep`. Verify any new pairing (4.5:1 body, 3:1 large).

## Typography

- **Silkscreen** 400/700 (`--font-lcd`) — LCD headings (`h1`, `h2`), the tab strip, key hints, buttons, dates and small on-screen labels. **Never body copy.**
- **Jost** italic 600/700 (`--font-print`) — anything "printed on the shell": wordmark, landing byline.
- **Public Sans** 400/500/600 (`--font-body`) — all reading text, 16–17px, line-height 1.5–1.65. `h3` and row titles are Public Sans 600.
- Code uses the system monospace stack (`--font-code`).

## Materials and shapes

- Device and bezel corners are large bottom-right only: `--radius-device` (`16px 16px 84px 16px`) on the landing device; the full-window bezel uses `0 0 64px 0`.
- Shell grain: `--shell-grain`. LCD inset: `--lcd-inset`. Bezel bevel: `--bezel-bevel` (the full-window bezel has no drop shadow).
- Pinstripe under the bezel top edge: 3px magenta over 3px blue (`.pinstripe`).
- CRT glass over the whole LCD (`.lcd::after`): 1-on-2-off ink scanlines, a fainter vertical dot-matrix grid, a radial vignette plus inset tube shadow; `.lcd::before` is a faint scan band rolling down every 9s (off ≤700px and under reduced motion). `.lcd-scroll` text gets a ±0.6px magenta/blue phosphor fringe. All of it is `pointer-events: none` and hidden in print. Keep it subtle — body copy must stay AA readable.
- On the LCD, rules are 3px solid ink (`--rule-ink`); left-rule blocks are 4px (`.ink-rule`). No hairlines, no shadows, no rounded corners inside the screen.
- D-pad arms are ribbed with `repeating-linear-gradient` and have a centre dimple; A/B are domed (radial highlight at 35% 28%, 4px hard shadow, engraved letters).

## Layout

- `/` — `src/pages/index.astro` + `src/components/Handheld.astro`. The device body is a `<div>` with a full-size `a.device-link` to `/home` underneath; the bezel, LCD, wordmark and speaker are `aria-hidden` decoration, but the controls are real: d-pad Work/Notes/CV/Now are links to `/research`, `/notebook`, `/cv`, `/now`, but with JS they **preview** the section on the device's own LCD instead (a "trailer": Silkscreen section title + up to 3 square-bulleted, single-line ellipsised lines, built at build time from `content/`, with "Press start" kept below; panels swap with a 3-step fade). Pressing the lit arm again returns to the title screen, the arrow keys press the arms, and a visually-hidden live region announces the preview; **B = Start** (and the device body) opens whatever is on screen, `/home` by default; **A = Theme** (button, see above); lozenges → `site.links.github` / `site.links.scholar`. Each control has a pressed state: the domes sink onto their shadow, the arms darken and their labels nudge in, the lozenges drop 2px. A visually-hidden nav lists the routes for crawlers.
- Everything else uses `src/layouts/Screen.astro` with an `active` tab prop. The tabs are real `<a>` links to real routes (`/home /research /notebook /now /cv /ask`). Pages outside the tab set either light their parent tab (colophon → CV, posts → Notebook) or none (404).
- The bezel fills the whole window edge to edge (no grey margin) and is a thin purple border (~10px) around the LCD. Like the device body, only its bottom-right corner curves (64px desktop, 28px phone), letting the shell ground show through; the LCD inside keeps square 4px corners. Keep a few px between the LCD corner and that curve — clearance ≈ R − √((R−dx)² + (R−dy)²). Top bar, left to right: the round red-tinted **power button** (links back to `/`, "Switch off"; red `--led` icon on lozenge plastic mixed with `--led`), the lab LED (no visible text; the state is in a visually-hidden live region and the `title`), the pinstripe stretching across all remaining width, and the wordmark at the far right (hidden ≤700px; the pinstripe stays). The bottom band is empty bezel (44px, matching the top bar) so the LCD corner clears the curve. Key hints (← → Browse, Enter Ask, Esc Back) are drawn **on the LCD** at the right end of the tab row (`.tab-row` holds `nav.tabs` and `ul.key-hints` above one ink rule), as 12px Silkscreen labels with 26px, 2px ink-outlined keys; they wrap below the tabs on narrow screens.
- The LCD frame (`.lcd`) never scrolls; its child `.lcd-scroll` does, 4px inside the edge ring. Its scrollbar is pixel art (dotted ink rail, block ink thumb with grip lines) Note Chromium ignores `::-webkit-scrollbar` once `scrollbar-color` is set, so the standard properties are only an `@supports` fallback.
- Desktop: the window never scrolls; the LCD scrolls internally. ≤700px: the window scrolls, tabs wrap, the wordmark and key hints hide.
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

- Landing turn: the device rests angled (`rotateY(-32deg) rotateX(8deg)`, perspective 1400px) and turns to face the viewer only while hovered or focused, swinging back when the pointer leaves — a `.9s cubic-bezier(.45,0,.15,1)` transition, never an autoplay loop. Hover is read off the untransformed `.scale` wrapper so the turning device can't slip out from under the cursor. Idle float `translateY(0 → -8px)` 7s. Hover/focus also lights the screen in `steps(3,end)`. **No scale or lift on hover.**
- On the LCD, hovers **invert ink and screen in 2 stepped frames** (`--step-invert`), never smooth fades. The active tab is permanently inverted.
- The block cursor blinks with `steps(1,end)`.
- Landing → screen uses a cross-document View Transition on `view-transition-name: lcd` (CSS only).
- `prefers-reduced-motion`: kill the idle float, the blink, the stepped transitions and the view transition. The hover turn may stay. Below 700px (no hover) the device simply faces the viewer.
- Falling blocks (`BlockDrop.astro`, inside `.lcd`, not the scroller): a 12-column well on the right of the screen where block pieces drop one row per step (`steps()`), some snap-rotate mid-fall, land on a two-row ragged pile, blink twice and vanish, on staggered loops. Decorative (`aria-hidden`, no pointer events). Shown only ≥1340×620 where the right side is empty; pieces are hidden under `prefers-reduced-motion`.
- Cursors: inside `.screen-wrap` the pointer is a 2× pixel-art arrow, and a pixel hand on anything clickable (ink outline, `--screen-hi` fill, SVG data URIs ≤32px). Text fields keep the native I-beam. The landing page keeps the system cursor.
- Keyboard (Screen.astro): ← → previous/next tab, Enter → Ask (focuses the input when already there), Esc → Home. Ignored while typing, with modifiers, or when Enter lands on a link/button/summary. Document changes in the colophon.
- Focus: 3px `--print-blue` outline on the shell, 3px ink outline inside the LCD; LCD controls show focus by inverting.

## Keep out

- No brand lettering or slogans from real hardware.
- No emoji, no generic SaaS card grids, no gradient washes outside the materials above, no drop-shadow cards on the LCD.
- No second accent colour on the screen — the LCD is monochrome. Code highlighting is monochrome too (weight/italic/underline only).
- Don't hardcode personal copy in components; it comes from `content/` (see the content-schema skill).

## Self-check before finishing any visual task

Screenshot at 1440×900 and 390×844 (and 360px wide), and compare against `handoff/reference/`. Check: does it still read as one physical device? Is every on-screen colour ink or screen? Does it work with JS disabled (tabs navigate, `<details>` open, Ask falls back to mailto)? Is anything a stock web component wearing a costume? Remove one thing.
