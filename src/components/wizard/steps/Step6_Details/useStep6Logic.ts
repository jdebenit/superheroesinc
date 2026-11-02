import { useEffect, useCallback, useState } from 'react';
import {
    calculateDerivedStats,
    formatDerivedStats,
    BREAKDOWN_COMBAT_FIELDS,
    BREAKDOWN_STAT_FIELDS,
    buildManualStatUpdate,
    syncDerivedStats
} from '../../../../utils/characterCalculations';
import { ARTIFACTS } from '../../../../data/artifacts';
import { MAGIC_OBJECTS } from '../../../../data/magicObjects';

export function useStep6Logic(data: any, onChange: (updates: any) => void) {
    const [unlockCombatStats, setUnlockCombatStats] = useState<boolean>(() => {
        return !!data.uiState?.unlockCombatStats;
    });

    const [unlockOtherStats, setUnlockOtherStats] = useState<boolean>(() => {
        return !!data.uiState?.unlockOtherStats;
    });

    // Derived Stats Effect (delegated to pure syncDerivedStats)
    useEffect(() => {
        const updates = syncDerivedStats({
            ...data,
            uiState: {
                ...data.uiState,
                unlockCombatStats,
                unlockOtherStats
            }
        });

        if (updates) {
            onChange(updates);
        }
    }, [
        data.attributes?.values,
        data.origin?.items,
        data.skills,
        data.level,
        data.modPerLevel,
        data.combatstats,
        data.otherstats,
        onChange,
        unlockCombatStats,
        unlockOtherStats
    ]);

    // Identity Handlers
    const updateField = useCallback((field: string, value: string) => {
        onChange({ [field]: value });
    }, [onChange]);

    // Manual Stat Handlers (unified via buildManualStatUpdate)
    const updateCombatStat = useCallback((field: string, value: string) => {
        if ((BREAKDOWN_COMBAT_FIELDS as readonly string[]).includes(field)) {
            const current = data.combatstats?.[field];
            let fallback: any = null;
            if (!current || typeof current !== 'object') {
                const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills, data.level, data.modPerLevel);
                fallback = formatDerivedStats(stats).combatStats[field];
            }
            const updatedBreakdown = buildManualStatUpdate(current, fallback, value);
            onChange({
                combatstats: {
                    ...data.combatstats,
                    [field]: updatedBreakdown
                }
            });
            return;
        }

        onChange({
            combatstats: {
                ...data.combatstats,
                [field]: value
            }
        });
    }, [data.combatstats, data.attributes?.values, data.origin?.items, data.skills, data.level, data.modPerLevel, onChange]);

    const updateOtherStat = useCallback((field: string, value: string) => {
        if ((BREAKDOWN_STAT_FIELDS as readonly string[]).includes(field)) {
            const current = data.otherstats?.[field];
            let fallback: any = null;
            if (!current || typeof current !== 'object') {
                const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills, data.level, data.modPerLevel);
                fallback = formatDerivedStats(stats).otherStats[field];
            }
            const updatedBreakdown = buildManualStatUpdate(current, fallback, value);
            onChange({
                otherstats: {
                    ...data.otherstats,
                    [field]: updatedBreakdown
                }
            });
            return;
        }

        onChange({
            otherstats: {
                ...data.otherstats,
                [field]: value
            }
        });
    }, [data.otherstats, data.attributes?.values, data.origin?.items, data.skills, data.level, data.modPerLevel, onChange]);

    // Generic List Handlers
    const addItem = useCallback((key: string, initialItem: any) => {
        const items = data[key]?.items || [];
        onChange({
            [key]: {
                items: [...items, initialItem]
            }
        });
    }, [data, onChange]);

    const updateItem = useCallback((key: string, index: number, field: string, value: any) => {
        const items = [...(data[key]?.items || [])];
        if (items[index]) {
            items[index] = { ...items[index], [field]: value };
            onChange({ [key]: { items } });
        }
    }, [data, onChange]);

    const removeItem = useCallback((key: string, index: number) => {
        const items = [...(data[key]?.items || [])];
        items.splice(index, 1);
        onChange({ [key]: { items } });
    }, [data, onChange]);

    // Specific Preset Handlers
    const applyArtifactPreset = useCallback((index: number, id: string) => {
        const preset = ARTIFACTS.find((a: any) => a.id === id);
        if (preset) {
            const items = [...(data.artifacts?.items || [])];
            if (items[index]) {
                items[index] = {
                    ...items[index],
                    name: preset.name,
                    reliability: preset.reliability,
                    cost: preset.pcCost,
                    notes: preset.description
                };
                onChange({ artifacts: { items } });
            }
        }
    }, [data.artifacts, onChange]);

    const applyMagicPreset = useCallback((index: number, id: string) => {
        const preset = MAGIC_OBJECTS.find((o: any) => o.id === id);
        if (preset) {
            const items = [...(data.magicObjects?.items || [])];
            if (items[index]) {
                items[index] = {
                    ...items[index],
                    name: preset.name,
                    description: preset.description,
                    em: preset.em
                };
                onChange({ magicObjects: { items } });
            }
        }
    }, [data.magicObjects, onChange]);

    return {
        updateField,
        addItem,
        updateItem,
        removeItem,
        applyArtifactPreset,
        applyMagicPreset,
        unlockCombatStats,
        setUnlockCombatStats: (value: boolean) => {
            setUnlockCombatStats(value);
            onChange({
                uiState: {
                    ...data.uiState,
                    unlockCombatStats: value
                }
            });
        },
        unlockOtherStats,
        setUnlockOtherStats: (value: boolean) => {
            setUnlockOtherStats(value);
            onChange({
                uiState: {
                    ...data.uiState,
                    unlockOtherStats: value
                }
            });
        },
        updateCombatStat,
        updateOtherStat
    };
}
