import { GENERAL_SKILLS } from '../../data/generalSkills';
import { SPECIAL_SKILLS, isSkillAllowed } from '../../data/specialSkills';
import { ORIGIN_SKILL_MODIFIERS } from '../../data/skillModifiers';
import { getFreeSkillsForOrigins } from '../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../data/requiredSpecialtySkills';
import type { SkillDisplayItem } from '../../types/character';
import Logger from '../Logger';

/**
 * Detecta si el personaje posee algún origen de tipo "Liberado"
 */
export function hasLiberadoOrigin(origins: any[] = []): boolean {
    if (!Array.isArray(origins) || origins.length === 0) return false;
    return origins.some(item => {
        if (!item || typeof item !== 'object') return false;
        const originName = Object.keys(item)[0];
        if (!originName) return false;
        if (originName.startsWith('Liberado')) return true;
        const content = item[originName];
        return Array.isArray(content) && content.some((s: string) => typeof s === 'string' && s.startsWith('Liberado'));
    });
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
            stats[normalizedKey] = Number(characteristics[key]) || 0;
        });
    }

    const isLiberado = hasLiberadoOrigin(origins);
    const basePointCost = isLiberado ? 0.05 : 0.1;

    const skills: { [key: string]: { base: number; minBase: number; originMod: number; specialtyMod: number; otherMod: number; total: number; pcCost: number } } = {};
    let totalPC = 0;

    GENERAL_SKILLS.forEach(skill => {
        // 1. Base Calculation
        let calculatedBase = 0;
        try {
            // Special case for "Conocimientos generales" with "Heraldo Cósmico" origin
            const isHeraldoCosmico = origins && origins.some(o => {
                const originName = Object.keys(o)[0];
                const content = o[originName] as string[];
                return content && content.includes('Heraldo Cósmico');
            });

            if (skill.id === 'conocimientos' && isHeraldoCosmico) {
                // Heraldo Cósmico knowledge is INT/5 instead of standard INT/3
                calculatedBase = Math.floor(stats['inteligencia'] / 5) || 0;
            } else {
                calculatedBase = Math.floor(skill.formula(stats)) || 0;
            }
        } catch (e) {
            Logger.error(`Error calculating base for ${skill.id}`, e);
            calculatedBase = 0;
        }

        let base = calculatedBase;
        let pcCost = 0;

        // Manual Base logic
        if (manualBases[skill.id] !== undefined) {
            if (manualBases[skill.id] >= calculatedBase) {
                base = manualBases[skill.id];
                pcCost = (base - calculatedBase) * basePointCost;
            } else {
                base = calculatedBase;
            }
        }

        totalPC += pcCost;

        // 2. Origin/Specialty Modifiers extraction
        let originMod = 0;
        let specialtyMods: number[] = [];

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
                                specialtyMods.push(mod.value);
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
                                    specialtyMods.push(mod.value);
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        // Take the highest specialty modifier only
        const specialtyMod = specialtyMods.length > 0 ? Math.max(...specialtyMods) : 0;

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
            stats[normalizedKey] = Number(characteristics[key]) || 0;
        });
    }

    const isLiberado = hasLiberadoOrigin(origins);
    const basePointCost = isLiberado ? 0.05 : 0.1;

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
            Logger.error(`Error calculating base for ${skill.id}`, e);
        }

        const skillData = standardSkills[skill.id] || { manualMods: 0, manualBases: 0 };
        let base = calculatedBase;
        let pcCost = 0;

        if (skillData.manualBases && skillData.manualBases >= calculatedBase) {
            base = skillData.manualBases;
            pcCost = (base - calculatedBase) * basePointCost;
        }

        totalPC += pcCost;

        // Extract modifiers
        let originMod = 0;
        let specialtyMods: number[] = [];

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
                                specialtyMods.push(mod.value);
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
                                    specialtyMods.push(mod.value);
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        // Take the highest specialty modifier only
        const specialtyMod = specialtyMods.length > 0 ? Math.max(...specialtyMods) : 0;

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
            Logger.error(`Error calculating base for ${specSkill.skillId}:${specSkill.specification}`, e);
        }

        let base = calculatedBase;
        let pcCost = 0;

        if (specSkill.manualBases && specSkill.manualBases >= calculatedBase) {
            base = specSkill.manualBases;
            pcCost = (base - calculatedBase) * basePointCost;
        }

        totalPC += pcCost;

        // Extract modifiers (apply to ALL instances of this skill type)
        let originMod = 0;
        let specialtyMods: number[] = [];

        if (origins && origins.length > 0) {
            origins.forEach(item => {
                const originName = Object.keys(item)[0];
                const content = item[originName] as string[];

                const originSkillMods = ORIGIN_SKILL_MODIFIERS[originName];
                if (originSkillMods) {
                    originSkillMods.forEach(mod => {
                        if (mod.skillId === skillDef.id) {
                            if (originName === 'Vigilante') {
                                specialtyMods.push(mod.value);
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
                                    specialtyMods.push(mod.value);
                                } else {
                                    originMod += mod.value;
                                }
                            }
                        });
                    }
                });
            });
        }

        // Take the highest specialty modifier only
        const specialtyMod = specialtyMods.length > 0 ? Math.max(...specialtyMods) : 0;

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
    const isLiberado = hasLiberadoOrigin(origins);

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
 * - Subir la base cuesta 0.1 PC por punto (0.05 PC por punto para origen "Liberado")
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
            stats[normalizedKey] = Number(attributes[key]) || 0;
        });
    }

    // 1. Detectar si es Liberado (0.5 PC por habilidad y mitad de coste por subir base)
    const isLiberado = hasLiberadoOrigin(origins);

    const costPerSkill = isLiberado ? 0.5 : 1.0;
    const basePointCost = isLiberado ? 0.05 : 0.1;

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
                    baseIncreaseCost += (skill.manualBases - calculatedBase) * basePointCost;
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
                    baseIncreaseCost += (skill.manualBases - calculatedBase) * basePointCost;
                }
            }
        }
    });

    // 4. Calcular bonificación por Inteligencia
    const intelligence = Number(attributes['Inteligencia'] || attributes['inteligencia']) || 0;
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
 * Calcula el valor base de una habilidad basado en una fórmula de atributos.
 * Soporta tanto `(characteristics, origins, formula)` como `(dataOrCharacteristics, formula)`.
 */
export function calculateSkillBase(
    characteristicsOrData: { [key: string]: any },
    originsOrFormula: any[] | string | undefined,
    maybeFormula?: string
): number {
    const formula = typeof originsOrFormula === 'string' ? originsOrFormula : (maybeFormula || '');
    if (!formula) return 0;

    const rawAttrs = characteristicsOrData?.attributes?.values || characteristicsOrData || {};

    const stats: { [key: string]: number } = {
        fuerza: 0, constitucion: 0, agilidad: 0, inteligencia: 0,
        percepcion: 0, apariencia: 0, voluntad: 0
    };
    if (rawAttrs) {
        Object.keys(rawAttrs).forEach(key => {
            const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey] = Number(rawAttrs[key]) || 0;
        });
    }

    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'fuerza', 'AGI': 'agilidad', 'CON': 'constitucion',
            'INT': 'inteligencia', 'PER': 'percepcion', 'VOL': 'voluntad', 'APA': 'apariencia'
        };
        return stats[map[abbr]] || 0;
    };

    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)());
    } catch (e) {
        return 0;
    }
}

/**
 * Formatea los ítems de habilidades generales para visualización y persistencia (`skills.generalItems`).
 */
export function formatGeneralSkillItems(
    skillValues: Record<string, { total: number; [key: string]: any }> = {},
    nativeLanguage: string = ''
): SkillDisplayItem[] {
    return Object.keys(skillValues).map(id => {
        const skillDef = GENERAL_SKILLS.find(s => s.id === id);
        const val = skillValues[id];
        let name = skillDef?.name || id;
        if (id === 'idioma' && nativeLanguage) {
            name = `${name} (${nativeLanguage})`;
        }
        return {
            name,
            math: skillDef?.formulaText || '',
            value: `${val.total}%`
        };
    });
}

/**
 * Formatea los ítems de habilidades de aprendizaje (estándar y especificadas) para visualización y persistencia (`skills.specialItems`).
 */
export function formatSpecialSkillItems(
    selectedSkills: Record<string, any> = {},
    standardSpecialSkills: Record<string, { total: number; [key: string]: any }> = {},
    specifiedSkills: Record<string, { skillId: string; specification: string; [key: string]: any }> = {},
    specifiedSpecialSkills: Record<string, { total: number; [key: string]: any }> = {}
): SkillDisplayItem[] {
    const stdFormatted = Object.keys(selectedSkills).map(skillId => {
        const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
        const val = standardSpecialSkills[skillId];
        if (!val) return null;
        return {
            name: skillDef?.name || skillId,
            math: skillDef?.formulaText || '',
            value: `${val.total}%`
        };
    }).filter((item): item is SkillDisplayItem => Boolean(item));

    const specFormatted = Object.keys(specifiedSkills).map(uniqueId => {
        const spec = specifiedSkills[uniqueId];
        const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
        const val = specifiedSpecialSkills[uniqueId];
        if (!val) return null;
        return {
            name: `${skillDef?.name}: ${spec.specification}`,
            math: skillDef?.formulaText || '',
            value: `${val.total}%`
        };
    }).filter((item): item is SkillDisplayItem => Boolean(item));

    return [...stdFormatted, ...specFormatted];
}

/**
 * Sincroniza de forma pura las habilidades de aprendizaje gratuitas de origen,
 * las habilidades obligatorias de especialidades de Vigilante, y limpia las habilidades restringidas.
 * Devuelve `{ selected, specified }` actualizado si hubo cambios, o `null` si no hubo cambios.
 */
export function syncOriginSkills(data: any): {
    selected: Record<string, any>;
    specified: Record<string, any>;
} | null {
    const originItems = data?.origin?.items || [];
    const currentSelected = data?.skills?.selected || {};
    const currentSpecified = data?.skills?.specified || {};

    const freeSkillIds = getFreeSkillsForOrigins(originItems);
    const requiredSkillIds = getRequiredSkillsForOrigins(originItems);

    const newSelected: Record<string, any> = { ...currentSelected };
    const newSpecified: Record<string, any> = { ...currentSpecified };
    let hasChanges = false;

    // 1. Auto-add free skills from origin
    if (freeSkillIds.length > 0) {
        freeSkillIds.forEach((skillId: string) => {
            if (!newSelected[skillId]) {
                newSelected[skillId] = { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 };
                hasChanges = true;
            }
        });
    }

    // 2. Cleanup: Remove isRequired from skills that are no longer required
    Object.keys(newSelected).forEach(skillId => {
        if (newSelected[skillId]?.isRequired && !requiredSkillIds.includes(skillId)) {
            newSelected[skillId] = {
                ...newSelected[skillId],
                isRequired: false
            };
            hasChanges = true;
        }
    });

    Object.keys(newSpecified).forEach(uniqueId => {
        const skillId = newSpecified[uniqueId]?.skillId;
        if (newSpecified[uniqueId]?.isRequired && !requiredSkillIds.includes(skillId)) {
            newSpecified[uniqueId] = {
                ...newSpecified[uniqueId],
                isRequired: false
            };
            hasChanges = true;
        }
    });

    // 3. Add: Ensure all currently required skills are marked as such
    if (requiredSkillIds.length > 0) {
        requiredSkillIds.forEach((skillId: string) => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);

            if (skillDef?.requiresSpecification) {
                const existingInstances = Object.values(newSpecified).filter((s: any) => s.skillId === skillId);

                if (existingInstances.length === 0) {
                    const uniqueId = `${skillId}_required`;
                    newSpecified[uniqueId] = {
                        skillId,
                        specification: '',
                        isFree: false,
                        isRequired: true,
                        manualMods: 0,
                        manualBases: 0
                    };
                    hasChanges = true;
                } else {
                    const hasRequiredInstance = existingInstances.some((s: any) => s.isRequired);
                    if (!hasRequiredInstance) {
                        const firstKey = Object.keys(newSpecified).find(key => newSpecified[key].skillId === skillId);
                        if (firstKey) {
                            newSpecified[firstKey] = {
                                ...newSpecified[firstKey],
                                isRequired: true
                            };
                            hasChanges = true;
                        }
                    }
                }
            } else {
                if (!newSelected[skillId]) {
                    newSelected[skillId] = { isFree: false, isRequired: true, manualMods: 0, manualBases: 0 };
                    hasChanges = true;
                } else if (!newSelected[skillId].isRequired) {
                    newSelected[skillId] = {
                        ...newSelected[skillId],
                        isRequired: true
                    };
                    hasChanges = true;
                }
            }
        });
    }

    // 4. Cleanup restricted skills when origin changes
    Object.keys(newSelected).forEach(skillId => {
        const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
        if (skillDef && !isSkillAllowed(skillDef, originItems, data)) {
            delete newSelected[skillId];
            hasChanges = true;
        }
    });

    Object.keys(newSpecified).forEach(uniqueId => {
        const skillId = newSpecified[uniqueId]?.skillId;
        const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
        if (skillDef && !isSkillAllowed(skillDef, originItems, data)) {
            delete newSpecified[uniqueId];
            hasChanges = true;
        }
    });

    return hasChanges ? { selected: newSelected, specified: newSpecified } : null;
}

/**
 * Sincroniza de forma pura las listas formateadas `generalItems` y `specialItems`
 * en función de los atributos actuales, orígenes y habilidades seleccionadas/modificadas.
 */
export function syncSkillFormattedItems(data: any): {
    generalItems: SkillDisplayItem[];
    specialItems: SkillDisplayItem[];
} | null {
    const attrValues = data?.attributes?.values || {};
    const originItems = data?.origin?.items || [];
    const manualMods = data?.skills?.generalManualMods || {};
    const manualBases = data?.skills?.manualBases || {};
    const nativeLanguage = data?.skills?.nativeLanguage || '';
    const selectedSkills = data?.skills?.selected || {};
    const specifiedSkills = data?.skills?.specified || {};

    const { skills: skillValues } = calculateGeneralSkillValues(
        attrValues,
        originItems,
        manualMods,
        manualBases
    );
    const { standard: standardSpecialSkills, specified: specifiedSpecialSkills } = calculateSpecialSkillValues(
        attrValues,
        originItems,
        selectedSkills,
        specifiedSkills
    );

    const generalItems = formatGeneralSkillItems(skillValues, nativeLanguage);
    const specialItems = formatSpecialSkillItems(
        selectedSkills,
        standardSpecialSkills,
        specifiedSkills,
        specifiedSpecialSkills
    );

    const prevGeneral = data?.skills?.generalItems || [];
    const prevSpecial = data?.skills?.specialItems || [];

    if (
        JSON.stringify(prevGeneral) !== JSON.stringify(generalItems) ||
        JSON.stringify(prevSpecial) !== JSON.stringify(specialItems)
    ) {
        return { generalItems, specialItems };
    }

    return null;
}
