// site.json.ts — static JSON API endpoint for site config
export const prerender = true;

import type { APIRoute } from 'astro';
import { getSiteData } from '../../lib/content';

export const GET: APIRoute = () => {
  const site = getSiteData();
  return new Response(JSON.stringify({ schema_version: 1, ...site }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
