import { GENERAL_SKILLS } from '../../data/generalSkills';
import { SPECIAL_SKILLS } from '../../data/specialSkills';
import {
    WEREWOLF_SUBTYPES,
    POWER_TRANSFORMATIONS,
    TRANSITION_CHARACTERISTICS_ORDER,
    WEREWOLF_TRANSITION_FORM_ID,
    type WerewolfSubtypeId,
    type WerewolfSubtypeConfig,
    type PowerTransformationConfig,
    type CharacterForm
} from '../../data/werewolfOptions';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from './skillCalculations';
import { calculateDerivedStats, formatDerivedStats, applyStatsOverrides } from './derivedStatsCalculations';

export function getWerewolfSubtypeConfig(subtype?: string | null): WerewolfSubtypeConfig {
    if (subtype && subtype in WEREWOLF_SUBTYPES) {
        return WEREWOLF_SUBTYPES[subtype as WerewolfSubtypeId];
    }
    return WEREWOLF_SUBTYPES.hibrido;
}

export function getPowerTransformationConfig(formId?: string | null): PowerTransformationConfig | undefined {
    if (!formId) return undefined;
    return POWER_TRANSFORMATIONS.find(cfg => cfg.formId === formId);
}

export function hasPowerTransformation(characterData: any, powerId: string): boolean {
    const selectedPowers: any[] = Array.isArray(characterData?.powers?.selected) ? characterData.powers.selected : [];
    return selectedPowers.some(p => p && p.id === powerId);
}

export function getActivePowerTransformations(characterData: any): PowerTransformationConfig[] {
    return POWER_TRANSFORMATIONS.filter(cfg => hasPowerTransformation(characterData, cfg.powerId));
}

/**
 * Construye una forma de transformación basada en un poder (como Blindaje Natural)
 * sumando los bonificadores fijos del poder sobre las características de la Forma Humana.
 */
export function buildPowerTransformationForm(
    config: PowerTransformationConfig,
    humanBreakdown?: Record<string, any> | null,
    humanValues?: Record<string, number> | null,
    existingForm?: CharacterForm | null
): CharacterForm {
    const humanVolChar = humanBreakdown?.voluntad;
    const humanVoluntad = humanVolChar
        ? (humanVolChar.base || 0) + (humanVolChar.originMod || 0) + (humanVolChar.specialtyMod || 0) + (humanVolChar.powerMod || 0) + (humanVolChar.otherMod || 0)
        : (Number(humanValues?.Voluntad) || 40);

    const values: any = {
        Fuerza: 40,
        Constitución: 40,
        Agilidad: 40,
        Inteligencia: 40,
        Percepción: 40,
        Apariencia: 40,
        Voluntad: humanVoluntad + (config.statBonuses.voluntad || 0)
    };
    const breakdown: Record<string, any> = {};

    TRANSITION_CHARACTERISTICS_ORDER.forEach(({ id, key }) => {
        const humanChar = humanBreakdown?.[id];
        const fallbackTotal = Number(humanValues?.[key]) || 40;
        const base = humanChar ? (humanChar.base ?? 40) : fallbackTotal;
        const originMod = humanChar ? (humanChar.originMod || 0) : 0;
        const specialtyMod = humanChar ? (humanChar.specialtyMod || 0) : 0;
        const bonus = config.statBonuses[id] || 0;
        const powerMod = (humanChar ? (humanChar.powerMod || 0) : 0) + bonus;
        const otherMod = humanChar ? (humanChar.otherMod || 0) : 0;

        const totalVal = base + originMod + specialtyMod + powerMod + otherMod;
        values[key] = totalVal;

        breakdown[id] = {
            base,
            originMod,
            specialtyMod,
            powerMod,
            otherMod,
            min: base,
            max: base
        };
    });

    return {
        ...(existingForm?.combatstats ? { combatstats: existingForm.combatstats } : {}),
        ...(existingForm?.otherstats ? { otherstats: existingForm.otherstats } : {}),
        id: config.formId,
        name: config.name,
        source: `Poder: ${config.shortName}`,
        cost: 0,
        attributes: {
            values,
            breakdown
        }
    };
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
 * Comprueba si el personaje tiene el origen/subtipo Hombre Lobo.
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
 * Comprueba si el personaje tiene otro origen/subtipo que permita adquirir o subir de rango poderes Sobrenaturales.
 */
export function hasOtherSobrenaturalPowerOrigin(characterData?: any): boolean {
    if (!characterData) return false;
    const origins = characterData.origin?.items || characterData.origins || [];
    const allowedSubtypes = [
        'Semidemonio',
        'Maldito',
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
 * Sincroniza el estado de transformaciones (Hombre Lobo y transformaciones por poderes como Blindaje Natural).
 * Devuelve un objeto parcial con los campos actualizados si hubo cambios, o null si ya está sincronizado.
 */
export function syncCharacterTransformations(data: any): Record<string, any> | null {
    const isWerewolf = hasHombreLobo(data);
    const currentForms: CharacterForm[] = Array.isArray(data?.forms) ? data.forms : [];
    const currentPowers: any[] = Array.isArray(data?.powers?.selected) ? data.powers.selected : [];

    let changed = false;
    const updates: Record<string, any> = {};
    let nextForms: CharacterForm[] = [...currentForms];

    if (!isWerewolf) {
        const hasWerewolfForm = nextForms.some(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
        const hasWerewolfPowers = currentPowers.some(p => p.isWerewolfInnate);
        const hasParams = data?.werewolfParams !== null && data?.werewolfParams !== undefined;

        if (hasParams) {
            updates.werewolfParams = null;
            changed = true;
        }
        if (hasWerewolfForm) {
            nextForms = nextForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        }
        if (hasWerewolfPowers) {
            updates.powers = {
                ...(data?.powers || {}),
                selected: currentPowers.filter(p => !p.isWerewolfInnate)
            };
            changed = true;
        }
    } else {
        const subtype: WerewolfSubtypeId = (data?.werewolfParams?.subtype && data.werewolfParams.subtype in WEREWOLF_SUBTYPES)
            ? data.werewolfParams.subtype
            : 'hibrido';

        const config = getWerewolfSubtypeConfig(subtype);
        const humanVoluntad = Number(data?.attributes?.values?.Voluntad) || 40;

        // 1. Check werewolfParams
        if (!data?.werewolfParams || data.werewolfParams.subtype !== subtype) {
            updates.werewolfParams = { subtype };
            changed = true;
        }

        // 2. Check werewolf_transition form
        const existingForm = nextForms.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
        const updatedForm = buildWerewolfTransitionForm(subtype, humanVoluntad, existingForm, data?.attributes?.breakdown);
        const otherForms = nextForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        nextForms = [updatedForm, ...otherForms];

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
    }

    // 4. Sync Power Transformations (e.g. Blindaje Natural)
    const effectivePowers = updates.powers?.selected ?? currentPowers;
    const dataWithEffectivePowers = { ...data, powers: { ...(data?.powers || {}), selected: effectivePowers } };
    const activePowerConfigs = getActivePowerTransformations(dataWithEffectivePowers);
    const activePowerFormIds = new Set(activePowerConfigs.map(c => c.formId));
    const allPowerFormIds = new Set(POWER_TRANSFORMATIONS.map(c => c.formId));

    // Remove inactive power transformation forms
    nextForms = nextForms.filter(f => !allPowerFormIds.has(f.id) || activePowerFormIds.has(f.id));

    // Add or update active power transformation forms
    activePowerConfigs.forEach(cfg => {
        const existingPForm = nextForms.find(f => f.id === cfg.formId);
        const builtPForm = buildPowerTransformationForm(
            cfg,
            data?.attributes?.breakdown,
            data?.attributes?.values,
            existingPForm
        );
        const idx = nextForms.findIndex(f => f.id === cfg.formId);
        if (idx === -1) {
            nextForms.push(builtPForm);
        } else {
            nextForms[idx] = builtPForm;
        }
    });

    if (JSON.stringify(currentForms) !== JSON.stringify(nextForms)) {
        updates.forms = nextForms;
        changed = true;
    }

    return changed ? updates : null;
}

export const syncWerewolfState = syncCharacterTransformations;

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
