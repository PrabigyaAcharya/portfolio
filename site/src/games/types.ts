// types.ts — the contract between the cartridge runtime and each game.
// A game is plain state plus pure-ish functions; the runtime owns the loop,
// the title / game-over screens, input and drawing surface.

export type Key = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start';
export type Buttons = Record<Key, boolean>;

export interface Input {
  /** Buttons held down right now. */
  held: Buttons;
  /** Buttons that went down since the previous tick (taps are never lost). */
  pressed: Buttons;
}

/** Four LCD shades, lightest to darkest: screen, deep, ink-soft, ink. */
export type Shade = 0 | 1 | 2 | 3;

export interface Gfx {
  /** Logical size in LCD pixels. */
  readonly W: number;
  readonly H: number;
  /** Ticks since the game was mounted; for blinking and animation. */
  readonly frame: number;
  clear(shade?: Shade): void;
  rect(x: number, y: number, w: number, h: number, shade: Shade): void;
  /** Silkscreen text, top-aligned. `size` is in LCD pixels (8 is the native size). */
  text(str: string, x: number, y: number, shade: Shade, align?: 'left' | 'center' | 'right', size?: number): void;
}

export interface Game<S = unknown> {
  id: string;
  title: string;
  /** One line of controls for the title screen, e.g. "A hop". */
  hint: string;
  create(seed: number): S;
  tick(state: S, input: Input): void;
  draw(state: S, g: Gfx): void;
  over(state: S): boolean;
  /** Integer score; higher is better. Stored as the best score. */
  score(state: S): number;
  /** How a score reads on screen, e.g. "loss 0.412". */
  formatScore(score: number): string;
  /** Autopilot for the attract loop. */
  demo(state: S): Buttons;
}

export const noButtons = (): Buttons =>
  ({ up: false, down: false, left: false, right: false, a: false, b: false, start: false });

/** Small seeded PRNG (mulberry32) so games are reproducible per seed. */
export function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
