import { useEffect, useCallback, useState } from 'react';
import { calculateDerivedStats, formatDerivedStats, applyStatBreakdownOverride } from '../../../../utils/characterCalculations';
import { ARTIFACTS } from '../../../../data/artifacts';
import { MAGIC_OBJECTS } from '../../../../data/magicObjects';

const BREAKDOWN_COMBAT_FIELDS = ['Iniciativa y Reflejos'];
const BREAKDOWN_STAT_FIELDS = ['Parada mental', 'Parada Fisica', 'Modificador de impacto'];

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

        // Preserve 'personalizado' in combat breakdown stats if already set
        BREAKDOWN_COMBAT_FIELDS.forEach(statKey => {
            const existingVal = data.combatstats?.[statKey];
            if (existingVal !== undefined && existingVal !== null && newCombat[statKey]) {
                newCombat[statKey] = applyStatBreakdownOverride(newCombat[statKey], existingVal);
            }
        });

        // Preserve 'personalizado' in other breakdown stats if already set
        BREAKDOWN_STAT_FIELDS.forEach(statKey => {
            const existingVal = data.otherstats?.[statKey];
            if (existingVal !== undefined && existingVal !== null && newOther[statKey]) {
                newOther[statKey] = applyStatBreakdownOverride(newOther[statKey], existingVal);
            }
        });

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
        if (BREAKDOWN_COMBAT_FIELDS.includes(field)) {
            const current = data.combatstats?.[field];
            let baseObj: any = { formula: "(AGI+PER)/4", base: 0, habilidades: 0, total: 0 };
            if (current && typeof current === 'object') {
                baseObj = {
                    ...(current.formula ? { formula: current.formula } : {}),
                    base: current.base ?? 0,
                    ...(current.origen !== undefined ? { origen: current.origen } : {}),
                    ...(current.habilidades !== undefined ? { habilidades: current.habilidades } : {}),
                    total: current.total ?? 0
                };
            } else {
                const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);
                const { combatStats: formattedCombat } = formatDerivedStats(stats);
                if (formattedCombat[field] && typeof formattedCombat[field] === 'object') {
                    baseObj = { ...formattedCombat[field] };
                }
            }

            const trimmed = value.trim();
            let updatedBreakdown: any;
            if (trimmed === '') {
                updatedBreakdown = { ...baseObj, personalizado: '' };
            } else {
                const parsed = !isNaN(Number(trimmed)) ? Number(trimmed) : value;
                if (parsed === baseObj.total) {
                    updatedBreakdown = { ...baseObj };
                } else {
                    updatedBreakdown = { ...baseObj, personalizado: parsed };
                }
            }

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
    }, [data.combatstats, data.attributes.values, data.origin?.items, data.skills, onChange]);

    const updateOtherStat = useCallback((field: string, value: string) => {
        if (BREAKDOWN_STAT_FIELDS.includes(field)) {
            const current = data.otherstats?.[field];
            let baseObj: any = field === 'Parada Fisica'
                ? { base: 0, habilidades: 0, total: 0 }
                : { base: 0, origen: 0, total: 0 };
            if (current && typeof current === 'object') {
                baseObj = {
                    base: current.base ?? 0,
                    ...(current.origen !== undefined ? { origen: current.origen } : {}),
                    ...(current.habilidades !== undefined ? { habilidades: current.habilidades } : {}),
                    total: current.total ?? 0
                };
            } else {
                const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);
                const { otherStats: formattedOther } = formatDerivedStats(stats);
                if (formattedOther[field] && typeof formattedOther[field] === 'object') {
                    baseObj = { ...formattedOther[field] };
                }
            }

            const trimmed = value.trim();
            let updatedBreakdown: any;
            if (trimmed === '') {
                updatedBreakdown = { ...baseObj, personalizado: '' };
            } else {
                const parsed = !isNaN(Number(trimmed)) ? Number(trimmed) : value;
                if (parsed === baseObj.total) {
                    updatedBreakdown = { ...baseObj };
                } else {
                    updatedBreakdown = { ...baseObj, personalizado: parsed };
                }
            }

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
    }, [data.otherstats, data.attributes.values, data.origin?.items, data.skills, onChange]);

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
