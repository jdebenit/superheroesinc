import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
    // Get all content from collections
    const blogPosts = await getCollection('blog');
    const loreEntries = await getCollection('lore');
    const characters = await getCollection('characters');

    // Build search index
    const searchIndex = [
        ...blogPosts.map(post => ({
            title: post.data.title,
            description: post.data.description,
            url: `/blog/${post.slug}`,
            category: 'Blog',
            type: 'blog'
        })),
        ...loreEntries.map(entry => ({
            title: entry.data.title,
            description: entry.data.description,
            url: entry.data.category === 'organizaciones'
                ? `/organizaciones/${entry.slug}`
                : `/lore/${entry.slug}`,
            category: entry.data.category === 'organizaciones' ? 'Organizaciones' : 'Lore',
            type: 'lore',
            source: entry.data.source
        })),
        ...characters.map(char => ({
            title: char.data.name,
            description: char.data.description,
            url: `/personajes/${char.slug}`,
            category: 'Personajes',
            type: 'character',
            alias: char.data.alias
        }))
    ];

    return new Response(JSON.stringify(searchIndex), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
