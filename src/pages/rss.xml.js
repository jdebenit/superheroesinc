import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: 'Superheroes Inc. Blog',
    description: 'Noticias, artículos y novedades sobre juegos de rol de superhéroes.',
    site: context.site,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: `<language>es-es</language>`,
    stylesheet: '/rss/styles.xsl',
    items: blog
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
        author: post.data.author,
        content: post.body,
        customData: post.data.image ? `<media:content url="${new URL(post.data.image, context.site).toString()}" medium="image" type="image/jpeg" />` : '',
      })),
  });
}
