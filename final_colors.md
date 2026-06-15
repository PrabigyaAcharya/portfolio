/*
 * colors.css — pragma.ooo-matched color scheme for prabigya.com.np
 *
 * This file supersedes DESIGN.md and any other color definitions.
 * Import or link this AFTER your main stylesheet to guarantee override.
 *
 * Derived from pragma.ooo's visual identity:
 *   - near-black backgrounds
 *   - bright off-white text
 *   - electric green accent
 *   - monospace-first aesthetic
 *   - zero warmth, maximum contrast
 */

:root {
  /* ── Backgrounds ──────────────────────────────────────────────── */
  --bg-page:        #0D0D0D;   /* pragma's near-black canvas          */
  --bg-surface:     #141414;   /* slightly lifted for cards / insets  */
  --bg-ink-wash:    #1A1A1A;   /* section dividers, subtle panels     */

  /* ── Ink / Text ───────────────────────────────────────────────── */
  --ink-primary:    #F0EDE8;   /* bright off-white — pragma's body    */
  --ink-secondary:  #A8A49E;   /* mid-grey for metadata, abstracts   */
  --ink-muted:      #666057;   /* timestamps, labels, captions        */

  /* ── Accent — pragma's electric green ────────────────────────── */
  --accent:         #4AFF91;   /* primary accent: links hover, active */
  --accent-subtle:  #0A1F12;   /* dark tinted bg for highlighted blocks */

  /* ── Code / Syntax nav ────────────────────────────────────────── */
  --code-keyword:   #4AFF91;   /* struct, contract, enum — green      */
  --code-bracket:   #555047;   /* { } punctuation — dim               */
  --code-index:     #4AFF91;   /* {0}, {1} index numbers — green      */

  /* ── Borders ──────────────────────────────────────────────────── */
  --border-light:   #1E1E1E;
  --border-medium:  #2A2A2A;

  /* ── Lab status dot colors ────────────────────────────────────── */
  --status-active:  #4AFF91;   /* active = green (same as accent)     */
  --status-idle:    #FFB347;   /* idle = amber                        */
  --status-unknown: #555047;   /* unknown = muted grey                */
}

/*
 * Dark-mode block kept for completeness but pragma.ooo IS the dark mode.
 * No light-mode variant — this palette is dark-only by design.
 * If your site has a light mode toggle, you may wish to add a :root[data-theme="light"]
 * variant that falls back to the DESIGN.md warm paper palette.
 */

/* ── Optional: force dark mode at OS level too ──────────────────── */
@media (prefers-color-scheme: light) {
  /*
   * Even on light-mode OS, keep the pragma palette.
   * Comment this block out if you want the DESIGN.md warm palette
   * to serve as the light-mode fallback.
   */
  :root {
    --bg-page:        #0D0D0D;
    --bg-surface:     #141414;
    --bg-ink-wash:    #1A1A1A;
    --ink-primary:    #F0EDE8;
    --ink-secondary:  #A8A49E;
    --ink-muted:      #666057;
    --accent:         #4AFF91;
    --accent-subtle:  #0A1F12;
    --code-keyword:   #4AFF91;
    --code-bracket:   #555047;
    --code-index:     #4AFF91;
    --border-light:   #1E1E1E;
    --border-medium:  #2A2A2A;
  }
}

/*
 * ── Derived utility classes (optional, for convenience) ──────────
 *
 * If your codebase uses utility classes alongside CSS vars,
 * these keep things consistent:
 */

.text-accent   { color: var(--accent); }
.text-primary  { color: var(--ink-primary); }
.text-muted    { color: var(--ink-muted); }
.bg-surface    { background-color: var(--bg-surface); }
.bg-page       { background-color: var(--bg-page); }
.border-light  { border-color: var(--border-light); }

/*
 * ── Selection highlight ──────────────────────────────────────────
 */
::selection {
  background-color: var(--accent);
  color: #0D0D0D;
}

/*
 * ── Scrollbar (webkit) — match the dark palette ─────────────────
 */
::-webkit-scrollbar              { width: 6px; }
::-webkit-scrollbar-track        { background: var(--bg-page); }
::-webkit-scrollbar-thumb        { background: var(--border-medium); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover  { background: var(--ink-muted); }