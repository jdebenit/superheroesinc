import { calculateDerivedStats, formatDerivedStats, applyStatsOverrides, getStatDisplayValue } from '../../../utils/characterCalculations';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from '../../../utils/calculations/skillCalculations';
import { formatPowersForDisplay } from '../../../utils/calculations/powerCalculations';
import { formatSpellsForDisplay } from '../../../utils/calculations/magicCalculations';

export const useCharacterSheetData = (character: any) => {
    // CALCULATE STATS LIVE to ensure they are up to date and match PDF export
    const derivedStats = calculateDerivedStats(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills || {},
        character.level,
        character.modPerLevel
    );

    const generalSkillsData = calculateGeneralSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.generalManualMods || {},
        character.skills?.manualBases || {}
    );

    const specialSkillsData = calculateSpecialSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.selected || character.skills?.learning?.selected || {},
        character.skills?.specified || character.skills?.learning?.specified || {}
    );

    // Format stats for display
    // Always use live calculated stats to prevent stale data
    const {
        combatStats: calculatedCombatStats,
        otherStats: calculatedOtherStats
    } = formatDerivedStats(derivedStats);

    // Apply overrides using the centralized utility
    const finalCombatStats = applyStatsOverrides(calculatedCombatStats, character.combatstats);
    const finalOtherStats = applyStatsOverrides(calculatedOtherStats, character.otherstats);

    // Normalize to array of objects for display components (including raw breakdown if object)
    const combatStats = Object.entries(finalCombatStats).map(([label, value]) => ({
        label,
        value: getStatDisplayValue(value),
        breakdown: value && typeof value === 'object' ? value : undefined
    }));
    const otherStats = Object.entries(finalOtherStats).map(([label, value]) => ({
        label,
        value: getStatDisplayValue(value),
        breakdown: value && typeof value === 'object' ? value : undefined
    }));

    // --- PRE-CALCULATE LISTS FOR PDF (Powers, Spells, etc.) ---
    const powersData = formatPowersForDisplay(character);
    const spellsData = formatSpellsForDisplay(character);

    // Tech Modules
    const techData = (character.techModules || []).map((m: any) => ({
        name: m.name || m.definitionId || '',
        location: m.location || '',
        notes: m.notes || ''
    }));

    // Weapons
    const weaponsData = (character.weapons?.items || []).map((w: any) => ({
        name: w.name || '',
        damage: w.damage || '',
        dxa: w.dxa || '',
        car: w.car || '',
        notes: w.notes || w.special || ''
    }));

    // Artifacts
    const artifactsData = (character.artifacts?.items || []).map((a: any) => ({
        name: a.name || '',
        reliability: a.reliability || '',
        value: a.value || '',
        cost: a.cost || '',
        notes: a.notes || ''
    }));

    // Vehicles
    const vehiclesData = (character.vehicles?.items || []).map((v: any) => ({
        name: v.name || '',
        armor: v.armor || '',
        pe: v.pe || '',
        speed: v.speed || '',
        range: v.range || ''
    }));

    // Equipment
    const equipmentData = (character.equipment?.items || []).map((e: any) => ({
        name: e.name || '',
        notes: e.notes || ''
    }));

    return {
        derivedStats,
        generalSkillsData,
        specialSkillsData,
        combatStats,
        otherStats,
        powersData,
        spellsData,
        techData,
        weaponsData,
        artifactsData,
        vehiclesData,
        equipmentData
    };
};
