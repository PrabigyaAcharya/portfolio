// descent.ts — gradient descent by hand. Each level is one loss landscape
// with false minima and a dashed target line under the real one. ← → set the
// learning rate, A takes a gradient step: the ball moves downhill by
// learning rate × slope, so a small rate crawls on flat ground and a big one
// overshoots the valley. A hollow ghost shows where the step will land. Get
// under the target within the step budget and the next landscape is bumpier.
// The run ends when the steps run out, or when the ball settles in a false
// minimum where the slope is flat and no learning rate moves it. The score is
// landscapes solved.

import { noButtons, rng, type Game } from './types';

interface Hop { from: number; to: number; t: number }

interface State {
  r: () => number;
  level: number;          // 1-based; solved = level - 1
  shape: number[];        // landscape parameters, from the seed and level
  target: number;         // loss to get under
  x: number;              // ball, screen px
  lr: number;             // index into RATES
  steps: number;          // left this level
  hop: Hop | null;        // a step in flight
  banner: number;         // ticks left on the "level n" / "converged" banner
  converged: boolean;     // this level is solved; next one loads after the banner
  out: number;            // ticks until game over, once the run has ended
  why: string;            // why it ended, for the banner
  idle: number;           // ticks since the ball came to rest (autopilot pacing)
  done: boolean;
}

const W = 120;
const LEFT = 3;           // usable x range for the ball
const RIGHT = W - 4;
const TOP = 16;           // loss 1
const BOTTOM = 84;        // loss 0
const RATES = [60, 120, 240, 480, 960, 1920, 3840];   // px moved per unit of slope
const HOP_TICKS = 12;

// ── Landscape ────────────────────────────────────────────────────────────────

function rawLoss(p: number[], x: number): number {
  const [c, bowl, amp, f1, f2, p1, p2] = p;
  const u = (x - c) / W;
  return bowl * u * u + amp * (0.6 * Math.sin(x * f1 + p1) + 0.4 * Math.sin(x * f2 + p2));
}

/** A level's landscape, normalised to loss 0.08..0.92, with its target. */
function makeLevel(r: () => number, level: number): { shape: number[]; target: number } {
  for (let attempt = 0; ; attempt++) {
    const shape = [
      W * (0.25 + 0.5 * r()),                         // where the real minimum sits
      2.2 + r(),                                      // bowl depth
      0.06 + Math.min(0.22, level * 0.035),           // bumps grow with the level
      0.09 + r() * 0.05 + level * 0.006,
      0.21 + r() * 0.08 + level * 0.01,
      r() * 6.28, r() * 6.28,
    ];
    const ys: number[] = [];
    for (let x = LEFT; x <= RIGHT; x++) ys.push(rawLoss(shape, x));
    const lo = Math.min(...ys), hi = Math.max(...ys);
    const norm = (v: number) => 0.08 + 0.84 * (v - lo) / (hi - lo);
    // Local minima, lowest first: the target sits between the best and the runner-up.
    const minima = ys
      .map((v, i) => ({ v: norm(v), i }))
      .filter(({ i }) => i > 0 && i < ys.length - 1 && ys[i] <= ys[i - 1] && ys[i] <= ys[i + 1])
      .map(m => m.v)
      .sort((a, b) => a - b);
    const best = minima[0] ?? 0.08;
    const next = minima[1] ?? best + 0.3;
    if (next - best < 0.07 && attempt < 30) continue;
    shape.push(lo, hi);
    return { shape, target: best + Math.min(0.08, (next - best) * 0.4) };
  }
}

const loss = (s: State, x: number) => {
  const lo = s.shape[7], hi = s.shape[8];
  return 0.08 + 0.84 * (rawLoss(s.shape, x) - lo) / (hi - lo);
};
const lossY = (l: number) => TOP + (1 - l) * (BOTTOM - TOP);
const curveY = (s: State, x: number) => lossY(loss(s, x));
const clampX = (x: number) => Math.max(LEFT, Math.min(RIGHT, x));

/** Where a gradient step at learning rate `lr` lands from `x`. */
function landing(s: State, x: number, lr: number): number {
  const slope = (loss(s, x + 0.5) - loss(s, x - 0.5));
  return clampX(x - RATES[lr] * slope);
}

/** In a false minimum: no learning rate moves the ball a whole pixel. */
const stuck = (s: State) => RATES.every((_, i) => Math.abs(landing(s, s.x, i) - s.x) < 1);

function end(s: State, why: string) {
  s.why = why;
  s.out = 60;
  s.banner = 60;
}

function startLevel(s: State) {
  const { shape, target } = makeLevel(s.r, s.level);
  s.shape = shape;
  s.target = target;
  // Start at whichever end is farther from the real minimum.
  s.x = shape[0] > W / 2 ? LEFT + 2 : RIGHT - 2;
  s.steps = Math.max(5, 11 - s.level);
  s.hop = null;
  s.converged = false;
  s.banner = 40;
  s.idle = 0;
}

// ── Autopilot ────────────────────────────────────────────────────────────────

/** Score of the best route from x within `depth` steps: lower is better;
 *  below zero means it reaches the target, sooner scoring lower. */
function route(s: State, x: number, depth: number): number {
  let best = loss(s, x);
  for (let i = 0; i < RATES.length; i++) {
    const nx = landing(s, x, i);
    if (Math.abs(nx - x) < 1) continue;
    const v = loss(s, nx) <= s.target ? -depth : depth > 1 ? route(s, nx, depth - 1) : loss(s, nx);
    if (v < best) best = v;
  }
  return best;
}

const plans = new Map<string, number>();

/** The learning rate the autopilot wants for its next step. */
function plan(s: State): number {
  const key = `${s.shape[0]}:${s.x}:${s.steps}`;
  const known = plans.get(key);
  if (known !== undefined) return known;
  const depth = Math.min(3, s.steps);
  let want = s.lr, best = Infinity;
  for (let i = 0; i < RATES.length; i++) {
    const nx = landing(s, s.x, i);
    if (Math.abs(nx - s.x) < 1) continue;
    const v = loss(s, nx) <= s.target ? -depth - 1 : depth > 1 ? route(s, nx, depth - 1) : loss(s, nx);
    if (v < best) { best = v; want = i; }
  }
  if (plans.size > 200) plans.clear();
  plans.set(key, want);
  return want;
}

// ── Game ─────────────────────────────────────────────────────────────────────

const descent: Game<State> = {
  id: 'descent',
  title: 'Descent',
  hint: 'arrows tune rate  A take a step',

  create(seed) {
    const s = {
      r: rng(seed), level: 1, shape: [], target: 0, x: 0, lr: 3, steps: 0,
      hop: null, banner: 0, converged: false, out: 0, why: '', idle: 0, done: false,
    } as State;
    startLevel(s);
    return s;
  },

  tick(s, { pressed }) {
    if (s.done) return;
    if (s.banner > 0) s.banner--;

    if (s.converged) {
      if (s.banner === 0) { s.level++; startLevel(s); }
      return;
    }
    if (s.out > 0) { if (--s.out === 0) s.done = true; return; }

    if (pressed.left || pressed.down) s.lr = Math.max(0, s.lr - 1);
    if (pressed.right || pressed.up) s.lr = Math.min(RATES.length - 1, s.lr + 1);

    if (s.hop) {
      if (++s.hop.t >= HOP_TICKS) {
        s.x = s.hop.to;
        s.hop = null;
        s.idle = 0;
        if (loss(s, s.x) <= s.target) { s.converged = true; s.banner = 45; }
        else if (stuck(s)) end(s, 'local minimum');
        else if (s.steps === 0) end(s, 'out of steps');
      }
      return;
    }
    s.idle++;
    if (pressed.a && s.steps > 0) {
      s.steps--;
      s.hop = { from: s.x, to: landing(s, s.x, s.lr), t: 0 };
    }
  },

  draw(s, g) {
    g.clear(0);
    // Ground under the curve, then the curve two pixels thick.
    for (let x = 0; x < W; x++) {
      const y = curveY(s, clampX(x));
      g.rect(x, y + 2, 1, g.H - y, 1);
      g.rect(x, y, 1, 2, 3);
    }
    // Target: a dashed line with its label.
    const ty = Math.round(lossY(s.target));
    for (let x = 0; x < W; x += 4) g.rect(x, ty, 2, 1, 2);
    g.rect(W - 31, ty - 9, 31, 8, 0);                // keep the label readable over the curve
    g.text('target', W - 2, ty - 8, 2, 'right');

    // Ball, mid-hop on an arc, or resting on the curve.
    let bx = s.x, by = curveY(s, s.x);
    if (s.hop) {
      const t = s.hop.t / HOP_TICKS;
      bx = s.hop.from + (s.hop.to - s.hop.from) * t;
      const lift = Math.min(18, 4 + Math.abs(s.hop.to - s.hop.from) * 0.35);
      by = curveY(s, s.hop.from) * (1 - t) + curveY(s, s.hop.to) * t - lift * Math.sin(Math.PI * t);
    } else if (!s.converged && s.out === 0 && s.steps > 0) {
      // Ghost: where the next step lands at this learning rate.
      const gx = Math.round(landing(s, s.x, s.lr));
      const gy = Math.round(curveY(s, gx));
      g.rect(gx - 2, gy - 5, 5, 1, 2); g.rect(gx - 2, gy - 1, 5, 1, 2);
      g.rect(gx - 2, gy - 4, 1, 3, 2); g.rect(gx + 2, gy - 4, 1, 3, 2);
    }
    g.rect(Math.round(bx) - 2, Math.round(by) - 5, 5, 5, 3);
    g.rect(Math.round(bx) - 1, Math.round(by) - 4, 1, 1, 0);

    // HUD: loss and steps on top, the learning-rate dial underneath.
    g.rect(0, 0, W, 11, 0);
    g.rect(0, 11, W, 1, 3);
    g.text(`loss ${loss(s, s.x).toFixed(2)}`, 3, 2, 3);
    g.text(`steps ${s.steps}`, W - 3, 2, 3, 'right');
    g.rect(0, g.H - 12, W, 12, 0);
    g.rect(0, g.H - 12, W, 1, 3);
    g.text('lr', 3, g.H - 9, 3);
    for (let i = 0; i < RATES.length; i++) {
      const h = 2 + i;                                // taller notch, bigger rate
      g.rect(18 + i * 7, g.H - 3 - h, 5, h, i <= s.lr ? 3 : 1);
    }
    g.text(s.lr <= 1 ? 'small' : s.lr >= 5 ? 'big' : '', W - 3, g.H - 9, 2, 'right');

    if (s.banner > 0) {
      const msg = s.out > 0 ? s.why : s.converged ? 'converged' : `level ${s.level}`;
      g.rect(12, 34, W - 24, 15, 3);
      g.text(msg, W / 2, 38, 0, 'center');
    }
  },

  over: s => s.done,
  score: s => s.level - 1,
  formatScore: n => `${n} solved`,

  demo(s) {
    const b = noButtons();
    if (s.hop || s.converged || s.banner > 0 || s.out > 0) return b;
    // Plan a few steps ahead, dial to the first step's rate, then step.
    // Presses alternate with releases so each one registers as a fresh tap.
    const want = plan(s);
    if (s.idle % 2) return b;
    if (want < s.lr) b.left = true;
    else if (want > s.lr) b.right = true;
    else if (s.idle > 24) b.a = true;
    return b;
  },
};

export default descent;
