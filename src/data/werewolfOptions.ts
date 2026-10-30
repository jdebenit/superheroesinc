import { GENERAL_SKILLS } from './generalSkills';
import { SPECIAL_SKILLS } from './specialSkills';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from '../utils/calculations/skillCalculations';
import { calculateDerivedStats, formatDerivedStats, applyStatsOverrides } from '../utils/calculations/derivedStatsCalculations';

/**
 * Definiciones y utilidades para el origen Hombre Lobo (Licántropos)
 * y el sistema reutilizable de Formas / Transformaciones (CharacterForm).
 */

export type WerewolfSubtypeId = 'puro' | 'hibrido' | 'renegado';

export interface TransitionStatConfig {
    id: string;
    label: string;
    abbr: string;
    base: number;
    max: number;
}

export interface WerewolfSubtypeConfig {
    id: WerewolfSubtypeId;
    name: string;
    shortName: string;
    cost: number;
    silverDamageBonus: number;
    regenRank: number;
    regenRankLabel: string;
    naturalWeaponRank: number;
    naturalWeaponRankLabel: string;
    hasPurePowers: boolean;
    description: string;
    rageDescription: string;
    silverDescription: string;
    extraRules?: string;
    transitionStats: Record<string, TransitionStatConfig>;
}

export interface CharacterForm {
    id: string;
    name: string;
    source: string;
    subtype?: string;
    cost: number;
    attributes: {
        values: {
            Fuerza: number;
            Constitución: number;
            Agilidad: number;
            Inteligencia: number;
            Percepción: number;
            Apariencia: number;
            Voluntad: number;
        };
        breakdown?: Record<string, {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
            otherMod: number;
            min: number;
            max: number;
        }>;
    };
    combatstats?: Record<string, any>;
    otherstats?: Record<string, any>;
}

export interface WerewolfParams {
    subtype: WerewolfSubtypeId;
}

export const WEREWOLF_TRANSITION_FORM_ID = 'werewolf_transition';

export const TRANSITION_CHARACTERISTICS_ORDER = [
    { id: 'fuerza', key: 'Fuerza', abbr: 'FUE' },
    { id: 'constitucion', key: 'Constitución', abbr: 'CON' },
    { id: 'agilidad', key: 'Agilidad', abbr: 'AGI' },
    { id: 'inteligencia', key: 'Inteligencia', abbr: 'INT' },
    { id: 'percepcion', key: 'Percepción', abbr: 'PER' },
    { id: 'apariencia', key: 'Apariencia', abbr: 'APA' },
] as const;

export const WEREWOLF_SUBTYPES: Record<WerewolfSubtypeId, WerewolfSubtypeConfig> = {
    puro: {
        id: 'puro',
        name: 'Hombre Lobo Puro',
        shortName: 'Puro',
        cost: 4,
        silverDamageBonus: 20,
        regenRank: 41,
        regenRankLabel: 'Elevado (41)',
        naturalWeaponRank: 1,
        naturalWeaponRankLabel: 'Bajo (1)',
        hasPurePowers: true,
        description: 'Fuertemente conectados con la naturaleza y los espíritus de la Madre Tierra. Poseen el don de la Empatía animal (rango medio) y Donación de vida (rango elevado) mediante el contacto físico.',
        rageDescription: 'En estado híbrido pierden gran parte de su control: si son atacados deben superar una tirada de Voluntad para no caer en una rabia asesina y atacar a sus compañeros, y otra cada vez que vayan a actuar en contra de su rabia.',
        silverDescription: 'Alergia severa a la plata: cualquier arma de plata suma +20 al daño y anula sus poderes de regeneración.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 120 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 120 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 110 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 100 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 130 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 80 }
        }
    },
    hibrido: {
        id: 'hibrido',
        name: 'Hombre Lobo Híbrido',
        shortName: 'Híbrido',
        cost: 0,
        silverDamageBonus: 10,
        regenRank: 41,
        regenRankLabel: 'Elevado (41)',
        naturalWeaponRank: 1,
        naturalWeaponRankLabel: 'Bajo (1)',
        hasPurePowers: false,
        description: 'Descendientes mezclados con humanos que conservan la capacidad de adoptar la forma intermedia y lupina, aunque con menor control sobre sus instintos.',
        rageDescription: 'Mayor tendencia a transformarse: cualquier situación de peligro o herida desencadena el cambio salvo que supere una tirada de Voluntad Difícil. En las noches de luna llena la transformación es inevitable.',
        silverDescription: 'Alergia a la plata moderada: las armas de plata les afectan con un bonificador de +10 al daño y anulan su regeneración.',
        extraRules: 'Mordisco infeccioso: transmite la enfermedad mental de licantropía si la víctima no supera una tirada de Resistencia a Venenos y otra de EQM.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 120 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 120 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 110 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 60 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 120 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 90 }
        }
    },
    renegado: {
        id: 'renegado',
        name: 'Hombre Lobo Renegado',
        shortName: 'Renegado',
        cost: 9,
        silverDamageBonus: 20,
        regenRank: 71,
        regenRankLabel: 'Alto (71)',
        naturalWeaponRank: 21,
        naturalWeaponRankLabel: 'Medio (21)',
        hasPurePowers: false,
        description: 'Licántropos que renegaron de sus códigos morales para tomar venganza contra los humanos. Carecen de la paz interna para Empatía animal y Donación de vida, pero poseen una Regeneración de tejidos superior (rango alto) y Arma Natural mejorada (rango medio).',
        rageDescription: 'Carácter sumamente violento que les lleva a perder el control al adoptar su forma intermedia. Si son atacados o intentan actuar contra su rabia deben superar tiradas de Voluntad.',
        silverDescription: 'Alergia severa a la plata: cualquier arma de plata suma +20 al daño y anula sus poderes de regeneración.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 130 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 130 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 120 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 80 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 120 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 60 }
        }
    }
};

export function getWerewolfSubtypeConfig(subtype?: string | null): WerewolfSubtypeConfig {
    if (subtype && subtype in WEREWOLF_SUBTYPES) {
        return WEREWOLF_SUBTYPES[subtype as WerewolfSubtypeId];
    }
    return WEREWOLF_SUBTYPES.hibrido;
}

/**
 * Construye o actualiza la forma de transición del Hombre Lobo preservando los valores base dentro de los límites de la casta.
 */
export function buildWerewolfTransitionForm(
    subtypeId: WerewolfSubtypeId,
    humanVoluntad: number = 40,
    existingForm?: CharacterForm | null,
    humanBreakdown?: Record<string, any> | null
): CharacterForm {
    const config = getWerewolfSubtypeConfig(subtypeId);
    const values: any = {
        Fuerza: 100,
        Constitución: 100,
        Agilidad: 100,
        Inteligencia: 40,
        Percepción: 100,
        Apariencia: 20,
        Voluntad: humanVoluntad
    };
    const breakdown: Record<string, any> = {};
    let totalPcCost = 0;

    TRANSITION_CHARACTERISTICS_ORDER.forEach(({ id, key }) => {
        const statCfg = config.transitionStats[id];
        const prevBreakdown = existingForm?.attributes?.breakdown?.[id] as any;
        const prevValue = (existingForm?.attributes?.values as any)?.[key];
        const humanChar = humanBreakdown?.[id];

        const originMod = humanChar ? (humanChar.originMod || 0) : (prevBreakdown?.originMod || 0);
        const specialtyMod = humanChar ? (humanChar.specialtyMod || 0) : (prevBreakdown?.specialtyMod || 0);
        const powerMod = humanChar ? (humanChar.powerMod || 0) : (prevBreakdown?.powerMod || 0);
        const otherMod = prevBreakdown?.otherMod || 0;

        let rawBase = statCfg.base;
        if (prevBreakdown) {
            if (typeof prevBreakdown.invested === 'number' && prevBreakdown.invested > 0 && prevBreakdown.base === statCfg.base) {
                rawBase = statCfg.base + prevBreakdown.invested;
            } else if (typeof prevBreakdown.base === 'number') {
                rawBase = prevBreakdown.base;
            }
        } else if (typeof prevValue === 'number') {
            rawBase = prevValue - originMod - specialtyMod - powerMod - otherMod;
        }

        const clampedBase = Math.max(statCfg.base, Math.min(statCfg.max, rawBase));

        const totalVal = clampedBase + originMod + specialtyMod + powerMod + otherMod;
        values[key] = totalVal;

        breakdown[id] = {
            base: clampedBase,
            originMod,
            specialtyMod,
            powerMod,
            otherMod,
            min: statCfg.base,
            max: statCfg.max
        };

        totalPcCost += Math.max(0, clampedBase - statCfg.base) / 10;
    });

    return {
        ...(existingForm?.combatstats ? { combatstats: existingForm.combatstats } : {}),
        ...(existingForm?.otherstats ? { otherstats: existingForm.otherstats } : {}),
        id: WEREWOLF_TRANSITION_FORM_ID,
        name: `Forma de Transición (${config.shortName})`,
        source: 'Hombre Lobo',
        subtype: subtypeId,
        cost: Number(totalPcCost.toFixed(2)),
        attributes: {
            values,
            breakdown
        }
    };
}

/**
 * Comprueba si el personaje tiene el origen/subtipo Hombre Lobo
 */
export function hasHombreLobo(characterData?: any): boolean {
    if (!characterData) return false;
    const origins = characterData.origin?.items || characterData.origins || [];
    return origins.some((item: any) => {
        const originName = Object.keys(item)[0];
        if (originName === 'Hombre Lobo') return true;
        const content = item[originName];
        return Array.isArray(content) && content.includes('Hombre Lobo');
    });
}

/**
 * Comprueba si el personaje tiene otro origen/subtipo que permita adquirir o subir de rango poderes Sobrenaturales
 */
export function hasOtherSobrenaturalPowerOrigin(characterData?: any): boolean {
    if (!characterData) return false;
    const origins = characterData.origin?.items || characterData.origins || [];
    const allowedSubtypes = [
        'Semidemonio',
        'Maldito',
        'Poseidó',
        'Poseido',
        'Poseído',
        'Híbrido mitológico',
        'Dotado',
        'Dios',
        'Dios menor',
        'Semidios'
    ];
    return origins.some((item: any) => {
        const originName = Object.keys(item)[0];
        if (originName === 'Maldito' || originName === 'Divino') return true;
        const content = item[originName];
        return Array.isArray(content) && content.some((sub: string) => allowedSubtypes.includes(sub));
    });
}

/**
 * Sincroniza el estado de Hombre Lobo (werewolfParams, forma de transición en forms, y poderes innatos).
 * Devuelve un objeto parcial con los campos actualizados si hubo cambios, o null si ya está sincronizado.
 */
export function syncWerewolfState(data: any): Record<string, any> | null {
    const isWerewolf = hasHombreLobo(data);
    const currentForms: CharacterForm[] = Array.isArray(data?.forms) ? data.forms : [];
    const currentPowers: any[] = Array.isArray(data?.powers?.selected) ? data.powers.selected : [];

    if (!isWerewolf) {
        const hasWerewolfForm = currentForms.some(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
        const hasWerewolfPowers = currentPowers.some(p => p.isWerewolfInnate);
        const hasParams = data?.werewolfParams !== null && data?.werewolfParams !== undefined;

        if (!hasWerewolfForm && !hasWerewolfPowers && !hasParams) {
            return null;
        }

        return {
            werewolfParams: null,
            forms: currentForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID),
            powers: {
                ...(data?.powers || {}),
                selected: currentPowers.filter(p => !p.isWerewolfInnate)
            }
        };
    }

    const subtype: WerewolfSubtypeId = (data?.werewolfParams?.subtype && data.werewolfParams.subtype in WEREWOLF_SUBTYPES)
        ? data.werewolfParams.subtype
        : 'hibrido';

    const config = getWerewolfSubtypeConfig(subtype);
    const humanVoluntad = Number(data?.attributes?.values?.Voluntad) || 40;

    let changed = false;
    const updates: Record<string, any> = {};

    // 1. Check werewolfParams
    if (!data?.werewolfParams || data.werewolfParams.subtype !== subtype) {
        updates.werewolfParams = { subtype };
        changed = true;
    }

    // 2. Check werewolf_transition form
    const existingForm = currentForms.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
    const updatedForm = buildWerewolfTransitionForm(subtype, humanVoluntad, existingForm, data?.attributes?.breakdown);

    if (
        !existingForm ||
        existingForm.subtype !== updatedForm.subtype ||
        existingForm.cost !== updatedForm.cost ||
        JSON.stringify(existingForm.attributes) !== JSON.stringify(updatedForm.attributes)
    ) {
        const otherForms = currentForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        updates.forms = [updatedForm, ...otherForms];
        changed = true;
    }

    // 3. Check innate powers
    const canModifySobrenatural = hasOtherSobrenaturalPowerOrigin(data);
    let nextPowers = [...currentPowers];
    let powersChanged = false;

    const ensureInnatePower = (
        id: string,
        targetFreeRank: number,
        extraProps: Record<string, any> = {},
        prevFreeRanks: number[] = []
    ) => {
        const idx = nextPowers.findIndex(p => p.id === id && (p.isWerewolfInnate || p.origin === 'Sobrenatural'));
        if (idx === -1) {
            nextPowers.push({
                id,
                origin: 'Sobrenatural',
                rank: targetFreeRank,
                skillValue: 0,
                isWerewolfInnate: true,
                ...extraProps
            });
            powersChanged = true;
        } else {
            const existing = nextPowers[idx];
            const desiredRank = canModifySobrenatural
                ? (prevFreeRanks.includes(existing.rank) ? targetFreeRank : Math.max(targetFreeRank, existing.rank))
                : targetFreeRank;
            if (!existing.isWerewolfInnate || existing.rank !== desiredRank) {
                nextPowers[idx] = {
                    ...existing,
                    isWerewolfInnate: true,
                    rank: desiredRank
                };
                powersChanged = true;
            }
        }
    };

    // Multiformidad (Teriomorfismo: lobo) - Rango Elevado (41)
    ensureInnatePower('multiformidad', 41, {
        customizations: [{ id: 'lobo_teriomorfismo', description: 'Teriomorfismo (lobo)', cost: 0 }]
    });

    // Regeneración de tejidos - Elevado (41) o Alto (71 para Renegado)
    ensureInnatePower(
        'regeneracion_de_tejidos',
        config.regenRank,
        {},
        config.regenRank === 71 ? [41] : [71]
    );

    // Ataque especial (Arma Natural) - Bajo (1) o Medio (21 para Renegado)
    ensureInnatePower(
        'ataque_especial',
        config.naturalWeaponRank,
        {
            selectedOption: 'Arma Natural',
            customizations: [{ id: 'lobo_garras', description: 'Garras y colmillos (en forma híbrida)', cost: 0 }]
        },
        config.naturalWeaponRank === 21 ? [1] : [21]
    );

    // Poderes exclusivos de Puro: Empatía animal (21) y Donación de vida (41)
    if (config.hasPurePowers) {
        ensureInnatePower('empatia_animal', 21);
        ensureInnatePower('donacion_de_vida', 41);
    } else {
        const beforeLen = nextPowers.length;
        nextPowers = nextPowers.filter(
            p => !(p.isWerewolfInnate && (p.id === 'empatia_animal' || p.id === 'donacion_de_vida'))
        );
        if (nextPowers.length !== beforeLen) {
            powersChanged = true;
        }
    }

    // Si no tiene otro origen que permita poderes Sobrenaturales, eliminar poderes Sobrenaturales no innatos
    if (!canModifySobrenatural) {
        const beforeFilter = nextPowers.length;
        nextPowers = nextPowers.filter(p => p.origin !== 'Sobrenatural' || p.isWerewolfInnate);
        if (nextPowers.length !== beforeFilter) {
            powersChanged = true;
        }
    }

    if (powersChanged) {
        updates.powers = {
            ...(data?.powers || {}),
            selected: nextPowers
        };
        changed = true;
    }

    return changed ? updates : null;
}

/**
 * Devuelve una vista proyectada del personaje aplicando los atributos y habilidades recalculadas de la forma activa.
 */
export function getCharacterForActiveForm(character: any, activeFormId: string): any {
    if (!activeFormId || activeFormId === 'base') return character;
    const forms: CharacterForm[] = Array.isArray(character?.forms) ? character.forms : [];
    const activeForm = forms.find(f => f.id === activeFormId);
    if (!activeForm) return character;

    const origins = character.origin?.items || [];
    const baseAttrs = character.attributes?.values || {};
    const formAttrs = {
        ...baseAttrs,
        ...(activeForm.attributes?.values || {}),
        Voluntad: activeForm.attributes?.values?.Voluntad ?? baseAttrs.Voluntad ?? 40
    };

    const baseGeneral = calculateGeneralSkillValues(
        baseAttrs,
        origins,
        character.skills?.generalManualMods || {},
        character.skills?.manualBases || {}
    );
    const formGeneralMin = calculateGeneralSkillValues(
        formAttrs,
        origins,
        character.skills?.generalManualMods || {},
        {}
    );

    const adjustedManualBases: Record<string, number> = {};
    Object.keys(formGeneralMin.skills).forEach(skillId => {
        const humanSkill = baseGeneral.skills[skillId];
        const formSkill = formGeneralMin.skills[skillId];
        const humanExtra = humanSkill ? Math.max(0, humanSkill.base - humanSkill.minBase) : 0;
        adjustedManualBases[skillId] = formSkill.minBase + humanExtra;
    });

    const finalFormGeneral = calculateGeneralSkillValues(
        formAttrs,
        origins,
        character.skills?.generalManualMods || {},
        adjustedManualBases
    );

    const nativeLanguage = character.skills?.nativeLanguage || '';
    const generalItems = Object.keys(finalFormGeneral.skills).map(id => {
        const skillDef = GENERAL_SKILLS.find(s => s.id === id);
        const val = finalFormGeneral.skills[id];
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

    let specialItems = character.skills?.specialItems || [];
    const selected = character.skills?.selected || {};
    const specified = character.skills?.specified || {};
    if (Object.keys(selected).length > 0 || Object.keys(specified).length > 0) {
        const formSpecial = calculateSpecialSkillValues(formAttrs, origins, selected, specified);
        const stdFormatted = Object.keys(selected).map(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            const val = formSpecial.standard[skillId];
            if (!val) return null;
            return {
                name: skillDef?.name || skillId,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        }).filter(Boolean);

        const specFormatted = Object.keys(specified).map(uniqueId => {
            const spec = specified[uniqueId];
            const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
            const val = formSpecial.specified[uniqueId];
            if (!val) return null;
            return {
                name: `${skillDef?.name}: ${spec.specification}`,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        }).filter(Boolean);

        specialItems = [...stdFormatted, ...specFormatted];
    }

    const updatedSkills = {
        ...(character.skills || {}),
        generalItems,
        specialItems
    };

    const rawDerived = calculateDerivedStats(
        formAttrs,
        origins,
        updatedSkills,
        character.level,
        character.modPerLevel
    );
    const { combatStats: calcCombat, otherStats: calcOther } = formatDerivedStats(rawDerived);

    return {
        ...character,
        attributes: {
            ...activeForm.attributes,
            values: formAttrs,
            cost: activeForm.cost
        },
        combatstats: applyStatsOverrides(calcCombat, activeForm.combatstats),
        otherstats: applyStatsOverrides(calcOther, activeForm.otherstats),
        skills: updatedSkills
    };
}
