import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import fs from 'fs';
import path from 'path';

const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: 'Superheroes Inc. Blog',
    description: 'Noticias, artículos y novedades sobre juegos de rol de superhéroes.',
    site: context.site,
    xmlns: {
      media: 'http://search.yahoo.com/mrss/',
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
    },
    customData: `<language>es-es</language>
<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />
<copyright>Copyright ${new Date().getFullYear()}, Superheroes Inc.</copyright>`,
    stylesheet: '/rss/styles.xsl',
    items: blog
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => {
        let rawBody = '';
        try {
          const filePath = path.join(process.cwd(), 'src/content/blog', `${post.id}.md`);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const parts = fileContent.split(/^---$/m);
          rawBody = parts.length >= 3 ? parts.slice(2).join('---').trim() : fileContent.trim();
        } catch (e) {
          rawBody = '';
        }

        return {
          title: post.data.title,
          pubDate: post.data.pubDate,
          description: post.data.description,
          link: `/blog/${post.id}/`,
          author: post.data.author,
          categories: post.data.tags,
          content: parser.render(rawBody),
          customData: (post.data.image ? `<media:content url="${new URL(post.data.image, context.site).toString()}" medium="image" type="image/jpeg" />` : '') +
            `<dc:creator>${post.data.author}</dc:creator>`,
        };
      }),
  });
}
