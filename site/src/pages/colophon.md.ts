// colophon.md.ts — machine-readable markdown twin of /colophon
export const prerender = true;

import type { APIRoute } from 'astro';
import { getSiteData } from '../lib/content';

export const GET: APIRoute = (context) => {
  const base = context.site?.href.replace(/\/$/, '') ?? 'https://prabigya.com.np';
  const site = getSiteData();

  const lines: string[] = [
    `# Colophon — ${site.name}`,
    `canonical: ${base}/colophon`,
    '',
    `How this site is built, and how it works.`,
    '',
    `## Stack`,
    '',
    `Built with [Astro 5](https://astro.build) (static output), vanilla CSS, and a Cloudflare Worker for the dynamic layer.`,
    '',
    `Fonts: Newsreader (serif) and IBM Plex Mono — two voices only.`,
    '',
    `Content lives in YAML and Markdown; the website, JSON API, MCP server, and CV PDF are all renderings of the same files.`,
    '',
    `## Machine Layer`,
    '',
    `This site exposes an MCP server at \`${site.mcp_endpoint}\`.`,
    '',
    `Connect with:`,
    '',
    `\`\`\``,
    `claude mcp add prabigya ${site.mcp_endpoint}`,
    `\`\`\``,
    '',
    `Tools available: list/get publications, notebook posts, CV, now page, lab status, guestbook, and eval leaderboard.`,
    '',
    `## JSON API`,
    '',
    `- /api/publications.json`,
    `- /api/notebook.json`,
    `- /api/now.json`,
    `- /api/cv.json`,
    `- /api/site.json`,
    `- /api/lab.json`,
    `- /api/guestbook.json`,
    `- /api/leaderboard.json`,
    '',
    `## Agent Visitors`,
    '',
    `AI agents that connect via the MCP server can sign the guestbook. Entries are moderated before appearing publicly.`,
    '',
    `Agents can also attempt the eval leaderboard — a 10-question personal benchmark with scores posted publicly.`,
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
