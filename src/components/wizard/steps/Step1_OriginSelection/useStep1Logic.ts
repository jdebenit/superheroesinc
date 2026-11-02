import { useState, useMemo, useCallback } from 'react';
import { ORIGIN_CATEGORIES } from '../../../../data/originDefinitions';

export const ORIGINS = [
    { id: 'divinos', name: 'Divino', logo: '/logos/divinos.png', categoryKey: 'Divino' },
    { id: 'cosmicos', name: 'Cósmico', logo: '/logos/cosmicos.png', categoryKey: 'Cósmico' },
    { id: 'guardianes', name: 'Guardián', logo: '/logos/guardianes.png', categoryKey: 'Guardian' },
    { id: 'alterados', name: 'Alterado', logo: '/logos/alterados.png', categoryKey: 'Alterado' },
    { id: 'sobrenaturales', name: 'Sobrenatural', logo: '/logos/sobrenaturales.png', categoryKey: 'Sobrenatural' },
    { id: 'arcanos', name: 'Arcano', logo: '/logos/arcanos.png', categoryKey: 'Arcano' },
    { id: 'parahumanos', name: 'Parahumano', logo: '/logos/parahumanos.png', categoryKey: 'Parahumano' },
    { id: 'tecnologicos', name: 'Tecnológico', logo: '/logos/tecnologicos.png', categoryKey: 'Tecnológico' },
    { id: 'mutantes', name: 'Mutante', logo: '/logos/mutantes.png', categoryKey: 'Mutante' },
    { id: 'vigilantes', name: 'Vigilante', logo: '/logos/vigilantes.png', categoryKey: 'Vigilante' }
];

export const SINGLE_SELECTION_ORIGINS = ['divinos', 'cosmicos', 'parahumanos', 'mutantes'];

export function useStep1Logic(data: any, onChange: (updates: any) => void) {
    // UI-only state for origins clicked by the user that require a subtype before being persisted in data.origin.items
    const [pendingOrigins, setPendingOrigins] = useState<string[]>([]);

    // Derive persisted origins and subtypes directly from data.origin.items (Single Source of Truth)
    const { persistedOrigins, selectedSubtypes } = useMemo(() => {
        const items = data?.origin?.items || [];
        const origins: string[] = [];
        const subtypes: Record<string, string[]> = {};

        items.forEach((item: any) => {
            const originName = Object.keys(item)[0];
            const origin = ORIGINS.find(o => o.name === originName);
            if (origin) {
                origins.push(origin.id);
                const subtypeList = item[originName];
                if (Array.isArray(subtypeList) && subtypeList.length > 0) {
                    subtypes[origin.id] = subtypeList;
                }
            }
        });

        return { persistedOrigins: origins, selectedSubtypes: subtypes };
    }, [data?.origin?.items]);

    const selectedOrigins = useMemo(() => {
        const combined = new Set([...persistedOrigins, ...pendingOrigins]);
        return ORIGINS.map(o => o.id).filter(id => combined.has(id));
    }, [persistedOrigins, pendingOrigins]);

    const getOriginCategory = useCallback((originId: string) => {
        const origin = ORIGINS.find(o => o.id === originId);
        if (!origin) return null;
        return ORIGIN_CATEGORIES[origin.categoryKey];
    }, []);

    const updateCharacterOrigins = useCallback((origins: string[], subtypes: Record<string, string[]>) => {
        const items = origins.map(id => {
            const origin = ORIGINS.find(o => o.id === id);
            if (!origin) return null;

            const category = ORIGIN_CATEGORIES[origin.categoryKey];
            if (!category) return { [origin.name]: [] };

            if (category.subtypes && subtypes[id] && subtypes[id].length > 0) {
                return { [origin.name]: subtypes[id] };
            }

            if (category.defaultEffects) {
                return { [origin.name]: category.defaultEffects };
            }

            return null;
        }).filter(Boolean);

        onChange({
            ...data,
            origin: { items }
        });
    }, [data, onChange]);

    const handleToggleOrigin = useCallback((originId: string) => {
        const isCurrentlySelected = selectedOrigins.includes(originId);
        const nextOrigins = isCurrentlySelected
            ? selectedOrigins.filter(id => id !== originId)
            : [...selectedOrigins, originId];

        const nextSubtypes = { ...selectedSubtypes };
        if (isCurrentlySelected) {
            delete nextSubtypes[originId];
            setPendingOrigins(prev => prev.filter(id => id !== originId));
        } else {
            const category = getOriginCategory(originId);
            const hasSubtypes = Boolean(category?.subtypes && Object.keys(category.subtypes).length > 0);
            if (hasSubtypes && !category?.defaultEffects) {
                setPendingOrigins(prev => (prev.includes(originId) ? prev : [...prev, originId]));
            }
        }

        updateCharacterOrigins(nextOrigins, nextSubtypes);
    }, [selectedOrigins, selectedSubtypes, getOriginCategory, updateCharacterOrigins]);

    const handleToggleSubtype = useCallback((originId: string, subtype: string) => {
        const isSingleSelection = SINGLE_SELECTION_ORIGINS.includes(originId);
        const current = selectedSubtypes[originId] || [];

        const nextOriginSubtypes = isSingleSelection
            ? [subtype]
            : current.includes(subtype)
                ? current.filter(s => s !== subtype)
                : [...current, subtype];

        const nextSubtypes: Record<string, string[]> = {
            ...selectedSubtypes,
            [originId]: nextOriginSubtypes
        };

        if (nextOriginSubtypes.length > 0) {
            setPendingOrigins(prev => prev.filter(id => id !== originId));
        } else {
            setPendingOrigins(prev => (prev.includes(originId) ? prev : [...prev, originId]));
        }

        updateCharacterOrigins(selectedOrigins, nextSubtypes);
    }, [selectedOrigins, selectedSubtypes, updateCharacterOrigins]);

    return {
        selectedOrigins,
        selectedSubtypes,
        getOriginCategory,
        handleToggleOrigin,
        handleToggleSubtype
    };
}
