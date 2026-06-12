#!/usr/bin/env tsx
// scripts/build-llms.ts — generates site/public/llms.txt
// Run as part of the build: `npx tsx ../scripts/build-llms.ts` from site/

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import yaml from 'js-yaml';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const contentDir = resolve(root, 'content');
const publicDir = resolve(root, 'site', 'public');

// Load site.yaml for name + tagline
interface SiteYaml {
  name: string;
  tagline: string;
  mcp_endpoint: string;
}
const site = yaml.load(readFileSync(resolve(contentDir, 'site.yaml'), 'utf-8')) as SiteYaml;

const BASE_URL = (process.env.SITE_URL ?? 'https://prabigya.com.np').replace(/\/$/, '');

const lines: string[] = [
  `# ${site.name} — research notebook`,
  `# ${site.tagline}`,
  '',
  '## Pages',
  `- / ${BASE_URL}/ — personal homepage with selected publications and recent notebook posts`,
  `- /research ${BASE_URL}/research — full publications list`,
  `- /research.md ${BASE_URL}/research.md — machine-readable markdown of publications`,
  `- /now ${BASE_URL}/now — what I am working on right now`,
  `- /now.md ${BASE_URL}/now.md — machine-readable markdown of now page`,
  `- /cv ${BASE_URL}/cv — curriculum vitae`,
  `- /cv.md ${BASE_URL}/cv.md — machine-readable markdown of CV`,
  `- /notebook ${BASE_URL}/notebook — research notes and writings`,
  `- /colophon ${BASE_URL}/colophon — how this site is built`,
  `- /colophon.md ${BASE_URL}/colophon.md — machine-readable markdown of colophon`,
  '',
  '## JSON API',
  `- /api/publications.json ${BASE_URL}/api/publications.json`,
  `- /api/notebook.json ${BASE_URL}/api/notebook.json`,
  `- /api/now.json ${BASE_URL}/api/now.json`,
  `- /api/cv.json ${BASE_URL}/api/cv.json`,
  `- /api/site.json ${BASE_URL}/api/site.json`,
  `- /api/lab.json ${BASE_URL}/api/lab.json — live GPU/training telemetry`,
  `- /api/guestbook.json ${BASE_URL}/api/guestbook.json — approved agent guestbook entries`,
  `- /api/leaderboard.json ${BASE_URL}/api/leaderboard.json — agent eval leaderboard`,
  '',
  '## Machine Access',
  `Connect via MCP: claude mcp add prabigya ${site.mcp_endpoint}`,
  '',
  'MCP tools: list_publications, get_publication, search_my_work, get_notebook_posts,',
  'get_notebook_post, get_cv, get_now, get_bio, get_lab_status, get_guestbook,',
  'sign_guestbook, take_eval, submit_eval, get_leaderboard',
  '',
  '## Notes',
  'All content is a rendering of YAML + Markdown source files.',
  'The worker at /mcp provides structured access to all data above.',
  'Notebook .md twins are available at /notebook/{slug}.md for each post.',
];

mkdirSync(publicDir, { recursive: true });
const outPath = resolve(publicDir, 'llms.txt');
writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
console.log(`[build-llms] wrote ${outPath}`);
