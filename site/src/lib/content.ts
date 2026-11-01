// content.ts — loads and validates YAML content from content/ directory
// YAML files live outside src/ per the single-source-of-truth principle.
// All types are derived from shared/schema.ts (same zod definitions used by
// the worker, so both sides stay in sync).

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

// ── Schemas (inline copies matching shared/src/schema.ts) ────────────────────
// We duplicate these here rather than importing from shared to avoid
// CommonJS/ESM friction during the Astro build. Both must be kept in sync.

const ResearchThreadSchema = z.object({
  id: z.string(),
  name: z.string(),
  blurb: z.string(),
});

const SiteLinksSchema = z.object({
  github: z.string(),
  scholar: z.string(),
  email: z.string(),
  linkedin: z.string(),
  cv_pdf: z.string().optional(),
});

const SiteSchema = z.object({
  name: z.string(),
  role: z.string(),
  tagline: z.string(),
  location: z.string(),
  links: SiteLinksSchema,
  mcp_endpoint: z.string(),
  research_threads: z.array(ResearchThreadSchema),
  // Photo in content/ that scripts/build-portrait.ts turns into the LCD pixel portrait.
  portrait: z.object({ src: z.string(), alt: z.string(), crop: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional() }).optional(),
});

const PublicationLinksSchema = z.object({
  pdf: z.string().optional(),
  arxiv: z.string().optional(),
  code: z.string().optional(),
  poster: z.string().optional(),
});

const PublicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  venue: z.string(),
  year: z.number().int().min(1900).max(2100),
  thread: z.string(),
  summary: z.string(),
  abstract: z.string(),
  backstory: z.string().optional(),
  links: PublicationLinksSchema.optional().default({}),
  bibtex: z.string(),
  selected: z.boolean().optional().default(false),
});

const NowSchema = z.object({
  updated: z.string(),
  working_on: z.array(z.string()),
  reading: z.array(z.string()),
  open_to: z.array(z.string()),
});

const CVEntrySchema = z.object({
  org: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  note: z.string().optional(),   // italic line under the role: place, supervisor, award
  details: z.array(z.string()).optional(),
});

const CVCertificationSchema = z.object({
  title: z.string(),
  detail: z.string().optional(),
  link: z.string().optional(),
});

const CVProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
  link: z.string(),
});

const CVSchema = z.object({
  summary: z.string().optional(),
  education: z.array(CVEntrySchema),
  positions: z.array(CVEntrySchema),
  grants: z.array(CVEntrySchema).default([]),
  supervision: z.array(CVEntrySchema).default([]),
  teaching: z.array(CVEntrySchema).default([]),
  projects: z.array(CVProjectSchema).optional(),
  skills: z.array(z.string()),
  certifications: z.array(CVCertificationSchema).default([]),
  service: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type Site = z.infer<typeof SiteSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type Now = z.infer<typeof NowSchema>;
export type CV = z.infer<typeof CVSchema>;
export type CVEntry = z.infer<typeof CVEntrySchema>;
export type CVCertification = z.infer<typeof CVCertificationSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const CONTENT_DIR = resolve(process.cwd(), '..', 'content');

function loadYaml<T>(schema: z.ZodSchema<T>, filename: string): T {
  const filepath = resolve(CONTENT_DIR, filename);
  const raw = readFileSync(filepath, 'utf-8');
  const parsed = yaml.load(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Validation failed for ${filename}:\n${errors}`);
  }
  return result.data;
}

// ── Loaders ───────────────────────────────────────────────────────────────────

export function getSiteData(): Site {
  return loadYaml(SiteSchema, 'site.yaml');
}

export function getPublications(): Publication[] {
  return loadYaml(z.array(PublicationSchema), 'publications.yaml');
}

export function getNow(): Now {
  return loadYaml(NowSchema, 'now.yaml');
}

export function getCV(): CV {
  return loadYaml(CVSchema, 'cv.yaml');
}

// ── Derived helpers ───────────────────────────────────────────────────────────

export function getSelectedPublications(): Publication[] {
  return getPublications().filter(p => p.selected);
}

export function getPublicationsByYear(): Map<number, Publication[]> {
  const pubs = getPublications();
  const byYear = new Map<number, Publication[]>();
  for (const pub of pubs) {
    const list = byYear.get(pub.year) ?? [];
    list.push(pub);
    byYear.set(pub.year, list);
  }
  // sort years descending
  return new Map([...byYear.entries()].sort((a, b) => b[0] - a[0]));
}

// ── Portrait ──────────────────────────────────────────────────────────────────

/** Where scripts/build-portrait.ts writes the pixel portrait mask. */
export const PORTRAIT_PATH = '/images/portrait-mask.png';

/** The pixel portrait, or null until a photo has been converted. */
export function getPortrait(): { url: string; alt: string } | null {
  const site = getSiteData();
  const built = existsSync(resolve(process.cwd(), 'public', PORTRAIT_PATH.slice(1)));
  return site.portrait && built ? { url: PORTRAIT_PATH, alt: site.portrait.alt } : null;
}
