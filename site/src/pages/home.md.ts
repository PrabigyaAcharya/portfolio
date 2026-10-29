// home.md.ts — machine-readable markdown twin of /home
export const prerender = true;

import type { APIRoute } from 'astro';
import { getNow, getSiteData } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();
  const now = getNow();

  const lines: string[] = [
    `# ${site.name}`,
    `canonical: ${base}/home`,
    '',
    `*${site.role}*`,
    '',
    site.tagline,
    '',
    `Location: ${site.location}`,
    '',
    `## Research threads`,
    '',
    ...site.research_threads.map(t => `- **${t.name}** — ${t.blurb}`),
    '',
    `## Now`,
    '',
    ...now.working_on.map(item => `- ${item}`),
    '',
    `## Pages`,
    '',
    `- [Research](${base}/research.md)`,
    `- [Notebook](${base}/notebook)`,
    `- [Now](${base}/now.md)`,
    `- [CV](${base}/cv.md)`,
    `- [Colophon](${base}/colophon.md)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
