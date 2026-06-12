// lab.json.ts — static stub for lab telemetry
// The worker at /api/lab.json will override this dynamically with live data.
// This static file serves as a build-time snapshot / fallback.
export const prerender = true;

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const stub = {
    schema_version: 1,
    status: 'idle',
    received_at: null,
    sparkline: [],
    latest: null,
  };
  return new Response(JSON.stringify(stub, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
