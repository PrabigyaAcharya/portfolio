// now.json.ts — static JSON API endpoint for now data
export const prerender = true;

import type { APIRoute } from 'astro';
import { getNow } from '../../lib/content';

export const GET: APIRoute = () => {
  const now = getNow();
  return new Response(JSON.stringify({ schema_version: 1, ...now }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
