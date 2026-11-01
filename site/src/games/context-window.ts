// context-window.ts — steer a chain of tokens around the grid. Every token
// you eat makes the chain longer; if it grows past the context window, the
// run ends in an overflow. Summary tokens (the blinking diamonds) halve the
// chain, so the game is choosing when to grow and when to compress. Walls and
// your own tail end the run too. The window widens a little each level.

import { noButtons, rng, type Buttons, type Game } from './types';

type Cell = [number, number];
type Dir = 'up' | 'down' | 'left' | 'right';

interface State {
  rand: () => number;
  body: Cell[];          // head first
  dir: Dir;
  next: Dir;
  wait: number;          // ticks until the next move
  food: Cell;
  summary: { at: Cell; ttl: number } | null;
  eaten: number;
  points: number;
  done: boolean;
  overflow: boolean;
}

const CELL = 6;
const COLS = 20;
const ROWS = 14;
const TOP = 13;
const DELTA: Record<Dir, Cell> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

const level = (s: State) => Math.floor(s.eaten / 8);
const windowSize = (s: State) => 12 + level(s) * 2;
const moveEvery = (s: State) => Math.max(3, 6 - level(s));
const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];

function freeCell(s: State): Cell {
  for (;;) {
    const c: Cell = [Math.floor(s.rand() * COLS), Math.floor(s.rand() * ROWS)];
    if (!s.body.some(b => same(b, c)) && !(s.summary && same(s.summary.at, c))) return c;
  }
}

function blocked(s: State, c: Cell): boolean {
  return c[0] < 0 || c[1] < 0 || c[0] >= COLS || c[1] >= ROWS
    || s.body.slice(0, -1).some(b => same(b, c));
}

const contextWindow: Game<State> = {
  id: 'context-window',
  title: 'Context Window',
  hint: 'arrows steer',

  create(seed) {
    const s: State = {
      rand: rng(seed),
      body: [[6, 7], [5, 7], [4, 7]],
      dir: 'right', next: 'right', wait: 6,
      food: [0, 0], summary: null,
      eaten: 0, points: 0, done: false, overflow: false,
    };
    s.food = freeCell(s);
    return s;
  },

  tick(s, { pressed }) {
    if (s.done) return;
    for (const d of ['up', 'down', 'left', 'right'] as Dir[]) {
      if (pressed[d] && d !== OPPOSITE[s.dir]) s.next = d;
    }
    if (s.summary && --s.summary.ttl <= 0) s.summary = null;
    if (--s.wait > 0) return;
    s.wait = moveEvery(s);

    s.dir = s.next;
    const [dx, dy] = DELTA[s.dir];
    const head: Cell = [s.body[0][0] + dx, s.body[0][1] + dy];
    if (blocked(s, head)) { s.done = true; return; }
    s.body.unshift(head);

    if (same(head, s.food)) {
      s.eaten++;
      s.points += 10;
      s.food = freeCell(s);
      if (s.eaten % 5 === 0 && !s.summary) s.summary = { at: freeCell(s), ttl: 240 };
      if (s.body.length > windowSize(s)) { s.done = true; s.overflow = true; }
      return;                                        // grow: keep the tail
    }
    if (s.summary && same(head, s.summary.at)) {
      s.summary = null;
      s.points += 25;
      s.body.length = Math.max(3, Math.ceil(s.body.length / 2));
    }
    s.body.pop();
  },

  draw(s, g) {
    g.clear(0);
    // Board frame.
    g.rect(0, TOP - 1, g.W, 1, 3);
    for (const [i, [x, y]] of s.body.entries()) {
      const px = x * CELL, py = TOP + y * CELL;
      g.rect(px, py, CELL - 1, CELL - 1, 3);
      if (i === 0) g.rect(px + 2, py + 2, 1, 1, 0);
    }
    const [fx, fy] = s.food;
    g.rect(fx * CELL, TOP + fy * CELL, CELL - 1, CELL - 1, 2);
    g.rect(fx * CELL + 2, TOP + fy * CELL + 2, 1, 1, 0);
    if (s.summary && (s.summary.ttl > 60 || Math.floor(g.frame / 4) % 2 === 0)) {
      const [sx, sy] = s.summary.at;
      const px = sx * CELL, py = TOP + sy * CELL;
      g.rect(px + 2, py, 1, 5, 3);
      g.rect(px, py + 2, 5, 1, 3);
      g.rect(px + 1, py + 1, 3, 3, 3);
    }
    // HUD: score, then how full the context is.
    g.text(String(s.points), 3, 2, 3);
    const win = windowSize(s);
    g.text(`ctx ${s.body.length}/${win}`, g.W - 3, 2, s.body.length >= win - 2 ? 3 : 2, 'right');
    g.rect(0, TOP - 2, (Math.min(s.body.length, win) / win) * g.W, 1, 2);
    if (s.overflow) g.text('overflow', g.W / 2, TOP + 36, 3, 'center');
  },

  over: s => s.done,
  score: s => s.points,
  formatScore: n => `${n} pts`,

  demo(s) {
    const b: Buttons = noButtons();
    const head = s.body[0];
    const wantSummary = s.summary && s.body.length > windowSize(s) * 0.5;
    const target = wantSummary ? s.summary!.at : s.food;
    let bestDir: Dir = s.dir;
    let bestDist = Infinity;
    for (const d of ['up', 'down', 'left', 'right'] as Dir[]) {
      if (d === OPPOSITE[s.dir]) continue;
      const c: Cell = [head[0] + DELTA[d][0], head[1] + DELTA[d][1]];
      if (blocked(s, c)) continue;
      // Avoid eating plain tokens when that would overflow.
      if (same(c, s.food) && s.body.length + 1 > windowSize(s)) continue;
      const dist = Math.abs(c[0] - target[0]) + Math.abs(c[1] - target[1]);
      if (dist < bestDist) { bestDist = dist; bestDir = d; }
    }
    b[bestDir] = true;
    return b;
  },
};

export default contextWindow;
