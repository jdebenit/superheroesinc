import { SITUATIONS, COVERAGES, DISTANCE_SITUATIONS, RANGES, HIT_LOCATIONS, MELEE_HIT_LOCATIONS } from '../data/combatData';

interface CalculationParams {
    mode: 'basic' | 'combat' | 'opposed';
    subMode?: 'melee' | 'distance';
    targetValue: number;
    difficultyModifier: number;
    customModifier: number;
    opposedValue?: number;
    divisionFactor?: number;
    situation: string;
    distSituation: string;
    range: string;
    coverage: string;
    targetParry: string;
}

export const calculateProbability = (params: CalculationParams) => {
    const {
        mode,
        subMode,
        targetValue,
        difficultyModifier,
        customModifier,
        opposedValue,
        divisionFactor,
        situation,
        distSituation,
        range,
        coverage,
        targetParry
    } = params;

    let finalProbability = 0;
    let modifiersSum = 0;
    let numericParry = parseInt(targetParry) || 0;
    let effectiveParry = numericParry;

    // Melee Logic (Pre-calculation needed for effective parry)
    const currentSituation = SITUATIONS.find(s => s.id === situation) || SITUATIONS[0];
    if (currentSituation.parry === 'half') effectiveParry = Math.floor(numericParry / 2);
    if (currentSituation.parry === 'none') effectiveParry = 0;

    // Distance Logic
    const currentDistSituation = DISTANCE_SITUATIONS.find(s => s.id === distSituation) || DISTANCE_SITUATIONS[0];
    const currentRange = RANGES.find(r => r.id === range) || RANGES[0];
    const currentCoverage = COVERAGES.find(c => c.id === coverage) || COVERAGES[0];

    if (mode === 'basic') {
        modifiersSum = difficultyModifier + customModifier;
        finalProbability = targetValue + modifiersSum;
    } else if (mode === 'opposed') {
        // Opposed Roll: 50 + (Attacker - Defender)
        const oppVal = opposedValue || 0;
        finalProbability = 50 + (targetValue - oppVal);
    } else {
        // Combat Mode
        // Apply Division Factor first (default 1)
        const divisor = divisionFactor && divisionFactor > 1 ? divisionFactor : 1;
        const effectiveBase = Math.floor(targetValue / divisor);

        const isDistance = subMode === 'distance';

        if (isDistance) {
            // Distance Formula: Base + Range + DistSituation - Coverage - DefenderMod
            // Note: Coverage is negative in constant, so we ADD it. same for DistSituation.
            modifiersSum = currentRange.mod + currentDistSituation.mod + currentCoverage.mod;
            // Defender Impact Mod (entered in targetParry input) is subtracted
            finalProbability = (effectiveBase + modifiersSum) - numericParry;
        } else {
            // Melee Formula
            modifiersSum = currentSituation.mod + currentCoverage.mod;
            finalProbability = (effectiveBase + modifiersSum) - effectiveParry;
        }
    }

    return {
        finalProbability,
        modifiersSum,
        effectiveParry,
        numericParry,
        currentSituation, // Return situational data for UI notes if needed
        isAutoHit: mode === 'combat' && subMode === 'melee' && currentSituation.parry === 'none'
    };
};

export const determineHitLocation = (subMode: 'melee' | 'distance') => {
    const locRoll = Math.floor(Math.random() * 20) + 1;
    let locData = null;

    if (subMode === 'distance') {
        locData = HIT_LOCATIONS[locRoll];
    } else if (subMode === 'melee') {
        locData = MELEE_HIT_LOCATIONS[locRoll];
    }

    if (locData) {
        return {
            roll: locRoll,
            location: locData.location,
            effect: locData.effect
        };
    }
    return undefined;
};
