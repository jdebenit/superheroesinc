import React, { useState, useEffect, useMemo } from 'react';
import { GENERAL_SKILLS } from '../../../../data/generalSkills';
import { SPECIAL_SKILLS, getSkillsByCategory } from '../../../../data/specialSkills';
import { calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt, calculateSpecialSkillValues } from '../../../../utils/characterCalculations';
import { getFreeSkillsForOrigins } from '../../../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../../../data/requiredSpecialtySkills';
import { useSkillAutoEffects } from '../../../../hooks/wizard/useCharacterAutoEffects';
import { WizardSection } from '../../shared/WizardSection';
import { GeneralSkillsSection } from './sections/GeneralSkillsSection';
import { SelectedSkillsSection } from './sections/SelectedSkillsSection';
import { AvailableSkillsSection } from './sections/AvailableSkillsSection';

interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step4_GeneralSkills({ data, onChange }: Step4Props) {
    const [manualMods, setManualMods] = useState<{ [key: string]: number }>(
        data.skills?.generalManualMods || {}
    );
    const [manualBases, setManualBases] = useState<{ [key: string]: number }>(
        data.skills?.manualBases || {}
    );
    const [nativeLanguage, setNativeLanguage] = useState<string>(data.skills?.nativeLanguage || '');

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

    // Get free skills from origin
    // kept for reference/consistency
    // const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);
    // const requiredSkillIds = getRequiredSkillsForOrigins(data.origin?.items || []);

    // Use custom hook for auto-effects
    useSkillAutoEffects(data, selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills);

    // Check if Liberado origin is present
    const isLiberado = useMemo(() => {
        if (!data.origin?.items?.length) return false;
        return data.origin.items.some((item: any) => {
            const originName = Object.keys(item)[0];
            const content = item[originName];
            return Array.isArray(content) && content.some((s: string) => s.startsWith('Liberado'));
        });
    }, [data.origin?.items]);

    // Check if Heraldo Cosmico available for General Skills section
    const isHeraldoCosmico = useMemo(() => {
        return data.origin?.items?.some((o: any) => {
            const originName = Object.keys(o)[0];
            const content = o[originName] as string[];
            return content && content.includes('Heraldo Cósmico');
        });
    }, [data.origin?.items]);


    // Save to parent whenever data changes
    useEffect(() => {
        // Format items for final data (General)
        const generalItems = Object.keys(skillValues).map(id => {
            const skillDef = GENERAL_SKILLS.find(s => s.id === id);
            const val = skillValues[id];

            let name = skillDef?.name || id;
            if (id === 'idioma' && nativeLanguage) {
                name = `${name} (${nativeLanguage})`;
            }

            return {
                name: name,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        });

        const specialStandardItemsFormatted = Object.keys(selectedSkills).map(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            const val = standardSpecialSkills[skillId];
            if (!val) return null;
            return {
                name: skillDef?.name || skillId,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        }).filter(Boolean);

        const specialSpecifiedItemsFormatted = Object.keys(specifiedSkills).map(uniqueId => {
            const spec = specifiedSkills[uniqueId];
            const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
            const val = specifiedSpecialSkills[uniqueId];
            if (!val) return null;
            return {
                name: `${skillDef?.name}: ${spec.specification}`,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        }).filter(Boolean);

        const allSpecialItems = [...specialStandardItemsFormatted, ...specialSpecifiedItemsFormatted];

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

    return (
        <div style={{ padding: '2rem' }}>
            {/* GENERAL SKILLS SECTION */}
            <GeneralSkillsSection
                skillValues={skillValues}
                manualMods={manualMods}
                nativeLanguage={nativeLanguage}
                isHeraldoCosmico={isHeraldoCosmico || false}
                onNativeLanguageChange={handleNativeLanguageChange}
                onBaseChange={handleBaseChange}
                onModChange={handleModChange}
            />

            {/* SPECIAL SKILLS SECTION */}
            <WizardSection
                title="Habilidades de Aprendizaje"
                description={<>Selecciona las habilidades que tu personaje ha aprendido. Cada habilidad cuesta <strong>{skillBaseCost} PC</strong> + coste de mejora.</>}
            >
                <SelectedSkillsSection
                    selectedSkills={selectedSkills}
                    specifiedSkills={specifiedSkills}
                    standardSpecialSkills={standardSpecialSkills}
                    specifiedSpecialSkills={specifiedSpecialSkills}
                    specialSkillsPC={specialSkillsPC}
                    skillBaseCost={skillBaseCost}
                    onSpecialBaseChange={handleSpecialBaseChange}
                    onSpecialModChange={handleSpecialModChange}
                    onRemoveSkill={handleRemoveSkill}
                    onRemoveSpecifiedSkill={handleRemoveSpecifiedSkill}
                    onSpecificationChange={handleSpecificationChange}
                />

                <AvailableSkillsSection
                    skillsByCategory={skillsByCategory}
                    originItems={data.origin?.items || []}
                    selectedSkills={selectedSkills}
                    skillBaseCost={skillBaseCost}
                    onAddSkill={handleAddSkill}
                    onAddSpecifiedSkill={handleAddSpecifiedSkill}
                />
            </WizardSection>
        </div>
    );
}
