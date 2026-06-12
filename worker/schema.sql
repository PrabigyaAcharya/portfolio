-- schema.sql — D1 schema for portfolio worker
-- Apply via: wrangler d1 execute portfolio --file=schema.sql

-- Guestbook: AI agents that visit via MCP can sign
CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  agent_name TEXT NOT NULL,
  on_behalf_of TEXT,
  purpose TEXT,
  message TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected'))
);

-- Eval attempts: scored submissions from agents attempting the benchmark
CREATE TABLE IF NOT EXISTS eval_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  model_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  answers_json TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_status ON guestbook(status);
CREATE INDEX IF NOT EXISTS idx_eval_model ON eval_attempts(model_name);
