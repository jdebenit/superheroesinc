import { POWERS, type PowerType } from '../../../../data/powers';
import { ORIGIN_CATEGORIES } from '../../../../data/originDefinitions';
import type { SelectedPower } from './types';

/**
 * Check if character has a specific origin
 */
export const hasOrigin = (data: any, originName: string): boolean => {
    return data.origin?.items?.some((item: any) => Object.keys(item)[0] === originName);
};

/**
 * Check if character has a specific subtype within an origin
 */
export const hasSubtype = (data: any, originName: string, subtypeName: string): boolean => {
    return data.origin?.items?.some((item: any) => {
        const key = Object.keys(item)[0];
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
};

/**
 * Get the value of a characteristic from character data
 */
export const getCharacteristicValue = (data: any, charName: string): number => {
    return data.attributes?.values?.[charName] || 0;
};

/**
 * Calculate Magical Energy (EM) based on characteristics and formula
 */
export const calculateEM = (data: any, selectedPowers: any[] = [], divisor: number = 1): number => {
    let int = Number(getCharacteristicValue(data, 'Inteligencia')) || 0;
    let per = Number(getCharacteristicValue(data, 'Percepción')) || 0;
    let vol = Number(getCharacteristicValue(data, 'Voluntad')) || 0;
    let con = Number(getCharacteristicValue(data, 'Constitución')) || 0;

    // Apply power modifiers
    if (selectedPowers) {
        selectedPowers.forEach(p => {
            const powerData = POWERS.find(power => power.id === p.id);
            if (powerData?.characteristic && p.powerMod) {
                switch (powerData.characteristic) {
                    case 'INT': int += p.powerMod; break;
                    case 'PER': per += p.powerMod; break;
                    case 'VOL': vol += p.powerMod; break;
                    case 'CON': con += p.powerMod; break;
                }
            }
        });
    }

    // If Semidemonio, add CON to the formula
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const conVal = isSemidemonio ? con : 0;

    return Math.floor((int + per + vol + conVal) / divisor);
};

/**
 * Calculate skill base value from a formula string
 */
export const calculateSkillBase = (data: any, formula: string): number => {
    if (!formula) return 0;

    // Map abbreviations to full names
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        return getCharacteristicValue(data, map[abbr] || '');
    };

    try {
        // Replace abbreviations with values
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        // Safe evaluation of simple math formula
        return Math.floor(new Function('return ' + evalFormula)());
    } catch (e) {
        return 0;
    }
};

/**
 * Get the rank level name based on rank value
 */
export const getRankLevel = (rank: number): string => {
    if (rank <= 20) return 'Bajo';
    if (rank <= 40) return 'Medio';
    if (rank <= 70) return 'Elevado';
    if (rank <= 95) return 'Alto';
    return 'Cósmico';
};

/**
 * Context for calculating power costs based on origin/subtype
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
}

/**
 * Configuration returned for power cost display
 */
export interface PowerCostConfig {
    freeRank: number;
    baseCostAdjustment: number; // e.g., -1, -2 for discounts
    isFixedCost: boolean; // if true, cost is 0 (Thals free)
}

/**
 * Centralized logic to determine power cost configuration
 */
export const getPowerCostConfig = (power: any, selection: SelectedPower, context: PowerContext): PowerCostConfig => {
    const {
        isParahumanoHybrid, isTesKhar, isAtlante, isTroll, isSemidemonio,
        isThalsDiscount, isThalsFree, isEnano, isGrifo, isElfoFisico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra
    } = context;

    const config: PowerCostConfig = {
        freeRank: 0,
        baseCostAdjustment: 0,
        isFixedCost: false
    };

    // 1. Check for Free Ranks (Atlante, Grifo, Hadas, Elfo Fisico, Troll, Tes-Khar)
    const isTesKharFree = isTesKhar && power.id === 'superhabilidad';
    const isTrollFree = isTroll && power.id === 'regeneracion_de_tejidos';
    const isElfoFisicoFree = isElfoFisico && power.id === 'supervelocidad';
    const isHadaAireSpeedFree = isHadaAire && power.id === 'supervelocidad';


    // 2. Check for Thals Free (Cost 0)
    if (isThalsFree) {
        config.isFixedCost = true;
        // Effect essentially zero cost
        return config;
    }

    // 3. Check for Free Ranks (Atlante, Grifo, Hadas)
    // These have free ranks up to a certain level
    const isHadaFlyFree = (isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra) && power.id === 'volar';
    const isHadaFuegoFree = isHadaFuego && power.id === 'control_del_fuego';
    const isHadaAguaFree = isHadaAgua && power.id === 'control_del_agua';
    const isHadaTierraFree = isHadaTierra && (power.id === 'control_de_la_vegetacion' || power.id === 'control_de_la_geodinamica');
    const isAtlanteFree = isAtlante && (power.id === 'superhabilidad' || power.id === 'control_del_agua' || power.id === 'empatia_animal');
    const isGrifoFree = isGrifo && power.id === 'volar';

    if (isTesKharFree || isTrollFree || isElfoFisicoFree || isHadaAireSpeedFree || isAtlanteFree || isGrifoFree || isHadaFlyFree || isHadaFuegoFree || isHadaAguaFree || isHadaTierraFree) {
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

        // Base cost adjustment logic for "Free Rank" powers (often -1.1 or similar to offset base cost)
        // This mirrors the original logic: "baseCost = -1.1" etc.
        // We will return the adjustment value. 
        // Original: if (p.id === 'control_del_agua') baseCost = -1.1; -> means cost becomes 0 effectively for base?
        // Actually the original logic was: baseCost = -1.1. If p.cost is normally 1.1? No, p.cost is usually int.
        // Wait, original logic: `let baseCost = p.cost; ... if (isAtlante) { if ... baseCost = -1.1 }`
        // It sets the baseCost TO -1.1 directly.
        // To support this in adjustment, we need to know how to use it.
        // Let's simplify: Return the target baseCost if it's an override.
        // BUT, we want to return an *adjustment* or a *config* that `PowerRow` uses.

        // Let's stick to returning `freeRank` which is used for the badge display.
        // The base calculation in PowerRow uses specific checks.
        // We can move that calculation here?
        // Yes, let's add `calculatedBaseCost` to the return if possible, or `forceBaseCost`.
    }

    return config;
};

/**
 * Get total base cost adjustment for display and calculation purposes
 */
export const getBaseCostAdjustment = (power: any, selection: SelectedPower, context: PowerContext, penaltyInfo: any): number => {
    let adjustment = 0;

    if (penaltyInfo && penaltyInfo.type !== 'none') {
        adjustment += penaltyInfo.cost;
    }

    // Penalties
    if (context.isParahumanoHybrid && selection.origin === 'Alterado') {
        adjustment += 3;
    }
    if (context.isEnano && selection.origin === 'Guardian') {
        adjustment += 2;
    }

    // Bonuses / Discounts
    if (context.isSemidemonio && selection.origin === 'Sobrenatural') {
        // Only non-characteristic powers get the base cost -1 discount? 
        // Wait, the original math in utils.ts was:
        // if (isSemidemonioBonus) baseCost = Math.max(0, baseCost - 1)
        // Let's preserve that logic:
        adjustment -= 1;
    } else if (context.isThalsDiscount) {
        adjustment -= 2;
    }

    return adjustment;
};

/**
 * Calculate the final base cost of a power including all modifiers
 */
export const calculatePowerBaseCost = (power: any, selection: SelectedPower, context: PowerContext, penaltyInfo: any): number => {
    const config = getPowerCostConfig(power, selection, context);
    const { isAtlante, isGrifo } = context;

    // Free powers (handled via isFixedCost in UI, but math-wise?)
    if (config.isFixedCost) return 0; // Thals free

    // Default base
    let baseCost = power.cost;

    // Apply adjustments
    const adjustment = getBaseCostAdjustment(power, selection, context, penaltyInfo);
    baseCost += adjustment;
    baseCost = Math.max(0, baseCost);

    // Specific cost overrides
    if (isAtlante) {
        if (power.id === 'control_del_agua') baseCost = -1.1;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Idioma nativo') baseCost = -4.1;
        else if (power.id === 'superhabilidad' && selection.selectedOption === 'Nadar') baseCost = -8.1;
        else if (power.id === 'empatia_animal') baseCost = -1.1;
    } else if (isGrifo && power.id === 'volar') {
        baseCost = -1.1;
    } else if (config.freeRank > 0) {
        // Find if this power uses 'characteristic' or 'skillCalc'
        if (power.characteristic) {
            // For characteristic powers, "1 free rank" historically means 1 PC (or 10 points)
            // But if it's treated just as a free flat power, we want the base cost to be 0 or -X?
            // Usually, these powers have a base cost (p.cost) that we want to cancel out.
            // If the user adds +1 to PowerMod, it costs 0.1.
            // When freeRank = 1, we offset by -0.1? No, if the base cost is normally 0, then we want it to be 0.
            // We just cancel the base cost.
            baseCost = -(config.freeRank * 0.1);
            // Wait! The issue is that `total = Math.max(0, baseCost + rankCost)` works to floor at 0.
            // But in PowerRow, `Total` is NOT floored. So it shows -0.1.
        } else {
            baseCost = -(config.freeRank * 0.1);
        }
    }

    return baseCost;
};
export const getMutantPowerTypes = (data: any): PowerType[] => {
    // Check for Mutant origin
    const mutantOrigin = data.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (mutantOrigin) {
        const subtypes = mutantOrigin['Mutante'];
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            const subtype = subtypes[0]; // El primer subtipo seleccionado

            // Mapear subtipo a tipos de poderes
            if (subtype === 'Psíquico') return ['Psíquico'];
            if (subtype === 'Energético') return ['Energético'];
            if (subtype === 'Físico') return ['Físico'];
            if (subtype === 'Psíquico/Energético') return ['Psíquico', 'Energético'];
            if (subtype === 'Energético/Físico') return ['Energético', 'Físico'];
            if (subtype === 'Psíquico/Físico') return ['Psíquico', 'Físico'];
        }
    }

    // Check for Ente origin (Sobrenatural subtype)
    const sobrenaturalOrigin = data.origin?.items?.find((item: any) =>
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
 * Get vigilante specialties from character data
 */
export const getVigilanteSpecialties = (data: any): string[] => {
    const vigItem = data.origin?.items?.find((item: any) => Object.keys(item)[0] === 'Vigilante');
    if (!vigItem) return [];

    const allValues: string[] = vigItem['Vigilante'] || [];

    // Filter out base defaultEffects — only return actual chosen specialties
    const vigilanteDef = ORIGIN_CATEGORIES['Vigilante'];
    const defaultEffects = vigilanteDef?.defaultEffects || [];
    const validSubtypes = vigilanteDef?.subtypes ? Object.keys(vigilanteDef.subtypes) : [];

    // Keep only values that are actual specialty names (keys of subtypes), not defaultEffects
    return allValues.filter(v => validSubtypes.includes(v) && !defaultEffects.includes(v));
};

/**
 * Get the mutant type from character origin
 * Returns the primary mutant type (Físico, Psíquico, or Energético)
 */
export const getMutantType = (data: any): PowerType | null => {
    const mutantOrigin = data.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (mutantOrigin) {
        const subtypes = mutantOrigin['Mutante'];
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            const subtype = subtypes[0];

            // Return the primary type
            if (subtype === 'Psíquico') return 'Psíquico';
            if (subtype === 'Energético') return 'Energético';
            if (subtype === 'Físico') return 'Físico';
        }
    }

    return null;
};

/**
 * Check if a power is cross-type for a mutant
 * A power is cross-type if the mutant's type is not in the power's types array
 */
export const isPowerCrossType = (data: any, powerId: string): boolean => {
    const mutantType = getMutantType(data);
    if (!mutantType) return false; // Not a mutant

    const power = POWERS.find(p => p.id === powerId);
    if (!power) return false;

    // If the power has the mutant's type, it's NOT cross-type
    // If the power doesn't have the mutant's type, it IS cross-type
    return !power.types.includes(mutantType);
};

/**
 * Robust check for Guardián origin (handles spelling variations)
 */
export const isGuardian = (data: any): boolean => {
    return hasOrigin(data, 'Guardián') || hasOrigin(data, 'Guardian');
};

/**
 * Check for Maldito subtype
 */
export const isMaldito = (data: any): boolean => {
    return hasSubtype(data, 'Sobrenatural', 'Maldito');
};

/**
 * Get power penalty information based on character data and power
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
            // Physical alteration exempts from the +3 PC cross-origin penalty
            // but only if the player has actually described what it is
            const hasPhysicalAlteration = data.divineParams?.hasPhysicalAlteration === true &&
                (data.divineParams?.physicalAlterationDescription || '').trim().length > 0;
            if (!hasPhysicalAlteration) {
                return { cost: 3, label: '+3 PC (Otro origen)', type: 'cross-origin' };
            }
        }
    }

    return { cost: 0, label: '', type: 'none' };
};

