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

const rpgCollection = defineCollection({
    type: 'data',
    schema: z.object({
        totalCost: z.number().optional(),
        level: z.number().optional(),
        origin: z.object({
            cost: z.number(),
            items: z.array(z.union([z.string(), z.record(z.string(), z.array(z.string()))]))
        }).optional(),
        other: z.array(z.string()).optional(),
        attributes: z.object({
            cost: z.number(),
            values: z.record(z.string(), z.number())
        }).optional(),
        skills: z.object({
            cost: z.number(),
            items: z.array(z.union([z.string(), z.record(z.string(), z.array(z.string()))]))
        }).optional(),
        specialskills: z.object({
            cost: z.number(),
            items: z.array(z.union([z.string(), z.record(z.string(), z.array(z.string()))]))
        }).optional(),
        background: z.object({
            cost: z.number(),
            items: z.array(z.union([z.string(), z.record(z.string(), z.array(z.string()))]))
        }).optional(),
        equipment: z.object({
            cost: z.number(),
            items: z.array(z.union([z.string(), z.record(z.string(), z.array(z.string()))]))
        }).optional(),
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
        // Reference to RPG data
        rpgId: z.string().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
    'lore': loreCollection,
    'characters': charactersCollection,
    'rpg': rpgCollection,
};
