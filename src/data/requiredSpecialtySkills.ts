/**
 * Habilidades de aprendizaje obligatorias para especialidades de Vigilante
 * 
 * Estas habilidades se añaden automáticamente al seleccionar la especialidad,
 * pero a diferencia de las habilidades gratuitas de origen:
 * - SÍ cuestan PC (1 PC o 0.5 PC para Liberado)
 * - NO se pueden eliminar (son obligatorias)
 * - Se marcan como "OBLIGATORIA" en la UI
 */

export interface RequiredSpecialtySkills {
    [specialty: string]: string[]; // Array de skillIds obligatorios
}

/**
 * Mapeo de especialidades de Vigilante a habilidades obligatorias
 */
export const REQUIRED_SPECIALTY_SKILLS: RequiredSpecialtySkills = {
    "Artista Marcial": ['artes_marciales'],
    "Artista Marcial con Chi": ['artes_marciales'],
    "Pistolero": ['armas_cortas'],
    "Espadachín": ['armas_blancas'],
    "Manipulador": ['otro_idioma'],  // Parametrizable - se añadirá una instancia vacía
    "Mente maestra": ['informatica']
};

/**
 * Obtiene todas las habilidades obligatorias para un conjunto de orígenes
 * Solo aplica a especialidades de Vigilante
 */
export function getRequiredSkillsForOrigins(origins: any[]): string[] {
    const requiredSkills: string[] = [];

    if (!origins || origins.length === 0) return requiredSkills;

    origins.forEach(item => {
        const originName = Object.keys(item)[0];
        const content = item[originName] as string[];

        // Solo procesar si es Vigilante
        if (originName === 'Vigilante' && Array.isArray(content)) {
            content.forEach(specialty => {
                if (REQUIRED_SPECIALTY_SKILLS[specialty]) {
                    requiredSkills.push(...REQUIRED_SPECIALTY_SKILLS[specialty]);
                }
            });
        }
    });

    // Eliminar duplicados
    return [...new Set(requiredSkills)];
}
