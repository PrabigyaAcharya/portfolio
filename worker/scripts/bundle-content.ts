#!/usr/bin/env tsx
// worker/scripts/bundle-content.ts
// Reads content/ and writes worker/src/content-bundle.ts
// Run via: npm run bundle-content

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

// Import schemas from shared (tsx handles TS directly)
import {
  SiteSchema,
  PublicationsSchema,
  NowSchema,
  CVSchema,
  EvalQuestionsSchema,
  NotebookFrontmatterSchema,
} from '../../shared/src/schema.js';

const scriptDir = dirname(new URL(import.meta.url).pathname);
const workerDir = resolve(scriptDir, '..');
const root = resolve(workerDir, '..');
const contentDir = resolve(root, 'content');

function loadYaml<T>(schema: z.ZodSchema<T>, filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Validation failed for ${filePath}:\n${errors}`);
  }
  return result.data;
}

// Load all content
const site = loadYaml(SiteSchema, resolve(contentDir, 'site.yaml'));
const publications = loadYaml(PublicationsSchema, resolve(contentDir, 'publications.yaml'));
const now = loadYaml(NowSchema, resolve(contentDir, 'now.yaml'));
const cv = loadYaml(CVSchema, resolve(contentDir, 'cv.yaml'));
const evalQuestions = loadYaml(EvalQuestionsSchema, resolve(contentDir, 'eval', 'questions.yaml'));

// Load notebook posts
interface NotebookPost {
  slug: string;
  title: string;
  date: string;
  updated: string | null;
  tags: string[];
  summary: string;
  draft: boolean;
  math: boolean;
  content: string;
}

const notebookDir = resolve(contentDir, 'notebook');
const notebookPosts: NotebookPost[] = [];

if (existsSync(notebookDir)) {
  const files = readdirSync(notebookDir).filter(f => ['.md', '.mdx'].includes(extname(f)));
  for (const file of files) {
    const slug = basename(file, extname(file));
    const raw = readFileSync(resolve(notebookDir, file), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!fmMatch) {
      console.warn(`[bundle-content] No frontmatter in ${file}, skipping`);
      continue;
    }
    const fm = yaml.load(fmMatch[1]) as Record<string, unknown>;
    const bodyContent = fmMatch[2];

    // Normalize date fields for zod
    if (fm.date instanceof Date) fm.date = fm.date.toISOString().slice(0, 10);
    if (fm.updated instanceof Date) fm.updated = fm.updated.toISOString().slice(0, 10);

    const parsed = NotebookFrontmatterSchema.safeParse(fm);
    if (!parsed.success) {
      console.warn(`[bundle-content] Invalid frontmatter in ${file}:`, parsed.error.issues);
      continue;
    }
    const data = parsed.data;
    notebookPosts.push({
      slug,
      title: data.title,
      date: typeof data.date === 'string' ? data.date : (data.date as Date).toISOString().slice(0, 10),
      updated: data.updated
        ? (typeof data.updated === 'string' ? data.updated : (data.updated as Date).toISOString().slice(0, 10))
        : null,
      tags: data.tags,
      summary: data.summary,
      draft: data.draft,
      math: data.math ?? false,
      content: bodyContent.trim(),
    });
  }
}

// Sort posts by date descending
notebookPosts.sort((a, b) => b.date.localeCompare(a.date));

// Generate the bundle TypeScript file
const bundle = `// AUTO-GENERATED — do not edit by hand; run \`npm run bundle-content\`
// Generated at: ${new Date().toISOString()}

export interface ResearchThread {
  id: string;
  name: string;
  blurb: string;
}

export interface SiteLinks {
  github: string;
  scholar: string;
  email: string;
  linkedin: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  location: string;
  links: SiteLinks;
  mcp_endpoint: string;
  research_threads: ResearchThread[];
}

export interface PublicationLinks {
  pdf?: string;
  arxiv?: string;
  code?: string;
  poster?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  thread: string;
  summary: string;
  abstract: string;
  backstory?: string;
  links: PublicationLinks;
  bibtex: string;
  selected: boolean;
}

export interface NowData {
  updated: string;
  working_on: string[];
  reading: string[];
  open_to: string[];
}

export interface CVEntry {
  org: string;
  role: string;
  start: string;
  end: string;
  details?: string[];
}

export interface CvData {
  education: CVEntry[];
  positions: CVEntry[];
  skills: string[];
  service: string[];
  awards: string[];
}

export interface EvalQuestion {
  id: string;
  question: string;
  type: 'exact' | 'numeric' | 'judged';
  tolerance?: number;
}

export interface NotebookPost {
  slug: string;
  title: string;
  date: string;
  updated: string | null;
  tags: string[];
  summary: string;
  draft: boolean;
  math: boolean;
  content: string;
}

export const site: SiteConfig = ${JSON.stringify(site, null, 2)};

export const publications: Publication[] = ${JSON.stringify(publications, null, 2)};

export const now: NowData = ${JSON.stringify(now, null, 2)};

export const cv: CvData = ${JSON.stringify(cv, null, 2)};

export const evalQuestions: EvalQuestion[] = ${JSON.stringify(evalQuestions, null, 2)};

export const notebookPosts: NotebookPost[] = ${JSON.stringify(notebookPosts, null, 2)};
`;

const outPath = resolve(workerDir, 'src', 'content-bundle.ts');
writeFileSync(outPath, bundle, 'utf-8');
console.log(`[bundle-content] wrote ${outPath}`);
console.log(`[bundle-content] ${publications.length} publications, ${notebookPosts.length} notebook posts, ${evalQuestions.length} eval questions`);
