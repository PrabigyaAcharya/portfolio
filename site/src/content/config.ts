import { defineCollection, z } from 'astro:content';

const notebookCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()),
    summary: z.string(),
    draft: z.boolean(),
    math: z.boolean().optional().default(false),
  }),
});

export const collections = {
  notebook: notebookCollection,
};
