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
        category: z.enum(['localizaciones', 'organizaciones', 'grupos', 'eventos', 'criaturas', 'entidades']),
        image: z.string().optional(),
        source: z.string().optional(),
        updatedDate: z.date().optional(),
    }),
});

const rpgCollection = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string().optional(),
        totalCost: z.union([z.number(), z.string()]).optional(),
        level: z.union([z.number(), z.string()]).optional(),
        origin: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        other: z.array(z.string()).optional(),
        attributes: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            values: z.record(z.string(), z.union([z.number(), z.string()]))
        }).optional(),
        skills: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        specialskills: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        background: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        equipment: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        powers: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        spells: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        weapons: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        techmodules: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        combatstats: z.array(z.string()).optional(),
        otherstats: z.array(z.string()).optional(),
        notes: z.union([z.string(), z.array(z.string())]).optional(),
        icon: z.string().optional(),
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
        category: z.enum(['principales', 'secundarios', 'genericos']).default('secundarios'),
    }),
});

export const collections = {
    'blog': blogCollection,
    'lore': loreCollection,
    'characters': charactersCollection,
    'rpg': rpgCollection,
};
