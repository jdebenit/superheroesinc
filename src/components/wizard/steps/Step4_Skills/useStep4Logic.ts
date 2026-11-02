import { useMemo, useCallback } from 'react';
import { getSkillsByCategory } from '../../../../data/specialSkills';
import {
    calculateGeneralSkillValues,
    calculateSpecialSkillsPCWithInt,
    calculateSpecialSkillValues,
    hasLiberadoOrigin,
    hasSubtype
} from '../../../../utils/characterCalculations';

export const useStep4Logic = (data: any, onChange: (updates: any) => void) => {
    const manualMods: Record<string, number> = data?.skills?.generalManualMods || {};
    const manualBases: Record<string, number> = data?.skills?.manualBases || {};
    const nativeLanguage: string = data?.skills?.nativeLanguage || '';
    const unlockManualMod = Boolean(data?.uiState?.unlockManualSkills);

    const selectedSkills: Record<string, { isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number }> =
        data?.skills?.selected || {};
    const specifiedSkills: Record<string, { skillId: string; specification: string; isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number }> =
        data?.skills?.specified || {};

    const originItems = data?.origin?.items || [];
    const attrValues = data?.attributes?.values || {};

    // Calculate general skills
    const { skills: skillValues } = useMemo(() => calculateGeneralSkillValues(
        attrValues,
        originItems,
        manualMods,
        manualBases
    ), [attrValues, originItems, manualMods, manualBases]);

    // Calculate special skills detailed values
    const { standard: standardSpecialSkills, specified: specifiedSpecialSkills } = useMemo(() => calculateSpecialSkillValues(
        attrValues,
        originItems,
        selectedSkills as any,
        specifiedSkills as any
    ), [attrValues, originItems, selectedSkills, specifiedSkills]);

    // Calculate special skills PC cost
    const specialSkillsPC = useMemo(() => calculateSpecialSkillsPCWithInt(
        selectedSkills,
        specifiedSkills,
        originItems,
        attrValues
    ), [selectedSkills, specifiedSkills, originItems, attrValues]);

    const isLiberado = useMemo(() => hasLiberadoOrigin(originItems), [originItems]);
    const isHeraldoCosmico = useMemo(() => hasSubtype(data, 'Cósmico', 'Heraldo Cósmico'), [data]);

    const commitSkillsPatch = useCallback((skillsPatch: Record<string, any>) => {
        onChange({
            ...data,
            skills: {
                ...(data?.skills || {}),
                ...skillsPatch
            }
        });
    }, [data, onChange]);

    // Handlers
    const handleNativeLanguageChange = useCallback((value: string) => {
        commitSkillsPatch({ nativeLanguage: value });
    }, [commitSkillsPatch]);

    const handleModChange = useCallback((skillId: string, value: string) => {
        const num = parseInt(value) || 0;
        commitSkillsPatch({
            generalManualMods: { ...manualMods, [skillId]: num }
        });
    }, [commitSkillsPatch, manualMods]);

    const handleBaseChange = useCallback((skillId: string, value: string, minLimit: number) => {
        const num = parseInt(value) || 0;
        if (num >= minLimit) {
            commitSkillsPatch({
                manualBases: { ...manualBases, [skillId]: num }
            });
        }
    }, [commitSkillsPatch, manualBases]);

    const handleSpecialBaseChange = useCallback((id: string, value: string, minLimit: number, isSpecified: boolean = false) => {
        const num = parseInt(value) || 0;
        if (num >= minLimit) {
            if (isSpecified) {
                commitSkillsPatch({
                    specified: {
                        ...specifiedSkills,
                        [id]: { ...specifiedSkills[id], manualBases: num }
                    }
                });
            } else {
                commitSkillsPatch({
                    selected: {
                        ...selectedSkills,
                        [id]: { ...selectedSkills[id], manualBases: num }
                    }
                });
            }
        }
    }, [commitSkillsPatch, specifiedSkills, selectedSkills]);

    const handleSpecialModChange = useCallback((id: string, value: string, isSpecified: boolean = false) => {
        const num = parseInt(value) || 0;
        if (isSpecified) {
            commitSkillsPatch({
                specified: {
                    ...specifiedSkills,
                    [id]: { ...specifiedSkills[id], manualMods: num }
                }
            });
        } else {
            commitSkillsPatch({
                selected: {
                    ...selectedSkills,
                    [id]: { ...selectedSkills[id], manualMods: num }
                }
            });
        }
    }, [commitSkillsPatch, specifiedSkills, selectedSkills]);

    const handleAddSkill = useCallback((skillId: string) => {
        commitSkillsPatch({
            selected: {
                ...selectedSkills,
                [skillId]: { isFree: false, isRequired: false, manualMods: 0, manualBases: 0 }
            }
        });
    }, [commitSkillsPatch, selectedSkills]);

    const handleRemoveSkill = useCallback((skillId: string) => {
        const nextSkills = { ...selectedSkills };
        delete nextSkills[skillId];
        commitSkillsPatch({ selected: nextSkills });
    }, [commitSkillsPatch, selectedSkills]);

    const handleAddSpecifiedSkill = useCallback((skillId: string) => {
        const uniqueId = `${skillId}_${Date.now()}`;
        commitSkillsPatch({
            specified: {
                ...specifiedSkills,
                [uniqueId]: {
                    skillId,
                    specification: '',
                    isFree: false,
                    isRequired: false,
                    manualMods: 0,
                    manualBases: 0
                }
            }
        });
    }, [commitSkillsPatch, specifiedSkills]);

    const handleSpecificationChange = useCallback((uniqueId: string, specification: string) => {
        commitSkillsPatch({
            specified: {
                ...specifiedSkills,
                [uniqueId]: { ...specifiedSkills[uniqueId], specification }
            }
        });
    }, [commitSkillsPatch, specifiedSkills]);

    const handleRemoveSpecifiedSkill = useCallback((uniqueId: string) => {
        const nextSkills = { ...specifiedSkills };
        delete nextSkills[uniqueId];
        commitSkillsPatch({ specified: nextSkills });
    }, [commitSkillsPatch, specifiedSkills]);

    const skillsByCategory = useMemo(() => getSkillsByCategory(), []);
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
            onChange({
                ...data,
                uiState: {
                    ...data?.uiState,
                    unlockManualSkills: value
                }
            });
        }
    };
};
