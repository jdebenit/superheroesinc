import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
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
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/lore' }),
    schema: z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string(),
        category: z.enum(['localizaciones', 'organizaciones', 'grupos', 'eventos', 'criaturas', 'entidades', 'actual-plays', 'cronicas']),
        image: z.string().optional(),
        source: z.string().optional(),
        updatedDate: z.date().optional(),
        pubDate: z.date().optional(),
        eventDate: z.date().optional(),
        // Reference to RPG data
        rpgId: z.string().optional(),
        // Actual Play specific fields
        type: z.string().optional(),
        system: z.string().optional(),
        arc: z.string().optional(),
        session: z.number().optional(),
        datePlayed: z.date().optional(),
        gm: z.string().optional(),
        players: z.array(z.object({
            name: z.string(),
            character: z.string(),
            rpgId: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
        })).optional(),
        npcs: z.array(z.object({
            name: z.string(),
            rpgId: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
        })).optional(),
        tags: z.array(z.string()).optional(),
        summary: z.string().optional(),
        reality: z.string().optional().default('Principal'),
        showInTimeline: z.boolean().optional().default(true),
    }),
});

const timelineCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/timeline' }),
    schema: z.object({
        title: z.string(),
        date: z.union([z.string(), z.date()]).transform((val) => {
            if (val instanceof Date) return val;
            // Handle negative years manually
            const match = val.match(/^(-?\d+)-(\d{2})-(\d{2})/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1; // 0-indexed
                const day = parseInt(match[3]);
                const date = new Date(0);
                date.setUTCFullYear(year, month, day);
                date.setUTCHours(0, 0, 0, 0);
                return date;
            }
            return new Date(val);
        }),
        displayDate: z.string().optional(),
        description: z.string(),
        reality: z.string().optional().default('Principal'),
        image: z.string().optional(),
        icon: z.string().optional(), // 'star', 'work', 'military', etc.
        tags: z.array(z.string()).optional(),
    }),
});

const rpgCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.json', base: './src/content/rpg' }),
    schema: z.object({
        name: z.string().optional(),
        alias: z.string().optional(),
        totalCost: z.union([z.number(), z.string()]).optional(),
        level: z.union([z.number(), z.string()]).optional(),
        origin: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        other: z.array(z.string()).optional(),
        attributes: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            values: z.record(z.string(), z.union([z.number(), z.string()]))
        }).passthrough().optional(),
        // Skills - support both old and new formats
        skills: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional(), // Old format
            generalItems: z.array(z.any()).optional(), // New format
            specialItems: z.array(z.any()).optional(), // New format
            generalManualMods: z.record(z.string(), z.number()).optional(),
            manualBases: z.record(z.string(), z.number()).optional(),
            learning: z.object({
                selected: z.record(z.string(), z.any()).optional(),
                specified: z.record(z.string(), z.any()).optional(),
            }).optional(),
        }).passthrough().optional(),
        specialskills: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        profession: z.string().optional(),
        sexualIdentity: z.string().optional(),
        background: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([]),
            prejudiceResistance: z.number().optional(),
            economicStatus: z.string().optional(),
            legalStatus: z.string().optional(),
            socialStatus: z.string().optional(),
            friendsAndAssociates: z.string().optional(),
        }).passthrough().optional(),
        equipment: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        // Powers - support both old and new formats
        powers: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional(), // Old format
            selected: z.array(z.any()).optional(), // New format
        }).passthrough().optional(),
        spells: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional(),
            selected: z.array(z.any()).optional(), // New format
        }).passthrough().optional(),
        weapons: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        // Tech modules - support both old and new formats
        techmodules: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        techModules: z.object({
            installed: z.array(z.any()).optional(),
        }).passthrough().optional(),
        artifacts: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        vehicles: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        magicObjects: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional().default([])
        }).optional(),
        magicTableRolls: z.array(z.any()).optional(),
        // Stats - handle both old array and new object formats
        combatstats: z.union([z.array(z.string()), z.record(z.string(), z.any())]).optional(),
        otherstats: z.union([z.array(z.string()), z.record(z.string(), z.any())]).optional(),
        notes: z.union([z.string(), z.array(z.string())]).optional(),
        traumas: z.record(z.string(), z.string()).optional(),
        icon: z.string().optional(),
        exoskeletonConfig: z.string().optional(),
        meta: z.object({
            version: z.string().optional(),
            generator: z.string().optional()
        }).passthrough().optional(),
        uiState: z.any().optional(),
        varios: z.object({
            items: z.array(z.any()).optional().default([])
        }).optional(),
    }).passthrough(),
});

const charactersCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/characters' }),
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
        birthDate: z.union([z.string(), z.date()]).transform((val) => {
            if (!val) return undefined;
            if (val instanceof Date) return val;
            const match = val.match(/^(-?\d+)-(\d{2})-(\d{2})/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const day = parseInt(match[3]);
                const date = new Date(0);
                date.setUTCFullYear(year, month, day);
                date.setUTCHours(0, 0, 0, 0);
                return date;
            }
            return new Date(val);
        }).optional(),
        deathDate: z.union([z.string(), z.date()]).transform((val) => {
            if (!val) return undefined;
            if (val instanceof Date) return val;
            const match = val.match(/^(-?\d+)-(\d{2})-(\d{2})/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const day = parseInt(match[3]);
                const date = new Date(0);
                date.setUTCFullYear(year, month, day);
                date.setUTCHours(0, 0, 0, 0);
                return date;
            }
            return new Date(val);
        }).optional(),
        originReality: z.string().optional(),
        actualReality: z.string().optional(),
        tags: z.array(z.string()).optional(),
        groups: z.array(z.string()).optional(),
        grupos: z.array(z.string()).optional(),
    }),
});

const faqCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/faq' }),
    schema: z.object({
        question: z.string(),
        tags: z.array(z.string()),
        category: z.string().optional(),
        order: z.number().optional(),
        updatedDate: z.date().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
    'lore': loreCollection,
    'characters': charactersCollection,
    'rpg': rpgCollection,
    'faq': faqCollection,
    'timeline': timelineCollection,
};
