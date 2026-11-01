// descent.ts — roll a ball down a loss curve. The curve trends downhill but
// is full of local minima that get deeper the further you go; ← → nudge the
// ball, A hops it out of a dip. Stop making progress for four seconds and the
// run has converged. The score is the lowest loss you reached.

import { noButtons, rng, type Game } from './types';

interface State {
  x: number;          // ball, world px
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  phases: number[];   // curve shape, from the seed
  minLoss: number;
  minX: number;
  maxX: number;
  sinceProgress: number;
  done: boolean;
}

const TOP = 16;       // curve space starts under the HUD
const SPAN = 78;      // px from loss 1 to loss 0
const CAM = 36;       // ball's screen x
const GRAVITY = 0.11;
const STALL_TICKS = 120;

function loss(s: State, x: number): number {
  const [p1, p2, p3] = s.phases;
  const trend = 0.82 * Math.exp(-x / 1400) + 0.06;
  const amp = 0.035 + Math.min(0.11, x / 9000);
  const bumps = Math.sin(x * 0.045 + p1) * 0.55 + Math.sin(x * 0.019 + p2) * 0.3 + Math.sin(x * 0.11 + p3) * 0.15;
  return Math.min(1, Math.max(0, trend + amp * bumps));
}

// Screen y of the curve: high loss near the top, low loss near the bottom.
const curveY = (s: State, x: number) => TOP + (1 - loss(s, x)) * SPAN;
const slope = (s: State, x: number) => curveY(s, x + 0.5) - curveY(s, x - 0.5);

const descent: Game<State> = {
  id: 'descent',
  title: 'Descent',
  hint: '← → nudge  A hop',

  create(seed) {
    const r = rng(seed);
    const s: State = {
      x: 8, y: 0, vx: 0.6, vy: 0, grounded: true,
      phases: [r() * 6.28, r() * 6.28, r() * 6.28],
      minLoss: 1, minX: 8, maxX: 8, sinceProgress: 0, done: false,
    };
    s.y = curveY(s, s.x);
    s.minLoss = loss(s, s.x);
    return s;
  },

  tick(s, { held, pressed }) {
    if (s.done) return;
    const steer = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    if (s.grounded) {
      const k = slope(s, s.x);
      // Roll: downhill pull along the curve, a weak nudge, rolling friction.
      s.vx += (k / (1 + k * k)) * GRAVITY * 2.2 + steer * 0.018;
      s.vx *= 0.985;
      if (pressed.a) { s.grounded = false; s.vy = -2.1; s.vx += steer * 0.4; }
    } else {
      s.vx += steer * 0.01;
      s.vy += GRAVITY;
    }
    s.vx = Math.max(-2.6, Math.min(2.6, s.vx));
    s.x = Math.max(0, s.x + s.vx);

    if (s.grounded) {
      s.y = curveY(s, s.x);
    } else {
      s.y += s.vy;
      const ground = curveY(s, s.x);
      if (s.y >= ground) { s.y = ground; s.grounded = true; s.vy = 0; }
    }

    const l = loss(s, s.x);
    if (s.grounded && l < s.minLoss) { s.minLoss = l; s.minX = s.x; }
    if (s.x > s.maxX + 1) { s.maxX = s.x; s.sinceProgress = 0; }
    else if (++s.sinceProgress > STALL_TICKS) s.done = true;
  },

  draw(s, g) {
    g.clear(0);
    const camX = s.x - CAM;
    // Ground under the curve, then the curve itself two pixels thick.
    for (let sx = 0; sx < g.W; sx++) {
      const y = curveY(s, camX + sx);
      g.rect(sx, y + 2, 1, g.H - y, 1);
      g.rect(sx, y, 1, 2, 3);
    }
    // Flag at the lowest point reached so far.
    const fx = s.minX - camX;
    if (fx > -4 && fx < g.W) {
      const fy = curveY(s, s.minX);
      g.rect(fx, fy - 9, 1, 9, 3);
      g.rect(fx + 1, fy - 9, 4, 3, 2);
    }
    // Ball: a 5×5 block with a highlight.
    g.rect(CAM - 2, s.y - 5, 5, 5, 3);
    g.rect(CAM - 1, s.y - 4, 1, 1, 0);
    // HUD.
    g.rect(0, 0, g.W, 11, 0);
    g.rect(0, 11, g.W, 1, 3);
    g.text(`loss ${loss(s, s.x).toFixed(3)}`, 3, 2, 3);
    g.text(`min ${s.minLoss.toFixed(3)}`, g.W - 3, 2, 2, 'right');
    // Stall meter: fills as the run converges.
    if (s.sinceProgress > 30) g.rect(0, 12, (s.sinceProgress / STALL_TICKS) * g.W, 1, 2);
  },

  over: s => s.done,
  score: s => Math.round((1 - s.minLoss) * 1000),
  formatScore: n => `loss ${(1 - n / 1000).toFixed(3)}`,

  demo(s) {
    const b = noButtons();
    b.right = true;
    // Hop when the ball is climbing out of a dip and running out of speed.
    if (s.grounded && slope(s, s.x + 4) < -0.25 && s.vx < 0.7) b.a = true;
    return b;
  },
};

export default descent;
