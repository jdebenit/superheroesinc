import { POWERS, type Power, type PowerType } from '../../data/powers';
import { hasHombreLobo } from '../../data/werewolfOptions';
import type { SelectedPower } from '../../types/character';
import { hasSubtype, isGuardian, isMaldito } from './originFlags';
import { calculateSkillBase as calculateSkillBaseFromAttrs } from './skillCalculations';

/**
 * Normalizes a power ID or name for case/accent/symbol-insensitive comparison.
 */
export const normalizePowerId = (id: string): string => {
    if (!id) return '';
    return id
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Known errata / legacy power name mappings to canonical ID and option.
 */
export const POWER_ERRATA_MAP: Record<string, { id: string; option?: string }> = {
    control_de_la_energia_cinetica: { id: 'control_de_energia', option: 'Cinética' },
    control_de_la_energia_cinética: { id: 'control_de_energia', option: 'Cinética' },
    controldelaenergiacinetica: { id: 'control_de_energia', option: 'Cinética' },
    controldeenergiacinetica: { id: 'control_de_energia', option: 'Cinética' },
    emision_de_energia_magica: { id: 'emision_de_energia', option: 'Mágica' },
    emisión_de_energía_mágica: { id: 'emision_de_energia', option: 'Mágica' },
    emisiondeenergiamagica: { id: 'emision_de_energia', option: 'Mágica' }
};

export const getPowerErrata = (nameOrId: string): { id: string; option?: string } | undefined => {
    if (!nameOrId) return undefined;
    const norm = normalizePowerId(nameOrId);
    const lower = nameOrId.toLowerCase().trim();
    return POWER_ERRATA_MAP[norm] || POWER_ERRATA_MAP[lower];
};

/**
 * Finds a Power definition by ID or Name, consulting POWER_ERRATA_MAP.
 */
export const findPowerByNameOrId = (nameOrId: string): Power | undefined => {
    if (!nameOrId) return undefined;
    const norm = normalizePowerId(nameOrId);
    if (!norm) return undefined;

    const errata = getPowerErrata(nameOrId);
    if (errata) {
        return POWERS.find(kp => kp.id === errata.id);
    }
    return POWERS.find(kp => normalizePowerId(kp.id) === norm || normalizePowerId(kp.name) === norm);
};

/**
 * Normalizes a character's powers object (supporting both `powers.selected` and legacy `powers.items`).
 */
export const normalizeCharacterPowers = (powersObj: any): any[] => {
    if (!powersObj) return [];

    if (Array.isArray(powersObj.selected)) {
        return powersObj.selected.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.id || p.name);
            const errata = getPowerErrata(p.id || p.name);
            return {
                ...p,
                id: knownPower?.id || p.id,
                selectedOption: p.selectedOption || errata?.option || '',
                rank: typeof p.rank === 'number' ? p.rank : parseInt(p.rank, 10) || 1
            };
        });
    }

    if (Array.isArray(powersObj.items)) {
        return powersObj.items.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.name || p.id);
            const errata = getPowerErrata(p.name || p.id);
            const id = knownPower?.id || p.id || `custom_${Math.random().toString(36).substr(2, 9)}`;

            let skillValue = 0;
            let powerMod = 0;

            if (typeof p.value === 'string') {
                const parsed = parseInt(p.value.replace(/\D/g, ''), 10);
                if (!isNaN(parsed)) {
                    if (knownPower?.characteristic) {
                        powerMod = parsed;
                    } else {
                        skillValue = parsed;
                    }
                }
            } else if (typeof p.value === 'number') {
                if (knownPower?.characteristic) {
                    powerMod = p.value;
                } else {
                    skillValue = p.value;
                }
            }

            return {
                id,
                name: p.name,
                rank: p.rank || 1,
                skillValue,
                powerMod,
                selectedOption: p.selectedOption || errata?.option || '',
                customizations: p.customizations || [],
                effect: p.notes
            };
        });
    }

    return [];
};

/**
 * Get the value of a characteristic from character data.
 */
export const getCharacteristicValue = (data: any, charName: string): number => {
    return data?.attributes?.values?.[charName] || 0;
};

/**
 * Calculate power skill base value from a formula string (e.g. "(PER+VOL)/2") using character object.
 */
export const calculateSkillBase = (data: any, formula: string): number => {
    if (!formula) return 0;

    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            FUE: 'Fuerza',
            AGI: 'Agilidad',
            CON: 'Constitución',
            INT: 'Inteligencia',
            PER: 'Percepción',
            VOL: 'Voluntad',
            APA: 'Apariencia'
        };
        return getCharacteristicValue(data, map[abbr] || '');
    };

    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)()) || 0;
    } catch {
        return 0;
    }
};

export const calculatePowerSkillBase = calculateSkillBase;

/**
 * Get the rank level name based on rank value.
 */
export const getRankLevel = (rank: number): string => {
    if (rank <= 20) return 'Bajo';
    if (rank <= 40) return 'Medio';
    if (rank <= 70) return 'Elevado';
    if (rank <= 95) return 'Alto';
    return 'Cósmico';
};

/**
 * Context for calculating power costs based on origin/subtype.
 */
export interface PowerContext {
    isParahumanoHybrid?: boolean;
    isTesKhar?: boolean;
    isAtlante?: boolean;
    isTroll?: boolean;
    isSemidemonio?: boolean;
    isThalsDiscount?: boolean;
    isThalsFree?: boolean;
    isEnano?: boolean;
    isGrifo?: boolean;
    isElfoFisico?: boolean;
    isHadaEter?: boolean;
    isHadaAire?: boolean;
    isHadaFuego?: boolean;
    isHadaAgua?: boolean;
    isHadaTierra?: boolean;
    isHombreLobo?: boolean;
    werewolfSubtype?: string;
    canModifySobrenatural?: boolean;
}

/**
 * Configuration returned for power cost display.
 */
export interface PowerCostConfig {
    freeRank: number;
    baseCostAdjustment: number;
    isFixedCost: boolean;
}

/**
 * Centralized logic to determine power cost configuration.
 */
export const getPowerCostConfig = (power: any, selection: SelectedPower, context: PowerContext): PowerCostConfig => {
    const {
        isTesKhar, isAtlante, isTroll,
        isThalsFree, isGrifo, isElfoFisico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra
    } = context;

    const config: PowerCostConfig = {
        freeRank: 0,
        baseCostAdjustment: 0,
        isFixedCost: false
    };

    // Check Hombre Lobo innate powers
    if (selection.isWerewolfInnate || context.isHombreLobo) {
        const sub = context.werewolfSubtype || 'hibrido';
        if (power.id === 'multiformidad' && selection.isWerewolfInnate) {
            config.freeRank = 41;
            return config;
        }
        if (power.id === 'regeneracion_de_tejidos' && selection.isWerewolfInnate) {
            config.freeRank = sub === 'renegado' ? 71 : 41;
            return config;
        }
        if (power.id === 'ataque_especial' && (selection.isWerewolfInnate || selection.selectedOption === 'Arma Natural')) {
            config.freeRank = sub === 'renegado' ? 21 : 1;
            return config;
        }
        if (power.id === 'empatia_animal' && (selection.isWerewolfInnate || sub === 'puro')) {
            config.freeRank = 21;
            return config;
        }
        if (power.id === 'donacion_de_vida' && (selection.isWerewolfInnate || sub === 'puro')) {
            config.freeRank = 41;
            return config;
        }
    }

    // 1. Check for Free Ranks (Atlante, Grifo, Hadas, Elfo Fisico, Troll, Tes-Khar)
    const isTesKharFree = isTesKhar && power.id === 'superhabilidad';
    const isTrollFree = isTroll && power.id === 'regeneracion_de_tejidos';
    const isElfoFisicoFree = isElfoFisico && power.id === 'supervelocidad';
    const isHadaAireSpeedFree = isHadaAire && power.id === 'supervelocidad';

    // 2. Check for Thals Free (Cost 0)
    if (isThalsFree) {
        config.isFixedCost = true;
        return config;
    }

    // 3. Check for Free Ranks (Atlante, Grifo, Hadas)
    const isHadaFlyFree = (isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra) && power.id === 'volar';
    const isHadaFuegoFree = isHadaFuego && power.id === 'control_del_fuego';
    const isHadaAguaFree = isHadaAgua && power.id === 'control_del_agua';
    const isHadaTierraFree = isHadaTierra && (power.id === 'control_de_la_vegetacion' || power.id === 'control_de_la_geodinamica');
    const isAtlanteFree = isAtlante && (power.id === 'superhabilidad' || power.id === 'control_del_agua' || power.id === 'empatia_animal');
    const isGrifoFree = isGrifo && power.id === 'volar';

    if (
        isTesKharFree || isTrollFree || isElfoFisicoFree || isHadaAireSpeedFree ||
        isAtlanteFree || isGrifoFree || isHadaFlyFree || isHadaFuegoFree ||
        isHadaAguaFree || isHadaTierraFree
    ) {
        if (power.id === 'control_del_agua' && isAtlante) config.freeRank = 11;
        else if (power.id === 'control_del_agua' && isHadaAgua) config.freeRank = 21;
        else if (power.id === 'control_del_fuego' && isHadaFuego) config.freeRank = 21;
        else if ((power.id === 'control_de_la_vegetacion' || power.id === 'control_de_la_geodinamica') && isHadaTierra) config.freeRank = 11;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Idioma nativo') config.freeRank = 41;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Nadar') config.freeRank = 81;
        else if (power.id === 'empatia_animal' && isAtlante) config.freeRank = 11;
        else if (isGrifo && power.id === 'volar') config.freeRank = 11;
        else if (isHadaFlyFree && power.id === 'volar') config.freeRank = 11;
        else if (isTrollFree) config.freeRank = 81;
        else if (isTesKharFree) config.freeRank = 11;
        else if (isElfoFisicoFree || isHadaAireSpeedFree) config.freeRank = 1;
    }

    return config;
};

/**
 * Get total base cost adjustment for display and calculation purposes.
 */
export const getBaseCostAdjustment = (power: any, selection: SelectedPower, context: PowerContext, penaltyInfo: any): number => {
    let adjustment = 0;

    if (penaltyInfo && penaltyInfo.type !== 'none') {
        adjustment += penaltyInfo.cost;
    }

    if (context.isParahumanoHybrid && selection.origin === 'Alterado') {
        adjustment += 3;
    }
    if (context.isEnano && selection.origin === 'Guardian') {
        adjustment += 2;
    }

    if (context.isSemidemonio && selection.origin === 'Sobrenatural') {
        adjustment -= 1;
    } else if (context.isThalsDiscount) {
        adjustment -= 2;
    }

    return adjustment;
};

/**
 * Calculate the final base cost of a power including all modifiers.
 */
export const calculatePowerBaseCost = (power: any, selection: SelectedPower, context: PowerContext, penaltyInfo: any): number => {
    const config = getPowerCostConfig(power, selection, context);
    const { isAtlante, isGrifo } = context;

    if (config.isFixedCost) return 0;

    let baseCost = power.cost;
    const adjustment = getBaseCostAdjustment(power, selection, context, penaltyInfo);
    baseCost += adjustment;
    baseCost = Math.max(0, baseCost);

    if (isAtlante) {
        if (power.id === 'control_del_agua') baseCost = -1.1;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Idioma nativo') baseCost = -4.1;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Nadar') baseCost = -8.1;
        else if (power.id === 'empatia_animal') baseCost = -1.1;
    } else if (isGrifo && power.id === 'volar') {
        baseCost = -1.1;
    } else if (config.freeRank > 0) {
        baseCost = -(config.freeRank * 0.1);
    }

    return baseCost;
};

/**
 * Get allowed Mutant power types based on character origin/subtypes.
 */
export const getMutantPowerTypes = (data: any): PowerType[] => {
    const mutantOrigin = data?.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (mutantOrigin) {
        const subtypes = mutantOrigin['Mutante'];
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            const subtype = subtypes[0];
            if (subtype === 'Psíquico') return ['Psíquico'];
            if (subtype === 'Energético') return ['Energético'];
            if (subtype === 'Físico') return ['Físico'];
            if (subtype === 'Psíquico/Energético') return ['Psíquico', 'Energético'];
            if (subtype === 'Energético/Físico') return ['Energético', 'Físico'];
            if (subtype === 'Psíquico/Físico') return ['Psíquico', 'Físico'];
        }
    }

    const sobrenaturalOrigin = data?.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Sobrenatural'
    );

    if (sobrenaturalOrigin) {
        const subtypes = sobrenaturalOrigin['Sobrenatural'];
        if (Array.isArray(subtypes) && subtypes.includes('Ente')) {
            return ['Psíquico', 'Energético'];
        }
    }

    return [];
};

/**
 * Get the primary mutant type from character origin (Físico, Psíquico, or Energético).
 */
export const getMutantType = (data: any): PowerType | null => {
    const mutantOrigin = data?.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (mutantOrigin) {
        const subtypes = mutantOrigin['Mutante'];
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            const subtype = subtypes[0];
            if (subtype === 'Psíquico') return 'Psíquico';
            if (subtype === 'Energético') return 'Energético';
            if (subtype === 'Físico') return 'Físico';
        }
    }

    return null;
};

/**
 * Check if a power is cross-type for a mutant.
 */
export const isPowerCrossType = (data: any, powerId: string): boolean => {
    const mutantType = getMutantType(data);
    if (!mutantType) return false;

    const power = POWERS.find(p => p.id === powerId);
    if (!power) return false;

    return !power.types.includes(mutantType);
};

/**
 * Get power penalty information based on character data and power.
 */
export const getPowerPenalty = (data: any, power: any): { cost: number; label: string; type: 'cross-origin' | 'cross-type' | 'none' } => {
    if (!data || !power) return { cost: 0, label: '', type: 'none' };

    // 1. Check Mutant Cross-Type
    if (isPowerCrossType(data, power.id)) {
        return { cost: 2, label: '+2 PC (Otro tipo)', type: 'cross-type' };
    }

    // 2. Check Guardián Cross-Origin
    if (isGuardian(data)) {
        const isGuardianPower = power.origins?.some((o: string) => o === 'Guardián' || o === 'Guardian');
        if (!isGuardianPower) {
            return { cost: 3, label: '+3 PC (Otro origen)', type: 'cross-origin' };
        }
    }

    // 3. Check Maldito Cross-Origin
    if (isMaldito(data)) {
        const isSobrenaturalPower = power.origins?.includes('Sobrenatural');
        if (!isSobrenaturalPower) {
            return { cost: 1, label: '+1 PC (Otro origen)', type: 'cross-origin' };
        }
    }

    // 4. Check Divino Cross-Origin (+3 PC unless hasPhysicalAlteration)
    const isDivino = hasSubtype(data, 'Divino', 'Dios') ||
        hasSubtype(data, 'Divino', 'Dios menor') ||
        hasSubtype(data, 'Divino', 'Semidios');
    if (isDivino) {
        const isDivinoPower = power.origins?.includes('Divino');
        if (!isDivinoPower) {
            const hasPhysicalAlteration = data.divineParams?.hasPhysicalAlteration === true &&
                (data.divineParams?.physicalAlterationDescription || '').trim().length > 0;
            if (!hasPhysicalAlteration) {
                return { cost: 3, label: '+3 PC (Otro origen)', type: 'cross-origin' };
            }
        }
    }

    return { cost: 0, label: '', type: 'none' };
};

/**
 * Calculates total PC cost of all selected powers for a character.
 */
export const calculateTotalPowersPC = (character: any): number => {
    const selectedPowers = character?.powers?.selected || [];
    if (!selectedPowers.length) return 0;

    let tesKharFreeUsed = false;
    let atlanteAnimalUsed = false;
    let atlanteSuperUsed = false;
    let atlanteSwimmingUsed = false;
    let atlanteEmpathyUsed = false;
    let trollRegenUsed = false;
    let thalsPowerCount = 0;

    return selectedPowers.reduce((acc: number, power: any) => {
        const powerData = POWERS.find((p: any) => p.id === power.id);
        if (!powerData) return acc;

        const isTesKhar = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return Array.isArray(val) && val.includes('Tes-khar');
            })
        );

        const isAtlante = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return Array.isArray(val) && val.includes('Atlante');
            })
        );

        const isTroll = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return Array.isArray(val) && val.includes('Troll');
            })
        );

        const isSemidemonio = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Sobrenatural' && Array.isArray(val) && val.includes('Semidemonio');
            })
        );

        const isThals = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Parahumano' && Array.isArray(val) && val.includes('Thals');
            })
        );

        if (isTesKhar && power.id === 'superhabilidad' && !tesKharFreeUsed) {
            tesKharFreeUsed = true;
            return acc;
        }

        if (isAtlante) {
            if (power.id === 'control_del_agua' && !atlanteAnimalUsed) {
                atlanteAnimalUsed = true;
                const rankDiff = (power.rank || 1) - 11;
                return acc + (rankDiff * 0.1);
            }

            if (power.id === 'superhabilidad') {
                if (power.selectedOption === 'Idioma nativo' && !atlanteSuperUsed) {
                    atlanteSuperUsed = true;
                    const rankDiff = (power.rank || 1) - 41;
                    return acc + (rankDiff * 0.1);
                }
                if (power.selectedOption === 'Nadar' && !atlanteSwimmingUsed) {
                    atlanteSwimmingUsed = true;
                    const rankDiff = (power.rank || 1) - 81;
                    return acc + (rankDiff * 0.1);
                }
            }

            if (power.id === 'empatia_animal' && !atlanteEmpathyUsed) {
                atlanteEmpathyUsed = true;
                const rankDiff = (power.rank || 1) - 11;
                return acc + (rankDiff * 0.1);
            }
        }

        if (isTroll && power.id === 'regeneracion_de_tejidos' && !trollRegenUsed) {
            trollRegenUsed = true;
            return acc;
        }

        const isGrifo = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Arcano' && Array.isArray(val) && val.includes('Grifo');
            })
        );

        if (isGrifo && power.id === 'volar') {
            const rankDiff = (power.rank || 1) - 11;
            return acc + (rankDiff * 0.1);
        }

        if (hasHombreLobo(character) && power.isWerewolfInnate) {
            const wwSubtype = character.werewolfParams?.subtype || 'hibrido';
            let freeRank = 0;
            if (power.id === 'multiformidad') freeRank = 41;
            else if (power.id === 'regeneracion_de_tejidos') freeRank = wwSubtype === 'renegado' ? 71 : 41;
            else if (power.id === 'ataque_especial') freeRank = wwSubtype === 'renegado' ? 21 : 1;
            else if (power.id === 'empatia_animal' && wwSubtype === 'puro') freeRank = 21;
            else if (power.id === 'donacion_de_vida' && wwSubtype === 'puro') freeRank = 41;

            if (freeRank > 0) {
                const rankDiff = Math.max(0, (power.rank || freeRank) - freeRank);
                const custCost = (power.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                return acc + (rankDiff * 0.1) + custCost;
            }
        }

        let cost = powerData.cost;
        const penalty = getPowerPenalty(character, powerData);
        if (penalty.cost > 0) {
            cost += penalty.cost;
        }

        const isSemidemonioBonus = isSemidemonio && power.origin === 'Sobrenatural';
        if (isSemidemonioBonus && !powerData.characteristic) {
            cost = Math.max(0, cost - 1);
        }

        if (isThals && power.origin === 'Thals') {
            thalsPowerCount++;
            if (thalsPowerCount === 1) {
                cost = 0;
            } else {
                cost = Math.max(0, cost - 2);
            }
        }

        const isEnano = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Arcano' && Array.isArray(val) && val.includes('Enano');
            })
        );
        if (isEnano && power.origin === 'Guardian') {
            cost += 2;
        }

        if (character.isParahumanoHybrid && power.origin === 'Alterado') {
            cost += 3;
        }

        if (!powerData.characteristic) {
            const rank = power.rank || 1;
            cost += rank * 0.1;

            if (powerData.skillCalc && power.skillValue) {
                const minVal = calculateSkillBase(character, powerData.skillCalc);
                if (power.skillValue > minVal) {
                    cost += (power.skillValue - minVal) * 0.1;
                }
            }
        } else {
            const powerMod = power.powerMod || 0;
            let modCost = powerMod;

            if (isSemidemonioBonus) {
                modCost = Math.max(0, modCost - 10);
            }

            cost += modCost / 10;
        }

        const custCost = (power.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
        cost += custCost;

        return acc + cost;
    }, 0);
};

/**
 * Formats a character's powers for display in CharacterSheet and PDF export.
 */
export const formatPowersForDisplay = (
    character: any
): Array<{ name: string; cost: string; val: string; rank: string; notes: string }> => {
    return (character?.powers?.selected || []).map((p: any) => {
        const powerData = findPowerByNameOrId(p.id || p.name);
        const baseName = powerData ? powerData.name : (p.name || '');
        const displayName = p.selectedOption ? `${baseName} (${p.selectedOption})` : baseName;

        let customNotes = '';
        if (p.customizations && p.customizations.length > 0) {
            const custTexts = p.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`);
            customNotes = custTexts.join(', ');
        }
        const finalDisplayName = customNotes ? `${displayName} [${customNotes}]` : displayName;

        const formatRankStr = (r: any) => {
            if (powerData?.characteristic) return '';
            if (r !== undefined && r !== null && r !== '') {
                const rankNum = Number(r);
                if (!isNaN(rankNum)) {
                    return `${getRankLevel(rankNum)} (${r})`;
                }
                return r.toString();
            }
            return '';
        };

        if (p.val || p.value) {
            return {
                name: finalDisplayName,
                cost: (p.cost !== undefined ? p.cost : (powerData?.cost || 0)).toString(),
                val: (p.value || p.val).toString(),
                rank: formatRankStr(p.rank),
                notes: p.effect || ''
            };
        }

        const isHybridPenalty = character?.isParahumanoHybrid && p.origin === 'Alterado';
        const isSemidemonio = character?.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Sobrenatural' && Array.isArray(val) && val.includes('Semidemonio');
            })
        );
        const isSemidemonioBonus = isSemidemonio && p.origin === 'Sobrenatural';

        let costVal = 0;
        let finalVal = '';

        if (powerData) {
            let baseCost = powerData.cost || 0;
            if (isSemidemonioBonus && !powerData.characteristic) {
                baseCost = Math.max(0, baseCost - 1);
            }
            const penalty = isHybridPenalty ? 3 : 0;

            if (!powerData.characteristic) {
                const rank = p.rank || 1;
                const minVal = powerData.skillCalc
                    ? calculateSkillBaseFromAttrs(character?.attributes?.values || {}, character?.origin?.items || [], powerData.skillCalc)
                    : 0;
                const currentVal = p.skillValue || minVal;
                const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal = baseCost + penalty + (rank * 0.1) + extraCost + custCost;
                finalVal = currentVal.toString();
            } else {
                const powerMod = p.powerMod || 0;
                let modCost = powerMod / 10;
                if (isSemidemonioBonus) {
                    modCost = Math.max(0, (powerMod - 10) / 10);
                }
                costVal = baseCost + penalty + modCost;
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal += custCost;
                finalVal = powerMod.toString();
            }
        } else {
            costVal = p.cost || 0;
            finalVal = (p.skillValue !== undefined ? p.skillValue : (p.powerMod || '')).toString();
        }

        return {
            name: finalDisplayName,
            cost: costVal.toFixed(1),
            val: finalVal,
            rank: formatRankStr(p.rank),
            notes: p.effect || ''
        };
    });
};
