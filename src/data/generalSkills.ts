export interface GeneralSkillDefinition {
    id: string;
    name: string;
    description?: string;
    formula: (stats: { [key: string]: number }) => number;
    formulaText: string;
}

export const GENERAL_SKILLS: GeneralSkillDefinition[] = [
    {
        id: 'acechar',
        name: 'Acechar/Discrección',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 2,
        formulaText: '(AGI+PER)/2'
    },
    {
        id: 'combate',
        name: 'Comb. cuerpo a cuerpo',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 2,
        formulaText: '(AGI+PER)/2'
    },
    {
        id: 'conocimientos',
        name: 'Conocimientos generales',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3'
    },
    {
        id: 'esconderse',
        name: 'Esconderse',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 4,
        formulaText: '(AGI+PER)/4'
    },
    {
        id: 'idea',
        name: 'Idea',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2'
    },
    {
        id: 'influencia',
        name: 'Influencia',
        formula: (stats) => (stats['inteligencia'] + stats['apariencia']) / 2,
        formulaText: '(INT+APA)/2'
    },
    {
        id: 'idioma',
        name: 'Idioma nativo',
        formula: (stats) => stats['inteligencia'],
        formulaText: 'INT'
    },
    {
        id: 'investigar',
        name: 'Investigar',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 3,
        formulaText: '(INT+PER)/3'
    },
    {
        id: 'lanzar',
        name: 'Lanzar',
        formula: (stats) => (stats['fuerza'] + stats['percepcion']) / 2,
        formulaText: '(FUE+PER)/2'
    },
    {
        id: 'primeros_auxilios',
        name: 'Primeros auxilios',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2'
    },
    {
        id: 'suerte',
        name: 'Suerte',
        formula: (stats) => (stats['percepcion'] + stats['voluntad']) / 4,
        formulaText: '(PER+VOL)/4'
    },
    {
        id: 'trepar',
        name: 'Trepar y Saltar',
        formula: (stats) => stats['agilidad'],
        formulaText: 'AGI'
    }
];
