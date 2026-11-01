import { z } from "zod";

// ── Site ──────────────────────────────────────────────────────────────────────

export const ResearchThreadSchema = z.object({
  id: z.string(),
  name: z.string(),
  blurb: z.string(),
});

export const SiteLinksSchema = z.object({
  github: z.string(),
  scholar: z.string(),
  email: z.string(),
  linkedin: z.string(),
  cv_pdf: z.string().optional(),
});

export const SiteSchema = z.object({
  name: z.string(),
  role: z.string(),
  tagline: z.string(),
  location: z.string(),
  links: SiteLinksSchema,
  mcp_endpoint: z.string().url(),
  research_threads: z.array(ResearchThreadSchema),
  // Photo in content/ that scripts/build-portrait.ts turns into the LCD pixel portrait.
  portrait: z.object({ src: z.string(), alt: z.string() }).optional(),
});

export type Site = z.infer<typeof SiteSchema>;
export type ResearchThread = z.infer<typeof ResearchThreadSchema>;

// ── Publications ──────────────────────────────────────────────────────────────

export const PublicationLinksSchema = z.object({
  pdf: z.string().optional(),
  arxiv: z.string().optional(),
  code: z.string().optional(),
  poster: z.string().optional(),
});

export const PublicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  venue: z.string(),
  year: z.number().int().min(1900).max(2100),
  thread: z.string(),
  summary: z.string(),
  abstract: z.string(),
  backstory: z.string().optional(),
  links: PublicationLinksSchema,
  bibtex: z.string(),
  selected: z.boolean().optional().default(false),
});

export const PublicationsSchema = z.array(PublicationSchema);

export type Publication = z.infer<typeof PublicationSchema>;

// ── Now ───────────────────────────────────────────────────────────────────────

export const NowSchema = z.object({
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date YYYY-MM-DD"),
  working_on: z.array(z.string()),
  reading: z.array(z.string()),
  open_to: z.array(z.string()),
});

export type Now = z.infer<typeof NowSchema>;

// ── CV ────────────────────────────────────────────────────────────────────────

export const CVEntrySchema = z.object({
  org: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  note: z.string().optional(),   // italic line under the role: place, supervisor, award
  details: z.array(z.string()).optional(),
});

export const CVCertificationSchema = z.object({
  title: z.string(),
  detail: z.string().optional(),
  link: z.string().optional(),
});

export const CVProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  tech: z.array(z.string()),
  link: z.string(),
});

export const CVSchema = z.object({
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

export type CV = z.infer<typeof CVSchema>;
export type CVEntry = z.infer<typeof CVEntrySchema>;
export type CVCertification = z.infer<typeof CVCertificationSchema>;

// ── Eval Questions ────────────────────────────────────────────────────────────

export const EvalQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["exact", "numeric", "judged"]),
  tolerance: z.number().optional(), // numeric only
});

export const EvalQuestionsSchema = z.array(EvalQuestionSchema);

export type EvalQuestion = z.infer<typeof EvalQuestionSchema>;

// ── Notebook post frontmatter ─────────────────────────────────────────────────

export const NotebookFrontmatterSchema = z.object({
  title: z.string(),
  date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()]),
  updated: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()]).optional(),
  tags: z.array(z.string()),
  summary: z.string(),
  draft: z.boolean(),
  math: z.boolean().optional().default(false),
});

export type NotebookFrontmatter = z.infer<typeof NotebookFrontmatterSchema>;
