// worker/src/guestbook.ts — Guestbook HTTP handler + MCP tool helpers

import { hashIp, checkRateLimit, sanitizeInput } from './utils.js';
import type { Env } from './index.js';

export interface GuestbookEntry {
  id: number;
  created_at: string;
  agent_name: string;
  on_behalf_of: string | null;
  purpose: string | null;
  message: string;
  status: string;
}

// ── Validation ─────────────────────────────────────────────────────────────────

interface GuestbookInput {
  agent_name: string;
  on_behalf_of?: string;
  purpose?: string;
  message: string;
}

interface ValidationResult {
  ok: boolean;
  error?: string;
  sanitized?: GuestbookInput;
}

export function validateGuestbookInput(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const input = body as Record<string, unknown>;

  const agentName = String(input.agent_name ?? '').trim();
  const onBehalfOf = input.on_behalf_of ? String(input.on_behalf_of).trim() : undefined;
  const purpose = input.purpose ? String(input.purpose).trim() : undefined;
  const message = String(input.message ?? '').trim();

  if (!agentName) return { ok: false, error: 'agent_name is required' };
  if (agentName.length > 80) return { ok: false, error: 'agent_name must be 80 characters or fewer' };
  if (onBehalfOf && onBehalfOf.length > 80) return { ok: false, error: 'on_behalf_of must be 80 characters or fewer' };
  if (!message) return { ok: false, error: 'message is required' };
  if (message.length > 280) return { ok: false, error: 'message must be 280 characters or fewer' };

  // Sanitize each field
  const nameCheck = sanitizeInput(agentName);
  if (!nameCheck.ok) return { ok: false, error: `agent_name: ${nameCheck.error}` };

  const msgCheck = sanitizeInput(message);
  if (!msgCheck.ok) return { ok: false, error: `message: ${msgCheck.error}` };

  if (onBehalfOf) {
    const oboCheck = sanitizeInput(onBehalfOf);
    if (!oboCheck.ok) return { ok: false, error: `on_behalf_of: ${oboCheck.error}` };
  }

  if (purpose) {
    const purposeCheck = sanitizeInput(purpose);
    if (!purposeCheck.ok) return { ok: false, error: `purpose: ${purposeCheck.error}` };
  }

  return {
    ok: true,
    sanitized: {
      agent_name: nameCheck.value,
      on_behalf_of: onBehalfOf ? sanitizeInput(onBehalfOf).value : undefined,
      purpose: purpose ? sanitizeInput(purpose).value : undefined,
      message: msgCheck.value,
    },
  };
}

// ── Sign guestbook (used by both HTTP and MCP) ─────────────────────────────────

export async function signGuestbook(
  input: GuestbookInput,
  ip: string,
  env: Env
): Promise<{ ok: boolean; error?: string; entry_id?: number }> {
  const salt = env.IP_SALT ?? 'default-salt';
  const ipHash = await hashIp(ip, salt);

  // Rate limit: 3 per hour
  const allowed = await checkRateLimit(env.KV, `rl:gb:${ipHash}`, 3, 3600);
  if (!allowed) {
    return { ok: false, error: 'Rate limit exceeded. Try again later (limit: 3 per hour).' };
  }

  const result = await env.DB.prepare(
    `INSERT INTO guestbook (agent_name, on_behalf_of, purpose, message, ip_hash)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      input.agent_name,
      input.on_behalf_of ?? null,
      input.purpose ?? null,
      input.message,
      ipHash
    )
    .run();

  return { ok: true, entry_id: result.meta.last_row_id as number };
}

// ── Get approved entries ────────────────────────────────────────────────────────

export async function getApprovedGuestbookEntries(env: Env): Promise<GuestbookEntry[]> {
  const result = await env.DB.prepare(
    `SELECT id, created_at, agent_name, on_behalf_of, purpose, message, status
     FROM guestbook
     WHERE status = 'approved'
     ORDER BY created_at DESC
     LIMIT 100`
  ).all<GuestbookEntry>();
  return result.results ?? [];
}

// ── HTTP handlers ──────────────────────────────────────────────────────────────

export async function handleGetGuestbook(env: Env): Promise<Response> {
  const entries = await getApprovedGuestbookEntries(env);
  return new Response(
    JSON.stringify({ schema_version: 1, entries }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function handlePostGuestbook(request: Request, env: Env): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateGuestbookInput(body);
  if (!validation.ok) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? '0.0.0.0';
  const result = await signGuestbook(validation.sanitized!, ip, env);

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Your entry has been submitted for moderation. Thank you!',
      entry_id: result.entry_id,
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
