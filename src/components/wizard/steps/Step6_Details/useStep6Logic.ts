import { useEffect, useCallback } from 'react';
import { calculateDerivedStats } from '../../../../utils/characterCalculations';
import { ARTIFACTS } from '../../../../data/artifacts';
import { MAGIC_OBJECTS } from '../../../../data/magicObjects';

export function useStep6Logic(data: any, onChange: (updates: any) => void) {
    // Derived Stats Effect
    useEffect(() => {
        const stats = calculateDerivedStats(data.attributes.values, data.origin?.items, data.skills);

        const combatStatsList = [
            `Acciones por asalto: ${stats.combat.acciones}`,
            `Iniciativa y Reflejos: ${stats.combat.iniciativa}`,
            `Puntos de Vida: ${stats.combat.pv}`,
            `Equilibrio Mental: ${stats.combat.equilibrio}`
        ];

        const otherStatsList = [
            `Inconsciencia: ${stats.other.inconsciencia}`,
            `Recuperación: ${stats.other.recuperacion}`,
            `Resistencia a gases y venenos: ${stats.other.resistenciaGases}`,
            `Modificador de fuerza: ${stats.other.modFuerza}`,
            `Peso Levantado: ${stats.other.pesoLevantado}`,
            `Daño absorbido físico: ${stats.other.daAbsorbidoFisico}`,
            `Daño absorbido mental: ${stats.other.daAbsorbidoMental}`,
            `Modificador de impacto: ${stats.other.modImpacto}`,
            `Modificador Psionico: ${stats.other.modPsionico}`,
            `Parada Fisica: ${stats.other.paradaFisica}`,
            `Parada mental: ${stats.other.paradaMental}`,
            `Salto (alto / largo): ${stats.other.salto}`
        ];

        const currentCombat = JSON.stringify(data.combatstats);
        const newCombat = JSON.stringify(combatStatsList);
        const currentOther = JSON.stringify(data.otherstats);
        const newOther = JSON.stringify(otherStatsList);

        if (currentCombat !== newCombat || currentOther !== newOther) {
            onChange({
                combatstats: combatStatsList,
                otherstats: otherStatsList
            });
        }
    }, [data.attributes.values, data.origin?.items, data.skills, data.combatstats, data.otherstats, onChange]);

    // Identity Handlers
    const updateField = useCallback((field: string, value: string) => {
        onChange({ [field]: value });
    }, [onChange]);

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
        applyMagicPreset
    };
}
