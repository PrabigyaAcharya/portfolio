#!/usr/bin/env tsx
// scripts/build-cv.ts — CV PDF builder
// Attempts to compile cv.yaml → cv.typ → prabigya-acharya-cv.pdf via Typst.
// If Typst is not available, exits gracefully (build continues without PDF).
// TODO Phase 2: implement full Typst template generation

import { execSync, execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const OUTPUT_PATH = resolve(__dirname, '../site/public/prabigya-acharya-cv.pdf');

function hasTypst(): boolean {
  try {
    execSync('typst --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('build-cv: checking for Typst...');

  if (!hasTypst()) {
    console.log('build-cv: Typst not found — skipping PDF generation (install typst to enable)');
    console.log('TODO: implement Typst CV build');
    process.exit(0);
  }

  console.log('build-cv: Typst found, but template not yet implemented');
  console.log('TODO Phase 2: generate cv.typ from content/cv.yaml and compile to PDF');
  process.exit(0);
}

main().catch(err => {
  console.error('build-cv error:', err);
  process.exit(0); // graceful — don't fail the build
});
