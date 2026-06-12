// [slug].md.ts — machine-readable markdown twin of individual notebook posts
export const prerender = true;

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('notebook', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props, site: siteUrl }) => {
  const base = siteUrl?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const { post } = props as { post: Awaited<ReturnType<typeof getCollection<'notebook'>>>[number] };

  // Read raw markdown from content directory (outside src/)
  const contentDir = resolve(process.cwd(), '..', 'content', 'notebook');
  const filePath = resolve(contentDir, `${post.slug}.md`);
  let rawContent: string;
  try {
    rawContent = readFileSync(filePath, 'utf-8');
  } catch {
    // Try .mdx extension
    try {
      rawContent = readFileSync(filePath.replace('.md', '.mdx'), 'utf-8');
    } catch {
      rawContent = `# ${post.data.title}\n\n*Content not available*\n`;
    }
  }

  const header = [
    `# ${post.data.title}`,
    `canonical: ${base}/notebook/${post.slug}`,
    `date: ${post.data.date instanceof Date ? post.data.date.toISOString().slice(0, 10) : post.data.date}`,
    `tags: ${post.data.tags.join(', ')}`,
    '',
  ].join('\n');

  return new Response(header + rawContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
