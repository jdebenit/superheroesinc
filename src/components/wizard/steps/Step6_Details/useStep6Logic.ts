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

        // Preserve 'personalizado' in Parada mental if it was already set
        const existingParada = data.otherstats?.["Parada mental"];
        if (existingParada && typeof existingParada === 'object') {
            const rawPers = existingParada.personalizado;
            if (rawPers !== undefined && rawPers !== null && String(rawPers).trim() !== '' && String(rawPers).trim() !== '-') {
                if (rawPers !== newOther["Parada mental"]?.total) {
                    newOther["Parada mental"] = {
                        ...newOther["Parada mental"],
                        personalizado: rawPers
                    };
                }
            }
        } else if (typeof existingParada === 'string' && existingParada.trim() !== '' && existingParada.trim() !== '-') {
            const strVal = existingParada.trim();
            const baseObj = newOther["Parada mental"];
            const maxOrigin = baseObj ? (baseObj.total ?? 0) - (baseObj.base ?? 0) : 0;
            const compactVal = strVal.replace(/\s+/g, '');
            if (
                baseObj &&
                strVal !== String(baseObj.total) &&
                !(maxOrigin !== 0 && compactVal === `${baseObj.base}+${maxOrigin}`)
            ) {
                const parsed = !isNaN(Number(strVal)) ? Number(strVal) : strVal;
                newOther["Parada mental"] = {
                    ...baseObj,
                    personalizado: parsed
                };
            }
        }

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
        if (field === 'Parada mental') {
            const current = data.otherstats?.['Parada mental'];
            let baseObj: { base: number; origen: number | Record<string, number>; total: number } = { base: 0, origen: 0, total: 0 };
            if (current && typeof current === 'object') {
                baseObj = {
                    base: current.base ?? 0,
                    origen: current.origen ?? 0,
                    total: current.total ?? 0
                };
            } else {
                const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);
                if (stats.other?.paradaMentalBreakdown) {
                    baseObj = { ...stats.other.paradaMentalBreakdown };
                }
            }

            const trimmed = value.trim();
            let updatedParada: any;
            if (trimmed === '') {
                updatedParada = { ...baseObj, personalizado: '' };
            } else {
                const parsed = !isNaN(Number(trimmed)) ? Number(trimmed) : value;
                if (parsed === baseObj.total) {
                    updatedParada = { ...baseObj };
                } else {
                    updatedParada = { ...baseObj, personalizado: parsed };
                }
            }

            onChange({
                otherstats: {
                    ...data.otherstats,
                    [field]: updatedParada
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
