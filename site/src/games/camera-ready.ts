// camera-ready.ts — a page slides back and forth above the stack; A drops it.
// Whatever hangs over the page below is trimmed off, so the stack narrows.
// The deadline bar drains all the time: every page buys a little time, a
// perfectly aligned page buys more. Miss the stack or hit the deadline and
// the run is over. The score is pages stacked.

import { noButtons, rng, type Game } from './types';

interface Slab { x: number; w: number }
interface Falling { x: number; y: number; w: number; vy: number }

interface State {
  rand: () => number;
  stack: Slab[];
  moving: Slab & { dir: number };
  falling: Falling[];
  deadline: number;
  pages: number;
  cam: number;          // px the view has scrolled up
  flash: number;        // ticks of "perfect" label left
  done: boolean;
  missed: boolean;
}

const SLAB = 6;
const FLOOR = 98;
const DEADLINE = 300;   // 10 s at 30 Hz
const W = 120;

const speed = (s: State) => 0.9 + Math.min(1.6, s.pages * 0.07);
const slabY = (s: State, i: number) => FLOOR - (i + 1) * SLAB + s.cam;

function nextMoving(s: State) {
  const top = s.stack[s.stack.length - 1];
  const fromLeft = s.pages % 2 === 0;
  s.moving = { x: fromLeft ? 0 : W - top.w, w: top.w, dir: fromLeft ? 1 : -1 };
}

const cameraReady: Game<State> = {
  id: 'camera-ready',
  title: 'Camera Ready',
  hint: 'A drop',

  create(seed) {
    const s: State = {
      rand: rng(seed),
      stack: [{ x: 30, w: 60 }],
      moving: { x: 0, w: 60, dir: 1 },
      falling: [], deadline: DEADLINE, pages: 0, cam: 0, flash: 0,
      done: false, missed: false,
    };
    nextMoving(s);
    return s;
  },

  tick(s, { pressed }) {
    for (const f of s.falling) { f.vy += 0.25; f.y += f.vy; }
    s.falling = s.falling.filter(f => f.y < 110);
    if (s.flash > 0) s.flash--;
    // Ease the view up so the top of the stack stays in sight.
    const want = Math.max(0, (s.stack.length - 9) * SLAB);
    s.cam += (want - s.cam) * 0.2;
    if (s.done) return;

    if (--s.deadline <= 0) { s.done = true; return; }

    const m = s.moving;
    m.x += m.dir * speed(s);
    if (m.x <= 0) { m.x = 0; m.dir = 1; }
    if (m.x + m.w >= W) { m.x = W - m.w; m.dir = -1; }

    if (!pressed.a) return;
    const top = s.stack[s.stack.length - 1];
    const y = slabY(s, s.stack.length);
    if (Math.abs(m.x - top.x) <= 1) {
      s.stack.push({ x: top.x, w: top.w });
      s.deadline = Math.min(DEADLINE, s.deadline + 90);
      s.flash = 20;
    } else {
      const left = Math.max(m.x, top.x);
      const right = Math.min(m.x + m.w, top.x + top.w);
      if (right - left <= 0) {
        s.falling.push({ x: m.x, y, w: m.w, vy: 0 });
        s.done = true;
        s.missed = true;
        return;
      }
      // The overhang drops off whichever side it was on.
      if (m.x < left) s.falling.push({ x: m.x, y, w: left - m.x, vy: 0 });
      if (m.x + m.w > right) s.falling.push({ x: right, y, w: m.x + m.w - right, vy: 0 });
      s.stack.push({ x: left, w: right - left });
      s.deadline = Math.min(DEADLINE, s.deadline + 45);
    }
    s.pages++;
    nextMoving(s);
  },

  draw(s, g) {
    g.clear(0);
    const page = (x: number, y: number, w: number) => {
      g.rect(x, y, w, SLAB - 1, 3);
      if (w > 2) {
        g.rect(x + 1, y + 1, w - 2, SLAB - 3, 1);
        if (w > 6) g.rect(x + 2, y + 2, Math.max(1, w * 0.6), 1, 2);
      }
    };
    s.stack.forEach((sl, i) => {
      const y = slabY(s, i);
      if (y > 10 && y < g.H) page(sl.x, y, sl.w);
    });
    for (const f of s.falling) page(f.x, f.y, f.w);
    if (!s.done) page(s.moving.x, slabY(s, s.stack.length), s.moving.w);

    // HUD: pages, then the deadline draining from the right.
    g.rect(0, 0, g.W, 12, 0);
    g.text(`pages ${s.pages}`, 3, 2, 3);
    const bar = 46;
    g.rect(g.W - bar - 3, 3, bar, 5, 3);
    g.rect(g.W - bar - 2, 4, bar - 2, 3, 0);
    g.rect(g.W - bar - 2, 4, (bar - 2) * (s.deadline / DEADLINE), 3, s.deadline < 90 && Math.floor(g.frame / 4) % 2 ? 2 : 3);
    g.rect(0, 12, g.W, 1, 3);
    if (s.flash > 0) g.text('perfect', g.W / 2, 18, 3, 'center');
    if (s.done && !s.missed) g.text('deadline', g.W / 2, 18, 3, 'center');
  },

  over: s => s.done && s.falling.length === 0,
  score: s => s.pages,
  formatScore: n => `${n} pages`,

  demo(s) {
    const b = noButtons();
    const top = s.stack[s.stack.length - 1];
    // Usually perfect, now and then a little early, like a person.
    const slack = s.pages % 4 === 3 ? 4 : 1;
    if (Math.abs(s.moving.x - top.x) <= slack && s.rand() < 0.6) b.a = true;
    return b;
  },
};

export default cameraReady;
