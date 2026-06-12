import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getSiteData } from '../../lib/content';

export async function GET(context: APIContext) {
  const site = getSiteData();
  const posts = await getCollection('notebook', ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${site.name} — Notebook`,
    description: site.tagline,
    site: context.site?.toString() ?? 'https://prabigya.com.np',
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/notebook/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
