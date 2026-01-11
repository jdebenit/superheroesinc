import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: 'Superheroes INC. Blog',
    description: 'Noticias, artículos y novedades sobre el juego de rol de superhéroes.',
    site: context.site,
    items: blog
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        // Compute RSS link from post `slug`
        // This example assumes all blog posts are rendered as `/blog/[slug]` routes
        link: `/blog/${post.slug}/`,
        author: post.data.author,
        content: post.body,
        customData: `
      <media:content
          url="${post.data.image ? new URL(post.data.image, context.site) : ''}"
          medium="image"
          type="image/jpeg"
      />
      `
      })),
    customData: `<language>es-es</language>`,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      atom: 'http://www.w3.org/2005/Atom', // Optional but good practice
    },
    stylesheet: '/rss/styles.xsl', // optional
  });
}
