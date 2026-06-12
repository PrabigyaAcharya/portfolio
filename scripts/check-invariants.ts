#!/usr/bin/env tsx
// scripts/check-invariants.ts — sync invariant checks for content/
// Run via: npx tsx scripts/check-invariants.ts
// Set PROD_GUARD=1 to make TODO(prabigya) strings throw errors instead of warnings.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import yaml from 'js-yaml';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const contentDir = resolve(root, 'content');
const PROD_GUARD = process.env.PROD_GUARD === '1';

let errors = 0;
let warnings = 0;

function warn(msg: string) {
  console.warn(`[WARN] ${msg}`);
  warnings++;
}

function fail(msg: string) {
  if (PROD_GUARD) {
    console.error(`[ERROR] ${msg}`);
    errors++;
  } else {
    warn(msg);
  }
}

// ── Load YAML ─────────────────────────────────────────────────────────────────

interface Publication {
  id: string;
  bibtex: string;
  thread: string;
  [key: string]: unknown;
}

interface SiteConfig {
  research_threads: Array<{ id: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

const publications = yaml.load(
  readFileSync(resolve(contentDir, 'publications.yaml'), 'utf-8')
) as Publication[];

const site = yaml.load(
  readFileSync(resolve(contentDir, 'site.yaml'), 'utf-8')
) as SiteConfig;

// ── Check 1: bibtex key matches id ────────────────────────────────────────────

console.log('[check-invariants] Checking bibtex keys match publication IDs...');
for (const pub of publications) {
  // Extract the first @type{key, ... } from bibtex
  const bibtexKeyMatch = pub.bibtex.match(/@\w+\{([^,\s]+)/);
  if (!bibtexKeyMatch) {
    warn(`Publication "${pub.id}": could not parse bibtex key`);
    continue;
  }
  const bibtexKey = bibtexKeyMatch[1].trim();
  if (bibtexKey !== pub.id) {
    warn(`Publication "${pub.id}": bibtex key "${bibtexKey}" does not match id "${pub.id}"`);
  }
}

// ── Check 2: thread references are valid ──────────────────────────────────────

console.log('[check-invariants] Checking publication threads reference valid site threads...');
const validThreadIds = new Set(site.research_threads.map((t) => t.id));
for (const pub of publications) {
  if (!validThreadIds.has(pub.thread)) {
    warn(`Publication "${pub.id}": thread "${pub.thread}" not found in site.yaml research_threads`);
  }
}

// ── Check 3: non-draft notebook posts would appear in API ────────────────────

console.log('[check-invariants] Checking notebook posts...');
const notebookDir = resolve(contentDir, 'notebook');
const notebookFiles = existsSync(notebookDir)
  ? readdirSync(notebookDir).filter((f) => ['.md', '.mdx'].includes(extname(f)))
  : [];

for (const file of notebookFiles) {
  const filePath = resolve(notebookDir, file);
  const raw = readFileSync(filePath, 'utf-8');

  // Parse frontmatter (simple YAML between --- delimiters)
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    warn(`Notebook file "${file}": no frontmatter found`);
    continue;
  }
  const fm = yaml.load(fmMatch[1]) as { draft?: boolean; title?: string };
  if (!fm.draft) {
    // Non-draft posts should have title and other required fields
    if (!fm.title) {
      warn(`Notebook file "${file}": non-draft post has no title`);
    }
  }
}

// ── Check 4: TODO(prabigya) strings in content files ─────────────────────────

console.log('[check-invariants] Checking for TODO(prabigya) placeholders...');

function checkFileForTodos(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  if (content.includes('TODO(prabigya)')) {
    const msg = `File "${filePath.replace(root + '/', '')}" contains TODO(prabigya) placeholders — real content required in production`;
    fail(msg);
  }
}

// Check all YAML files in content/
const contentFiles = [
  'site.yaml',
  'publications.yaml',
  'now.yaml',
  'cv.yaml',
  'eval/questions.yaml',
];
for (const f of contentFiles) {
  const fp = resolve(contentDir, f);
  if (existsSync(fp)) checkFileForTodos(fp);
}

// Check notebook posts
for (const file of notebookFiles) {
  checkFileForTodos(resolve(notebookDir, file));
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n[check-invariants] Done. ${warnings} warning(s), ${errors} error(s).`);
if (errors > 0) {
  console.error('[check-invariants] Failing due to errors (PROD_GUARD=1).');
  process.exit(1);
}
if (warnings > 0 && !PROD_GUARD) {
  console.warn('[check-invariants] Warnings above. Set PROD_GUARD=1 to treat as errors.');
}
