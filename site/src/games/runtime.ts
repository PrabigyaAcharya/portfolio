// runtime.ts — runs one cartridge on a <canvas>: a fixed 30 Hz tick, the
// title and game-over screens, best scores, and drawing in the four LCD
// shades. The canvas is 120×100 LCD pixels, stored at 2× and scaled up by CSS
// with image-rendering: pixelated.

import { findCartridge } from './cartridges';
import { Pad } from './input';
import { getBest, recordScore } from './state';
import type { Game, Gfx, Shade } from './types';

export type Mode = 'play' | 'demo' | 'still';

export interface Mounted {
  readonly game: Game<any>;
  setMode(mode: Mode): void;
  stop(): void;
}

const W = 120;
const H = 100;
const SCALE = 2;
const STEP = 1000 / 30;

/** The four shades come from the LCD tokens, so no colour is hardcoded here. */
function readPalette(el: Element): string[] {
  const css = getComputedStyle(el);
  return ['--screen', '--screen-deep', '--screen-ink-soft', '--screen-ink']
    .map(v => css.getPropertyValue(v).trim() || '#000');
}

export async function mountGame(
  canvas: HTMLCanvasElement,
  cartridgeId: string,
  opts: { mode: Mode; pad: Pad },
): Promise<Mounted> {
  const cart = findCartridge(cartridgeId);
  if (!cart) throw new Error(`Unknown cartridge: ${cartridgeId}`);
  const game = await cart.load();

  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const palette = readPalette(canvas);

  let frame = 0;
  const g: Gfx = {
    W, H,
    get frame() { return frame; },
    clear(shade: Shade = 0) { ctx.fillStyle = palette[shade]; ctx.fillRect(0, 0, W, H); },
    rect(x, y, w, h, shade) { ctx.fillStyle = palette[shade]; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    text(str, x, y, shade, align = 'left', size = 8) {
      ctx.font = `${size}px Silkscreen, ui-monospace, monospace`;
      ctx.textBaseline = 'top';
      ctx.textAlign = align;
      ctx.fillStyle = palette[shade];
      ctx.fillText(str.toUpperCase(), Math.round(x), Math.round(y));
    },
  };

  const demoPad = new Pad();
  let mode: Mode = opts.mode;
  let phase: 'title' | 'play' | 'over' = 'title';
  let state: any = null;
  let lock = 0;          // ticks before game-over input is accepted
  let best = getBest(game.id);
  let lastScore = 0;

  const newGame = () => { state = game.create((Math.random() * 2 ** 32) >>> 0); phase = 'play'; };

  function step() {
    frame++;
    if (mode === 'demo') {
      if (!state) newGame();
      if (phase === 'play') {
        demoPad.set(game.demo(state));
        game.tick(state, demoPad.take());
        if (game.over(state)) { phase = 'over'; lock = 45; }
      } else if (--lock <= 0) newGame();
      return;
    }
    const input = opts.pad.take();
    const go = input.pressed.start || input.pressed.a;
    if (phase === 'title') {
      if (go) newGame();
    } else if (phase === 'play') {
      game.tick(state, input);
      if (game.over(state)) {
        lastScore = game.score(state);
        best = recordScore(game.id, lastScore);
        phase = 'over';
        lock = 20;
      }
    } else if (--lock <= 0 && go) {
      newGame();
    }
  }

  function titleLines(): { lines: string[]; size: number } {
    for (const size of [16, 8]) {
      ctx.font = `${size}px Silkscreen, ui-monospace, monospace`;
      if (ctx.measureText(game.title.toUpperCase()).width <= W - 10) return { lines: [game.title], size };
      const words = game.title.split(' ');
      if (words.every(w => ctx.measureText(w.toUpperCase()).width <= W - 10)) return { lines: words, size };
    }
    return { lines: [game.title], size: 8 };
  }

  /** The hint on one line, or split at its double spaces when too wide. */
  function hintLines(): string[] {
    ctx.font = '8px Silkscreen, ui-monospace, monospace';
    const fits = (t: string) => ctx.measureText(t.toUpperCase()).width <= W - 8;
    if (fits(game.hint)) return [game.hint];
    const lines: string[] = [];
    for (const part of game.hint.split(/\s{2,}/)) {
      const last = lines[lines.length - 1];
      if (last !== undefined && fits(`${last}  ${part}`)) lines[lines.length - 1] = `${last}  ${part}`;
      else lines.push(part);
    }
    return lines;
  }

  function drawTitle() {
    g.clear(0);
    g.rect(4, 4, W - 8, 3, 3);
    g.rect(4, H - 7, W - 8, 3, 3);
    const { lines, size } = titleLines();
    const top = 18;
    lines.forEach((l, i) => g.text(l, W / 2, top + i * (size + 3), 3, 'center', size));
    let below = top + lines.length * (size + 3) + 6;
    for (const line of hintLines()) { g.text(line, W / 2, below, 2, 'center'); below += 10; }
    if (best !== null) g.text(`best ${game.formatScore(best)}`, W / 2, below + 2, 2, 'center');
    if (mode !== 'still' && Math.floor(frame / 15) % 2 === 0) g.text('press start', W / 2, H - 22, 3, 'center');
  }

  function drawOver() {
    game.draw(state, g);
    if (mode === 'demo') return;
    const bw = 108, bh = 46, bx = (W - bw) / 2, by = (H - bh) / 2;
    g.rect(bx - 3, by - 3, bw + 6, bh + 6, 3);
    g.rect(bx, by, bw, bh, 0);
    g.text('game over', W / 2, by + 5, 3, 'center');
    g.text(game.formatScore(lastScore), W / 2, by + 17, 3, 'center');
    g.text(`best ${game.formatScore(best ?? lastScore)}`, W / 2, by + 27, 2, 'center');
    if (lock <= 0 && Math.floor(frame / 15) % 2 === 0) g.text('start', W / 2, by + 37, 3, 'center');
  }

  function render() {
    if (mode !== 'demo' && phase === 'title') drawTitle();
    else if (phase === 'over') drawOver();
    else game.draw(state, g);
  }

  // Draw only when the game has moved on: every tick while playing, every
  // other tick (15 fps) for the attract loop. Nothing else changes between
  // ticks, and each canvas update re-composites the screen around it.
  let raf = 0;
  let acc = 0;
  let last = performance.now();
  let drawn = -1;
  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (document.hidden) { last = now; return; }
    acc += Math.min(now - last, 250);
    last = now;
    while (acc >= STEP) { step(); acc -= STEP; }
    const due = mode === 'demo' ? frame >> 1 : frame;
    if (due !== drawn) { drawn = due; render(); }
  }

  function setMode(next: Mode) {
    cancelAnimationFrame(raf);
    mode = next;
    opts.pad.reset();
    state = null;
    phase = 'title';
    best = getBest(game.id);
    if (mode === 'still') { drawTitle(); return; }
    if (mode === 'demo') newGame();
    last = performance.now();
    acc = 0;
    drawn = -1;
    raf = requestAnimationFrame(loop);
  }

  setMode(mode);
  // Repaint once the pixel font arrives, so the first frames aren't in the fallback face.
  document.fonts?.load('8px Silkscreen').then(() => { if (mode === 'still') drawTitle(); }).catch(() => {});

  return {
    game,
    setMode,
    stop() { cancelAnimationFrame(raf); opts.pad.reset(); },
  };
}
