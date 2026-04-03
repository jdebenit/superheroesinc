import { useEffect, useCallback, useState } from 'react';
import { calculateDerivedStats, formatDerivedStats } from '../../../../utils/characterCalculations';
import { ARTIFACTS } from '../../../../data/artifacts';
import { MAGIC_OBJECTS } from '../../../../data/magicObjects';

export function useStep6Logic(data: any, onChange: (updates: any) => void) {
    const [unlockCombatStats, setUnlockCombatStats] = useState<boolean>(() => {
        return !!data.uiState?.unlockCombatStats;
    });

    const [unlockOtherStats, setUnlockOtherStats] = useState<boolean>(() => {
        return !!data.uiState?.unlockOtherStats;
    });

    // Derived Stats Effect
    useEffect(() => {
        // Only run if at least ONE section is locked
        if (unlockCombatStats && unlockOtherStats) return;

        const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);
        const { combatStats: newCombat, otherStats: newOther } = formatDerivedStats(stats);

        const currentCombatStr = JSON.stringify(data.combatstats);
        const nextCombatStr = JSON.stringify(newCombat);
        const currentOtherStr = JSON.stringify(data.otherstats);
        const nextOtherStr = JSON.stringify(newOther);

        const updates: any = {};
        let hasChanges = false;

        // Selective update for Combat Stats
        if (!unlockCombatStats && currentCombatStr !== nextCombatStr) {
            updates.combatstats = newCombat;
            hasChanges = true;
        }

        // Selective update for Other Stats
        if (!unlockOtherStats && currentOtherStr !== nextOtherStr) {
            updates.otherstats = newOther;
            hasChanges = true;
        }

        if (hasChanges) {
            onChange(updates);
        }
    }, [data.attributes.values, data.origin?.items, data.skills, data.combatstats, data.otherstats, onChange, unlockCombatStats, unlockOtherStats]);

    // Identity Handlers
    const updateField = useCallback((field: string, value: string) => {
        onChange({ [field]: value });
    }, [onChange]);

    // Manual Stat Handlers
    const updateCombatStat = useCallback((field: string, value: string) => {
        onChange({
            combatstats: {
                ...data.combatstats,
                [field]: value
            }
        });
    }, [data.combatstats, onChange]);

    const updateOtherStat = useCallback((field: string, value: string) => {
        onChange({
            otherstats: {
                ...data.otherstats,
                [field]: value
            }
        });
    }, [data.otherstats, onChange]);

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
