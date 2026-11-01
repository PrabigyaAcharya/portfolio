// descent.ts — keep going down. Ledges with one gap each rise up the screen;
// steer the ball with ← → and drop through the gaps. Ride a ledge up into the
// spikes under the HUD and the run is over. Every ledge you get below brings
// the loss down; the score is how many you passed.

import { noButtons, rng, type Game } from './types';

interface Ledge {
  y: number;          // top edge
  gap: number;        // gap's left edge
  width: number;      // gap's width
  passed: boolean;
}

interface State {
  r: () => number;
  x: number;          // ball's left edge
  y: number;          // ball's top edge
  vy: number;
  ledges: Ledge[];
  depth: number;      // ledges passed
  done: boolean;
}

const W = 120;
const H = 100;
const TOP = 16;       // under the HUD and the spikes
const BALL = 4;
const THICK = 3;      // ledge thickness
const SPACING = 22;
const GRAVITY = 0.16;
const FALL_MAX = 2.6;
const MOVE = 1.6;

const rise = (s: State) => Math.min(0.85, 0.3 + s.depth * 0.006);
const lossAt = (depth: number) => 1 / (1 + depth * 0.08);

function addLedge(s: State, y: number) {
  const width = Math.max(12, 19 - Math.floor(s.depth / 8));
  s.ledges.push({ y, gap: 2 + Math.floor(s.r() * (W - width - 4)), width, passed: false });
}

/** Whether the ball comes to rest on this ledge this tick. */
function landing(s: State, ledge: Ledge): boolean {
  const bottom = s.y + BALL;
  const inGap = s.x >= ledge.gap && s.x + BALL <= ledge.gap + ledge.width;
  return !inGap && bottom >= ledge.y && bottom <= ledge.y + THICK + FALL_MAX;
}

const descent: Game<State> = {
  id: 'descent',
  title: 'Descent',
  hint: 'arrows steer',

  create(seed) {
    const s: State = { r: rng(seed), x: W / 2 - 2, y: TOP + 4, vy: 0, ledges: [], depth: 0, done: false };
    for (let y = 60; y < H + SPACING; y += SPACING) addLedge(s, y);
    return s;
  },

  tick(s, { held }) {
    if (s.done) return;
    const v = rise(s);
    for (const l of s.ledges) l.y -= v;
    s.ledges = s.ledges.filter(l => l.y > TOP - THICK);
    const last = s.ledges[s.ledges.length - 1];
    if (!last || last.y < H) addLedge(s, (last?.y ?? H) + SPACING);

    // Steer, but never sideways into a ledge the ball is dropping through. A
    // ball resting on a ledge sits up to one tick of rise into it; that one
    // isn't "through", hence the pixel of slack.
    const steer = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    s.x = Math.max(0, Math.min(W - BALL, s.x + steer * MOVE));
    for (const l of s.ledges) {
      if (s.y + BALL > l.y + 1 && s.y < l.y + THICK) s.x = Math.max(l.gap, Math.min(l.gap + l.width - BALL, s.x));
    }

    // Fall, or ride the ledge underneath up the screen.
    s.vy = Math.min(FALL_MAX, s.vy + GRAVITY);
    s.y += s.vy;
    const under = s.ledges.find(l => landing(s, l));
    if (under) { s.y = under.y - BALL; s.vy = 0; }
    s.y = Math.min(H - BALL, s.y);

    for (const l of s.ledges) {
      if (!l.passed && s.y > l.y + THICK) { l.passed = true; s.depth++; }
    }
    if (s.y <= TOP) s.done = true;
  },

  draw(s, g) {
    g.clear(0);
    // Shaft walls, faintly.
    g.rect(0, TOP, 1, H - TOP, 1);
    g.rect(W - 1, TOP, 1, H - TOP, 1);
    // Ledges with their gaps.
    for (const l of s.ledges) {
      const y = Math.round(l.y);
      g.rect(0, y, l.gap, THICK, 3);
      g.rect(l.gap + l.width, y, W - l.gap - l.width, THICK, 3);
    }
    // Ball, with a highlight.
    const bx = Math.round(s.x), by = Math.round(s.y);
    g.rect(bx, by, BALL, BALL, 3);
    g.rect(bx + 1, by + 1, 1, 1, 0);
    // Spikes along the top: ride a ledge into them and the run is over.
    g.rect(0, 12, W, 1, 3);
    for (let x = 0; x < W; x += 4) { g.rect(x + 1, 13, 2, 1, 3); g.rect(x + 1.5, 14, 1, 1, 2); }
    // HUD.
    g.rect(0, 0, W, 12, 0);
    g.rect(0, 11, W, 1, 3);
    g.text(`loss ${lossAt(s.depth).toFixed(3)}`, 3, 2, 3);
    g.text(`depth ${s.depth}`, W - 3, 2, 2, 'right');
  },

  over: s => s.done,
  score: s => s.depth,
  formatScore: n => `loss ${lossAt(n).toFixed(3)}`,

  demo(s) {
    const b = noButtons();
    // Head for the gap of the next ledge below.
    const next = s.ledges.find(l => l.y >= s.y + BALL - 1);
    if (!next) return b;
    const target = next.gap + (next.width - BALL) / 2;
    if (s.x < target - 1) b.right = true;
    else if (s.x > target + 1) b.left = true;
    return b;
  },
};

export default descent;
