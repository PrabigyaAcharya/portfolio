// worker/src/index.ts — Cloudflare Worker entry point (Hono + MCP)

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleMcpRequest } from './mcp.js';
import {
  handleGetGuestbook,
  handlePostGuestbook,
} from './guestbook.js';
import {
  handleTakeEval,
  handleGetLeaderboard,
} from './eval.js';
import {
  handleIngestLab,
  handleGetLabStatus,
} from './telemetry.js';
import { constantTimeEqual } from './utils.js';
import { handleAsk } from './askbox.js';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GROQ_API_KEY?: string;
  SITE_URL?: string;
  TELEMETRY_TOKEN?: string;
  EVAL_ANSWERS?: string;
  ADMIN_TOKEN?: string;
  IP_SALT?: string;
  ENVIRONMENT?: string;
}

const app = new Hono<{ Bindings: Env }>();

// ── CORS ───────────────────────────────────────────────────────────────────────

// Public GET API endpoints allow all origins
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
}));

// Guestbook POST is unrestricted (signed with IP-based rate limit)
app.use('/api/guestbook', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}));

// Ask-box: allow production origin + any localhost in dev
app.use('/api/ask', async (c, next) => {
  const siteOrigin = (c.env.SITE_URL ?? 'https://prabigya.com.np').replace(/\/$/, '');
  const allowedOrigins = [siteOrigin, 'https://prabigya.com.np'];
  // In dev, allow any localhost port (Vite dev server port can vary)
  const origin = c.req.header('Origin') ?? '';
  const isDev = c.env.ENVIRONMENT === 'development';
  const resolved = isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)
    ? origin
    : (allowedOrigins.includes(origin) ? origin : null);

  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': resolved ?? '',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  await next();
  if (resolved) c.res.headers.set('Access-Control-Allow-Origin', resolved);
});

// ── Health check ───────────────────────────────────────────────────────────────

app.get('/health', (c) => {
  return c.json({ status: 'ok', version: '1.0.0' });
});

// ── MCP ────────────────────────────────────────────────────────────────────────
// Handle all methods at /mcp — the transport handles GET (SSE), POST (JSON-RPC),
// and DELETE (session teardown)

app.all('/mcp', async (c) => {
  return handleMcpRequest(c.req.raw, c.env);
});

// ── API routes ─────────────────────────────────────────────────────────────────

// Lab status (live from KV — overrides the static build-time file on the CDN)
app.get('/api/lab.json', async (c) => {
  return handleGetLabStatus(c.env);
});

// Guestbook
app.get('/api/guestbook.json', async (c) => {
  return handleGetGuestbook(c.env);
});

app.post('/api/guestbook', async (c) => {
  return handlePostGuestbook(c.req.raw, c.env);
});

// Eval
app.get('/api/eval/questions', async (_c) => {
  return handleTakeEval();
});

app.get('/api/leaderboard.json', async (c) => {
  return handleGetLeaderboard(c.env);
});

// ── Telemetry ingest (server-to-server only) ───────────────────────────────────

app.post('/ingest/lab', async (c) => {
  return handleIngestLab(c.req.raw, c.env);
});

// ── Admin moderation ───────────────────────────────────────────────────────────

app.get('/admin/guestbook', async (c) => {
  const authHeader = c.req.header('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedToken = c.env.ADMIN_TOKEN ?? '';

  if (!expectedToken || !constantTimeEqual(token, expectedToken)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = await c.env.DB.prepare(
    `SELECT id, created_at, agent_name, on_behalf_of, purpose, message, ip_hash, status
     FROM guestbook
     ORDER BY created_at DESC
     LIMIT 200`
  ).all();

  return c.json({ entries: result.results });
});

app.post('/admin/guestbook/:id/approve', async (c) => {
  const authHeader = c.req.header('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedToken = c.env.ADMIN_TOKEN ?? '';

  if (!expectedToken || !constantTimeEqual(token, expectedToken)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = parseInt(c.req.param('id'), 10);
  await c.env.DB.prepare(`UPDATE guestbook SET status = 'approved' WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

app.post('/admin/guestbook/:id/reject', async (c) => {
  const authHeader = c.req.header('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const expectedToken = c.env.ADMIN_TOKEN ?? '';

  if (!expectedToken || !constantTimeEqual(token, expectedToken)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = parseInt(c.req.param('id'), 10);
  await c.env.DB.prepare(`UPDATE guestbook SET status = 'rejected' WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

// ── Ask-box ────────────────────────────────────────────────────────────────────

app.post('/api/ask', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '0.0.0.0';
  return handleAsk(c.req.raw, c.env, ip);
});

export default app;
