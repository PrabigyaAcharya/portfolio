// publications.json.ts — static JSON API endpoint for publications
export const prerender = true;

import type { APIRoute } from 'astro';
import { getPublications } from '../../lib/content';

export const GET: APIRoute = () => {
  const publications = getPublications();
  return new Response(JSON.stringify({ schema_version: 1, publications }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
