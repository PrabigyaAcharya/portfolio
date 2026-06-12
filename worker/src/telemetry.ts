// worker/src/telemetry.ts — Lab telemetry ingest + read

import { z } from 'zod';
import { constantTimeEqual } from './utils.js';
import type { Env } from './index.js';

const SPARKLINE_MAX = 64;
const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

// ── Payload schema (allowlisted fields only) ───────────────────────────────────

const LabPayloadSchema = z.object({
  run_name: z.string().max(120).optional(),
  epoch: z.number().int().min(0).optional(),
  total_epochs: z.number().int().min(0).optional(),
  loss: z.number().finite().optional(),
  started_at: z.string().max(64).optional(),
  gpu_util: z.number().min(0).max(100).optional(),
  gpu_mem: z.number().min(0).optional(),
  gpus: z.number().int().min(0).max(32).optional(),
}).strict();

// ── State type ─────────────────────────────────────────────────────────────────

export interface LabState {
  status: 'training' | 'idle';
  received_at: string | null;
  sparkline: Array<{ t: number; loss: number }>;
  latest: z.infer<typeof LabPayloadSchema> | null;
}

// ── Ingest handler ─────────────────────────────────────────────────────────────

export async function handleIngestLab(request: Request, env: Env): Promise<Response> {
  // Authenticate
  const authHeader = request.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedToken = env.TELEMETRY_TOKEN ?? '';

  if (!expectedToken || !constantTimeEqual(token, expectedToken)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse and validate body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = LabPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', details: parsed.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = parsed.data;
  const now = new Date().toISOString();

  // Read existing state from KV
  let state: LabState = {
    status: 'training',
    received_at: now,
    sparkline: [],
    latest: null,
  };

  try {
    const existing = await env.KV.get('lab:latest', 'text');
    if (existing) {
      state = JSON.parse(existing) as LabState;
    }
  } catch {
    // Start fresh
  }

  // Update state
  state.status = 'training';
  state.received_at = now;
  state.latest = payload;

  // Append to sparkline ring buffer
  if (payload.loss !== undefined) {
    state.sparkline.push({ t: Date.now(), loss: payload.loss });
    if (state.sparkline.length > SPARKLINE_MAX) {
      state.sparkline = state.sparkline.slice(-SPARKLINE_MAX);
    }
  }

  // Write back to KV
  await env.KV.put('lab:latest', JSON.stringify(state), {
    expirationTtl: 7200, // auto-expire after 2 hours
  });

  return new Response(JSON.stringify({ ok: true, received_at: now }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── Read handler ───────────────────────────────────────────────────────────────

export async function handleGetLabStatus(env: Env): Promise<Response> {
  let state: LabState = {
    status: 'idle',
    received_at: null,
    sparkline: [],
    latest: null,
  };

  try {
    const raw = await env.KV.get('lab:latest', 'text');
    if (raw) {
      state = JSON.parse(raw) as LabState;

      // Check staleness
      if (state.received_at) {
        const ageMs = Date.now() - new Date(state.received_at).getTime();
        if (ageMs > STALE_THRESHOLD_MS) {
          state.status = 'idle';
        }
      } else {
        state.status = 'idle';
      }
    }
  } catch {
    // Return idle on error
  }

  return new Response(
    JSON.stringify({ schema_version: 1, ...state }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
