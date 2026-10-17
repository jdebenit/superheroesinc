import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const LORE_CATEGORY_LABELS: Record<string, string> = {
    'organizaciones': 'Organizaciones',
    'localizaciones': 'Localizaciones',
    'grupos': 'Grupos',
    'eventos': 'Eventos',
    'criaturas': 'Criaturas',
    'entidades': 'Entidades',
    'actual-plays': 'Actual Plays',
    'cronicas': 'Crónicas',
};

export const GET: APIRoute = async () => {
    // Get all content from collections
    const [blogPosts, loreEntries, characters, faqs] = await Promise.all([
        getCollection('blog'),
        getCollection('lore'),
        getCollection('characters'),
        getCollection('faq'),
    ]);

    // Build search index
    const searchIndex = [
        ...blogPosts.map(post => ({
            title: post.data.title,
            description: post.data.description,
            url: `/blog/${post.id}`,
            category: 'Blog',
            type: 'blog'
        })),
        ...loreEntries.map(entry => {
            const filename = entry.id.split('/').pop() || entry.id;
            return {
                title: entry.data.title,
                description: entry.data.description,
                url: `/lore/${entry.data.category}/${filename}`,
                category: LORE_CATEGORY_LABELS[entry.data.category] || 'Lore',
                type: 'lore',
                source: entry.data.source
            };
        }),
        ...characters.map(char => ({
            title: char.data.name,
            description: char.data.description,
            url: `/personajes/${char.id}`,
            category: 'Personajes',
            type: 'character',
            alias: char.data.alias
        })),
        ...faqs.map(faq => ({
            title: faq.data.question,
            description: faq.data.category ? `FAQ (${faq.data.category})` : 'Preguntas Frecuentes',
            url: `/recursos/faqs`,
            category: 'FAQs',
            type: 'faq'
        }))
    ];

    return new Response(JSON.stringify(searchIndex), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
