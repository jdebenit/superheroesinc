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
        category: z.enum(['localizaciones', 'organizaciones', 'grupos', 'eventos', 'criaturas', 'entidades', 'actual-plays']),
        image: z.string().optional(),
        source: z.string().optional(),
        updatedDate: z.date().optional(),
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
        }).optional(),
        specialskills: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        profession: z.string().optional(),
        sexualIdentity: z.string().optional(),
        background: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()),
            prejudiceResistance: z.number().optional(),
            economicStatus: z.string().optional(),
            legalStatus: z.string().optional(),
            socialStatus: z.string().optional(),
            friendsAndAssociates: z.string().optional(),
        }).optional(),
        equipment: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        // Powers - support both old and new formats
        powers: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional(), // Old format
            selected: z.array(z.any()).optional(), // New format
        }).optional(),
        spells: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any()).optional(),
            selected: z.array(z.any()).optional(), // New format
        }).optional(),
        weapons: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        // Tech modules - support both old and new formats
        techmodules: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        techModules: z.object({
            installed: z.array(z.any()).optional(),
        }).optional(),
        artifacts: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        vehicles: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        magicObjects: z.object({
            cost: z.union([z.number(), z.string()]).optional(),
            items: z.array(z.any())
        }).optional(),
        magicTableRolls: z.array(z.any()).optional(),
        combatstats: z.array(z.string()).optional(),
        otherstats: z.array(z.string()).optional(),
        notes: z.union([z.string(), z.array(z.string())]).optional(),
        traumas: z.record(z.string(), z.string()).optional(),
        icon: z.string().optional(),
        exoskeletonConfig: z.string().optional(),
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
        tags: z.array(z.string()).optional(),
    }),
});

const faqCollection = defineCollection({
    type: 'content',
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
};
