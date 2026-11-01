// cv.md.ts — machine-readable markdown twin of /cv
export const prerender = true;

import type { APIRoute } from 'astro';
import { getCV, getSiteData, getPublications, type CVEntry } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();
  const cv = getCV();
  const publications = getPublications();

  const lines: string[] = [
    `# CV — ${site.name}`,
    `canonical: ${base}/cv`,
    ...(site.links.cv_pdf ? [`pdf: ${site.links.cv_pdf}`] : []),
    '',
    ...(cv.summary ? [cv.summary, ''] : []),
  ];

  const entries = (title: string, list: CVEntry[]) => {
    if (list.length === 0) return;
    lines.push(`## ${title}`, '');
    for (const entry of list) {
      lines.push(`### ${entry.role}`);
      lines.push(`**${entry.org}** · ${entry.start === entry.end ? entry.start : `${entry.start}–${entry.end}`}`);
      if (entry.note) lines.push(`_${entry.note}_`);
      if (entry.details?.length) {
        lines.push('');
        for (const d of entry.details) lines.push(`- ${d}`);
      }
      lines.push('');
    }
  };
  const bullets = (title: string, list: string[]) => {
    if (list.length === 0) return;
    lines.push(`## ${title}`, '');
    for (const item of list) lines.push(`- ${item}`);
    lines.push('');
  };

  entries('Education', cv.education);
  entries('Research and work experience', cv.positions);

  lines.push(`## Publications`, '');
  for (const pub of publications) {
    lines.push(`- **${pub.title}** — ${pub.authors.join(', ')} — ${pub.venue}, ${pub.year}`);
  }
  lines.push('');

  entries('Grants and funded research', cv.grants);
  entries('Research supervision and mentorship', cv.supervision);
  bullets('Technical skills', cv.skills);
  bullets('Certifications and programs', cv.certifications.map(c =>
    [`**${c.title}.**`, c.detail, c.link && `<${c.link}>`].filter(Boolean).join(' ')));
  entries('Teaching, volunteering and leadership', cv.teaching);
  bullets('Service', cv.service);
  bullets('Awards', cv.awards);

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
