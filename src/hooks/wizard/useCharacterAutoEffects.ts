import { useEffect } from 'react';
import { getFreeSkillsForOrigins } from '../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../data/requiredSpecialtySkills';
import { SPECIAL_SKILLS, isSkillAllowed } from '../../data/specialSkills';
import { syncCharacterTransformations } from '../../utils/calculations/formCalculations';
import { syncOriginAutoPowers, syncPowerModsToAttributes } from '../../utils/calculations/powerCalculations';

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

export function useSkillAutoEffects(data: any, selectedSkills: any, specifiedSkills: any, setSelectedSkills: any, setSpecifiedSkills: any) {
    const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);
    const requiredSkillIds = getRequiredSkillsForOrigins(data.origin?.items || []);

    // Auto-add free skills from origin
    useEffect(() => {
        if (freeSkillIds.length > 0) {
            const newSelected = { ...selectedSkills };
            let hasChanges = false;

            freeSkillIds.forEach((skillId: string) => {
                if (!newSelected[skillId]) {
                    newSelected[skillId] = { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 };
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedSkills(newSelected);
            }
        }
    }, [freeSkillIds.join(','), selectedSkills, setSelectedSkills]);

    // Auto-add required skills from Vigilante specialties AND update isRequired status
    useEffect(() => {
        const newSelected = { ...selectedSkills };
        const newSpecified = { ...specifiedSkills };
        let hasChanges = false;

        // 1. Cleanup: Remove isRequired from skills that are no longer required
        Object.keys(newSelected).forEach(skillId => {
            if (newSelected[skillId].isRequired && !requiredSkillIds.includes(skillId)) {
                newSelected[skillId] = {
                    ...newSelected[skillId],
                    isRequired: false
                };
                hasChanges = true;
            }
        });

        Object.keys(newSpecified).forEach(uniqueId => {
            const skillId = newSpecified[uniqueId].skillId;
            if (newSpecified[uniqueId].isRequired && !requiredSkillIds.includes(skillId)) {
                newSpecified[uniqueId] = {
                    ...newSpecified[uniqueId],
                    isRequired: false
                };
                hasChanges = true;
            }
        });

        // 2. Add: Ensure all currently required skills are marked as such
        if (requiredSkillIds.length > 0) {
            requiredSkillIds.forEach((skillId: string) => {
                const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);

                if (skillDef?.requiresSpecification) {
                    const existingInstances = Object.values(newSpecified).filter((s: any) => s.skillId === skillId);

                    if (existingInstances.length === 0) {
                        const uniqueId = `${skillId}_required_${Date.now()}`;
                        newSpecified[uniqueId] = {
                            skillId,
                            specification: '',
                            isFree: false,
                            isRequired: true,
                            manualMods: 0,
                            manualBases: 0
                        };
                        hasChanges = true;
                    } else {
                        const hasRequiredInstance = existingInstances.some((s: any) => s.isRequired);
                        if (!hasRequiredInstance) {
                            const firstKey = Object.keys(newSpecified).find(key => newSpecified[key].skillId === skillId);
                            if (firstKey) {
                                newSpecified[firstKey] = {
                                    ...newSpecified[firstKey],
                                    isRequired: true
                                };
                                hasChanges = true;
                            }
                        }
                    }
                } else {
                    if (!newSelected[skillId]) {
                        newSelected[skillId] = { isFree: false, isRequired: true, manualMods: 0, manualBases: 0 };
                        hasChanges = true;
                    } else if (!newSelected[skillId].isRequired) {
                        newSelected[skillId] = {
                            ...newSelected[skillId],
                            isRequired: true
                        };
                        hasChanges = true;
                    }
                }
            });
        }

        if (hasChanges) {
            setSelectedSkills(newSelected);
            setSpecifiedSkills(newSpecified);
        }
    }, [requiredSkillIds.join(','), selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills]);

    // Cleanup restricted skills when origin changes
    useEffect(() => {
        const originItems = data.origin?.items || [];
        const newSelected = { ...selectedSkills };
        const newSpecified = { ...specifiedSkills };
        let hasChanges = false;

        Object.keys(newSelected).forEach(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            if (skillDef && !isSkillAllowed(skillDef, originItems, data)) {
                delete newSelected[skillId];
                hasChanges = true;
            }
        });

        Object.keys(newSpecified).forEach(uniqueId => {
            const skillId = newSpecified[uniqueId].skillId;
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            if (skillDef && !isSkillAllowed(skillDef, originItems, data)) {
                delete newSpecified[uniqueId];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setSelectedSkills(newSelected);
            setSpecifiedSkills(newSpecified);
        }
    }, [JSON.stringify(data.origin?.items), JSON.stringify(data.liberadoParams), selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills]);
}
