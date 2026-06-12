// now.md.ts — machine-readable markdown twin of /now
export const prerender = true;

import type { APIRoute } from 'astro';
import { getNow, getSiteData } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();
  const now = getNow();

  const lines: string[] = [
    `# Now — ${site.name}`,
    `canonical: ${base}/now`,
    '',
    `*Updated: ${now.updated}*`,
    '',
    `## Working On`,
    '',
    ...now.working_on.map(item => `- ${item}`),
    '',
    `## Reading`,
    '',
    ...now.reading.map(item => `- ${item}`),
    '',
    `## Open To`,
    '',
    ...now.open_to.map(item => `- ${item}`),
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
