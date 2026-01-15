export interface GeneralSkillDefinition {
    id: string;
    name: string;
    category: 'combat' | 'technical' | 'knowledge' | 'social' | 'other' | 'exclusive';
    type?: 'cac' | 'distance' | 'both';
    description?: string;
    formula: (stats: { [key: string]: number }) => number;
    formulaText: string;
}

export const GENERAL_SKILLS: GeneralSkillDefinition[] = [
    {
        id: 'acechar',
        name: 'Acechar/Discrección',
        category: 'other',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 2,
        formulaText: '(AGI+PER)/2'
    },
    {
        id: 'combate',
        name: 'Comb. cuerpo a cuerpo',
        category: 'combat',
        type: 'cac',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 2,
        formulaText: '(AGI+PER)/2'
    },
    {
        id: 'conocimientos',
        name: 'Conocimientos generales',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3'
    },
    {
        id: 'esconderse',
        name: 'Esconderse',
        category: 'other',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 4,
        formulaText: '(AGI+PER)/4'
    },
    {
        id: 'idea',
        name: 'Idea',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2'
    },
    {
        id: 'influencia',
        name: 'Influencia',
        category: 'social',
        formula: (stats) => (stats['inteligencia'] + stats['apariencia']) / 2,
        formulaText: '(INT+APA)/2'
    },
    {
        id: 'idioma',
        name: 'Idioma nativo',
        category: 'social',
        formula: (stats) => stats['inteligencia'],
        formulaText: 'INT'
    },
    {
        id: 'investigar',
        name: 'Investigar',
        category: 'knowledge',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 3,
        formulaText: '(INT+PER)/3'
    },
    {
        id: 'lanzar',
        name: 'Lanzar',
        category: 'combat',
        type: 'distance',
        formula: (stats) => (stats['fuerza'] + stats['percepcion']) / 2,
        formulaText: '(FUE+PER)/2'
    },
    {
        id: 'primeros_auxilios',
        name: 'Primeros auxilios',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2'
    },
    {
        id: 'suerte',
        name: 'Suerte',
        category: 'other',
        formula: (stats) => (stats['percepcion'] + stats['voluntad']) / 4,
        formulaText: '(PER+VOL)/4'
    },
    {
        id: 'trepar',
        name: 'Trepar y Saltar',
        category: 'other',
        formula: (stats) => stats['agilidad'],
        formulaText: 'AGI'
    }
];
