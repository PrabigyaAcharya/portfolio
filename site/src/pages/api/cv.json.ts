// cv.json.ts — static JSON API endpoint for CV data
export const prerender = true;

import type { APIRoute } from 'astro';
import { getCV } from '../../lib/content';

export const GET: APIRoute = () => {
  const cv = getCV();
  return new Response(JSON.stringify({ schema_version: 1, ...cv }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
