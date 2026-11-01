#!/usr/bin/env tsx
// scripts/build-portrait.ts — turns the hand-drawn sprite named in site.yaml
// (portrait.src, relative to content/) into the LCD pixel portrait at
// site/public/images/portrait-mask.png. Run before every build and dev server.
//
// The sprite is a square text grid, one character per LCD pixel:
//   .  bare screen     -  light ink     +  mid ink     #  full ink
// The output is an alpha mask, not a picture, stored at 12 px per sprite
// pixel, so any display size that is a whole multiple of the sprite side
// (64 → 128, 192) stays crisp on 1× and 2× screens. Pages paint it
// with `mask-image` over `var(--screen-ink)`, so its colour always comes from
// the tokens.
//
// No sprite, no mask: the pages then show no portrait.

import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const out = resolve(root, 'site', 'public', 'images', 'portrait-mask.png');

const UP = 12;    // stored px per sprite pixel
const INK: Record<string, number> = { '.': 0, '-': 1, '+': 2, '#': 3 };

const site = yaml.load(readFileSync(resolve(root, 'content', 'site.yaml'), 'utf-8')) as { portrait?: { src: string } };
const src = site.portrait?.src ? resolve(root, 'content', site.portrait.src) : null;

function fail(msg: string): never {
  console.error(`[build-portrait] ${src}: ${msg}`);
  process.exit(1);
}

async function main(src: string) {
  const rows = readFileSync(src, 'utf-8').split('\n').map(r => r.trimEnd()).filter(Boolean);
  const n = rows.length;
  rows.forEach((r, y) => {
    if (r.length !== n) fail(`row ${y + 1} is ${r.length} wide, expected ${n}`);
    const bad = [...r].find(c => !(c in INK));
    if (bad) fail(`row ${y + 1} has "${bad}"; use only . - + #`);
  });

  const OUT = n * UP;
  const rgba = Buffer.alloc(OUT * OUT * 4);
  for (let y = 0; y < OUT; y++) {
    for (let x = 0; x < OUT; x++) {
      const level = INK[rows[Math.floor(y / UP)][Math.floor(x / UP)]];
      rgba[(y * OUT + x) * 4 + 3] = Math.round((level / 3) * 255);
    }
  }

  mkdirSync(dirname(out), { recursive: true });
  await sharp(rgba, { raw: { width: OUT, height: OUT, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  console.log(`[build-portrait] wrote ${out} from a ${n}×${n} sprite`);
}

if (!src || !existsSync(src)) {
  console.warn(`[build-portrait] ${src ? `${site.portrait!.src} not found in content/` : 'no portrait.src in site.yaml'}; pages will show no portrait.`);
  rmSync(out, { force: true });
} else {
  main(src).catch((err) => { console.error('[build-portrait]', err); process.exit(1); });
}
