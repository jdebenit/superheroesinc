import { ORIGIN_CHARACTERISTIC_MODIFIERS } from '../data/characteristicModifiers';
import { ORIGIN_CATEGORIES } from '../data/originDefinitions';
import { GENERAL_SKILLS, type GeneralSkillDefinition } from '../data/generalSkills';
import { SPECIAL_SKILLS, type SpecialSkillDefinition } from '../data/specialSkills';
import { ORIGIN_SKILL_MODIFIERS } from '../data/skillModifiers';
import { getFreeSkillsForOrigins } from '../data/freeOriginSkills';

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
    manualMods: { [key: string]: number } = {},
    manualBases: { [key: string]: number } = {}
) {
    // 1. Normalize characteristics keys to lowercase
    const stats: { [key: string]: number } = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };
    if (characteristics) {
        Object.keys(characteristics).forEach(key => {
            const normalizedKey = key.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey] = characteristics[key] || 0;
        });
    }

    const skills: { [key: string]: { base: number; minBase: number; originMod: number; specialtyMod: number; otherMod: number; total: number; pcCost: number } } = {};
    let totalPC = 0;

    GENERAL_SKILLS.forEach(skill => {
        // 1. Base Calculation
        let calculatedBase = 0;
        try {
            calculatedBase = Math.floor(skill.formula(stats)) || 0;
        } catch (e) {
            console.error(`Error calculating base for ${skill.id}`, e);
            calculatedBase = 0;
        }

        let base = calculatedBase;
        let pcCost = 0;

        // Manual Base logic
        if (manualBases[skill.id] !== undefined) {
            if (manualBases[skill.id] >= calculatedBase) {
                base = manualBases[skill.id];
                pcCost = (base - calculatedBase) * 0.1;
            } else {
                base = calculatedBase;
            }
        }

        totalPC += pcCost;

        // 2. Origin/Specialty Modifiers extraction
        let originMod = 0;
        let specialtyMod = 0;

        if (origins && origins.length > 0) {
            origins.forEach(item => {
                const originName = Object.keys(item)[0];
                const content = item[originName] as string[];

                // Check if this origin has skill modifiers
                const originSkillMods = ORIGIN_SKILL_MODIFIERS[originName];
                if (originSkillMods) {
                    originSkillMods.forEach(mod => {
                        if (mod.skillId === skill.id) {
                            // Determine if this is a Vigilante specialty or regular origin
                            if (originName === 'Vigilante') {
                                specialtyMod += mod.value;
                            } else {
                                originMod += mod.value;
                            }
                        }
                    });
                }

                // Also check subtypes/specialties
                content.forEach(subtype => {
                    const subtypeSkillMods = ORIGIN_SKILL_MODIFIERS[subtype];
                    if (subtypeSkillMods) {
                        subtypeSkillMods.forEach(mod => {
                            if (mod.skillId === skill.id) {
                                // Vigilante subtypes are specialties, others are origin mods
                                if (originName === 'Vigilante') {
                                    specialtyMod += mod.value;
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        const otherMod = manualMods[skill.id] || 0;

        skills[skill.id] = {
            base,
            minBase: calculatedBase,
            originMod,
            specialtyMod,
            otherMod,
            total: base + originMod + specialtyMod + otherMod,
            pcCost
        };
    });

    return { skills, totalPC };
}

/**
 * Calcula el desglose de habilidades de aprendizaje
 * Similar a calculateGeneralSkillValues pero maneja habilidades parametrizables
 */
export function calculateSpecialSkillValues(
    characteristics: { [key: string]: number },
    origins: any[],
    standardSkills: { [skillId: string]: { manualMods: number; manualBases: number } } = {},
    specifiedSkills: { [uniqueId: string]: { skillId: string; specification: string; manualMods: number; manualBases: number } } = {}
) {
    // 1. Normalize characteristics
    const stats: { [key: string]: number } = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };
    if (characteristics) {
        Object.keys(characteristics).forEach(key => {
            const normalizedKey = key.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey] = characteristics[key] || 0;
        });
    }

    const standard: { [key: string]: { base: number; minBase: number; originMod: number; specialtyMod: number; otherMod: number; total: number; pcCost: number } } = {};
    const specified: { [key: string]: { skillId: string; specification: string; base: number; minBase: number; originMod: number; specialtyMod: number; otherMod: number; total: number; pcCost: number } } = {};
    let totalPC = 0;

    // Calculate standard skills (non-parametrizable)
    SPECIAL_SKILLS.filter(s => !s.requiresSpecification).forEach(skill => {
        let calculatedBase = 0;
        try {
            if (skill.formula) {
                calculatedBase = Math.floor(skill.formula(stats)) || 0;
            }
        } catch (e) {
            console.error(`Error calculating base for ${skill.id}`, e);
        }

        const skillData = standardSkills[skill.id] || { manualMods: 0, manualBases: 0 };
        let base = calculatedBase;
        let pcCost = 0;

        if (skillData.manualBases && skillData.manualBases >= calculatedBase) {
            base = skillData.manualBases;
            pcCost = (base - calculatedBase) * 0.1;
        }

        totalPC += pcCost;

        // Extract modifiers
        let originMod = 0;
        let specialtyMod = 0;

        if (origins && origins.length > 0) {
            origins.forEach(item => {
                const originName = Object.keys(item)[0];
                const content = item[originName] as string[];

                // Check for special skill modifiers (e.g., Terrano_special)
                const specialKey = `${originName}_special`;
                const originSkillMods = ORIGIN_SKILL_MODIFIERS[specialKey] || ORIGIN_SKILL_MODIFIERS[originName];

                if (originSkillMods) {
                    originSkillMods.forEach(mod => {
                        if (mod.skillId === skill.id) {
                            if (originName === 'Vigilante') {
                                specialtyMod += mod.value;
                            } else {
                                originMod += mod.value;
                            }
                        }
                    });
                }

                // Check subtypes
                content.forEach(subtype => {
                    const subtypeSpecialKey = `${subtype}_special`;
                    const subtypeSkillMods = ORIGIN_SKILL_MODIFIERS[subtypeSpecialKey] || ORIGIN_SKILL_MODIFIERS[subtype];

                    if (subtypeSkillMods) {
                        subtypeSkillMods.forEach(mod => {
                            if (mod.skillId === skill.id) {
                                if (originName === 'Vigilante') {
                                    specialtyMod += mod.value;
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        const otherMod = skillData.manualMods || 0;

        standard[skill.id] = {
            base,
            minBase: calculatedBase,
            originMod,
            specialtyMod,
            otherMod,
            total: base + originMod + specialtyMod + otherMod,
            pcCost
        };
    });

    // Calculate specified skills (parametrizable)
    Object.keys(specifiedSkills).forEach(uniqueId => {
        const specSkill = specifiedSkills[uniqueId];
        const skillDef = SPECIAL_SKILLS.find(s => s.id === specSkill.skillId);

        if (!skillDef) return;

        let calculatedBase = 0;
        try {
            if (skillDef.formula) {
                calculatedBase = Math.floor(skillDef.formula(stats)) || 0;
            }
        } catch (e) {
            console.error(`Error calculating base for ${specSkill.skillId}:${specSkill.specification}`, e);
        }

        let base = calculatedBase;
        let pcCost = 0;

        if (specSkill.manualBases && specSkill.manualBases >= calculatedBase) {
            base = specSkill.manualBases;
            pcCost = (base - calculatedBase) * 0.1;
        }

        totalPC += pcCost;

        // Extract modifiers (apply to ALL instances of this skill type)
        let originMod = 0;
        let specialtyMod = 0;

        if (origins && origins.length > 0) {
            origins.forEach(item => {
                const originName = Object.keys(item)[0];
                const content = item[originName] as string[];

                const originSkillMods = ORIGIN_SKILL_MODIFIERS[originName];
                if (originSkillMods) {
                    originSkillMods.forEach(mod => {
                        if (mod.skillId === skillDef.id) {
                            if (originName === 'Vigilante') {
                                specialtyMod += mod.value;
                            } else {
                                originMod += mod.value;
                            }
                        }
                    });
                }

                content.forEach(subtype => {
                    const subtypeSkillMods = ORIGIN_SKILL_MODIFIERS[subtype];
                    if (subtypeSkillMods) {
                        subtypeSkillMods.forEach(mod => {
                            if (mod.skillId === skillDef.id) {
                                if (originName === 'Vigilante') {
                                    specialtyMod += mod.value;
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        const otherMod = specSkill.manualMods || 0;

        specified[uniqueId] = {
            skillId: specSkill.skillId,
            specification: specSkill.specification,
            base,
            minBase: calculatedBase,
            originMod,
            specialtyMod,
            otherMod,
            total: base + originMod + specialtyMod + otherMod,
            pcCost
        };
    });

    return { standard, specified, totalPC };
}

/**
 * Calcula el coste en PC de las habilidades de aprendizaje seleccionadas
 * - Cada habilidad cuesta 1 PC (0.5 PC para origen "Liberado")
 * - Las habilidades gratuitas de origen no cuestan PC
 */
export function calculateSpecialSkillsPC(
    selectedSkills: { [skillId: string]: { isFree: boolean } } = {},
    specifiedSkills: { [uniqueId: string]: { isFree: boolean } } = {},
    origins: any[] = []
): { totalSkills: number; freeSkills: number; paidSkills: number; totalPC: number } {
    let totalSkills = 0;
    let freeSkills = 0;
    let paidSkills = 0;
    let totalPC = 0;

    // Detectar si es Liberado (0.5 PC por habilidad)
    let isLiberado = false;
    if (origins && origins.length > 0) {
        origins.forEach(item => {
            const originName = Object.keys(item)[0];
            const content = item[originName] as string[];
            if (Array.isArray(content) && content.includes('Liberado')) {
                isLiberado = true;
            }
        });
    }

    const costPerSkill = isLiberado ? 0.5 : 1.0;

    // Contar habilidades estándar seleccionadas
    Object.values(selectedSkills).forEach(skill => {
        totalSkills++;
        if (skill.isFree) {
            freeSkills++;
        } else {
            paidSkills++;
            totalPC += costPerSkill;
        }
    });

    // Contar habilidades especificadas
    Object.values(specifiedSkills).forEach(skill => {
        totalSkills++;
        if (skill.isFree) {
            freeSkills++;
        } else {
            paidSkills++;
            totalPC += costPerSkill;
        }
    });

    return { totalSkills, freeSkills, paidSkills, totalPC };
}

/**
 * Calcula el coste en PC de las habilidades de aprendizaje seleccionadas (V2 con Bonus INT)
 * - Cada habilidad cuesta 1 PC (0.5 PC para origen "Liberado")
 * - Las habilidades gratuitas de origen no cuestan PC
 * - La Inteligencia otorga habilidades gratuitas extra (101-120: 1, 121-140: 2, 141-160: 3, 161+: 4)
 */
export function calculateSpecialSkillsPCWithInt(
    selectedSkills: { [skillId: string]: { isFree: boolean; manualBases?: number } } = {},
    specifiedSkills: { [uniqueId: string]: { skillId: string; isFree: boolean; manualBases?: number; specification?: string } } = {},
    origins: any[] = [],
    attributes: { [key: string]: number } = {}
): { totalSkills: number; freeSkills: number; paidSkills: number; intBonusSkills: number; totalPC: number } {
    let totalSkills = 0;
    let freeSkillsByOrigin = 0;
    let potentiallyPaidSkills = 0;
    let baseIncreaseCost = 0;

    // Normalize stats for base calculation
    const stats: { [key: string]: number } = {
        fuerza: 0, constitucion: 0, agilidad: 0, inteligencia: 0,
        percepcion: 0, apariencia: 0, voluntad: 0
    };
    if (attributes) {
        Object.keys(attributes).forEach(key => {
            const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey] = attributes[key] || 0;
        });
    }

    // 1. Detectar si es Liberado (0.5 PC por habilidad)
    let isLiberado = false;
    if (origins && origins.length > 0) {
        origins.forEach(item => {
            const originName = Object.keys(item)[0];
            const content = item[originName] as string[];
            if (Array.isArray(content) && content.includes('Liberado')) {
                isLiberado = true;
            }
        });
    }

    const costPerSkill = isLiberado ? 0.5 : 1.0;

    // 2. Contar habilidades estándar
    Object.entries(selectedSkills).forEach(([skillId, skill]) => {
        totalSkills++;
        if (skill.isFree) {
            freeSkillsByOrigin++;
        } else {
            potentiallyPaidSkills++;
        }

        // Calculate Base Cost
        if (skill.manualBases) {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            if (skillDef?.formula) {
                const calculatedBase = Math.floor(skillDef.formula(stats)) || 0;
                if (skill.manualBases > calculatedBase) {
                    baseIncreaseCost += (skill.manualBases - calculatedBase) * 0.1;
                }
            }
        }
    });

    // 3. Contar habilidades especificadas
    Object.values(specifiedSkills).forEach(skill => {
        totalSkills++;
        if (skill.isFree) {
            freeSkillsByOrigin++;
        } else {
            potentiallyPaidSkills++;
        }

        // Calculate Base Cost
        if (skill.manualBases) {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skill.skillId);
            if (skillDef?.formula) {
                const calculatedBase = Math.floor(skillDef.formula(stats)) || 0;
                if (skill.manualBases > calculatedBase) {
                    baseIncreaseCost += (skill.manualBases - calculatedBase) * 0.1;
                }
            }
        }
    });

    // 4. Calcular bonificación por Inteligencia
    const intelligence = attributes['Inteligencia'] || attributes['inteligencia'] || 0;
    let intBonusSkills = 0;

    if (intelligence >= 161) intBonusSkills = 4;
    else if (intelligence >= 141) intBonusSkills = 3;
    else if (intelligence >= 121) intBonusSkills = 2;
    else if (intelligence >= 101) intBonusSkills = 1;

    // 5. Aplicar bonificación a las habilidades pagadas
    const paidSkills = Math.max(0, potentiallyPaidSkills - intBonusSkills);
    const totalPC = (paidSkills * costPerSkill) + baseIncreaseCost;

    // Total habilidades gratuitas (Origen + Bonus INT usado)
    const bonusUsed = Math.min(potentiallyPaidSkills, intBonusSkills);
    const totalFreeSkills = freeSkillsByOrigin + bonusUsed;

    return {
        totalSkills,
        freeSkills: totalFreeSkills,
        paidSkills,
        intBonusSkills: bonusUsed,
        totalPC
    };
}

/**
 * Calcula las estadísticas derivadas para el Paso 6
 */
export function calculateDerivedStats(
    attributes: { [key: string]: number },
    origins: any[] = [],
    skills: any = {}
) {
    // Normalizar atributos
    const stats = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };

    if (attributes) {
        Object.keys(attributes).forEach(key => {
            const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey as keyof typeof stats] = attributes[key] || 0;
        });
    }

    // --- CÁLCULOS BÁSICOS ---
    const fue = stats.fuerza;
    const con = stats.constitucion;
    const agi = stats.agilidad;
    const int = stats.inteligencia;
    const per = stats.percepcion;
    // const apa = stats.apariencia;
    const vol = stats.voluntad;

    // Puntos de Vida (Estimado: FUE + CON) -> REPLACED BY CON TABLE
    // const puntosVida = fue + con; -> MOVED TO TABLE LOGIC
    let puntosVida = 0;
    let recuperacion = 0;
    let daFisico = 0;

    // --- TABLE CALCULATIONS (CONSTITUCIÓN) ---
    if (con <= 100) {
        puntosVida = Math.floor(con / 2);
        daFisico = 0;
        recuperacion = 1;
    } else if (con <= 110) {
        puntosVida = con - 45;
        daFisico = 15;
        recuperacion = 2;
    } else if (con <= 120) {
        puntosVida = con - 40;
        daFisico = 30;
        recuperacion = 4;
    } else if (con <= 130) {
        puntosVida = con - 35;
        daFisico = 45;
        recuperacion = 6;
    } else if (con <= 140) {
        puntosVida = con - 30;
        daFisico = 60;
        recuperacion = 10;
    } else if (con <= 150) {
        puntosVida = con - 25;
        daFisico = 75;
        recuperacion = 15;
    } else if (con <= 160) {
        puntosVida = con - 20;
        daFisico = 90;
        recuperacion = 20;
    } else if (con <= 170) {
        puntosVida = con - 15;
        daFisico = 105;
        recuperacion = 25;
    } else if (con <= 180) {
        puntosVida = con - 10;
        daFisico = 120;
        recuperacion = 30;
    } else if (con <= 190) {
        puntosVida = con - 5;
        daFisico = 135;
        recuperacion = 35;
    } else {
        // 191-200+
        puntosVida = con;
        daFisico = 150;
        recuperacion = 40;
    }

    // Iniciativa y Reflejos: (AGI + PER) / 4
    let iniciativaReflejos = Math.floor((agi + per) / 4);

    // Check for Artes Marciales skill bonus (can be General or Special)
    const hasMartialArts =
        skills?.generalItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) ||
        skills?.specialItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) || false;

    // Equilibrio Mental: INT
    const equilibrioMental = int;


    // --- OTROS STATS ---

    // Inconsciencia: PV / 10
    const inconsciencia = Math.floor(puntosVida / 10);

    // Recuperación calculada en tabla CON

    // --- TABLE CALCULATIONS (FUERZA) ---
    // Resistencia a gases y venenos: CON / 3
    const resistenciaGases = Math.floor(con / 3);

    let modFuerzaStr = "+0";
    let pesoLevantadoStr = "0kg";
    let jumpMod = 1;

    if (fue < 40) {
        modFuerzaStr = "0";
        pesoLevantadoStr = "0kg";
        jumpMod = 1;
    } else if (fue <= 75) {
        modFuerzaStr = "1d4";
        pesoLevantadoStr = `${fue}kg`;
        jumpMod = 1;
    } else if (fue <= 90) {
        modFuerzaStr = "1d6";
        pesoLevantadoStr = `${fue * 2}kg`;
        jumpMod = 1;
    } else if (fue <= 99) {
        modFuerzaStr = "1d8";
        pesoLevantadoStr = `${fue * 3}kg`;
        jumpMod = 1;
    } else if (fue === 100) {
        modFuerzaStr = "1d10";
        pesoLevantadoStr = "500kg";
        jumpMod = 1;
    } else if (fue <= 102) {
        modFuerzaStr = "1d10+2";
        pesoLevantadoStr = "1 t";
        jumpMod = 2;
    } else if (fue <= 104) {
        modFuerzaStr = "2d10+2";
        pesoLevantadoStr = "2 t";
        jumpMod = 2;
    } else if (fue <= 106) {
        modFuerzaStr = "2d10+4";
        pesoLevantadoStr = "4 t";
        jumpMod = 2;
    } else if (fue <= 108) {
        modFuerzaStr = "3d10+4";
        pesoLevantadoStr = "6 t";
        jumpMod = 2;
    } else if (fue <= 110) {
        modFuerzaStr = "3d10+6";
        pesoLevantadoStr = "8 t";
        jumpMod = 2;
    } else if (fue <= 112) {
        modFuerzaStr = "4d10+6";
        pesoLevantadoStr = "10 t";
        jumpMod = 2;
    } else if (fue <= 114) {
        modFuerzaStr = "4d10+8";
        pesoLevantadoStr = "12 t";
        jumpMod = 2;
    } else if (fue <= 116) {
        modFuerzaStr = "5d10+8";
        pesoLevantadoStr = "14 t";
        jumpMod = 2;
    } else if (fue === 117) {
        modFuerzaStr = "5d10+10";
        pesoLevantadoStr = "16 t";
        jumpMod = 2;
    } else if (fue === 118) {
        modFuerzaStr = "5d10+15";
        pesoLevantadoStr = "18 t";
        jumpMod = 2;
    } else if (fue === 119) {
        modFuerzaStr = "5d10+20";
        pesoLevantadoStr = "19 t";
        jumpMod = 2;
    } else {
        // 120+
        const diff = fue - 100;
        modFuerzaStr = `1d100+${diff}`;
        pesoLevantadoStr = `${diff} t`;

        if (fue <= 120) jumpMod = 2;
        else if (fue <= 140) jumpMod = 5;
        else if (fue <= 160) jumpMod = 10;
        else if (fue <= 180) jumpMod = 20;
        else if (fue <= 199) jumpMod = 40;
        else jumpMod = 100;
    }

    // --- TABLE CALCULATIONS (AGILIDAD) ---
    // Tabla 1-4: AGILIDAD
    let paradaFisica = 0;
    let acciones = 0;
    let jumpDivisor = 12;
    let modImpacto = 0;

    if (agi <= 75) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 1;
        jumpDivisor = 12;
        modImpacto = 0;
    } else if (agi <= 90) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 2;
        jumpDivisor = 11;
        modImpacto = 0;
    } else if (agi <= 100) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 3;
        jumpDivisor = 10;
        modImpacto = 0;
    } else if (agi <= 115) {
        paradaFisica = 30;
        acciones = 3;
        jumpDivisor = 10;
        modImpacto = agi - 100;
    } else if (agi <= 130) {
        paradaFisica = 40;
        acciones = 3;
        jumpDivisor = 9;
        modImpacto = agi - 100;
    } else if (agi <= 145) {
        paradaFisica = 50;
        acciones = 4;
        jumpDivisor = 9;
        modImpacto = agi - 100;
    } else if (agi <= 160) {
        paradaFisica = 55;
        acciones = 4;
        jumpDivisor = 8;
        modImpacto = agi - 100;
    } else if (agi <= 175) {
        paradaFisica = 60;
        acciones = 4;
        jumpDivisor = 8;
        modImpacto = agi - 100;
    } else if (agi <= 190) {
        paradaFisica = 65;
        acciones = 5;
        jumpDivisor = 7;
        modImpacto = agi - 100;
    } else if (agi <= 195) {
        paradaFisica = 70;
        acciones = 5;
        jumpDivisor = 6;
        modImpacto = agi - 100;
    } else if (agi <= 199) {
        paradaFisica = 75;
        acciones = 5;
        jumpDivisor = 5;
        modImpacto = agi - 100;
    } else {
        // 200+
        paradaFisica = 80;
        acciones = 6;
        jumpDivisor = 4;
        modImpacto = agi - 100;
    }

    // Apply Martial Arts bonus to Physical Parry (+20)
    if (hasMartialArts) {
        paradaFisica += 20;
    }

    // Apply Martial Arts bonus to Initiative (+20)
    if (hasMartialArts) {
        iniciativaReflejos += 20;
    }

    // --- TABLE CALCULATIONS (VOLUNTAD) ---
    let paradaMental = 0;
    let modPsionico = 0;

    // --- TABLE CALCULATIONS (INTELIGENCIA) ---
    let daMental = 0;
    if (int <= 100) {
        daMental = 0;
    } else if (int <= 120) {
        daMental = 40;
    } else if (int <= 140) {
        daMental = 60;
    } else if (int <= 160) {
        daMental = 80;
    } else if (int <= 180) {
        daMental = 100;
    } else {
        // 181-200+
        daMental = 120;
    }

    if (vol <= 50) {
        paradaMental = -25;
        modPsionico = -50;
    } else if (vol <= 60) {
        paradaMental = -10;
        modPsionico = -25;
    } else if (vol <= 70) {
        paradaMental = 0;
        modPsionico = -10;
    } else if (vol <= 80) {
        paradaMental = 10;
        modPsionico = 0;
    } else if (vol <= 90) {
        paradaMental = 25;
        modPsionico = 10;
    } else if (vol <= 100) {
        paradaMental = 50;
        modPsionico = 25;
    } else if (vol <= 120) {
        paradaMental = 55;
        modPsionico = 30;
    } else if (vol <= 150) {
        paradaMental = 60;
        modPsionico = 35;
    } else if (vol <= 170) {
        paradaMental = 65;
        modPsionico = 40;
    } else {
        // 171-200+
        paradaMental = 75;
        modPsionico = 50;
    }


    // Modificador por Origen (Mental Parry)
    let maxOriginBonus = 0;
    // Origins structure: [ { "NombreOrigen": ["efecto1", ...] }, ... ]
    if (origins && origins.length > 0) {
        origins.forEach(originObj => {
            // The key is the origin category (e.g. "Parahumano", "Divino")
            // The value is an array (e.g. ["Thals"], ["Poder divino"])
            const originCategory = Object.keys(originObj)[0];
            const originDetails = originObj[originCategory] || [];
            if (!originCategory) return;

            let currentBonus = 0;

            // 1. Check if "Thals" is in the details array
            const hasThals = originDetails.some((detail: string) =>
                detail.toLowerCase().includes('thals') || detail.toLowerCase().includes('thal')
            );

            if (hasThals) {
                currentBonus = 10;
            } else {
                // 2. Check the category name
                const categoryLower = originCategory.toLowerCase();

                let categoryName = "";

                // Direct Category Match
                const catKeys = Object.keys(ORIGIN_CATEGORIES);
                for (const cat of catKeys) {
                    if (cat.toLowerCase() === categoryLower) {
                        categoryName = cat;
                        break;
                    }
                }

                // Apply Bonus based on Category
                if (categoryName === "Divino") currentBonus = 25;
                else if (categoryName === "Cósmico") currentBonus = 25;
                else if (categoryName === "Arcano") currentBonus = 20;
                else if (categoryName === "Sobrenatural") currentBonus = 20;
            }

            if (currentBonus > maxOriginBonus) {
                maxOriginBonus = currentBonus;
            }
        });
    }

    paradaMental += maxOriginBonus;

    // Salto: 
    // Base from Agility Table applied with Strength Multiplier
    const saltoBase = agi / jumpDivisor;
    const saltoLargoVal = saltoBase * jumpMod;
    const saltoAltoVal = saltoLargoVal / 3;

    const saltoLargo = saltoLargoVal.toFixed(1);
    const saltoAlto = saltoAltoVal.toFixed(1);

    const saltoStr = `${saltoAlto}m / ${saltoLargo}m${jumpMod > 1 ? ` (x${jumpMod})` : ''}`;

    return {
        combat: {
            acciones: `${acciones}`,
            iniciativa: `${iniciativaReflejos}`,
            pv: `${puntosVida}`,
            equilibrio: `${equilibrioMental}`
        },
        other: {
            inconsciencia: `${inconsciencia}`,
            recuperacion: `${recuperacion} PV/h`,
            resistenciaGases: `${resistenciaGases}%`,
            modFuerza: modFuerzaStr,
            pesoLevantado: pesoLevantadoStr,
            daAbsorbidoFisico: `${daFisico}`,
            daAbsorbidoMental: `${daMental}`,
            modImpacto: `${modImpacto}`,
            modPsionico: `${modPsionico}`,
            paradaFisica: `${paradaFisica}`,
            paradaMental: `${paradaMental}`,
            salto: saltoStr.replace(/\./g, ',')
        }
    };
}
