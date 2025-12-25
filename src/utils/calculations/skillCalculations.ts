import { GENERAL_SKILLS, type GeneralSkillDefinition } from '../../data/generalSkills';
import { SPECIAL_SKILLS, type SpecialSkillDefinition } from '../../data/specialSkills';
import { ORIGIN_SKILL_MODIFIERS } from '../../data/skillModifiers';

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
