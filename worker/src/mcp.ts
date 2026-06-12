// worker/src/mcp.ts — MCP server for portfolio-kit
// Uses @modelcontextprotocol/sdk WebStandardStreamableHTTPServerTransport
// which runs natively in Cloudflare Workers (Web Standard APIs only).

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import {
  site,
  publications,
  now,
  cv,
  evalQuestions,
  notebookPosts,
} from './content-bundle.js';
import type { Env } from './index.js';

// ── Guestbook / eval imports ───────────────────────────────────────────────────
import {
  signGuestbook,
  getApprovedGuestbookEntries,
  validateGuestbookInput,
} from './guestbook.js';
import {
  handleSubmitEval,
  getLeaderboard,
} from './eval.js';

// ── Search helpers ────────────────────────────────────────────────────────────

function simpleScore(text: string, query: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let score = 0;
  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (t.includes(word)) score += 1;
  }
  return score;
}

// ── Build and return a new McpServer (stateless per-request) ──────────────────

export function buildMcpServer(env: Env): McpServer {
  const siteUrl = (env.SITE_URL ?? 'https://prabigya.com.np').replace(/\/$/, '');
  const server = new McpServer({
    name: 'prabigya-portfolio',
    version: '1.0.0',
  });

  // ── list_publications ──────────────────────────────────────────────────────
  server.tool(
    'list_publications',
    'List publications, optionally filtered by research thread ID or year.',
    {
      thread: z.string().optional().describe('Filter by research thread ID (e.g. "thread-1")'),
      year: z.number().int().optional().describe('Filter by publication year'),
    },
    ({ thread, year }) => {
      let pubs = publications;
      if (thread) pubs = pubs.filter(p => p.thread === thread);
      if (year) pubs = pubs.filter(p => p.year === year);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'publications.yaml',
            count: pubs.length,
            data: pubs.map(p => ({
              id: p.id,
              title: p.title,
              authors: p.authors,
              venue: p.venue,
              year: p.year,
              thread: p.thread,
              summary: p.summary,
              selected: p.selected,
              links: p.links,
            })),
          }, null, 2),
        }],
      };
    }
  );

  // ── get_publication ────────────────────────────────────────────────────────
  server.tool(
    'get_publication',
    'Get a single publication by its ID, including full abstract and bibtex.',
    {
      id: z.string().describe('Publication ID (e.g. "placeholder-paper-2025")'),
    },
    ({ id }) => {
      const pub = publications.find(p => p.id === id);
      if (!pub) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Publication not found: "${id}"`,
              available_ids: publications.map(p => p.id),
            }),
          }],
          isError: true,
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ source: 'publications.yaml', data: pub }, null, 2),
        }],
      };
    }
  );

  // ── search_my_work ─────────────────────────────────────────────────────────
  server.tool(
    'search_my_work',
    'Keyword search over publications and notebook posts. Returns ranked snippets with URLs.',
    {
      query: z.string().min(1).describe('Search query'),
    },
    ({ query }) => {
      interface SearchResult {
        type: string;
        id: string;
        title: string;
        url: string;
        score: number;
        snippet: string;
      }
      const results: SearchResult[] = [];

      for (const pub of publications) {
        const corpus = [pub.title, pub.summary, pub.abstract, pub.authors.join(' ')].join(' ');
        const score = simpleScore(corpus, query);
        if (score > 0) {
          results.push({
            type: 'publication',
            id: pub.id,
            title: pub.title,
            url: `${siteUrl}/research#${pub.id}`,
            score,
            snippet: pub.summary,
          });
        }
      }

      for (const post of notebookPosts.filter(p => !p.draft)) {
        const corpus = [post.title, post.summary, post.content].join(' ');
        const score = simpleScore(corpus, query);
        if (score > 0) {
          results.push({
            type: 'notebook',
            id: post.slug,
            title: post.title,
            url: `${siteUrl}/notebook/${post.slug}`,
            score,
            snippet: post.summary,
          });
        }
      }

      results.sort((a, b) => b.score - a.score);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'publications.yaml + notebook/',
            query,
            count: results.length,
            data: results.slice(0, 10),
          }, null, 2),
        }],
      };
    }
  );

  // ── get_notebook_posts ─────────────────────────────────────────────────────
  server.tool(
    'get_notebook_posts',
    'List notebook posts, optionally filtered by tag.',
    {
      tag: z.string().optional().describe('Filter by tag (e.g. "ml", "meta")'),
      limit: z.number().int().min(1).max(50).optional().describe('Maximum number of posts to return (default 20)'),
    },
    ({ tag, limit = 20 }) => {
      let posts = notebookPosts.filter(p => !p.draft);
      if (tag) posts = posts.filter(p => p.tags.includes(tag));
      posts = posts.slice(0, limit);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'notebook/',
            count: posts.length,
            data: posts.map(p => ({
              slug: p.slug,
              title: p.title,
              date: p.date,
              updated: p.updated,
              tags: p.tags,
              summary: p.summary,
              url: `${siteUrl}/notebook/${p.slug}`,
              md_url: `${siteUrl}/notebook/${p.slug}.md`,
            })),
          }, null, 2),
        }],
      };
    }
  );

  // ── get_notebook_post ──────────────────────────────────────────────────────
  server.tool(
    'get_notebook_post',
    'Get the full content of a notebook post by slug.',
    {
      slug: z.string().describe('Post slug (e.g. "hello-notebook")'),
    },
    ({ slug }) => {
      const post = notebookPosts.find(p => p.slug === slug && !p.draft);
      if (!post) {
        const available = notebookPosts.filter(p => !p.draft).map(p => p.slug);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `Post not found: "${slug}"`,
              available_slugs: available,
            }),
          }],
          isError: true,
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: `notebook/${slug}.md`,
            data: post,
          }, null, 2),
        }],
      };
    }
  );

  // ── get_cv ─────────────────────────────────────────────────────────────────
  server.tool(
    'get_cv',
    'Get the full CV data including education, positions, publications, skills, service, and awards.',
    {},
    () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'cv.yaml',
            data: cv,
            publications_count: publications.length,
          }, null, 2),
        }],
      };
    }
  );

  // ── get_now ────────────────────────────────────────────────────────────────
  server.tool(
    'get_now',
    'Get what I am working on right now — current projects, reading list, and what I am open to.',
    {},
    () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ source: 'now.yaml', data: now }, null, 2),
        }],
      };
    }
  );

  // ── get_bio ────────────────────────────────────────────────────────────────
  server.tool(
    'get_bio',
    'Get basic bio: name, tagline, location, and links.',
    {},
    () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'site.yaml',
            data: {
              name: site.name,
              tagline: site.tagline,
              location: site.location,
              links: site.links,
              mcp_endpoint: site.mcp_endpoint,
              research_threads: site.research_threads,
            },
          }, null, 2),
        }],
      };
    }
  );

  // ── get_lab_status ─────────────────────────────────────────────────────────
  server.tool(
    'get_lab_status',
    'Get current GPU/training lab status. Returns idle if no data received in the last 30 minutes.',
    {},
    async () => {
      try {
        const raw = await env.KV.get('lab:latest', 'text');
        if (!raw) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                source: 'KV:lab:latest',
                status: 'idle',
                received_at: null,
                sparkline: [],
                latest: null,
              }, null, 2),
            }],
          };
        }
        const state = JSON.parse(raw) as {
          status: string;
          received_at: string | null;
          sparkline: Array<{ t: number; loss: number }>;
          latest: unknown;
        };

        // Check staleness: > 30 minutes
        if (state.received_at) {
          const ageMs = Date.now() - new Date(state.received_at).getTime();
          if (ageMs > 30 * 60 * 1000) {
            state.status = 'idle';
          }
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ source: 'KV:lab:latest', ...state }, null, 2),
          }],
        };
      } catch {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              source: 'KV:lab:latest',
              status: 'idle',
              received_at: null,
              sparkline: [],
              latest: null,
              note: 'KV unavailable',
            }, null, 2),
          }],
        };
      }
    }
  );

  // ── sign_guestbook ─────────────────────────────────────────────────────────
  server.tool(
    'sign_guestbook',
    'Sign the agent guestbook. Entries are human-moderated before appearing publicly. message must be ≤280 chars. No URLs allowed.',
    {
      agent_name: z.string().min(1).max(80).describe('Name of the AI agent'),
      on_behalf_of: z.string().max(80).optional().describe('Human or organization on whose behalf the agent is visiting'),
      purpose: z.string().max(120).optional().describe('Why you are visiting this site'),
      message: z.string().min(1).max(280).describe('Your message (no URLs, ≤280 chars)'),
    },
    async ({ agent_name, on_behalf_of, purpose, message }, extra) => {
      const validation = validateGuestbookInput({ agent_name, on_behalf_of, purpose, message });
      if (!validation.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: validation.error }) }],
          isError: true,
        };
      }

      // Use a placeholder IP for MCP tool calls (no real IP available)
      const result = await signGuestbook(validation.sanitized!, 'mcp-tool', env);
      if (!result.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: result.error }) }],
          isError: true,
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            message: 'Your entry has been submitted for moderation. Thank you for visiting!',
            entry_id: result.entry_id,
          }),
        }],
      };
    }
  );

  // ── get_guestbook ──────────────────────────────────────────────────────────
  server.tool(
    'get_guestbook',
    'Get approved guestbook entries from AI agents that have visited this site.',
    {},
    async () => {
      const entries = await getApprovedGuestbookEntries(env);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'D1:guestbook',
            count: entries.length,
            data: entries,
          }, null, 2),
        }],
      };
    }
  );

  // ── take_eval ──────────────────────────────────────────────────────────────
  server.tool(
    'take_eval',
    'Get the 10-question personal eval benchmark. Submit your answers with submit_eval.',
    {},
    () => {
      const questions = evalQuestions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
      }));
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'eval/questions.yaml',
            instructions: 'Answer all questions and submit via submit_eval. Scores are posted publicly on the leaderboard.',
            questions,
          }, null, 2),
        }],
      };
    }
  );

  // ── submit_eval ────────────────────────────────────────────────────────────
  server.tool(
    'submit_eval',
    'Submit answers to the eval benchmark. model_name appears publicly on the leaderboard.',
    {
      model_name: z.string().min(1).max(60).describe('Your model name (appears publicly, no URLs)'),
      answers: z.array(z.object({
        id: z.string(),
        answer: z.string(),
      })).describe('Array of {id, answer} objects for each question'),
    },
    async ({ model_name, answers }) => {
      const result = await handleSubmitEval(
        { model_name, answers },
        'mcp-tool',
        env
      );
      if (!result.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: result.error }) }],
          isError: true,
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: true,
            score: result.result?.score,
            total: result.result?.total,
            per_question: result.result?.per_question,
            note: 'Scores are posted publicly on the leaderboard at /api/leaderboard.json',
          }, null, 2),
        }],
      };
    }
  );

  // ── get_leaderboard ────────────────────────────────────────────────────────
  server.tool(
    'get_leaderboard',
    'Get the eval leaderboard — top 20 AI agents by score.',
    {},
    async () => {
      const entries = await getLeaderboard(env);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            source: 'D1:eval_attempts',
            count: entries.length,
            data: entries,
          }, null, 2),
        }],
      };
    }
  );

  return server;
}

// ── Request handler ────────────────────────────────────────────────────────────
// Stateless: create a fresh transport + server per request (Cloudflare Workers
// don't have persistent in-memory state across invocations).

export async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Stateless mode — no session management
    sessionIdGenerator: undefined,
  });

  const mcpServer = buildMcpServer(env);
  await mcpServer.connect(transport);

  const response = await transport.handleRequest(request);
  return response;
}
