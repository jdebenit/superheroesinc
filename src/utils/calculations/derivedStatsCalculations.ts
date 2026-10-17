import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';

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
            // The key is the origin category (e.g. "Parahumano", "Divino")
            // The value is an array (e.g. ["Thals"], ["Poder divino"])
            const originCategory = Object.keys(originObj)[0];
            const originDetails = originObj[originCategory] || [];
            if (!originCategory) return;

            // --- Mental Parry Bonus ---
            let currentBonus = 0;

            if (ORIGIN_CATEGORIES[originCategory]) {
                const categoryDef = ORIGIN_CATEGORIES[originCategory];

                // 1. Base Category Bonus
                if (categoryDef.paradaMentalBonus) {
                    currentBonus = categoryDef.paradaMentalBonus;
                    originMentalBonuses[originCategory] = Math.max(
                        originMentalBonuses[originCategory] || 0,
                        categoryDef.paradaMentalBonus
                    );
                }

                // 2. Subtype Bonus (if any, e.g. Thals)
                if (categoryDef.subtypeModifiers) {
                    originDetails.forEach((specialization: string) => {
                        if (!categoryDef.subtypeModifiers) return;
                        const modifier = categoryDef.subtypeModifiers[specialization];
                        if (modifier && modifier.paradaMental) {
                            originMentalBonuses[specialization] = Math.max(
                                originMentalBonuses[specialization] || 0,
                                modifier.paradaMental
                            );
                            if (modifier.paradaMental > currentBonus) {
                                currentBonus = modifier.paradaMental;
                            }
                        }
                    });
                }
            }

            if (currentBonus > maxOriginBonus) {
                maxOriginBonus = currentBonus;
            }

            // --- Impact Bonus (Generic via subtypeModifiers) ---
            if (originCategory) {
                const categoryDef = ORIGIN_CATEGORIES[originCategory];
                if (categoryDef && categoryDef.subtypeModifiers) {
                    let currentImpactBonus = 0;

                    // Iterate over all specializations the character has in this category
                    originDetails.forEach((specialization: string) => {
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
            }
        });
    }

    const paradaMentalBase = paradaMental;
    const modImpactoBase = modImpacto;
    paradaMental += maxOriginBonus;
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

    // Salto: 
    // Base from Agility Table applied with Strength Multiplier
    const saltoBase = agi / jumpDivisor;
    const saltoLargoVal = saltoBase * jumpMod;
    const saltoAltoVal = saltoLargoVal / 3;

    const saltoLargo = saltoLargoVal.toFixed(1);
    const saltoAlto = saltoAltoVal.toFixed(1);

    const saltoStr = `${saltoAlto}m / ${saltoLargo}m`;

    return {
        combat: {
            acciones: `${acciones}`,
            iniciativa: `${iniciativaReflejos}`,
            iniciativaBreakdown,
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
            modImpactoBreakdown,
            modPsionico: `${modPsionico}`,
            paradaFisica: `${paradaFisica}`,
            paradaFisicaBreakdown,
            paradaMental: `${paradaMental}`,
            paradaMentalBreakdown,
            salto: saltoStr.replace(/\./g, ',')
        }
    };
}

export interface StatBreakdown {
    formula?: string;
    base: number;
    origen?: number | Record<string, number>;
    habilidades?: number | Record<string, number>;
    total: number;
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
    bonusKey: 'origen' | 'habilidades' = 'origen'
): StatBreakdown {
    if (breakdownObj && typeof breakdownObj === 'object') {
        return { ...breakdownObj };
    }
    if (fallbackVal && typeof fallbackVal === 'object') {
        return { ...fallbackVal };
    }
    const num = Number(fallbackVal) || 0;
    return {
        ...(bonusKey === 'habilidades' ? {} : {}),
        base: num,
        [bonusKey]: 0,
        total: num
    };
}

/**
 * Formats derived stats object into standard objects for JSON/Display
 * Optimized for stability as requested by the user
 */
export function formatDerivedStats(stats: any) {
    const iniciativaObj = normalizeToBreakdown(stats.combat?.iniciativaBreakdown, stats.combat?.iniciativa, 'habilidades');

    const combatStats: Record<string, any> = {
        "Acciones por asalto": stats.combat.acciones,
        "Iniciativa y Reflejos": iniciativaObj,
        "Puntos de Vida": stats.combat.pv,
        "Equilibrio Mental": stats.combat.equilibrio
    };

    const modImpactoObj = normalizeToBreakdown(stats.other?.modImpactoBreakdown, stats.other?.modImpacto, 'origen');
    const paradaFisicaObj = normalizeToBreakdown(stats.other?.paradaFisicaBreakdown, stats.other?.paradaFisica, 'habilidades');
    const paradaMentalObj = normalizeToBreakdown(stats.other?.paradaMentalBreakdown, stats.other?.paradaMental, 'origen');

    const otherStats: Record<string, any> = {
        "Inconsciencia": stats.other.inconsciencia,
        "Recuperación": stats.other.recuperacion,
        "Resistencia a gases y venenos": stats.other.resistenciaGases,
        "Modificador de fuerza": stats.other.modFuerza,
        "Peso Levantado": stats.other.pesoLevantado,
        "Daño absorbido físico": stats.other.daAbsorbidoFisico,
        "Daño absorbido mental": stats.other.daAbsorbidoMental,
        "Modificador de impacto": modImpactoObj,
        "Modificador Psionico": stats.other.modPsionico,
        "Parada Fisica": paradaFisicaObj,
        "Parada mental": paradaMentalObj,
        "Salto (alto / largo)": stats.other.salto
    };

    return { combatStats, otherStats };
}

/**
 * Helper to apply a saved override to a StatBreakdown object.
 * Keeps formula (if any), base, origen/habilidades (if any), and total, and only attaches 'personalizado' if manually modified.
 */
export function applyStatBreakdownOverride(baseBreakdown: StatBreakdown, savedValue: any): StatBreakdown {
    const cleanBase: StatBreakdown = {
        ...(baseBreakdown.formula ? { formula: baseBreakdown.formula } : {}),
        base: baseBreakdown.base ?? 0,
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
        total: baseBreakdown.total ?? 0
    };

    if (savedValue === null || savedValue === undefined) {
        return cleanBase;
    }

    if (typeof savedValue === 'object') {
        const rawPers = savedValue.personalizado;
        if (rawPers !== undefined && rawPers !== null && String(rawPers).trim() !== '' && String(rawPers).trim() !== '-') {
            const strPers = String(rawPers).trim();
            const parsedPers = !isNaN(Number(strPers)) ? Number(strPers) : strPers;
            if (parsedPers !== cleanBase.total) {
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
    const bonusDiff = cleanBase.total - cleanBase.base;
    const compactVal = strVal.replace(/\s+/g, '');
    if (
        strVal === String(cleanBase.total) ||
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
