#!/usr/bin/env tsx
// scripts/build-portrait.ts — turns the photo named in site.yaml (portrait.src,
// relative to content/) into the LCD pixel portrait at
// site/public/images/portrait-mask.png. Run before every build and dev server.
//
// The output is an alpha mask, not a picture: 48×48 LCD pixels, Bayer-dithered
// to four levels of ink coverage, stored at 4× with nearest-neighbour so it
// stays crisp at 1× and ½×. Pages paint it with `mask-image` over
// `var(--screen-ink)`, so its colour always comes from the tokens.
//
// No photo, no change: an existing mask is kept (so the photo itself never has
// to be committed), and without either the pages show a TODO placeholder.

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import yaml from 'js-yaml';
import sharp from 'sharp';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const out = resolve(root, 'site', 'public', 'images', 'portrait-mask.png');

const SIZE = 48;   // LCD pixels per side
const UP = 4;      // stored scale
const LEVELS = 4;  // screen, light, mid, full ink

// 4×4 ordered-dither thresholds, 0..1.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);

const site = yaml.load(readFileSync(resolve(root, 'content', 'site.yaml'), 'utf-8')) as { portrait?: { src: string } };
const src = site.portrait?.src ? resolve(root, 'content', site.portrait.src) : null;

async function main(src: string) {
  const { data } = await sharp(src)
    .rotate()                                         // respect EXIF orientation
    .resize(SIZE, SIZE, { fit: 'cover', position: sharp.strategy.attention })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Darker photo pixels get more ink.
  const levels = new Uint8Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Near-white reads as bare screen, so backgrounds don't fill with stray dots.
      const ink = Math.max(0, (1 - data[y * SIZE + x] / 255 - 0.08) / 0.92);
      const t = BAYER[(y % 4) * 4 + (x % 4)];
      levels[y * SIZE + x] = Math.min(LEVELS - 1, Math.floor(ink * (LEVELS - 1) + t));
    }
  }

  const W = SIZE * UP;
  const rgba = Buffer.alloc(W * W * 4);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const level = levels[Math.floor(y / UP) * SIZE + Math.floor(x / UP)];
      rgba[(y * W + x) * 4 + 3] = Math.round((level / (LEVELS - 1)) * 255);
    }
  }

  mkdirSync(dirname(out), { recursive: true });
  await sharp(rgba, { raw: { width: W, height: W, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  console.log(`[build-portrait] wrote ${out}`);
}

if (!src || !existsSync(src)) {
  const why = src ? `${site.portrait!.src} not found in content/` : 'no portrait.src in site.yaml';
  console.warn(`[build-portrait] ${why}; ${existsSync(out) ? 'keeping the existing mask' : 'pages will show the TODO placeholder'}.`);
} else {
  main(src).catch((err) => { console.error('[build-portrait]', err); process.exit(1); });
}
