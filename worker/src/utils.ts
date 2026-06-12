// worker/src/utils.ts — shared utility functions

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(ip + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

// Rate limiter using KV
// Returns true if the request is allowed, false if rate limited.
export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const raw = await kv.get(key, 'text');
  const now = Math.floor(Date.now() / 1000);

  if (raw) {
    const data = JSON.parse(raw) as { count: number; window_start: number };
    if (now - data.window_start < windowSeconds) {
      if (data.count >= maxRequests) return false;
      await kv.put(key, JSON.stringify({ count: data.count + 1, window_start: data.window_start }), {
        expirationTtl: windowSeconds,
      });
      return true;
    }
  }

  // New window
  await kv.put(key, JSON.stringify({ count: 1, window_start: now }), {
    expirationTtl: windowSeconds,
  });
  return true;
}

// Sanitize input: strip control chars, reject URLs
const CONTROL_CHAR_RE = /[\x00-\x1F]/g;
const URL_PATTERN_RE = /https?:\/\/|www\./i;

export function sanitizeInput(input: string): { ok: boolean; value: string; error?: string } {
  if (URL_PATTERN_RE.test(input)) {
    return { ok: false, value: input, error: 'URLs are not allowed in this field' };
  }
  const cleaned = input.replace(CONTROL_CHAR_RE, '');
  return { ok: true, value: cleaned };
}
