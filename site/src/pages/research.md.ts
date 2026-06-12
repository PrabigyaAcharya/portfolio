// research.md.ts — machine-readable markdown twin of /research
export const prerender = true;

import type { APIRoute } from 'astro';
import { getPublications, getSiteData } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();
  const publications = getPublications();

  const lines: string[] = [
    `# Research — ${site.name}`,
    `canonical: ${base}/research`,
    '',
    `${site.name}'s publications and research work.`,
    '',
  ];

  // Group by year
  const byYear = new Map<number, typeof publications>();
  for (const pub of publications) {
    const list = byYear.get(pub.year) ?? [];
    list.push(pub);
    byYear.set(pub.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  for (const year of years) {
    lines.push(`## ${year}`, '');
    for (const pub of byYear.get(year)!) {
      lines.push(`### ${pub.title}`);
      lines.push('');
      lines.push(`**Authors:** ${pub.authors.join(', ')}`);
      lines.push(`**Venue:** ${pub.venue} (${pub.year})`);
      lines.push('');
      lines.push(pub.summary);
      lines.push('');
      lines.push(`**Abstract:** ${pub.abstract.trim()}`);
      lines.push('');
      if (pub.backstory) {
        lines.push(`*Note: ${pub.backstory}*`);
        lines.push('');
      }
      const linkParts: string[] = [];
      if (pub.links?.pdf) linkParts.push(`[PDF](${pub.links.pdf})`);
      if (pub.links?.arxiv) linkParts.push(`[arXiv](${pub.links.arxiv})`);
      if (pub.links?.code) linkParts.push(`[Code](${pub.links.code})`);
      if (linkParts.length > 0) {
        lines.push(linkParts.join(' · '));
        lines.push('');
      }
    }
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
