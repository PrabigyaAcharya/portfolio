import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { rehypeSidenotes } from './src/plugins/rehype-sidenotes.mjs';

const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';

// The LCD is monochrome, so code is too: one ink colour, with weight and
// italics carrying the syntax. Colours match --screen-ink in tokens.css.
const lcdTheme = {
  name: 'lcd',
  type: 'light',
  colors: { 'editor.background': '#00000000', 'editor.foreground': '#2f3317' },
  tokenColors: [
    { settings: { foreground: '#2f3317' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { fontStyle: 'bold' } },
    { scope: ['entity.name.function', 'support.function', 'entity.name.type', 'entity.name.class'], settings: { fontStyle: 'underline' } },
  ],
};

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
      theme: lcdTheme,
      wrap: false,
    },
    syntaxHighlight: 'shiki',
  },
});
