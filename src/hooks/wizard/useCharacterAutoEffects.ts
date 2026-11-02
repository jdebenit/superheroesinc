import { useEffect } from 'react';
import { syncCharacterTransformations } from '../../utils/calculations/formCalculations';
import { syncOriginAutoPowers, syncPowerModsToAttributes } from '../../utils/calculations/powerCalculations';
import { syncOriginSkills } from '../../utils/calculations/skillCalculations';

export function useCharacterAutoEffects(data: any, onChange: (updates: any) => void) {
    const selectedPowers = data.powers?.selected || [];

    // 1. Auto-add innate origin powers deterministically in a single pass
    useEffect(() => {
        const updatedPowers = syncOriginAutoPowers(data);
        if (updatedPowers) {
            onChange({
                ...data,
                powers: {
                    ...data.powers,
                    selected: updatedPowers
                }
            });
        }
    }, [JSON.stringify(data.origin?.items), selectedPowers, onChange, data]);

    // 2. Auto-sync Hombre Lobo state and Power Transformations (e.g. Blindaje Natural)
    useEffect(() => {
        const updates = syncCharacterTransformations(data);
        if (updates) {
            onChange({
                ...data,
                ...updates
            });
        }
    }, [
        JSON.stringify(data.origin?.items),
        data.werewolfParams?.subtype,
        data.attributes?.values?.Voluntad,
        JSON.stringify(data.attributes?.breakdown),
        selectedPowers,
        onChange,
        data
    ]);

    // 3. Auto-update Attributes when Powers change (Power Mods)
    useEffect(() => {
        const updatedAttributes = syncPowerModsToAttributes(data);
        if (updatedAttributes) {
            onChange({
                ...data,
                attributes: updatedAttributes
            });
        }
    }, [selectedPowers, data.attributes?.breakdown, onChange, data]);
}

export function useSkillAutoEffects(
    data: any,
    selectedSkills: any,
    specifiedSkills: any,
    setSelectedSkills: any,
    setSpecifiedSkills: any
) {
    useEffect(() => {
        const result = syncOriginSkills({
            ...data,
            skills: {
                ...(data.skills || {}),
                selected: selectedSkills,
                specified: specifiedSkills
            }
        });

        if (result) {
            setSelectedSkills(result.selected);
            setSpecifiedSkills(result.specified);
        }
    }, [
        JSON.stringify(data.origin?.items),
        JSON.stringify(data.liberadoParams),
        selectedSkills,
        specifiedSkills,
        setSelectedSkills,
        setSpecifiedSkills
    ]);
}
