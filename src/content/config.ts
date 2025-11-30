import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        description: z.string(),
        author: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
    }),
});

const loreCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        category: z.enum(['localizaciones', 'organizaciones', 'grupos']),
        image: z.string().optional(),
        source: z.string().optional(),
        updatedDate: z.date().optional(),
    }),
});

const charactersCollection = defineCollection({
    type: 'content',
    schema: z.object({
        name: z.string(),
        alias: z.string().optional(),
        description: z.string(),
        image: z.string().optional(),
        powers: z.array(z.string()).optional(),
        source: z.string().optional(),
        updatedDate: z.date().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
    'lore': loreCollection,
    'characters': charactersCollection,
};
