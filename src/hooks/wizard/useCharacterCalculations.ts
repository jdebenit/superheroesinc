import { useMemo } from 'react';
import { calculateCharacterPCBreakdown } from '../../utils/calculations/pcCalculations';

export function useCharacterCalculations(character: any) {
    const breakdown = useMemo(() => calculateCharacterPCBreakdown(character), [character]);

    return {
        totalPCs: breakdown.total,
        breakdown
    };
}
