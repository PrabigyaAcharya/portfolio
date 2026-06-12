// cv.md.ts — machine-readable markdown twin of /cv
export const prerender = true;

import type { APIRoute } from 'astro';
import { getCV, getSiteData, getPublications } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();
  const cv = getCV();
  const publications = getPublications();

  const lines: string[] = [
    `# CV — ${site.name}`,
    `canonical: ${base}/cv`,
    '',
    `## Education`,
    '',
  ];

  for (const entry of cv.education) {
    lines.push(`### ${entry.org}`);
    lines.push(`**${entry.role}** · ${entry.start}–${entry.end}`);
    if (entry.details?.length) {
      lines.push('');
      for (const d of entry.details) lines.push(`- ${d}`);
    }
    lines.push('');
  }

  lines.push(`## Positions`, '');
  for (const entry of cv.positions) {
    lines.push(`### ${entry.org}`);
    lines.push(`**${entry.role}** · ${entry.start}–${entry.end}`);
    if (entry.details?.length) {
      lines.push('');
      for (const d of entry.details) lines.push(`- ${d}`);
    }
    lines.push('');
  }

  lines.push(`## Publications`, '');
  for (const pub of publications) {
    lines.push(`- **${pub.title}** — ${pub.authors.join(', ')} — ${pub.venue}, ${pub.year}`);
  }
  lines.push('');

  lines.push(`## Skills`, '');
  for (const skill of cv.skills) lines.push(`- ${skill}`);
  lines.push('');

  lines.push(`## Service`, '');
  for (const item of cv.service) lines.push(`- ${item}`);
  lines.push('');

  lines.push(`## Awards`, '');
  for (const item of cv.awards) lines.push(`- ${item}`);
  lines.push('');

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
