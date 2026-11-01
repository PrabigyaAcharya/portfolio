#!/usr/bin/env tsx
// scripts/build-portrait.ts — turns the photo named in site.yaml (portrait.src,
// relative to content/, optionally cut to portrait.crop) into the LCD pixel
// portrait at site/public/images/portrait-mask.png. Run before every build and
// dev server.
//
// The output is an alpha mask, not a picture: 48×48 LCD pixels in four flat
// levels of ink coverage, stored at 4× with nearest-neighbour so it stays
// crisp at 1× and ½×. Pages paint it with `mask-image` over
// `var(--screen-ink)`, so its colour always comes from the tokens.
//
// The levels are flat (no dithering, which turns skin into checkerboard at
// this size) and their thresholds come from the photo's own tone spread, so
// any reasonably lit photo lands on all four.
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
// Share of pixels darker than each cut, darkest first: full ink, mid, light.
// The lightest 30% stay bare screen.
const CUTS = [0.2, 0.42, 0.7];

interface PortraitYaml { src: string; crop?: [number, number, number, number] }
const site = yaml.load(readFileSync(resolve(root, 'content', 'site.yaml'), 'utf-8')) as { portrait?: PortraitYaml };
const portrait = site.portrait;
const src = portrait?.src ? resolve(root, 'content', portrait.src) : null;

async function main(src: string, crop?: PortraitYaml['crop']) {
  let img = sharp(src).rotate();                    // respect EXIF orientation
  if (crop) {
    const [left, top, width, height] = crop;
    img = img.extract({ left, top, width, height });
  }
  const { data } = await img
    .resize(SIZE, SIZE, { fit: 'cover', position: sharp.strategy.attention, kernel: 'lanczos3' })
    .grayscale()                                    // no sharpening: it speckles skin at 48 px
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sorted = Array.from(data.subarray(0, SIZE * SIZE)).sort((a, b) => a - b);
  const th = CUTS.map(c => sorted[Math.floor(c * sorted.length)]);
  const level = (v: number) => (v < th[0] ? 3 : v < th[1] ? 2 : v < th[2] ? 1 : 0);

  const W = SIZE * UP;
  const rgba = Buffer.alloc(W * W * 4);
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const v = data[Math.floor(y / UP) * SIZE + Math.floor(x / UP)];
      rgba[(y * W + x) * 4 + 3] = Math.round((level(v) / 3) * 255);
    }
  }

  mkdirSync(dirname(out), { recursive: true });
  await sharp(rgba, { raw: { width: W, height: W, channels: 4 } }).png({ compressionLevel: 9 }).toFile(out);
  console.log(`[build-portrait] wrote ${out}`);
}

if (!src || !existsSync(src)) {
  const why = src ? `${portrait!.src} not found in content/` : 'no portrait.src in site.yaml';
  console.warn(`[build-portrait] ${why}; ${existsSync(out) ? 'keeping the existing mask' : 'pages will show the TODO placeholder'}.`);
} else {
  main(src, portrait?.crop).catch((err) => { console.error('[build-portrait]', err); process.exit(1); });
}
