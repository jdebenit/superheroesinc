/**
 * Definiciones de habilidades de aprendizaje para Superheroes INC.
 * 
 * Las habilidades de aprendizaje son más específicas que las generales y algunas
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
    category: 'combat' | 'technical' | 'knowledge' | 'social' | 'other' | 'exclusive';
}

export const SPECIAL_SKILLS: SpecialSkillDefinition[] = [
    // ==========================================
    // COMBATE
    // ==========================================
    {
        id: 'arcos',
        name: 'Arcos / Ballestas',
        category: 'combat',
        formula: (stats) => (2 * stats['percepcion']) / 3,
        formulaText: '(2xPER)/3',
        description: 'Arcos, Ballestas'
    },
    {
        id: 'armas_cortas',
        name: 'Armas cortas',
        category: 'combat',
        formula: (stats) => (2 * stats['percepcion']) / 3,
        formulaText: '(2xPER)/3',
        description: 'Pistolas, revólveres'
    },
    {
        id: 'armas_largas',
        name: 'Armas largas',
        category: 'combat',
        formula: (stats) => (2 * stats['percepcion']) / 3,
        formulaText: '(2xPER)/3',
        description: 'Rifles, escopetas, subfusiles'
    },
    {
        id: 'armas_militares',
        name: 'Armas militares',
        category: 'combat',
        formula: (stats) => stats['percepcion'] / 3,
        formulaText: 'PER/3',
        description: 'Armas pesadas, artillería'
    },
    {
        id: 'armas_blancas',
        name: 'Armas blancas',
        category: 'combat',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 3,
        formulaText: '(AGI+PER)/3',
        description: 'Espadas, cuchillos, hachas'
    },
    {
        id: 'arma_especial',
        name: 'Arma Especial',
        requiresSpecification: true,
        specificationLabel: 'Arma',
        specificationPlaceholder: 'Ej: Escudo, Cerbatana, Látigo...',
        category: 'combat',
        formula: (stats) => (2 * stats['percepcion']) / 3,
        formulaText: '(2xPER)/3',
    },
    {
        id: 'explosivos',
        name: 'Explosivos',
        category: 'combat',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT)/2',
        description: 'Manipular y crear explosivos'
    },
    {
        id: 'trampas',
        name: 'Trampas',
        category: 'combat',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT)/2',
        description: 'Detectar, desarmar y crear trampas'
    },

    // ==========================================
    // CONOCIMIENTO
    // ==========================================
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
        id: 'farmacologia',
        name: 'Farmacología',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
        description: 'Conocimiento de drogas, venenos y medicamentos'
    },
    {
        id: 'medicina',
        name: 'Medicina',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3',
        description: 'Medicina general'
    },
    {
        id: 'especialidad',
        name: 'Medicina Especialidad',
        requiresSpecification: true,
        specificationLabel: 'Campo médico',
        specificationPlaceholder: 'Ej: Cirugía, Oncologia, Inmunología...',
        category: 'knowledge',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3',
    },

    // ==========================================
    // TÉCNICAS
    // ==========================================
    {
        id: 'artesania',
        name: 'Artesanía',
        requiresSpecification: true,
        specificationLabel: 'Disciplina',
        specificationPlaceholder: 'Ej: Herreria, carpintería, sastreria...',
        category: 'technical',
        formula: (stats) => stats['percepcion'] / 2,
        formulaText: 'PER/2'
    },
    {
        id: 'cerrajeria',
        name: 'Cerrajería',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
        description: 'Cerraduras electronicas, alarmas, cierres laser'
    },
    {
        id: 'cibernetica',
        name: 'Cibernética',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
        description: 'Creación y reparación de sistemas informático-electronico muy complejos'
    },
    {
        id: 'conducir',
        name: 'Conducir',
        requiresSpecification: true,
        specificationLabel: 'Vehiculo',
        specificationPlaceholder: 'Ej: Coche, moto, avion, barco...',
        category: 'technical',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 4,
        formulaText: '(INT+PER)/4',
    },
    {
        id: 'computadoras',
        name: 'Computadoras / Comunicaciones',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
        description: 'Programación, hacking, sistemas'
    },
    {
        id: 'mecanica',
        name: 'Mecánica',
        category: 'technical',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
        description: 'Reparación y mantenimiento de maquinaria'
    },

    // ==========================================
    // SOCIAL
    // ==========================================
    {
        id: 'interpretar',
        name: 'Interpretar',
        requiresSpecification: true,
        specificationLabel: 'Especialidad',
        specificationPlaceholder: 'Ej: Drama, música, danza...',
        category: 'social',
        formula: (stats) => (stats['apariencia'] + stats['percepcion']) / 3,
        formulaText: '(APR+PER)/3'
    },
    {
        id: 'otro_idioma',
        name: 'Otro idioma',
        requiresSpecification: true,
        specificationLabel: 'Idioma',
        specificationPlaceholder: 'Ej: Inglés, Francés, Alemán...',
        category: 'social',
        formula: (stats) => stats['inteligencia'] / 3,
        formulaText: 'INT/3'
    },
    {
        id: 'robar',
        name: 'Robar',
        category: 'social',
        formula: (stats) => stats['agilidad'] / 3,
        formulaText: 'AGI/2',
        description: 'Sustraer objetos sin que el propietario lo detecte'
    },

    // ==========================================
    // OTRAS
    // ==========================================
    {
        id: 'nadar',
        name: 'Nadar / Bucear',
        category: 'other',
        formula: (stats) => (stats['fuerza'] + stats['agilidad']) / 2,
        formulaText: '(FUE+AGI)/2',
        description: 'Nadar y bucear'
    },
    {
        id: 'montar',
        name: 'Montar Animal',
        requiresSpecification: true,
        specificationLabel: 'Animal',
        specificationPlaceholder: 'Ej: Caballo, Camello, Grifo...',
        category: 'other',
        formula: (stats) => stats['agilidad'] / 2,
        formulaText: 'AGI/2',
    },
    {
        id: 'rastrear',
        name: 'Rastrear',
        category: 'other',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 4,
        formulaText: '(INT+PER)/4',
        description: 'Seguir huellas, encontrar pistas'
    },
    {
        id: 'supervivencia',
        name: 'Supervivencia',
        requiresSpecification: true,
        specificationLabel: 'Entorno',
        specificationPlaceholder: 'Ej: Bosque, Bajos fondos...',
        category: 'other',
        formula: (stats) => stats['inteligencia'] / 2,
        formulaText: 'INT/2',
    },
    {
        id: 'trato_animal',
        name: 'Trato animal',
        requiresSpecification: true,
        specificationLabel: 'Clase de animal',
        specificationPlaceholder: 'Ej: Aves rapaces, animales de trabajo...',
        category: 'other',
        formula: (stats) => (stats['voluntad'] + stats['inteligencia']) / 4,
        formulaText: '(VOL+INT)/4',
    },


    // ==========================================
    // EXCLUSIVAS
    // ==========================================
    {
        id: 'magia',
        name: 'Magia',
        category: 'exclusive',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 2,
        formulaText: '(INT+PER)/2',
        description: 'Capacidad para lanzar hechizos'
    },
    {
        id: 'artes_marciales',
        name: 'Artes Marciales',
        category: 'exclusive',
        formula: (stats) => (stats['agilidad'] + stats['percepcion']) / 3,
        formulaText: '(AGI+PER)/3',
        description: 'Combate cuerpo a cuerpo sin armas'
    },
    {
        id: 'artesania_arcana',
        name: 'Artesania Arcana',
        category: 'exclusive',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 3,
        formulaText: '(INT+PER)/3',
        description: 'Impresión de voluntad en objetos'
    },
    {
        id: 'contemplacion',
        name: 'Contemplación',
        category: 'exclusive',
        formula: (stats) => stats['voluntad'] / 2,
        formulaText: 'VOL/2',
        description: 'Centrar su voluntad en una canalización de hechizo o de chi'
    },
    {
        id: 'forjador_artefactos',
        name: 'Forjador de Artefactos',
        category: 'exclusive',
        formula: (stats) => (stats['inteligencia'] + stats['voluntad']) / 3,
        formulaText: '(INT+VOL)/3',
        description: 'Creación y reparación de artefactos'
    },
    {
        id: 'sistemas_armamento',
        name: 'Sistemas de Armamento',
        category: 'exclusive',
        formula: (stats) => stats['percepcion'] / 2,
        formulaText: 'PER/2',
        description: 'Permite operar armas en tecnoarmaduras, tecnoimplantes y tecnovehiculos'
    },
    {
        id: 'tecnoarmadura',
        name: 'Tecnoarmadura / Tecnovehiculo',
        category: 'exclusive',
        formula: (stats) => (stats['inteligencia'] + stats['percepcion']) / 3,
        formulaText: '(INT+PER)/3',
        description: 'Manejo de tecnoarmaduras de combate y tecnovehiculos'
    },
];

// Helper para obtener categorías únicas
export const SKILL_CATEGORIES = {
    combat: 'Combate',
    technical: 'Técnicas',
    knowledge: 'Conocimiento',
    social: 'Social',
    other: 'Otras',
    exclusive: 'Exclusivas'
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
