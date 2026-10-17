import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';

const normalizeModKey = (str: string): string =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/**
 * Suma los modificadores de `modPerLevel` para una clave dada (stat o habilidad)
 * desde el nivel 2 hasta el nivel actual del personaje (`level`).
 */
export function getLevelModifierForKey(
    targetKey: string,
    level: number | string = 1,
    modPerLevel?: Record<string, Record<string, number>>
): number {
    if (!modPerLevel || typeof modPerLevel !== 'object' || !targetKey) return 0;
    const maxLevel = Math.max(1, Number(level) || 1);
    if (maxLevel <= 1) return 0;

    const normTarget = normalizeModKey(targetKey);
    let totalBonus = 0;

    Object.entries(modPerLevel).forEach(([lvlKey, mods]) => {
        const lvlNum = Number(lvlKey);
        if (!isNaN(lvlNum) && lvlNum >= 2 && lvlNum <= maxLevel && mods && typeof mods === 'object') {
            Object.entries(mods).forEach(([modKey, val]) => {
                // If it's a sub-category object (e.g. combatstats, skills, otherstats)
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    Object.entries(val).forEach(([subKey, subVal]) => {
                        if (normalizeModKey(subKey) === normTarget) {
                            totalBonus += Number(subVal) || 0;
                        }
                    });
                } else if (normalizeModKey(modKey) === normTarget) {
                    totalBonus += Number(val) || 0;
                }
            });
        }
    });

    return totalBonus;
}

/**
 * Aplica los modificadores por nivel (`modPerLevel`) a una lista de habilidades (`generalItems` o `specialItems`).
 */
export function applyLevelModsToSkillItems(
    items: any[] = [],
    level: number | string = 1,
    modPerLevel?: Record<string, Record<string, number>>
): any[] {
    if (!Array.isArray(items) || !modPerLevel) return items || [];
    return items.map(item => {
        if (!item || !item.name) return item;
        const levelBonus = getLevelModifierForKey(item.name, level, modPerLevel);
        if (levelBonus === 0) return item;

        const rawVal = String(item.value ?? '');
        const hasPercent = rawVal.includes('%');
        const baseNum = parseInt(rawVal, 10);
        if (isNaN(baseNum)) return item;

        const finalNum = baseNum + levelBonus;
        return {
            ...item,
            baseValue: item.baseValue ?? `${baseNum}${hasPercent ? '%' : ''}`,
            levelBonus,
            value: `${finalNum}${hasPercent ? '%' : ''}`
        };
    });
}

/**
 * Obtiene el trasfondo efectivo aplicando las modificaciones por nivel hasta el nivel actual.
 */
export function getEffectiveBackground(
    background: any = {},
    level: number | string = 1,
    modPerLevel?: Record<string, any>
): any {
    if (!background) return {};
    const result = {
        ...background,
        items: Array.isArray(background.items) ? [...background.items] : []
    };
    if (!modPerLevel || typeof modPerLevel !== 'object') return result;

    const maxLevel = Math.max(1, Number(level) || 1);
    if (maxLevel <= 1) return result;

    Object.entries(modPerLevel).forEach(([lvlKey, mods]) => {
        const lvlNum = Number(lvlKey);
        if (!isNaN(lvlNum) && lvlNum >= 2 && lvlNum <= maxLevel && mods && typeof mods === 'object') {
            const bgMods = mods.background;
            if (bgMods && typeof bgMods === 'object') {
                if (bgMods.economicStatus !== undefined) result.economicStatus = bgMods.economicStatus;
                if (bgMods.legalStatus !== undefined) result.legalStatus = bgMods.legalStatus;
                if (bgMods.socialStatus !== undefined) result.socialStatus = bgMods.socialStatus;
                if (bgMods.friendsAndAssociates !== undefined) result.friendsAndAssociates = bgMods.friendsAndAssociates;
                if (bgMods.baseCoverage !== undefined) result.baseCoverage = bgMods.baseCoverage;
                if (bgMods.prejudiceResistance !== undefined) {
                    result.prejudiceResistance = (result.prejudiceResistance || 50) + Number(bgMods.prejudiceResistance);
                }
                if (Array.isArray(bgMods.items)) {
                    bgMods.items.forEach((item: string) => {
                        if (!result.items.includes(item)) result.items.push(item);
                    });
                }
            }
        }
    });

    return result;
}

/**
 * Calcula las estadísticas derivadas para el Paso 6
 */
export function calculateDerivedStats(
    attributes: { [key: string]: number },
    origins: any[] = [],
    skills: any = {},
    level: number | string = 1,
    modPerLevel?: Record<string, Record<string, number>>
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
            stats[normalizedKey as keyof typeof stats] = Number(attributes[key]) || 0;
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

    // Puntos de Vida
    let puntosVida = 0;
    let pvFormula = "CON/2";
    let recuperacion = 0;
    let daFisico = 0;

    // --- TABLE CALCULATIONS (CONSTITUCIÓN) ---
    if (con <= 100) {
        puntosVida = Math.floor(con / 2);
        pvFormula = "CON/2";
        daFisico = 0;
        recuperacion = 1;
    } else if (con <= 110) {
        puntosVida = con - 45;
        pvFormula = "CON-45";
        daFisico = 15;
        recuperacion = 2;
    } else if (con <= 120) {
        puntosVida = con - 40;
        pvFormula = "CON-40";
        daFisico = 30;
        recuperacion = 4;
    } else if (con <= 130) {
        puntosVida = con - 35;
        pvFormula = "CON-35";
        daFisico = 45;
        recuperacion = 6;
    } else if (con <= 140) {
        puntosVida = con - 30;
        pvFormula = "CON-30";
        daFisico = 60;
        recuperacion = 10;
    } else if (con <= 150) {
        puntosVida = con - 25;
        pvFormula = "CON-25";
        daFisico = 75;
        recuperacion = 15;
    } else if (con <= 160) {
        puntosVida = con - 20;
        pvFormula = "CON-20";
        daFisico = 90;
        recuperacion = 20;
    } else if (con <= 170) {
        puntosVida = con - 15;
        pvFormula = "CON-15";
        daFisico = 105;
        recuperacion = 25;
    } else if (con <= 180) {
        puntosVida = con - 10;
        pvFormula = "CON-10";
        daFisico = 120;
        recuperacion = 30;
    } else if (con <= 190) {
        puntosVida = con - 5;
        pvFormula = "CON-5";
        daFisico = 135;
        recuperacion = 35;
    } else {
        // 191-200+
        puntosVida = con;
        pvFormula = "CON";
        daFisico = 150;
        recuperacion = 40;
    }

    // Iniciativa y Reflejos: (AGI + PER) / 4
    // Excepción: si INT >= 121, sustituye a la menor entre AGI y PER si INT es mayor que ella
    let iniciativaFormula = "(AGI+PER)/4";
    let iniciativaReflejos = Math.floor((agi + per) / 4);

    if (int >= 121 && int > Math.min(agi, per)) {
        if (agi <= per) {
            iniciativaFormula = "(INT+PER)/4";
            iniciativaReflejos = Math.floor((int + per) / 4);
        } else {
            iniciativaFormula = "(AGI+INT)/4";
            iniciativaReflejos = Math.floor((agi + int) / 4);
        }
    }
    const iniciativaBase = iniciativaReflejos;

    // Check for Artes Marciales skill bonus (can be General or Special)
    const hasMartialArts =
        skills?.generalItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) ||
        skills?.specialItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) ||
        Boolean(skills?.selected?.['artes_marciales']) ||
        Boolean(skills?.learning?.selected?.['artes_marciales']) ||
        false;

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

    const paradaFisicaBase = paradaFisica;
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


    // Modificador por Origen (Mental Parry & Mod. Impacto)
    let maxOriginBonus = 0;
    let maxImpactBonus = 0;
    const originMentalBonuses: Record<string, number> = {};
    const originImpactBonuses: Record<string, number> = {};

    // Origins structure: [ { "NombreOrigen": ["efecto1", ...] }, ... ]
    if (origins && origins.length > 0) {
        origins.forEach(originObj => {
            // The key can be the origin category (e.g. "Parahumano", "Divino")
            // OR directly a subtype name in legacy/exported JSONs (e.g. "Semidios", "Mago", "Manipulador")
            const originKey = Object.keys(originObj)[0];
            const originDetails = originObj[originKey] || [];
            if (!originKey) return;

            let categoryDef = ORIGIN_CATEGORIES[originKey];
            let effectiveSpecializations: string[] = Array.isArray(originDetails) ? [...originDetails] : [];

            // Fallback: if originKey is actually a subtype (e.g. "Semidios", "Mago", "Thals", "Artista Marcial")
            if (!categoryDef) {
                const parentEntry = Object.entries(ORIGIN_CATEGORIES).find(([, def]) =>
                    (def.subtypes && Object.prototype.hasOwnProperty.call(def.subtypes, originKey)) ||
                    (def.subtypeModifiers && Object.prototype.hasOwnProperty.call(def.subtypeModifiers, originKey))
                );
                if (parentEntry) {
                    categoryDef = parentEntry[1];
                    if (!effectiveSpecializations.includes(originKey)) {
                        effectiveSpecializations.push(originKey);
                    }
                }
            }

            if (!categoryDef) return;

            // --- Mental Parry Bonus ---
            let currentBonus = 0;

            // 1. Base Category Bonus
            if (categoryDef.paradaMentalBonus) {
                currentBonus = categoryDef.paradaMentalBonus;
                originMentalBonuses[originKey] = Math.max(
                    originMentalBonuses[originKey] || 0,
                    categoryDef.paradaMentalBonus
                );
            }

            // 2. Subtype Bonus (if any, e.g. Thals)
            if (categoryDef.subtypeModifiers) {
                effectiveSpecializations.forEach((specialization: string) => {
                    if (!categoryDef.subtypeModifiers) return;
                    const modifier = categoryDef.subtypeModifiers[specialization];
                    if (modifier && modifier.paradaMental) {
                        const bonusKey = ORIGIN_CATEGORIES[originKey] ? originKey : specialization;
                        originMentalBonuses[bonusKey] = Math.max(
                            originMentalBonuses[bonusKey] || 0,
                            modifier.paradaMental
                        );
                        if (modifier.paradaMental > currentBonus) {
                            currentBonus = modifier.paradaMental;
                        }
                    }
                });
            }

            if (currentBonus > maxOriginBonus) {
                maxOriginBonus = currentBonus;
            }

            // --- Impact Bonus (Generic via subtypeModifiers) ---
            if (categoryDef.subtypeModifiers) {
                let currentImpactBonus = 0;

                // Iterate over all specializations the character has in this category
                effectiveSpecializations.forEach((specialization: string) => {
                    if (!categoryDef.subtypeModifiers) return;

                    const modifier = categoryDef.subtypeModifiers[specialization];
                    if (modifier && modifier.modImpacto) {
                        originImpactBonuses[specialization] = Math.max(
                            originImpactBonuses[specialization] || 0,
                            modifier.modImpacto
                        );
                        if (modifier.modImpacto > currentImpactBonus) {
                            currentImpactBonus = modifier.modImpacto;
                        }
                    }
                });

                if (currentImpactBonus > maxImpactBonus) {
                    maxImpactBonus = currentImpactBonus;
                }
            }
        });
    }

    const totalMentalOriginBonus = Object.values(originMentalBonuses).reduce((sum, val) => sum + val, 0);

    const paradaMentalBase = paradaMental;
    const modImpactoBase = modImpacto;
    paradaMental += totalMentalOriginBonus;
    modImpacto += maxImpactBonus;

    const mentalOriginBreakdown: number | Record<string, number> =
        Object.keys(originMentalBonuses).length > 0 ? originMentalBonuses : 0;

    const impactOriginBreakdown: number | Record<string, number> =
        Object.keys(originImpactBonuses).length > 0 ? originImpactBonuses : 0;

    const habilidadesBonusBreakdown: number | Record<string, number> =
        hasMartialArts ? { "Artes Marciales": 20 } : 0;

    const paradaFisicaBreakdown: StatBreakdown = {
        base: paradaFisicaBase,
        habilidades: habilidadesBonusBreakdown,
        total: paradaFisica
    };

    const iniciativaBreakdown: StatBreakdown = {
        formula: iniciativaFormula,
        base: iniciativaBase,
        habilidades: habilidadesBonusBreakdown,
        total: iniciativaReflejos
    };

    const modImpactoBreakdown: StatBreakdown = {
        base: modImpactoBase,
        origen: impactOriginBreakdown,
        total: modImpacto
    };

    const paradaMentalBreakdown: StatBreakdown = {
        base: paradaMentalBase,
        origen: mentalOriginBreakdown,
        total: paradaMental
    };

    const pvBase = puntosVida;
    const pvLevelBonus = getLevelModifierForKey('Puntos de Vida', level, modPerLevel);
    puntosVida = pvBase + pvLevelBonus;

    // Recalculate Inconsciencia with final Puntos de Vida (including level progression)
    const inconscienciaFinal = Math.floor(puntosVida / 10);

    const pvBreakdown: StatBreakdown = {
        formula: pvFormula,
        base: pvBase,
        ...(pvLevelBonus !== 0 ? { nivel: pvLevelBonus } : {}),
        total: puntosVida
    };

    const equilibrioBreakdown: StatBreakdown = {
        formula: "INT",
        base: equilibrioMental,
        total: equilibrioMental
    };

    const inconscienciaBreakdown: StatBreakdown = {
        formula: "PV/10",
        base: inconscienciaFinal,
        total: inconscienciaFinal
    };

    const resistenciaGasesBreakdown: StatBreakdown = {
        formula: "CON/3",
        base: resistenciaGases,
        total: `${resistenciaGases}%`
    };

    const daFisicoBreakdown: StatBreakdown = {
        base: daFisico,
        total: daFisico
    };

    const daMentalBreakdown: StatBreakdown = {
        base: daMental,
        total: daMental
    };

    // Salto: 
    // Base from Agility Table applied with Strength Multiplier
    const saltoBase = agi / jumpDivisor;
    const saltoLargoVal = saltoBase * jumpMod;
    const saltoAltoVal = saltoLargoVal / 3;

    const saltoLargo = saltoLargoVal.toFixed(1);
    const saltoAlto = saltoAltoVal.toFixed(1);

    const saltoStr = `${saltoAlto}m / ${saltoLargo}m`;
    const saltoTotalFormatted = saltoStr.replace(/\./g, ',');
    const jumpFormula = jumpMod > 1 ? `(AGI/${jumpDivisor})*${jumpMod}` : `AGI/${jumpDivisor}`;

    const saltoBreakdown: StatBreakdown = {
        formula: jumpFormula,
        multiplicadorFuerza: jumpMod,
        alto: `${saltoAlto.replace(/\./g, ',')}m`,
        largo: `${saltoLargo.replace(/\./g, ',')}m`,
        total: saltoTotalFormatted
    };

    return {
        combat: {
            acciones: `${acciones}`,
            iniciativa: `${iniciativaReflejos}`,
            iniciativaBreakdown,
            pv: `${puntosVida}`,
            pvBreakdown,
            equilibrio: `${equilibrioMental}`,
            equilibrioBreakdown
        },
        other: {
            inconsciencia: `${inconscienciaFinal}`,
            inconscienciaBreakdown,
            recuperacion: `${recuperacion} PV/h`,
            resistenciaGases: `${resistenciaGases}%`,
            resistenciaGasesBreakdown,
            modFuerza: modFuerzaStr,
            pesoLevantado: pesoLevantadoStr,
            daAbsorbidoFisico: `${daFisico}`,
            daFisicoBreakdown,
            daAbsorbidoMental: `${daMental}`,
            daMentalBreakdown,
            modImpacto: `${modImpacto}`,
            modImpactoBreakdown,
            modPsionico: `${modPsionico}`,
            paradaFisica: `${paradaFisica}`,
            paradaFisicaBreakdown,
            paradaMental: `${paradaMental}`,
            paradaMentalBreakdown,
            salto: saltoTotalFormatted,
            saltoBreakdown
        }
    };
}

export interface StatBreakdown {
    formula?: string;
    base?: number;
    multiplicadorFuerza?: number;
    alto?: string;
    largo?: string;
    origen?: number | Record<string, number>;
    habilidades?: number | Record<string, number>;
    nivel?: number | Record<string, number>;
    total: number | string;
    personalizado?: number | string;
}

export type ParadaMentalBreakdown = StatBreakdown;

/**
 * Extracts the display string for any stat value (supports string, number, or breakdown object).
 * Prioritizes 'personalizado' when present, otherwise falls back to 'total'.
 */
export function getStatDisplayValue(val: any): string {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'object') {
        if (val.personalizado !== undefined && val.personalizado !== null && String(val.personalizado).trim() !== '') {
            return String(val.personalizado);
        }
        if (val.total !== undefined && val.total !== null) {
            return String(val.total);
        }
        return '-';
    }
    const str = String(val);
    return str.trim() !== '' ? str : '-';
}

function normalizeToBreakdown(
    breakdownObj: any,
    fallbackVal: any,
    bonusKey?: 'origen' | 'habilidades'
): StatBreakdown {
    if (breakdownObj && typeof breakdownObj === 'object') {
        return { ...breakdownObj };
    }
    if (fallbackVal && typeof fallbackVal === 'object') {
        return { ...fallbackVal };
    }
    const isStringVal = typeof fallbackVal === 'string' && isNaN(Number(fallbackVal));
    const num = Number(fallbackVal) || 0;
    return {
        base: num,
        ...(bonusKey ? { [bonusKey]: 0 } : {}),
        total: isStringVal ? fallbackVal : num
    };
}

/**
 * Formats derived stats object into standard objects for JSON/Display
 * Optimized for stability as requested by the user
 */
export function formatDerivedStats(stats: any) {
    const iniciativaObj = normalizeToBreakdown(stats.combat?.iniciativaBreakdown, stats.combat?.iniciativa, 'habilidades');
    const pvObj = normalizeToBreakdown(stats.combat?.pvBreakdown, stats.combat?.pv);
    const equilibrioObj = normalizeToBreakdown(stats.combat?.equilibrioBreakdown, stats.combat?.equilibrio);

    const combatStats: Record<string, any> = {
        "Acciones por asalto": stats.combat.acciones,
        "Iniciativa y Reflejos": iniciativaObj,
        "Puntos de Vida": pvObj,
        "Equilibrio Mental": equilibrioObj
    };

    const inconscienciaObj = normalizeToBreakdown(stats.other?.inconscienciaBreakdown, stats.other?.inconsciencia);
    const resistenciaGasesObj = normalizeToBreakdown(stats.other?.resistenciaGasesBreakdown, stats.other?.resistenciaGases);
    const daFisicoObj = normalizeToBreakdown(stats.other?.daFisicoBreakdown, stats.other?.daAbsorbidoFisico);
    const daMentalObj = normalizeToBreakdown(stats.other?.daMentalBreakdown, stats.other?.daAbsorbidoMental);
    const modImpactoObj = normalizeToBreakdown(stats.other?.modImpactoBreakdown, stats.other?.modImpacto, 'origen');
    const paradaFisicaObj = normalizeToBreakdown(stats.other?.paradaFisicaBreakdown, stats.other?.paradaFisica, 'habilidades');
    const paradaMentalObj = normalizeToBreakdown(stats.other?.paradaMentalBreakdown, stats.other?.paradaMental, 'origen');
    const saltoObj = normalizeToBreakdown(stats.other?.saltoBreakdown, stats.other?.salto);

    const otherStats: Record<string, any> = {
        "Inconsciencia": inconscienciaObj,
        "Recuperación": stats.other.recuperacion,
        "Resistencia a gases y venenos": resistenciaGasesObj,
        "Modificador de fuerza": stats.other.modFuerza,
        "Peso Levantado": stats.other.pesoLevantado,
        "Daño absorbido físico": daFisicoObj,
        "Daño absorbido mental": daMentalObj,
        "Modificador de impacto": modImpactoObj,
        "Modificador Psionico": stats.other.modPsionico,
        "Parada Fisica": paradaFisicaObj,
        "Parada mental": paradaMentalObj,
        "Salto (alto / largo)": saltoObj
    };

    return { combatStats, otherStats };
}

/**
 * Helper to apply a saved override to a StatBreakdown object.
 * Keeps formula (if any), base, origen/habilidades/nivel (if any), and total, and only attaches 'personalizado' if manually modified.
 */
export function applyStatBreakdownOverride(baseBreakdown: StatBreakdown, savedValue: any): StatBreakdown {
    const cleanBase: StatBreakdown = {
        ...(baseBreakdown.formula ? { formula: baseBreakdown.formula } : {}),
        ...(baseBreakdown.base !== undefined ? { base: baseBreakdown.base } : {}),
        ...(baseBreakdown.multiplicadorFuerza !== undefined ? { multiplicadorFuerza: baseBreakdown.multiplicadorFuerza } : {}),
        ...(baseBreakdown.alto !== undefined ? { alto: baseBreakdown.alto } : {}),
        ...(baseBreakdown.largo !== undefined ? { largo: baseBreakdown.largo } : {}),
        ...(baseBreakdown.origen !== undefined
            ? {
                origen: baseBreakdown.origen && typeof baseBreakdown.origen === 'object'
                    ? { ...baseBreakdown.origen }
                    : baseBreakdown.origen
            }
            : {}),
        ...(baseBreakdown.habilidades !== undefined
            ? {
                habilidades: baseBreakdown.habilidades && typeof baseBreakdown.habilidades === 'object'
                    ? { ...baseBreakdown.habilidades }
                    : baseBreakdown.habilidades
            }
            : {}),
        ...(baseBreakdown.nivel !== undefined
            ? {
                nivel: baseBreakdown.nivel && typeof baseBreakdown.nivel === 'object'
                    ? { ...baseBreakdown.nivel }
                    : baseBreakdown.nivel
            }
            : {}),
        total: baseBreakdown.total ?? 0
    };

    if (savedValue === null || savedValue === undefined) {
        return cleanBase;
    }

    const totalCompact = String(cleanBase.total).replace(/\s+/g, '');

    if (typeof savedValue === 'object') {
        const rawPers = savedValue.personalizado;
        if (rawPers !== undefined && rawPers !== null && String(rawPers).trim() !== '' && String(rawPers).trim() !== '-') {
            const strPers = String(rawPers).trim();
            const parsedPers = !isNaN(Number(strPers)) ? Number(strPers) : strPers;
            if (parsedPers !== cleanBase.total && String(parsedPers).replace(/\s+/g, '') !== totalCompact) {
                return { ...cleanBase, personalizado: parsedPers };
            }
        }
        return cleanBase;
    }

    const strVal = String(savedValue).trim();
    if (!strVal || strVal === '-') {
        return cleanBase;
    }

    // Ignore if it matches calculated total or legacy "base+bonus" notation
    const bonusDiff = (typeof cleanBase.total === 'number' && typeof cleanBase.base === 'number')
        ? cleanBase.total - cleanBase.base
        : 0;
    const compactVal = strVal.replace(/\s+/g, '');
    if (
        strVal === String(cleanBase.total) ||
        compactVal === totalCompact ||
        (bonusDiff !== 0 && compactVal === `${cleanBase.base}+${bonusDiff}`)
    ) {
        return cleanBase;
    }

    const parsed = !isNaN(Number(strVal)) ? Number(strVal) : strVal;
    return {
        ...cleanBase,
        personalizado: parsed
    };
}

/**
 * Utility to apply overrides from JSON (supports both old string array and new object format)
 * This ensures that if a user manually modified a stat in the JSON, it is preserved.
 */
export function applyStatsOverrides(baseStats: Record<string, any>, savedStats: any): Record<string, any> {
    const result = { ...baseStats };
    if (!savedStats) return result;

    if (Array.isArray(savedStats)) {
        // Old format: ["Label: Value", ...]
        savedStats.forEach((item: any) => {
            if (typeof item !== 'string') return;
            const parts = item.split(':');
            if (parts.length > 1) {
                const label = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                if (value && value !== '-' && result.hasOwnProperty(label)) {
                    if (result[label] && typeof result[label] === 'object' && 'total' in result[label]) {
                        result[label] = applyStatBreakdownOverride(result[label], value);
                    } else {
                        result[label] = value;
                    }
                }
            }
        });
    } else if (typeof savedStats === 'object' && savedStats !== null) {
        // New format: { "Label": "Value" | Object, ... }
        Object.entries(savedStats).forEach(([label, value]) => {
            if (!result.hasOwnProperty(label)) return;

            if (result[label] && typeof result[label] === 'object' && 'total' in result[label]) {
                result[label] = applyStatBreakdownOverride(result[label], value);
            } else if (typeof value === 'string' && value && value !== '-') {
                result[label] = value;
            }
        });
    }
    return result;
}
