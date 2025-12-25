/**
 * habilidades de aprendizaje gratuitas otorgadas por orígenes
 * 
 * Algunos orígenes otorgan habilidades de aprendizaje sin coste de PC.
 * Estas habilidades se añaden automáticamente al seleccionar el origen.
 */

export interface FreeOriginSkills {
    [originOrSubtype: string]: string[]; // Array de skillIds
}

/**
 * Mapeo de orígenes/subtipos a habilidades gratuitas
 */
export const FREE_ORIGIN_SKILLS: FreeOriginSkills = {
    // Parahumano
    "Tes-khar": ['trampas', 'farmacologia'],
    "Mago": ['magia'],
    // Añadir más orígenes según sea necesario
    // Ejemplo:
    // "Atlante": ['conducir'], // Si Atlante diera Conducir gratis
};

/**
 * Obtiene todas las habilidades gratuitas para un conjunto de orígenes
 */
export function getFreeSkillsForOrigins(origins: any[]): string[] {
    const freeSkills: string[] = [];

    if (!origins || origins.length === 0) return freeSkills;

    origins.forEach(item => {
        const originName = Object.keys(item)[0];
        const content = item[originName] as string[];

        // Buscar en origen principal
        if (FREE_ORIGIN_SKILLS[originName]) {
            freeSkills.push(...FREE_ORIGIN_SKILLS[originName]);
        }

        // Buscar en subtipos
        if (Array.isArray(content)) {
            content.forEach(subtype => {
                if (FREE_ORIGIN_SKILLS[subtype]) {
                    freeSkills.push(...FREE_ORIGIN_SKILLS[subtype]);
                }
            });
        }
    });

    // Eliminar duplicados
    return [...new Set(freeSkills)];
}
