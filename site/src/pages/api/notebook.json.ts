// notebook.json.ts — static JSON API endpoint for notebook post index
export const prerender = true;

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const allPosts = await getCollection('notebook', ({ data }) => !data.draft);
  const posts = allPosts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map(post => ({
      slug: post.slug,
      title: post.data.title,
      date: post.data.date.toISOString().slice(0, 10),
      updated: post.data.updated ? post.data.updated.toISOString().slice(0, 10) : null,
      tags: post.data.tags,
      summary: post.data.summary,
      url: `${base}/notebook/${post.slug}`,
      md_url: `${base}/notebook/${post.slug}.md`,
    }));

  return new Response(JSON.stringify({ schema_version: 1, posts }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
