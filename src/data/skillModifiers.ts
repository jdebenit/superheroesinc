/**
 * Modificadores de habilidades para orígenes y especialidades
 * 
 * Este archivo define los modificadores numéricos que cada origen/especialidad
 * aplica a las habilidades generales del personaje.
 */

export interface SkillModifier {
    skillId: string;      // ID de la habilidad (debe coincidir con GENERAL_SKILLS)
    value: number;        // Modificador numérico (puede ser negativo)
    description?: string; // Descripción opcional para el usuario
}

export interface OriginSkillModifiers {
    [originOrSpecialty: string]: SkillModifier[];
}

/**
 * Modificadores de habilidades por origen y especialidad
 */
export const ORIGIN_SKILL_MODIFIERS: OriginSkillModifiers = {
    // ==========================================
    // DIVINO
    // ==========================================
    "Dios menor": [
        {
            skillId: 'conocimientos',
            value: -15,
            description: 'Conocimiento limitado del mundo mortal'
        }
    ],

    // ==========================================
    // ARCANO
    // ==========================================
    "Terrano": [
        {
            skillId: 'conocimientos',
            value: -15,
            description: 'Desconexión de la tecnología y conocimiento moderno'
        }
    ],

    // ==========================================
    // VIGILANTE - ESPECIALIDADES
    // ==========================================
    "Acrobata": [
        { skillId: 'trepar', value: 20 },
        { skillId: 'suerte', value: 20 }
    ],

    "Arquero": [
        { skillId: 'acechar', value: 20 }
    ],

    "Artista Marcial": [
        { skillId: 'acechar', value: 20 },
        { skillId: 'trepar', value: 20 }
    ],

    "Artista Marcial con Chi": [
        { skillId: 'acechar', value: 20 },
        { skillId: 'trepar', value: 20 }
    ],

    "Cazador": [
        { skillId: 'acechar', value: 20 },
        { skillId: 'investigar', value: 20 }
    ],

    "Espadachín": [
        { skillId: 'combate', value: 20 }
    ],

    "Espia/Ladrón": [
        { skillId: 'esconderse', value: 20 },
        { skillId: 'acechar', value: 20 }
    ],

    "Francotirador": [
        { skillId: 'esconderse', value: 20 },
        { skillId: 'acechar', value: 20 }
    ],

    "Manipulador": [
        { skillId: 'idea', value: 20 },
        { skillId: 'influencia', value: 20 },
        { skillId: 'otro_idioma', value: 20, description: 'Aplica a un idioma especifico' }
    ],

    "Mente maestra": [
        { skillId: 'investigar', value: 20 },
        { skillId: 'conocimientos', value: 20 },
        { skillId: 'idea', value: 20 },
        { skillId: 'acechar', value: 20 },
    ],

    "Militar": [
        { skillId: 'combate', value: 20 }
    ],

    "Pistolero": [
        { skillId: 'acechar', value: 20 }
    ],

    // =============================================
    // MODIFICADORES PARA HABILIDADES DE APRENDIZAJE
    // =============================================

    // Terrano tiene penalizaciones con armas y tecnología
    "Terrano_special": [
        { skillId: 'armas_cortas', value: -25, description: 'Rechazo a armas de fuego' },
        { skillId: 'armas_largas', value: -25, description: 'Rechazo a armas de fuego' },
        { skillId: 'armas_militares', value: -25, description: 'Rechazo a armas de fuego' },
        { skillId: 'computadoras', value: -15, description: 'Desconexión tecnológica' },
        { skillId: 'cibernetica', value: -15, description: 'Desconexión tecnológica' }
    ]
};
