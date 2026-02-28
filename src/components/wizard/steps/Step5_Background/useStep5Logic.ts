import { useMemo, useCallback } from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../../data/backgroundTables';

export function useStep5Logic(data: any, onChange: (updates: any) => void) {
    const resistanceValue = data.background?.prejudiceResistance || 50;
    const resistanceCost = (resistanceValue - 50) * 0.1;

    // Derived Status Objects
    const currentEconomic = useMemo(() =>
        ECONOMIC_STATUS.find(e => e.id === data.background?.economicStatus) || ECONOMIC_STATUS[3],
        [data.background?.economicStatus]);

    const currentLegal = useMemo(() =>
        LEGAL_STATUS.find(l => l.id === data.background?.legalStatus) || LEGAL_STATUS[0],
        [data.background?.legalStatus]);

    const currentSocial = useMemo(() =>
        SOCIAL_STATUS.find(s => s.id === data.background?.socialStatus) || SOCIAL_STATUS[2],
        [data.background?.socialStatus]);

    const currentFriends = useMemo(() =>
        FRIENDS_AND_ASSOCIATES.find(f => f.id === data.background?.friendsAndAssociates) || FRIENDS_AND_ASSOCIATES[2],
        [data.background?.friendsAndAssociates]);

    // Handlers
    const addBackgroundItem = useCallback(() => {
        onChange({
            background: {
                ...data.background,
                items: [...(data.background.items || []), "Nuevo elemento de trasfondo"]
            }
        });
    }, [data.background, onChange]);

    const updateBackgroundItem = useCallback((index: number, value: string) => {
        const newItems = [...(data.background.items || [])];
        newItems[index] = value;
        onChange({ background: { ...data.background, items: newItems } });
    }, [data.background, onChange]);

    const removeBackgroundItem = useCallback((index: number) => {
        const newItems = [...(data.background.items || [])];
        newItems.splice(index, 1);
        onChange({ background: { ...data.background, items: newItems } });
    }, [data.background, onChange]);

    const handleResistanceChange = useCallback((value: number) => {
        if (!isNaN(value) && value >= 1 && value <= 100) {
            onChange({ background: { ...data.background, prejudiceResistance: value } });
        }
    }, [data.background, onChange]);

    const updateStatus = useCallback((field: string, val: string) => {
        onChange({ background: { ...data.background, [field]: val } });
    }, [data.background, onChange]);

    return {
        // Values
        resistanceValue,
        resistanceCost,
        currentEconomic,
        currentLegal,
        currentSocial,
        currentFriends,
        backgroundItems: data.background?.items || [],

        // Handlers
        addBackgroundItem,
        updateBackgroundItem,
        removeBackgroundItem,
        handleResistanceChange,
        updateStatus
    };
}
