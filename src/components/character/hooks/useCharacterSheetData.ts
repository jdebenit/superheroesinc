import {
    calculateDerivedStats,
    formatDerivedStats,
    applyStatsOverrides,
    getStatDisplayValue,
    applyLevelModsToSkillItems
} from '../../../utils/characterCalculations';
import {
    calculateGeneralSkillValues,
    calculateSpecialSkillValues,
    formatGeneralSkillItems,
    formatSpecialSkillItems
} from '../../../utils/calculations/skillCalculations';
import { formatPowersForDisplay } from '../../../utils/calculations/powerCalculations';
import { formatSpellsForDisplay } from '../../../utils/calculations/magicCalculations';
import {
    syncCharacterTransformations,
    getCharacterForActiveForm,
    type CharacterForm
} from '../../../utils/calculations/formCalculations';
import { getCharacterOriginFlags } from '../../../utils/calculations/originFlags';
import { calculateCharacterPCBreakdown } from '../../../utils/calculations/pcCalculations';

/**
 * Motor puro de Capa 4 para CharacterSheet y usePdfExport.
 * Deriva desde la fuente de verdad (`character` + `activeFormId`) todas las proyecciones
 * de formas, estadísticas de combate, habilidades con bonos de nivel, poderes, hechizos y PCs.
 * Al ser una función pura libre de hooks internos, puede invocarse directamente en tests de integración
 * y memoizarse con `useMemo` en `CharacterSheet.tsx`.
 */
export const useCharacterSheetData = (
    character: any,
    activeFormId: string = 'base',
    providedTotalPCs?: number | string
) => {
    // 1. Sincronización pura de formas disponibles (Transición Hombre Lobo + Transformaciones por Poder)
    const synced = syncCharacterTransformations(character);
    const availableForms: CharacterForm[] = (synced && synced.forms) || character?.forms || [];

    const effectiveFormId =
        activeFormId === 'base'
            ? 'base'
            : availableForms.some(f => f.id === activeFormId)
                ? activeFormId
                : 'base';

    const characterWithForms =
        availableForms.length === 0
            ? character
            : { ...character, forms: availableForms };

    // 2. Proyección del personaje según la forma activa seleccionada
    const activeCharacter = getCharacterForActiveForm(characterWithForms, effectiveFormId);

    // 3. Flags centralizados de origen y cálculo de PCs totales
    const originFlags = getCharacterOriginFlags(activeCharacter);

    let resolvedTotalPCs: number | string;
    if (providedTotalPCs !== undefined && providedTotalPCs !== null && providedTotalPCs !== '') {
        resolvedTotalPCs = providedTotalPCs;
    } else if (character?.totalCost !== undefined && character?.totalCost !== null && character?.totalCost !== '') {
        resolvedTotalPCs = character.totalCost;
    } else {
        resolvedTotalPCs = calculateCharacterPCBreakdown(characterWithForms).total;
    }

    // 4. Estadísticas derivadas y aplicación de overrides manuales
    const derivedStats = calculateDerivedStats(
        activeCharacter?.attributes?.values || {},
        activeCharacter?.origin?.items || [],
        activeCharacter?.skills || {},
        activeCharacter?.level,
        activeCharacter?.modPerLevel
    );

    const {
        combatStats: calculatedCombatStats,
        otherStats: calculatedOtherStats
    } = formatDerivedStats(derivedStats);

    const finalCombatStats = applyStatsOverrides(calculatedCombatStats, activeCharacter?.combatstats);
    const finalOtherStats = applyStatsOverrides(calculatedOtherStats, activeCharacter?.otherstats);

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

    // 5. Habilidades Generales y de Aprendizaje (con fallback reactivo si no venían pre-formateadas)
    const generalSkillsData = calculateGeneralSkillValues(
        activeCharacter?.attributes?.values || {},
        activeCharacter?.origin?.items || [],
        activeCharacter?.skills?.generalManualMods || {},
        activeCharacter?.skills?.manualBases || {}
    );

    const specialSkillsData = calculateSpecialSkillValues(
        activeCharacter?.attributes?.values || {},
        activeCharacter?.origin?.items || [],
        activeCharacter?.skills?.selected || activeCharacter?.skills?.learning?.selected || {},
        activeCharacter?.skills?.specified || activeCharacter?.skills?.learning?.specified || {}
    );

    const rawGeneralItems = (activeCharacter?.skills?.generalItems && activeCharacter.skills.generalItems.length > 0)
        ? activeCharacter.skills.generalItems
        : formatGeneralSkillItems(generalSkillsData.skills, activeCharacter?.skills?.nativeLanguage || '');

    const generalSkillItems = applyLevelModsToSkillItems(
        rawGeneralItems,
        activeCharacter?.level,
        activeCharacter?.modPerLevel
    );

    const selected = activeCharacter?.skills?.selected || activeCharacter?.skills?.learning?.selected || {};
    const specified = activeCharacter?.skills?.specified || activeCharacter?.skills?.learning?.specified || {};
    const hasSelectedOrSpecified = Object.keys(selected).length > 0 || Object.keys(specified).length > 0;

    const rawSpecialItems = (activeCharacter?.skills?.specialItems && activeCharacter.skills.specialItems.length > 0)
        ? activeCharacter.skills.specialItems
        : (hasSelectedOrSpecified
            ? formatSpecialSkillItems(selected, specialSkillsData.standard, specified, specialSkillsData.specified)
            : []);

    const specialSkillItems = applyLevelModsToSkillItems(
        rawSpecialItems,
        activeCharacter?.level,
        activeCharacter?.modPerLevel
    );

    // 6. Listas pre-calculadas para visualización y exportación PDF
    const powersData = formatPowersForDisplay(activeCharacter);
    const spellsData = formatSpellsForDisplay(activeCharacter);

    const techData = (activeCharacter?.techModules || []).map((m: any) => ({
        name: m.name || m.definitionId || '',
        location: m.location || '',
        notes: m.notes || ''
    }));

    const weaponsData = (activeCharacter?.weapons?.items || []).map((w: any) => ({
        name: w.name || '',
        damage: w.damage || '',
        dxa: w.dxa || '',
        car: w.car || '',
        notes: w.notes || w.special || ''
    }));

    const artifactsData = (activeCharacter?.artifacts?.items || []).map((a: any) => ({
        name: a.name || '',
        reliability: a.reliability || '',
        value: a.value || '',
        cost: a.cost || '',
        notes: a.notes || ''
    }));

    const vehiclesData = (activeCharacter?.vehicles?.items || []).map((v: any) => ({
        name: v.name || '',
        armor: v.armor || '',
        pe: v.pe || '',
        speed: v.speed || '',
        range: v.range || ''
    }));

    const equipmentData = (activeCharacter?.equipment?.items || []).map((e: any) => ({
        name: e.name || '',
        notes: e.notes || ''
    }));

    return {
        availableForms,
        effectiveFormId,
        characterWithForms,
        activeCharacter,
        originFlags,
        resolvedTotalPCs,
        derivedStats,
        generalSkillsData,
        specialSkillsData,
        generalSkillItems,
        specialSkillItems,
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
