// descent.ts — keep going down. Ledges with one gap each rise up the screen;
// steer the ball with ← → and drop through the gaps. Ride a ledge up into the
// spikes under the HUD and the run is over. Every eight ledges the game steps
// up a speed tier: ledges rise faster, gaps narrow, steering quickens. Every
// ledge you get below brings the loss down; the score is how many you passed.

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
  speed: number;      // current rise, eased toward the tier's
  flash: number;      // ticks left on the "faster" banner
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
const TIER = 8;      // ledges per speed tier

const tier = (s: State) => Math.floor(s.depth / TIER);
// No plateau: the rise keeps climbing toward the ball's top falling speed and
// the gaps toward the ball's width, so even a perfect run ends eventually.
const riseFor = (t: number) => Math.min(FALL_MAX - 0.1, 0.45 + t * 0.14);   // px per tick
const moveFor = (t: number) => Math.min(3.2, 1.6 + t * 0.12);
const gapFor = (t: number) => Math.max(BALL + 2, 18 - t);
const lossAt = (depth: number) => 1 / (1 + depth * 0.08);

function addLedge(s: State, y: number) {
  const width = gapFor(tier(s));
  s.ledges.push({ y, gap: 2 + Math.floor(s.r() * (W - width - 4)), width, passed: false });
}

const inGap = (x: number, l: Ledge) => x >= l.gap && x + BALL <= l.gap + l.width;
/** The ball and the ledge's band share at least one row. */
const overlaps = (s: State, l: Ledge) => s.y + BALL > l.y && s.y < l.y + THICK;

const descent: Game<State> = {
  id: 'descent',
  title: 'Descent',
  hint: 'arrows steer',

  create(seed) {
    const s: State = { r: rng(seed), x: W / 2 - 2, y: TOP + 4, vy: 0, ledges: [], depth: 0, speed: riseFor(0), flash: 0, done: false };
    for (let y = 60; y < H + SPACING; y += SPACING) addLedge(s, y);
    return s;
  },

  tick(s, { held }) {
    if (s.done) return;
    // Ease into each new tier's speed over about a second instead of jolting.
    s.speed += (riseFor(tier(s)) - s.speed) * 0.05;
    if (s.flash > 0) s.flash--;
    for (const l of s.ledges) l.y -= s.speed;
    s.ledges = s.ledges.filter(l => l.y > TOP - THICK);
    const last = s.ledges[s.ledges.length - 1];
    if (!last || last.y < H) addLedge(s, (last?.y ?? H) + SPACING);

    // Steer. A ball already inside a gap stays between its walls; one that
    // overlaps a ledge any other way is resting on it (the ledge rose into
    // it this tick) and the landing below settles that.
    const steer = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    const nx = Math.max(0, Math.min(W - BALL, s.x + steer * moveFor(tier(s))));
    const through = s.ledges.find(l => overlaps(s, l) && inGap(s.x, l));
    s.x = through ? Math.max(through.gap, Math.min(through.gap + through.width - BALL, nx)) : nx;

    // Fall, then stand on any ledge the ball overlaps outside its gap: one it
    // fell onto, or one that rose into it. The overlap window (ball plus
    // ledge, 7px) is wider than a tick of fall plus rise, so nothing tunnels.
    s.vy = Math.min(FALL_MAX, s.vy + GRAVITY);
    s.y = Math.min(H - BALL, s.y + s.vy);
    const under = s.ledges.find(l => overlaps(s, l) && !inGap(s.x, l));
    if (under) { s.y = under.y - BALL; s.vy = 0; }

    for (const l of s.ledges) {
      if (!l.passed && s.y > l.y + THICK) {
        l.passed = true;
        s.depth++;
        if (s.depth % TIER === 0) s.flash = 45;
      }
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
    // A blinking banner as each speed tier starts.
    if (s.flash > 0 && Math.floor(s.flash / 8) % 2 === 0) {
      g.rect(34, 44, W - 68, 13, 3);
      g.text('faster', W / 2, 47, 0, 'center');
    }
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
