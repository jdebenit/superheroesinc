import React, { useState, useEffect, useMemo } from 'react';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../../../data/specialSkills';
import { calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt, calculateSpecialSkillValues } from '../../../utils/characterCalculations';
import { getFreeSkillsForOrigins } from '../../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../../data/requiredSpecialtySkills';
import { useSkillAutoEffects } from '../../../hooks/wizard/useCharacterAutoEffects';
import { WizardSection } from '../shared/WizardSection';
import { SkillTable } from './Step4_Components/SkillTable';
import { SkillRow } from './Step4_Components/SkillRow';
import { WizardButton } from '../shared/WizardButton';

interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
}

const isSkillAllowed = (skill: any, originItems: any[]) => {
    if (!skill.allowedCriteria || skill.allowedCriteria.length === 0) return true;

    return skill.allowedCriteria.some((criteria: any) => {
        if (criteria.origin) {
            const hasOrigin = originItems.some(item => Object.keys(item)[0] === criteria.origin);
            if (!hasOrigin) return false;
        }

        if (criteria.subtype) {
            const hasSubtype = originItems.some(item => {
                const originName = Object.keys(item)[0];
                const subtypes = item[originName];
                return Array.isArray(subtypes) && subtypes.includes(criteria.subtype);
            });
            if (!hasSubtype) return false;
        }

        return true;
    });
};

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
    const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);

    // Get required skills from Vigilante specialties
    const requiredSkillIds = getRequiredSkillsForOrigins(data.origin?.items || []);

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
            <WizardSection
                title="Habilidades Generales"
                description="Estas habilidades las poseen todos los personajes. Se calculan en base a tus características y orígenes."
            >
                <SkillTable>
                    {GENERAL_SKILLS.map((skill, index) => {
                        const val = skillValues[skill.id];

                        // Custom formula logic for Heraldo Cosmico
                        const isHeraldoCosmico = data.origin?.items?.some((o: any) => {
                            const originName = Object.keys(o)[0];
                            const content = o[originName] as string[];
                            return content && content.includes('Heraldo Cósmico');
                        });

                        let formula = skill.formulaText;
                        if (skill.id === 'conocimientos' && isHeraldoCosmico) {
                            formula = 'INT/5';
                        }

                        // Render Name (with input for language)
                        const renderName = (
                            <>
                                {skill.name}
                                {skill.id === 'idioma' && (
                                    <div style={{ marginTop: '0.25rem' }}>
                                        <input
                                            type="text"
                                            value={nativeLanguage}
                                            onChange={(e) => handleNativeLanguageChange(e.target.value)}
                                            placeholder="Especifique idioma..."
                                            style={{
                                                width: '100%',
                                                padding: '0.25rem 0.5rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem',
                                                fontWeight: 'normal'
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        );

                        return (
                            <SkillRow
                                key={skill.id}
                                name={renderName}
                                formula={formula}
                                baseValue={val.base}
                                minBase={val.minBase}
                                originMod={val.originMod}
                                specialtyMod={val.specialtyMod}
                                manualMod={manualMods[skill.id] || 0}
                                total={val.total}
                                calcPCCost={val.pcCost}
                                onBaseChange={(v) => handleBaseChange(skill.id, v, val.minBase)}
                                onModChange={(v) => handleModChange(skill.id, v)}
                            />
                        );
                    })}
                </SkillTable>
            </WizardSection>

            {/* SPECIAL SKILLS SECTION */}
            <WizardSection
                title="Habilidades de Aprendizaje"
                description={<>Selecciona las habilidades que tu personaje ha aprendido. Cada habilidad cuesta <strong>{skillBaseCost} PC</strong> + coste de mejora.</>}
            >
                {/* PC Counter */}
                <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                            Habilidades Seleccionadas: {specialSkillsPC.totalSkills}
                        </span>
                        <span style={{ fontSize: '1.125rem' }}>
                            ({specialSkillsPC.freeSkills} gratuitas {specialSkillsPC.intBonusSkills > 0 && <span style={{ color: '#059669', fontSize: '0.9em' }}>[+{specialSkillsPC.intBonusSkills} INT]</span>}, {specialSkillsPC.paidSkills} pagadas)
                        </span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                            Total: {specialSkillsPC.totalPC.toFixed(1).replace('.0', '')} PC
                        </span>
                    </div>
                </div>

                {/* Selected Skills Table */}
                {(Object.keys(selectedSkills).length > 0 || Object.keys(specifiedSkills).length > 0) && (
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: '2px solid #10b981',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' }}>
                            ✓ Habilidades Seleccionadas
                        </h3>
                        <SkillTable isSpecial>
                            {/* Standard Selected Skills */}
                            {Object.entries(selectedSkills).map(([skillId, skillData]) => {
                                const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
                                if (!skillDef) return null;
                                const val = standardSpecialSkills[skillId];
                                if (!val) return null;

                                const itemBaseCost = skillData.isFree ? 0 : skillBaseCost;
                                const totalCost = itemBaseCost + (val.pcCost || 0);

                                return (
                                    <SkillRow
                                        key={skillId}
                                        isSpecial
                                        name={skillDef.name}
                                        formula={skillDef.formulaText}
                                        baseValue={val.base}
                                        minBase={val.minBase}
                                        originMod={val.originMod}
                                        specialtyMod={val.specialtyMod}
                                        manualMod={skillData.manualMods || 0}
                                        total={val.total}
                                        calcPCCost={val.pcCost}
                                        totalPCCost={totalCost}
                                        isFree={skillData.isFree}
                                        isRequired={skillData.isRequired}
                                        onBaseChange={(v) => handleSpecialBaseChange(skillId, v, val.minBase, false)}
                                        onModChange={(v) => handleSpecialModChange(skillId, v, false)}
                                        onRemove={() => handleRemoveSkill(skillId)}
                                    />
                                );
                            })}

                            {/* Specified Skills */}
                            {Object.entries(specifiedSkills).map(([uniqueId, spec]) => {
                                const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
                                if (!skillDef) return null;
                                const val = specifiedSpecialSkills[uniqueId];
                                if (!val) return null;

                                const itemBaseCost = spec.isFree ? 0 : skillBaseCost;
                                const totalCost = itemBaseCost + (val.pcCost || 0);

                                const renderName = (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span>{skillDef.name}</span>
                                        <input
                                            type="text"
                                            value={spec.specification}
                                            onChange={(e) => handleSpecificationChange(uniqueId, e.target.value)}
                                            placeholder={skillDef.specificationPlaceholder || "Especificar..."}
                                            style={{
                                                padding: '0.25rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                );

                                return (
                                    <SkillRow
                                        key={uniqueId}
                                        isSpecial
                                        name={renderName}
                                        formula={skillDef.formulaText}
                                        baseValue={val.base}
                                        minBase={val.minBase}
                                        originMod={val.originMod}
                                        specialtyMod={val.specialtyMod}
                                        manualMod={spec.manualMods || 0}
                                        total={val.total}
                                        calcPCCost={val.pcCost}
                                        totalPCCost={totalCost}
                                        isFree={spec.isFree}
                                        isRequired={spec.isRequired}
                                        onBaseChange={(v) => handleSpecialBaseChange(uniqueId, v, val.minBase, true)}
                                        onModChange={(v) => handleSpecialModChange(uniqueId, v, true)}
                                        onRemove={() => handleRemoveSpecifiedSkill(uniqueId)}
                                    />
                                );
                            })}
                        </SkillTable>
                    </div>
                )}

                {/* Available Skills by Category */}
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
                    Habilidades Disponibles
                </h3>

                {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category} style={{ marginBottom: '2rem' }}>
                        <h4 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '0.75rem',
                            color: '#374151',
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '0.5rem'
                        }}>
                            {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]}
                        </h4>

                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            padding: '1rem',
                            border: '1px solid #e5e7eb'
                        }}>
                            {skills.filter(skill => isSkillAllowed(skill, data.origin?.items || [])).map(skill => {
                                const isSelected = selectedSkills[skill.id] !== undefined;
                                const isParametrizable = skill.requiresSpecification;
                                const displayCost = `${skillBaseCost} PC`;

                                if (isParametrizable) {
                                    return (
                                        <div key={skill.id} style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <strong>{skill.name}</strong>
                                                {skill.description && (
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                                        ({skill.description})
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                                {skill.formulaText}
                                            </span>
                                            <WizardButton
                                                variant="primary"
                                                onClick={() => handleAddSpecifiedSkill(skill.id)}
                                                style={{ backgroundColor: '#10b981' }}
                                            >
                                                + Añadir ({displayCost})
                                            </WizardButton>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div key={skill.id} style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #e5e7eb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            opacity: isSelected ? 0.5 : 1
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <strong>{skill.name}</strong>
                                                {skill.description && (
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                                        ({skill.description})
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                                {skill.formulaText}
                                            </span>
                                            {!isSelected ? (
                                                <WizardButton
                                                    variant="primary"
                                                    onClick={() => handleAddSkill(skill.id)}
                                                    style={{ backgroundColor: '#10b981' }}
                                                >
                                                    + Añadir ({displayCost})
                                                </WizardButton>
                                            ) : (
                                                <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    ✓ Seleccionada
                                                </span>
                                            )}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                ))}
            </WizardSection>
        </div>
    );
}
