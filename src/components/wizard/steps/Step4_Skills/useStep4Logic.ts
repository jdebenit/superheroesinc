import { useState, useEffect, useMemo } from 'react';
import { GENERAL_SKILLS } from '../../../../data/generalSkills';
import { SPECIAL_SKILLS, getSkillsByCategory } from '../../../../data/specialSkills';
import {
    calculateGeneralSkillValues,
    calculateSpecialSkillsPCWithInt,
    calculateSpecialSkillValues,
    formatGeneralSkillItems,
    formatSpecialSkillItems,
    hasLiberadoOrigin,
    hasSubtype
} from '../../../../utils/characterCalculations';
import { useSkillAutoEffects } from '../../../../hooks/wizard/useCharacterAutoEffects';

export const useStep4Logic = (data: any, onChange: (updates: any) => void) => {
    const [manualMods, setManualMods] = useState<{ [key: string]: number }>(
        data.skills?.generalManualMods || {}
    );
    const [manualBases, setManualBases] = useState<{ [key: string]: number }>(
        data.skills?.manualBases || {}
    );
    const [nativeLanguage, setNativeLanguage] = useState<string>(data.skills?.nativeLanguage || '');
    const [unlockManualMod, setUnlockManualMod] = useState<boolean>(
        !!data.uiState?.unlockManualSkills
    );

    // Special skills - with isRequired flag
    const [selectedSkills, setSelectedSkills] = useState<{ [skillId: string]: { isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } }>(
        data.skills?.selected || {}
    );
    const [specifiedSkills, setSpecifiedSkills] = useState<{ [uniqueId: string]: { skillId: string; specification: string; isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } }>(
        data.skills?.specified || {}
    );

    // Calculate general skills
    const { skills: skillValues } = calculateGeneralSkillValues(
        data.attributes.values,
        data.origin?.items || [],
        manualMods,
        manualBases
    );

    // Calculate special skills detailed values
    const { standard: standardSpecialSkills, specified: specifiedSpecialSkills } = calculateSpecialSkillValues(
        data.attributes.values,
        data.origin?.items || [],
        selectedSkills as any,
        specifiedSkills as any
    );

    // Calculate special skills PC cost
    const specialSkillsPC = calculateSpecialSkillsPCWithInt(
        selectedSkills,
        specifiedSkills,
        data.origin?.items || [],
        data.attributes?.values || {}
    );

    // Use custom hook for auto-effects
    useSkillAutoEffects(data, selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills);

    // Check if Liberado origin is present
    const isLiberado = useMemo(() => {
        return hasLiberadoOrigin(data.origin?.items || []);
    }, [data.origin?.items]);

    // Check if Heraldo Cosmico available for General Skills section
    const isHeraldoCosmico = useMemo(() => {
        return hasSubtype(data, 'Cósmico', 'Heraldo Cósmico');
    }, [data.origin?.items]);

    // Save to parent whenever data changes
    useEffect(() => {
        const generalItems = formatGeneralSkillItems(skillValues, nativeLanguage);
        const allSpecialItems = formatSpecialSkillItems(
            selectedSkills,
            standardSpecialSkills,
            specifiedSkills,
            specifiedSpecialSkills
        );

        const newSkillsData = {
            generalManualMods: manualMods,
            manualBases: manualBases,
            nativeLanguage: nativeLanguage,
            selected: selectedSkills,
            specified: specifiedSkills,
            generalItems: generalItems,
            specialItems: allSpecialItems
        };

        if (JSON.stringify(data.skills?.generalItems) !== JSON.stringify(generalItems) ||
            JSON.stringify(data.skills?.specialItems) !== JSON.stringify(allSpecialItems) ||
            JSON.stringify(data.skills?.generalManualMods) !== JSON.stringify(manualMods) ||
            JSON.stringify(data.skills?.manualBases) !== JSON.stringify(manualBases) ||
            JSON.stringify(data.skills?.nativeLanguage) !== nativeLanguage ||
            JSON.stringify(data.skills?.selected) !== JSON.stringify(selectedSkills) ||
            JSON.stringify(data.skills?.specified) !== JSON.stringify(specifiedSkills)) {
            onChange({
                ...data,
                skills: {
                    ...data.skills,
                    ...newSkillsData
                }
            });
        }
    }, [manualMods, manualBases, nativeLanguage, selectedSkills, specifiedSkills, data.attributes.values, data.origin?.items]);

    // Handlers
    const handleNativeLanguageChange = (value: string) => setNativeLanguage(value);

    const handleModChange = (skillId: string, value: string) => {
        const num = parseInt(value) || 0;
        setManualMods(prev => ({ ...prev, [skillId]: num }));
    };

    const handleBaseChange = (skillId: string, value: string, minLimit: number) => {
        const num = parseInt(value) || 0;
        if (num >= minLimit) {
            setManualBases(prev => ({ ...prev, [skillId]: num }));
        }
    };

    const handleSpecialBaseChange = (id: string, value: string, minLimit: number, isSpecified: boolean = false) => {
        const num = parseInt(value) || 0;
        if (num >= minLimit) {
            if (isSpecified) {
                setSpecifiedSkills(prev => ({
                    ...prev,
                    [id]: { ...prev[id], manualBases: num }
                }));
            } else {
                setSelectedSkills(prev => ({
                    ...prev,
                    [id]: { ...prev[id], manualBases: num }
                }));
            }
        }
    };

    const handleSpecialModChange = (id: string, value: string, isSpecified: boolean = false) => {
        const num = parseInt(value) || 0;
        if (isSpecified) {
            setSpecifiedSkills(prev => ({
                ...prev,
                [id]: { ...prev[id], manualMods: num }
            }));
        } else {
            setSelectedSkills(prev => ({
                ...prev,
                [id]: { ...prev[id], manualMods: num }
            }));
        }
    };

    const handleAddSkill = (skillId: string) => {
        setSelectedSkills(prev => ({
            ...prev,
            [skillId]: { isFree: false, isRequired: false, manualMods: 0, manualBases: 0 }
        }));
    };

    const handleRemoveSkill = (skillId: string) => {
        setSelectedSkills(prev => {
            const newSkills = { ...prev };
            delete newSkills[skillId];
            return newSkills;
        });
    };

    const handleAddSpecifiedSkill = (skillId: string) => {
        const uniqueId = `${skillId}_${Date.now()}`;
        setSpecifiedSkills(prev => ({
            ...prev,
            [uniqueId]: {
                skillId,
                specification: '',
                isFree: false,
                isRequired: false,
                manualMods: 0,
                manualBases: 0
            }
        }));
    };

    const handleSpecificationChange = (uniqueId: string, specification: string) => {
        setSpecifiedSkills(prev => ({
            ...prev,
            [uniqueId]: { ...prev[uniqueId], specification }
        }));
    };

    const handleRemoveSpecifiedSkill = (uniqueId: string) => {
        setSpecifiedSkills(prev => {
            const newSkills = { ...prev };
            delete newSkills[uniqueId];
            return newSkills;
        });
    };

    const skillsByCategory = getSkillsByCategory();
    const skillBaseCost = isLiberado ? 0.5 : 1;

    return {
        // State
        manualMods,
        manualBases,
        nativeLanguage,
        selectedSkills,
        specifiedSkills,

        // Calculated Values
        skillValues,
        standardSpecialSkills,
        specifiedSpecialSkills,
        specialSkillsPC,
        isLiberado,
        isHeraldoCosmico,
        skillsByCategory,
        skillBaseCost,

        // Handlers
        handleNativeLanguageChange,
        handleBaseChange,
        handleModChange,
        handleSpecialBaseChange,
        handleSpecialModChange,
        handleAddSkill,
        handleRemoveSkill,
        handleAddSpecifiedSkill,
        handleSpecificationChange,
        handleRemoveSpecifiedSkill,
        unlockManualMod,
        setUnlockManualMod: (value: boolean) => {
            setUnlockManualMod(value);
            onChange({
                ...data,
                uiState: {
                    ...data.uiState,
                    unlockManualSkills: value
                }
            });
        }
    };
};
