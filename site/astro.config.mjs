import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { rehypeSidenotes } from './src/plugins/rehype-sidenotes.mjs';

const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://prabigya.com.np',
  output: 'static',
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    server: {
      proxy: {
        // Forward dynamic worker routes to wrangler dev.
        // Static Astro-generated JSON (/api/publications.json etc.) are NOT
        // listed here and continue to be served by the Astro dev server.
        '/api/ask':           { target: workerUrl, changeOrigin: true },
        '/api/guestbook':     { target: workerUrl, changeOrigin: true },
        '/api/guestbook.json':{ target: workerUrl, changeOrigin: true },
        '/api/leaderboard.json': { target: workerUrl, changeOrigin: true },
        '/api/lab.json':      { target: workerUrl, changeOrigin: true },
        '/api/eval':          { target: workerUrl, changeOrigin: true },
        '/mcp':               { target: workerUrl, changeOrigin: true },
        '/ingest':            { target: workerUrl, changeOrigin: true },
        '/admin':             { target: workerUrl, changeOrigin: true },
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [rehypeKatex, rehypeSidenotes],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
    syntaxHighlight: 'shiki',
  },
});
