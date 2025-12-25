import { ORIGIN_CHARACTERISTIC_MODIFIERS, VIGILANTE_SPECIALTY_MODIFIERS } from '../../data/characteristicModifiers';

/**
 * Helper para iterar sobre orígenes y subtipos
 */
export function forEachOriginAndSubtype(
    origins: any[],
    callback: (name: string, data: any, isSubtype: boolean) => void
) {
    if (!origins || origins.length === 0) return;

    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        const subtypes = item[originName] || [];

        // Procesar origen base
        const originData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
        if (originData) {
            callback(originName, originData, false);
        }

        // Procesar subtipos
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            subtypes.forEach((subtype: string) => {
                const subtypeData = ORIGIN_CHARACTERISTIC_MODIFIERS[subtype];
                if (subtypeData) {
                    callback(subtype, subtypeData, true);
                }
            });
        }
    });
}

/**
 * Calcula los modificadores de origen para todas las características
 * Usa el MÁXIMO entre múltiples orígenes, no suma
 */
export function calculateOriginModifiers(
    origins: any[],
    chosenBonusCharacteristic: string | null
): { [key: string]: number } {
    const modifiers: { [key: string]: number } = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };

    forEachOriginAndSubtype(origins, (name, data, isSubtype) => {
        // Aplicar modificadores de características
        Object.keys(modifiers).forEach(charId => {
            const charMod = data[charId as keyof typeof data];
            if (charMod && typeof charMod === 'object' && 'modifier' in charMod && charMod.modifier) {
                modifiers[charId] = Math.max(modifiers[charId], charMod.modifier);
            }
        });

        // Aplicar bonus de característica elegible
        if (data.choosableCharacteristic && chosenBonusCharacteristic) {
            modifiers[chosenBonusCharacteristic] = Math.max(
                modifiers[chosenBonusCharacteristic],
                data.choosableCharacteristic.bonus
            );
        }
    });

    return modifiers;
}

/**
 * Calcula los límites (min/max) para una característica
 * Toma el MÁXIMO de max y el MÍNIMO de min entre todos los orígenes
 */
export function calculateLimits(
    origins: any[],
    charId: string
): { min: number; max: number } {
    let maxLimit = 100;
    let minLimit = 40;
    let hasSpecificMin = false;

    forEachOriginAndSubtype(origins, (name, data, isSubtype) => {
        const charMod = data[charId as keyof typeof data];
        if (charMod && typeof charMod === 'object' && 'max' in charMod) {
            if (charMod.max && charMod.max > maxLimit) {
                maxLimit = charMod.max;
            }
            if (charMod.min !== undefined) {
                if (!hasSpecificMin) {
                    minLimit = charMod.min;
                    hasSpecificMin = true;
                } else if (charMod.min < minLimit) {
                    minLimit = charMod.min;
                }
            }
        }
    });

    return { min: minLimit, max: maxLimit };
}

/**
 * Detecta si algún origen tiene característica elegible (choosableCharacteristic)
 */
export function hasChoosableCharacteristic(origins: any[]): any | null {
    if (!origins || origins.length === 0) return null;

    let result: any = null;
    forEachOriginAndSubtype(origins, (name, data, isSubtype) => {
        if (data.choosableCharacteristic && !result) {
            result = data.choosableCharacteristic;
        }
    });

    return result;
}

/**
 * Detecta si algún origen tiene puntos distribuibles
 */
export function hasDistributablePoints(origins: any[]): boolean {
    if (!origins || origins.length === 0) return false;

    let hasPoints = false;
    forEachOriginAndSubtype(origins, (name, data, isSubtype) => {
        if (data.distributablePoints !== undefined) {
            hasPoints = true;
        }
    });

    return hasPoints;
}

/**
 * Calcula información sobre puntos distribuibles de origen
 */
export function getDistributablePointsInfo(
    origins: any[],
    characteristics: any,
    chosenBonusCharacteristic: string | null
): { total: number; used: number; remaining: number } {
    let totalAvailable = 0;

    // Calcular total disponible
    forEachOriginAndSubtype(origins, (name, data, isSubtype) => {
        if (data.distributablePoints) {
            totalAvailable += data.distributablePoints;
        }
        if (data.choosableCharacteristic && data.choosableCharacteristic.distributablePoints) {
            totalAvailable += data.choosableCharacteristic.distributablePoints;
        }
    });

    // Calcular puntos usados (excluyendo modificadores automáticos)
    const autoMods = calculateOriginModifiers(origins, chosenBonusCharacteristic);
    let used = 0;

    Object.keys(characteristics).forEach(charId => {
        const currentOriginMod = characteristics[charId].originMod;
        const autoMod = autoMods[charId] || 0;
        const manualPoints = currentOriginMod - autoMod;
        used += Math.max(0, manualPoints);
    });

    return { total: totalAvailable, used, remaining: totalAvailable - used };
}

/**
 * Calcula los modificadores de especialidad (Vigilante)
 * Usa el MÁXIMO entre múltiples especialidades
 */
export function calculateSpecialtyModifiers(origins: any[]): { [key: string]: number } {
    const modifiers: { [key: string]: number } = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };

    if (!origins || origins.length === 0) return modifiers;

    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        const subtypes = item[originName] || [];

        if (originName === "Vigilante" && Array.isArray(subtypes) && subtypes.length > 0) {
            subtypes.forEach((specialty: string) => {
                const specialtyMods = VIGILANTE_SPECIALTY_MODIFIERS[specialty];
                if (specialtyMods) {
                    Object.keys(modifiers).forEach(charId => {
                        const modValue = specialtyMods[charId as keyof typeof specialtyMods];
                        if (typeof modValue === 'number') {
                            modifiers[charId] = Math.max(modifiers[charId], modValue);
                        } else if (modValue && typeof modValue === 'object' && 'modifier' in modValue) {
                            modifiers[charId] = Math.max(modifiers[charId], (modValue as { modifier: number }).modifier);
                        }
                    });
                }
            });
        }
    });

    return modifiers;
}

/**
 * Detecta si hay puntos distribuibles de ESPECIALIDAD
 */
export function hasSpecialtyDistributablePoints(origins: any[]): boolean {
    if (!origins || origins.length === 0) return false;

    let hasPoints = false;
    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        const subtypes = item[originName] || [];

        if (originName === "Vigilante" && Array.isArray(subtypes) && subtypes.length > 0) {
            subtypes.forEach((specialty: string) => {
                const specialtyMods = VIGILANTE_SPECIALTY_MODIFIERS[specialty];
                if (specialtyMods && specialtyMods.distributablePoints) {
                    hasPoints = true;
                }
            });
        }
    });
    return hasPoints;
}

/**
 * Obtener info de puntos distribuibles de especialidad
 */
export function getSpecialtyDistributablePointsInfo(
    origins: any[],
    characteristics: any
): { total: number; used: number; remaining: number } {
    let totalAvailable = 0;

    if (!origins || origins.length === 0) {
        return { total: 0, used: 0, remaining: 0 };
    }

    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        const subtypes = item[originName] || [];

        if (originName === "Vigilante" && Array.isArray(subtypes) && subtypes.length > 0) {
            subtypes.forEach((specialty: string) => {
                const specialtyMods = VIGILANTE_SPECIALTY_MODIFIERS[specialty];
                if (specialtyMods && specialtyMods.distributablePoints) {
                    totalAvailable += specialtyMods.distributablePoints;
                }
            });
        }
    });

    // Calcular puntos usados (excluyendo modificadores fijos)
    let used = 0;
    const fixedMods = calculateSpecialtyModifiers(origins);

    Object.keys(characteristics).forEach(charId => {
        const currentMod = characteristics[charId].specialtyMod;
        const fixedMod = fixedMods[charId] || 0;
        used += Math.max(0, currentMod - fixedMod);
    });

    return { total: totalAvailable, used, remaining: totalAvailable - used };
}

/**
 * Obtener características permitidas para distribución de puntos de especialidad
 */
export function calculateSpecialtyAllowedCharacteristics(origins: any[]): string[] | null {
    if (!origins || origins.length === 0) {
        return null;
    }

    let hasAnySpecialtyWithPoints = false;
    const allowedSet = new Set<string>();

    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        const subtypes = item[originName] || [];

        if (originName === "Vigilante" && Array.isArray(subtypes) && subtypes.length > 0) {
            subtypes.forEach((specialty: string) => {
                const specialtyMods = VIGILANTE_SPECIALTY_MODIFIERS[specialty];

                if (specialtyMods && specialtyMods.distributablePoints) {
                    hasAnySpecialtyWithPoints = true;

                    if (specialtyMods.allowedCharacteristics) {
                        // Si tiene restricciones explícitas, añadirlas (UNIÓN)
                        specialtyMods.allowedCharacteristics.forEach(char => allowedSet.add(char));
                    } else {
                        // Si tiene puntos pero NO restricciones explícitas, inferir de los modificadores existentes
                        Object.keys(specialtyMods).forEach(key => {
                            if (key !== 'distributablePoints' && key !== 'allowedCharacteristics') {
                                allowedSet.add(key);
                            }
                        });
                    }
                }
            });
        }
    });

    // Si no hay ninguna especialidad con puntos, retornamos null
    if (!hasAnySpecialtyWithPoints) return null;

    return Array.from(allowedSet);
}
