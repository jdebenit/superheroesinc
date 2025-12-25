import React, { useState, useEffect } from 'react';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../../../data/specialSkills';
import { calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt, calculateSpecialSkillValues } from '../../../utils/characterCalculations';
import { getFreeSkillsForOrigins } from '../../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../../data/requiredSpecialtySkills';

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
    const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);

    // Get required skills from Vigilante specialties
    const requiredSkillIds = getRequiredSkillsForOrigins(data.origin?.items || []);

    // Auto-add free skills from origin
    useEffect(() => {
        if (freeSkillIds.length > 0) {
            const newSelected = { ...selectedSkills };
            let hasChanges = false;

            freeSkillIds.forEach(skillId => {
                if (!newSelected[skillId]) {
                    newSelected[skillId] = { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 };
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedSkills(newSelected);
            }
        }
    }, [freeSkillIds.join(',')]);

    // Auto-add required skills from Vigilante specialties
    useEffect(() => {
        if (requiredSkillIds.length > 0) {
            const newSelected = { ...selectedSkills };
            const newSpecified = { ...specifiedSkills };
            let hasChanges = false;

            requiredSkillIds.forEach(skillId => {
                const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);

                if (skillDef?.requiresSpecification) {
                    // For parametrizable skills (like 'otro_idioma'), add an empty instance
                    const existingInstances = Object.values(newSpecified).filter(s => s.skillId === skillId);
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
                    }
                } else {
                    // For standard skills
                    if (!newSelected[skillId]) {
                        newSelected[skillId] = { isFree: false, isRequired: true, manualMods: 0, manualBases: 0 };
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                setSelectedSkills(newSelected);
                setSpecifiedSkills(newSpecified);
            }
        }
    }, [requiredSkillIds.join(',')]);

    // Save to parent whenever data changes
    useEffect(() => {
        // Format items for final data
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

        // Special skills items - for parent component
        const specialStandardItems = Object.keys(standardSpecialSkills).map(skillId => {
            const val = standardSpecialSkills[skillId];
            return {
                name: val.total.toString(), // TODO: Verify what 'name' should be here. Originally it was skillDef.name
                // Reverting to previous logic for 'name' but using calculated total
                // Actually, let's use the logic that was here but with calculated values
                // But wait, the previous code constructed it from definitions.
                // Let's grab definitions again to be safe and cleaner
            };
        });

        const specialStandardItemsFormatted = Object.keys(selectedSkills).map(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            const val = standardSpecialSkills[skillId]; // Using calculated values
            if (!val) return null;
            return {
                name: skillDef?.name || skillId,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        }).filter(Boolean);

        // Special skills items - specified
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

        // Combine special skills (standard + specified)
        const allSpecialItems = [...specialStandardItemsFormatted, ...specialSpecifiedItemsFormatted];

        const newSkillsData = {
            generalManualMods: manualMods,
            manualBases: manualBases,
            nativeLanguage: nativeLanguage,
            selected: selectedSkills,
            specified: specifiedSkills,
            generalItems: generalItems,        // Habilidades generales
            specialItems: allSpecialItems,     // Habilidades de aprendizaje
            items: [...generalItems, ...allSpecialItems]  // Todas juntas (para compatibilidad)
        };

        // Simple check to avoid loop
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

    // Handlers for general skills
    const handleNativeLanguageChange = (value: string) => {
        setNativeLanguage(value);
    };

    const handleModChange = (skillId: string, value: string) => {
        const num = parseInt(value) || 0;
        setManualMods(prev => ({
            ...prev,
            [skillId]: num
        }));
    };

    const handleBaseChange = (skillId: string, value: string, minLimit: number) => {
        const num = parseInt(value) || 0;
        if (num >= minLimit) {
            setManualBases(prev => ({
                ...prev,
                [skillId]: num
            }));
        }
    };

    // Handlers for special skills modifiers
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

    return (
        <div style={{ padding: '2rem' }}>
            {/* GENERAL SKILLS SECTION */}
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Habilidades Generales
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '2rem' }}>
                Estas habilidades las poseen todos los personajes. Se calculan en base a tus características y orígenes.
            </p>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                marginBottom: '3rem'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Habilidad</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Fórmula</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Base</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Origen</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Especialidad</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Otros</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: '#111827', fontWeight: 'bold' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {GENERAL_SKILLS.map((skill, index) => {
                            const val = skillValues[skill.id];
                            const isEven = index % 2 === 0;
                            return (
                                <tr key={skill.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
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
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                        {skill.formulaText}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#4b5563' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <input
                                                type="number"
                                                value={val.base}
                                                min={val.minBase}
                                                onChange={(e) => handleBaseChange(skill.id, e.target.value, val.minBase)}
                                                style={{
                                                    width: '50px',
                                                    padding: '0.25rem',
                                                    border: val.pcCost > 0 ? '2px solid #f59e0b' : '1px solid #d1d5db',
                                                    borderRadius: '4px',
                                                    textAlign: 'center',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            {val.pcCost > 0 && (
                                                <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                                                    {val.pcCost.toFixed(1)} PC
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: val.originMod ? '#2563eb' : '#9ca3af', fontWeight: val.originMod ? 'bold' : 'normal' }}>
                                        {val.originMod > 0 ? `+${val.originMod}` : val.originMod || '-'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: val.specialtyMod ? '#7c3aed' : '#9ca3af', fontWeight: val.specialtyMod ? 'bold' : 'normal' }}>
                                        {val.specialtyMod > 0 ? `+${val.specialtyMod}` : val.specialtyMod || '-'}
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            value={manualMods[skill.id] || ''}
                                            onChange={(e) => handleModChange(skill.id, e.target.value)}
                                            placeholder="0"
                                            style={{
                                                width: '60px',
                                                padding: '0.5rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem', color: '#059669' }}>
                                        {val.total}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* SPECIAL SKILLS SECTION */}
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Habilidades de Aprendizaje
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                Selecciona las habilidades que tu personaje ha aprendido. Cada habilidad cuesta <strong>1 PC</strong> (0.5 PC para Liberado).
            </p>

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

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead style={{ backgroundColor: '#ecfdf5', borderBottom: '2px solid #10b981' }}>
                                <tr>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#065f46' }}>Habilidad</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Fórmula</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Base</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Origen</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Especialidad</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Otros</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b', fontWeight: 'bold' }}>TOTAL</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>PCs</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#064e3b' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Standard Selected Skills */}
                                {Object.entries(selectedSkills).map(([skillId, skillData]) => {
                                    const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
                                    if (!skillDef) return null;

                                    const val = standardSpecialSkills[skillId];
                                    if (!val) return null; // Should not happen if calcs are correct

                                    // Determine base skill cost
                                    // Logic duplicated from calculateSpecialSkillsPC for display purposes
                                    let isLiberado = false;
                                    if (data.origin?.items?.length > 0) {
                                        data.origin.items.forEach((item: any) => {
                                            const originName = Object.keys(item)[0];
                                            const content = item[originName];
                                            if (Array.isArray(content) && content.includes('Liberado')) {
                                                isLiberado = true;
                                            }
                                        });
                                    }
                                    const skillBaseCost = skillData.isFree ? 0 : (isLiberado ? 0.5 : 1);
                                    const totalCost = skillBaseCost + (val.pcCost || 0);

                                    return (
                                        <tr key={skillId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                {skillDef.name}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                {skillDef.formulaText}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <input
                                                        type="number"
                                                        value={val.base}
                                                        min={val.minBase}
                                                        onChange={(e) => handleSpecialBaseChange(skillId, e.target.value, val.minBase, false)}
                                                        style={{
                                                            width: '50px',
                                                            padding: '0.25rem',
                                                            border: val.pcCost > 0 ? '2px solid #f59e0b' : '1px solid #d1d5db',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: val.originMod ? '#2563eb' : '#9ca3af', fontWeight: val.originMod ? 'bold' : 'normal' }}>
                                                {val.originMod > 0 ? `+${val.originMod}` : val.originMod || '-'}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: val.specialtyMod ? '#7c3aed' : '#9ca3af', fontWeight: val.specialtyMod ? 'bold' : 'normal' }}>
                                                {val.specialtyMod > 0 ? `+${val.specialtyMod}` : val.specialtyMod || '-'}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={skillData.manualMods || ''}
                                                    onChange={(e) => handleSpecialModChange(skillId, e.target.value, false)}
                                                    placeholder="0"
                                                    style={{
                                                        width: '50px',
                                                        padding: '0.25rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem', color: '#059669' }}>
                                                {val.total}%
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'bold',
                                                    color: totalCost > 0 ? '#b45309' : '#10b981'
                                                }}>
                                                    {totalCost > 0 ? `${totalCost.toFixed(1).replace('.0', '')} PC` : 'GRATIS'}
                                                </span>
                                                {val.pcCost > 0 && (
                                                    <div style={{ fontSize: '0.7em', color: '#666' }}>
                                                        (Base: +{val.pcCost.toFixed(1)})
                                                    </div>
                                                )}
                                                {skillData.isRequired && (
                                                    <div style={{ fontSize: '0.7em', color: '#b45309', fontStyle: 'italic' }}>
                                                        Obligatoria
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                {!skillData.isFree && !skillData.isRequired && (
                                                    <button
                                                        onClick={() => handleRemoveSkill(skillId)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#fee2e2',
                                                            color: '#ef4444',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        title="Eliminar"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                                {skillData.isFree && <span style={{ fontSize: '1.25rem', color: '#10b981' }}>✓</span>}
                                                {skillData.isRequired && <span style={{ fontSize: '1.25rem', color: '#f59e0b' }}>✓</span>}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Specified Skills */}
                                {Object.entries(specifiedSkills).map(([uniqueId, spec]) => {
                                    const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
                                    if (!skillDef) return null;

                                    const val = specifiedSpecialSkills[uniqueId];
                                    if (!val) return null;

                                    // Determine base skill cost
                                    let isLiberado = false;
                                    if (data.origin?.items?.length > 0) {
                                        data.origin.items.forEach((item: any) => {
                                            const originName = Object.keys(item)[0];
                                            const content = item[originName];
                                            if (Array.isArray(content) && content.includes('Liberado')) {
                                                isLiberado = true;
                                            }
                                        });
                                    }
                                    const skillBaseCost = spec.isFree ? 0 : (isLiberado ? 0.5 : 1);
                                    const totalCost = skillBaseCost + (val.pcCost || 0);

                                    return (
                                        <tr key={uniqueId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#1f2937' }}>
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
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                {skillDef.formulaText}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <input
                                                        type="number"
                                                        value={val.base}
                                                        min={val.minBase}
                                                        onChange={(e) => handleSpecialBaseChange(uniqueId, e.target.value, val.minBase, true)}
                                                        style={{
                                                            width: '50px',
                                                            padding: '0.25rem',
                                                            border: val.pcCost > 0 ? '2px solid #f59e0b' : '1px solid #d1d5db',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: val.originMod ? '#2563eb' : '#9ca3af', fontWeight: val.originMod ? 'bold' : 'normal' }}>
                                                {val.originMod > 0 ? `+${val.originMod}` : val.originMod || '-'}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: val.specialtyMod ? '#7c3aed' : '#9ca3af', fontWeight: val.specialtyMod ? 'bold' : 'normal' }}>
                                                {val.specialtyMod > 0 ? `+${val.specialtyMod}` : val.specialtyMod || '-'}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={spec.manualMods || ''}
                                                    onChange={(e) => handleSpecialModChange(uniqueId, e.target.value, true)}
                                                    placeholder="0"
                                                    style={{
                                                        width: '50px',
                                                        padding: '0.25rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem', color: '#059669' }}>
                                                {val.total}%
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'bold',
                                                    color: totalCost > 0 ? '#b45309' : '#10b981'
                                                }}>
                                                    {totalCost > 0 ? `${totalCost.toFixed(1).replace('.0', '')} PC` : 'GRATIS'}
                                                </span>
                                                {val.pcCost > 0 && (
                                                    <div style={{ fontSize: '0.7em', color: '#666' }}>
                                                        (Base: +{val.pcCost.toFixed(1)})
                                                    </div>
                                                )}
                                                {spec.isRequired && (
                                                    <div style={{ fontSize: '0.7em', color: '#b45309', fontStyle: 'italic' }}>
                                                        Obligatoria
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                {!spec.isRequired && (
                                                    <button
                                                        onClick={() => handleRemoveSpecifiedSkill(uniqueId)}
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#fee2e2',
                                                            color: '#ef4444',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        title="Eliminar"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                                {spec.isRequired && <span style={{ fontSize: '1.25rem', color: '#f59e0b' }}>✓</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
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
                        {skills.map(skill => {
                            const isSelected = selectedSkills[skill.id] !== undefined;
                            const isParametrizable = skill.requiresSpecification;

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
                                        <button
                                            onClick={() => handleAddSpecifiedSkill(skill.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            + Añadir (1 PC)
                                        </button>
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
                                            <button
                                                onClick={() => handleAddSkill(skill.id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                + Añadir (1 PC)
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 'bold' }}>
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
        </div>
    );
}
