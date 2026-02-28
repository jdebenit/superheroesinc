import { useState } from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../data/cyborgImplantConfigs';

export function useCyborgSectionLogic(implants: CyborgImplant[] = [], onChange: (implants: CyborgImplant[]) => void) {
    const [newImplantName, setNewImplantName] = useState('');
    const [selectedStatId, setSelectedStatId] = useState<string>(CYBORG_IMPLANT_STATS[0].id);
    const [selectedStrengthId, setSelectedStrengthId] = useState<string>(CYBORG_IMPLANT_STRENGTHS[0].id);

    const handleAddImplant = () => {
        if (!newImplantName.trim()) return;

        const newImplant: CyborgImplant = {
            id: crypto.randomUUID(),
            name: newImplantName.trim(),
            statConfigId: selectedStatId,
            strengthConfigId: selectedStrengthId
        };

        onChange([...implants, newImplant]);
        setNewImplantName('');
    };

    const handleDeleteImplant = (id: string) => {
        onChange(implants.filter(imp => imp.id !== id));
    };

    const totalCost = implants.reduce((acc, imp) => {
        const stat = CYBORG_IMPLANT_STATS.find((s: any) => s.id === imp.statConfigId);
        const str = CYBORG_IMPLANT_STRENGTHS.find((s: any) => s.id === imp.strengthConfigId);
        return acc + (stat?.pcCost || 0) + (str?.pcCost || 0);
    }, 0);

    return {
        newImplantName,
        setNewImplantName,
        selectedStatId,
        setSelectedStatId,
        selectedStrengthId,
        setSelectedStrengthId,
        handleAddImplant,
        handleDeleteImplant,
        totalCost,
    };
}
