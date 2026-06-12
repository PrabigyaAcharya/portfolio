// rehype-sidenotes.mjs
// Transforms standard GFM footnotes into sidenote-ready markup.
// - Marks the footnote section with .sidenotes class
// - Desktop: CSS positions notes in the margin column via grid layout
// - Mobile (≤820px): CSS shows <details> disclosure inline (no JS needed)
// The base fallback (no JS, no CSS) is standard footnote links at page bottom.

import { visit } from 'unist-util-visit';

export function rehypeSidenotes() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // remark-gfm generates <section data-footnotes class="footnotes">
      if (
        node.tagName === 'section' &&
        node.properties?.dataFootnotes !== undefined
      ) {
        // Add our sidenotes class alongside the existing one
        const existing = Array.isArray(node.properties.className)
          ? node.properties.className
          : node.properties.className
          ? [node.properties.className]
          : [];
        node.properties.className = [...existing, 'sidenotes'];
        // Add ARIA role and label for accessibility
        node.properties.role = 'doc-endnotes';
        if (!node.properties['aria-label']) {
          node.properties['aria-label'] = 'Footnotes';
        }
      }

      // Add role="doc-footnote" to individual footnote list items
      if (
        node.tagName === 'li' &&
        node.properties?.id &&
        typeof node.properties.id === 'string' &&
        node.properties.id.startsWith('user-content-fn-')
      ) {
        node.properties.role = 'doc-footnote';
      }
    });
  };
}
