import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { POWERS } from '../data/powers';
import { SPELLS } from '../data/spells';
import { SPELLS_DETAILS } from '../data/spells/index';
import { TECH_MODULES } from '../data/techModules';

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

const STATIC_TOOLS_AND_GUIDES = [
    {
        title: 'Generador de Fichas (Wizard)',
        description: 'Crea personajes metahumanos paso a paso, calcula Puntos de Creación (PC) y exporta tu ficha en JSON.',
        url: '/recursos/generador-fichas',
        category: 'Herramientas',
        type: 'tool'
    },
    {
        title: 'Visor de Fichas',
        description: 'Visualiza y consulta fichas de personaje en formato JSON o explora las fichas oficiales.',
        url: '/recursos/visor-fichas',
        category: 'Herramientas',
        type: 'tool'
    },
    {
        title: 'Guía Rápida de Reglas',
        description: 'Resumen del sistema d100, resolución de acciones, combate, iniciativas y reglas esenciales.',
        url: '/recursos/reglas',
        category: 'Reglas',
        type: 'tool'
    },
    {
        title: 'Guía de Iniciación',
        description: 'Punto de partida para nuevos jugadores y Guionistas en el universo de Superheroes INC.',
        url: '/iniciacion',
        category: 'Guías',
        type: 'tool'
    },
    {
        title: 'Timeline Completo del Universo SHI',
        description: 'Cronología histórica interactiva con todos los eventos del universo Superheroes INC.',
        url: '/lore/timeline',
        category: 'Lore',
        type: 'tool'
    },
    {
        title: 'SHI Tactic Master Terminal',
        description: 'Terminal táctica para Directores de Juego (Guionistas): gestión de combates, iniciativas y grupos.',
        url: '/recursos/tactic-master-terminal',
        category: 'Herramientas',
        type: 'tool'
    },
    {
        title: 'SHI Tactic Player Terminal',
        description: 'Terminal táctica para jugadores: control de estadísticas, acciones y tiradas en partida.',
        url: '/recursos/tactic-player-terminal',
        category: 'Herramientas',
        type: 'tool'
    }
];

function stripMarkdown(raw: string = ''): string {
    return raw
        .replace(/[#>*_`~\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export const GET: APIRoute = async () => {
    const [blogPosts, loreEntries, characters, faqs] = await Promise.all([
        getCollection('blog'),
        getCollection('lore'),
        getCollection('characters'),
        getCollection('faq'),
    ]);

    const searchIndex = [
        ...STATIC_TOOLS_AND_GUIDES,
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
        ...faqs.map(faq => {
            const cleanBody = stripMarkdown(faq.body || '');
            const prefix = faq.data.category ? `[${faq.data.category}] ` : '';
            return {
                title: faq.data.question,
                description: cleanBody ? `${prefix}${cleanBody.slice(0, 180)}` : `${prefix}Preguntas Frecuentes`,
                url: `/recursos/faqs#${faq.id}`,
                category: 'FAQs',
                type: 'faq'
            };
        }),
        ...POWERS.map(power => ({
            title: power.name,
            description: `Coste: ${power.cost} PC · Orígenes: ${power.origins.join(', ')} · Tipos: ${power.types.join(', ')}${power.options?.length ? ' · Opciones: ' + power.options.join(', ') : ''}`,
            url: `/recursos/poderes?q=${encodeURIComponent(power.name)}`,
            category: 'Poderes',
            type: 'power'
        })),
        ...SPELLS.map(spell => {
            const details = SPELLS_DETAILS[spell.id];
            const descText = details?.description ? ` — ${stripMarkdown(details.description).slice(0, 140)}` : '';
            return {
                title: spell.name,
                description: `Coste: ${spell.cost} EM/rango${spell.requirements ? ' · Req: ' + spell.requirements : ''}${descText}`,
                url: `/recursos/hechizos?q=${encodeURIComponent(spell.name)}`,
                category: 'Hechizos',
                type: 'spell'
            };
        }),
        ...TECH_MODULES.map(mod => ({
            title: mod.name,
            description: `Coste: ${mod.cost} PC · Tipo: ${mod.type || 'General'} · Loc: ${(mod.locations || []).join(', ')}${mod.description ? ' — ' + stripMarkdown(mod.description).slice(0, 140) : ''}`,
            url: `/recursos/modulos-tecnologicos?q=${encodeURIComponent(mod.name)}`,
            category: 'Módulos Tech',
            type: 'tech'
        }))
    ];

    return new Response(JSON.stringify(searchIndex), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
