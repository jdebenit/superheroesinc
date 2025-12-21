import { ORIGIN_CHARACTERISTIC_MODIFIERS } from '../data/characteristicModifiers';
import { ORIGIN_CATEGORIES } from '../data/originDefinitions';
import { GENERAL_SKILLS, type GeneralSkillDefinition } from '../data/generalSkills';

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

import { VIGILANTE_SPECIALTY_MODIFIERS } from '../data/characteristicModifiers';

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

/**
 * Calcula los Puntos de Creación (PC) generados por las características
 * Fórmula: (Base + Mod. Otros) / 10
 */
export function calculateCreationPoints(
    characteristics: { [key: string]: { base: number; powerMod: number } },
    origins: any[] = []
): { pcValues: { [key: string]: number }; totalPC: number } {
    const pcValues: { [key: string]: number } = {};
    let totalPC = 0;

    let isEnte = false;
    let isDotado = false;

    // Detectar subtipos especiales para reducción de costes
    if (origins && origins.length > 0) {
        forEachOriginAndSubtype(origins, (name) => {
            if (name === "Ente") isEnte = true;
            if (name === "Dotado") isDotado = true;
        });
    }

    Object.keys(characteristics).forEach(charId => {
        const char = characteristics[charId];
        if (char) {
            let costMultiplier = 1.0;

            // Lógica de reducción de costes
            if (isEnte) {
                costMultiplier = 0.5;
            } else if (isDotado && charId === 'voluntad') {
                costMultiplier = 0.5;
            }

            // Calcular puntos individuales con decimales y aplicador multiplicador
            const pc = ((char.base + char.powerMod) / 10) * costMultiplier;
            pcValues[charId] = pc;
            totalPC += pc;
        }
    });

    return { pcValues, totalPC };
}

/**
 * Calcula el desglose de habilidades generales
 */
export function calculateGeneralSkillValues(
    characteristics: { [key: string]: number },
    origins: any[],
    manualMods: { [key: string]: number } = {}
) {
    // 1. Normalize characteristics keys to lowercase
    const stats: { [key: string]: number } = {};
    Object.keys(characteristics).forEach(key => {
        // Remove accents? formulas use "constitucion", "percepcion".
        // Input might satisfy "Constitución".
        // Helper to normalize: lowercase + remove accents
        const normalizedKey = key.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
        stats[normalizedKey] = characteristics[key];
    });

    const skills: { [key: string]: { base: number; originMod: number; specialtyMod: number; otherMod: number; total: number } } = {};

    GENERAL_SKILLS.forEach(skill => {
        // 1. Base Calculation
        const base = Math.floor(skill.formula(stats));

        // 2. Origin/Specialty Modifiers extraction
        let originMod = 0;
        let specialtyMod = 0;

        if (origins && origins.length > 0) {
            origins.forEach(item => {
                const originName = Object.keys(item)[0];
                const content = item[originName] as string[];

                const category = ORIGIN_CATEGORIES[originName];
                if (!category) return;

                const subtypeKeys = category.subtypes ? Object.keys(category.subtypes) : [];

                content.forEach((entry: string) => {
                    let effects: string[] = [];
                    // Check if entry is a known subtype
                    if (subtypeKeys.includes(entry)) {
                        effects = category.subtypes![entry];
                    } else {
                        // Assume entry is the effect itself
                        effects = [entry];
                    }

                    effects.forEach(effect => {
                        // Simple Regex to find bonuses: "+20 Idea" or "+10 a la habilidad de Esconderse"
                        // Case insensitive
                        // Look for the skill name in the effect string
                        if (effect.toLowerCase().includes(skill.name.toLowerCase()) ||
                            (skill.id === 'acechar' && effect.toLowerCase().includes('acechar')) || // Handle slash names if needed
                            (skill.id === 'idea' && effect.toLowerCase().includes('idea'))
                        ) {
                            const match = effect.match(/([+-])\s*(\d+)/);
                            if (match) {
                                const sign = match[1] === '-' ? -1 : 1;
                                const val = parseInt(match[2]) * sign;

                                // Distinguish Origin vs Specialty
                                // "Vigilante" subtypes are typically considered Specialties
                                // Others are Subtypes (Origin Mod)
                                if (originName === 'Vigilante') {
                                    specialtyMod += val;
                                } else {
                                    originMod += val;
                                }
                            }
                        }
                    });
                });
            });
        }

        const otherMod = manualMods[skill.id] || 0;

        skills[skill.id] = {
            base,
            originMod,
            specialtyMod,
            otherMod,
            total: base + originMod + specialtyMod + otherMod
        };
    });

    return skills;
}
