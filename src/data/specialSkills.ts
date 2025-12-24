/**
 * Definiciones de Habilidades Especiales para Superheroes INC.
 * 
 * Las habilidades especiales son más específicas que las generales y algunas
 * requieren especificación adicional (ej: Otro idioma: Inglés)
 */

export interface SpecialSkillDefinition {
    id: string;
    name: string;
    requiresSpecification?: boolean;  // Si requiere campo personalizable
    specificationLabel?: string;      // Label para el campo (ej: "Idioma", "Ciencia")
    specificationPlaceholder?: string; // Placeholder del input
    description?: string;
    formula?: (stats: { [key: string]: number }) => number;
    formulaText?: string;
    category: 'combat' | 'technical' | 'knowledge' | 'social' | 'other';
}

export const SPECIAL_SKILLS: SpecialSkillDefinition[] = [
    // ==========================================
    // COMBATE
    // ==========================================
    {
        id: 'armas_cortas',
        name: 'Armas cortas',
        category: 'combat',
        formula: (stats) => stats['agilidad'] / 4,
        formulaText: 'AGI/4',
        description: 'Pistolas, revólveres, subfusiles'
    },
    {
        id: 'armas_largas',
        name: 'Armas largas',
        category: 'combat',
        formula: (stats) => stats['percepcion'] / 4,
        formulaText: 'PER/4',
        description: 'Rifles, escopetas, arcos'
    },
    {
        id: 'armas_militares',
        name: 'Armas militares',
        category: 'combat',
        formula: (stats) => stats['percepcion'] / 5,
        formulaText: 'PER/5',
        description: 'Armas pesadas, explosivos, artillería'
    },
    {
        id: 'armas_blancas',
        name: 'Armas blancas',
        category: 'combat',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 4,
        formulaText: '(AGI+PER)/4',
        description: 'Espadas, cuchillos, hachas'
    },
    {
        id: 'trampas',
        name: 'Trampas',
        category: 'combat',
        formula: (stats) => (stats['inteligencia'] + stats['agilidad']) / 4,
        formulaText: '(INT+AGI)/4',
        description: 'Detectar, desarmar y crear trampas'
    },
    {
        id: 'artes_marciales',
        name: 'Artes Marciales',
        category: 'combat',
        formula: (stats) => (stats['agilidad'] + stats['fuerza']) / 4,
        formulaText: '(AGI+FUE)/4',
        description: 'Combate cuerpo a cuerpo sin armas'
    },

    // ==========================================
    // CONOCIMIENTO
    // ==========================================
    {
        id: 'otro_idioma',
        name: 'Otro idioma',
        requiresSpecification: true,
        specificationLabel: 'Idioma',
        specificationPlaceholder: 'Ej: Inglés, Francés, Alemán...',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2'
    },
    {
        id: 'ciencia',
        name: 'Ciencia',
        requiresSpecification: true,
        specificationLabel: 'Campo científico',
        specificationPlaceholder: 'Ej: Física, Química, Biología...',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3'
    },
    {
        id: 'arte',
        name: 'Arte',
        requiresSpecification: true,
        specificationLabel: 'Disciplina artística',
        specificationPlaceholder: 'Ej: Pintura, Escultura, Música...',
        category: 'knowledge',
        formula: (stats) => (stats['inteligencia'] + stats['agilidad']) / 4,
        formulaText: '(INT+AGI)/4'
    },
    {
        id: 'farmacologia',
        name: 'Farmacología',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3',
        description: 'Conocimiento de drogas, venenos y medicamentos'
    },
    {
        id: 'oficio',
        name: 'Oficio',
        requiresSpecification: true,
        specificationLabel: 'Tipo de oficio',
        specificationPlaceholder: 'Ej: Carpintería, Herrería, Mecánica...',
        category: 'technical',
        formula: (stats) => (stats['inteligencia'] + stats['agilidad']) / 4,
        formulaText: '(INT+AGI)/4'
    },

    // ==========================================
    // TÉCNICAS
    // ==========================================
    {
        id: 'conducir',
        name: 'Conducir',
        category: 'technical',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 4,
        formulaText: '(AGI+PER)/4',
        description: 'Vehículos terrestres'
    },
    {
        id: 'pilotar',
        name: 'Pilotar',
        category: 'technical',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 5,
        formulaText: '(AGI+PER)/5',
        description: 'Aeronaves, helicópteros'
    },
    {
        id: 'informatica',
        name: 'Informática',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3',
        description: 'Programación, hacking, sistemas'
    },
    {
        id: 'electronica',
        name: 'Electrónica',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 4,
        formulaText: 'INT/4',
        description: 'Reparación y diseño de dispositivos electrónicos'
    },
    {
        id: 'mecanica',
        name: 'Mecánica',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 4,
        formulaText: 'INT/4',
        description: 'Reparación y mantenimiento de maquinaria'
    },

    // ==========================================
    // SOCIAL
    // ==========================================
    {
        id: 'callejeo',
        name: 'Callejeo',
        category: 'social',
        formula: (stats) => (stats['inteligencia'] + stats['apariencia']) / 4,
        formulaText: '(INT+APA)/4',
        description: 'Contactos, rumores, información de la calle'
    },
    {
        id: 'etiqueta',
        name: 'Etiqueta',
        category: 'social',
        formula: (stats) => (stats['inteligencia'] + stats['apariencia']) / 4,
        formulaText: '(INT+APA)/4',
        description: 'Protocolo, buenos modales, alta sociedad'
    },
    {
        id: 'intimidar',
        name: 'Intimidar',
        category: 'social',
        formula: (stats) => (stats['fuerza'] + stats['voluntad']) / 4,
        formulaText: '(FUE+VOL)/4',
        description: 'Amenazas, coerción'
    },
    {
        id: 'persuasion',
        name: 'Persuasión',
        category: 'social',
        formula: (stats) => (stats['inteligencia'] + stats['apariencia']) / 3,
        formulaText: '(INT+APA)/3',
        description: 'Convencer, negociar, seducir'
    },

    // ==========================================
    // OTRAS
    // ==========================================
    {
        id: 'medicina',
        name: 'Medicina',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3',
        description: 'Diagnóstico, cirugía, tratamiento médico'
    },
    {
        id: 'supervivencia',
        name: 'Supervivencia',
        category: 'other',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 4,
        formulaText: '(INT+PER)/4',
        description: 'Orientación, caza, refugio en la naturaleza'
    },
    {
        id: 'rastrear',
        name: 'Rastrear',
        category: 'other',
        formula: (stats) => stats['percepcion'] / 3,
        formulaText: 'PER/3',
        description: 'Seguir huellas, encontrar pistas'
    }
];

// Helper para obtener categorías únicas
export const SKILL_CATEGORIES = {
    combat: 'Combate',
    technical: 'Técnicas',
    knowledge: 'Conocimiento',
    social: 'Social',
    other: 'Otras'
} as const;

// Helper para agrupar habilidades por categoría
export function getSkillsByCategory() {
    const grouped: { [key: string]: SpecialSkillDefinition[] } = {};

    SPECIAL_SKILLS.forEach(skill => {
        if (!grouped[skill.category]) {
            grouped[skill.category] = [];
        }
        grouped[skill.category].push(skill);
    });

    return grouped;
}
