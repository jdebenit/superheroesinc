import React, { useState, useEffect } from 'react';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS, SKILL_CATEGORIES, getSkillsByCategory } from '../../../data/specialSkills';
import { calculateGeneralSkillValues, calculateSpecialSkillsPC } from '../../../utils/characterCalculations';
import { getFreeSkillsForOrigins } from '../../../data/freeOriginSkills';

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

    // Special skills - NEW STRUCTURE
    const [selectedSkills, setSelectedSkills] = useState<{ [skillId: string]: { isFree: boolean; manualMods: number } }>(
        data.skills?.selected || {}
    );
    const [specifiedSkills, setSpecifiedSkills] = useState<{ [uniqueId: string]: { skillId: string; specification: string; isFree: boolean; manualMods: number } }>(
        data.skills?.specified || {}
    );

    // Calculate general skills
    const { skills: skillValues } = calculateGeneralSkillValues(
        data.attributes.values,
        data.origin?.items || [],
        manualMods,
        manualBases
    );

    // Calculate special skills PC cost
    const specialSkillsPC = calculateSpecialSkillsPC(
        selectedSkills,
        specifiedSkills,
        data.origin?.items || []
    );

    // Get free skills from origin
    const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);

    // Auto-add free skills from origin
    useEffect(() => {
        if (freeSkillIds.length > 0) {
            const newSelected = { ...selectedSkills };
            let hasChanges = false;

            freeSkillIds.forEach(skillId => {
                if (!newSelected[skillId]) {
                    newSelected[skillId] = { isFree: true, manualMods: 0 };
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedSkills(newSelected);
            }
        }
    }, [freeSkillIds.join(',')]);

    // Save to parent whenever data changes
    useEffect(() => {
        // General skills items
        const generalItems = Object.keys(skillValues).map(key => {
            const skillDef = GENERAL_SKILLS.find(s => s.id === key);
            const val = skillValues[key];
            return {
                name: skillDef?.name || key,
                math: skillDef?.formulaText || '',
                value: `${val.total}%`
            };
        });

        // Special skills items - only selected ones
        const specialStandardItems = Object.keys(selectedSkills).map(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            const base = skillDef?.formula ? Math.floor(skillDef.formula(data.attributes.values || {})) : 0;
            const total = base + (selectedSkills[skillId].manualMods || 0);
            return {
                name: skillDef?.name || skillId,
                math: skillDef?.formulaText || '',
                value: `${total}%`
            };
        });

        // Special skills items - specified
        const specialSpecifiedItems = Object.keys(specifiedSkills).map(uniqueId => {
            const spec = specifiedSkills[uniqueId];
            const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
            const base = skillDef?.formula ? Math.floor(skillDef.formula(data.attributes.values || {})) : 0;
            const total = base + (spec.manualMods || 0);
            return {
                name: `${skillDef?.name}: ${spec.specification}`,
                math: skillDef?.formulaText || '',
                value: `${total}%`
            };
        });

        // Combine special skills (standard + specified)
        const allSpecialItems = [...specialStandardItems, ...specialSpecifiedItems];

        const newSkillsData = {
            generalManualMods: manualMods,
            manualBases: manualBases,
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
    }, [manualMods, manualBases, selectedSkills, specifiedSkills, data.attributes.values, data.origin?.items]);

    // Handlers for general skills
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

    // Handlers for special skills
    const handleAddSkill = (skillId: string) => {
        setSelectedSkills(prev => ({
            ...prev,
            [skillId]: { isFree: false, manualMods: 0 }
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
                manualMods: 0
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
                Habilidades Especiales
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                Selecciona las habilidades especiales que tu personaje ha aprendido. Cada habilidad cuesta <strong>1 PC</strong> (0.5 PC para Liberado).
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
                        ({specialSkillsPC.freeSkills} gratuitas, {specialSkillsPC.paidSkills} pagadas)
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        Total: {specialSkillsPC.totalPC} PC
                    </span>
                </div>
            </div>

            {/* Selected Skills */}
            {(Object.keys(selectedSkills).length > 0 || Object.keys(specifiedSkills).length > 0) && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '2px solid #10b981'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' }}>
                        ✓ Habilidades Seleccionadas
                    </h3>

                    {Object.entries(selectedSkills).map(([skillId, skillData]) => {
                        const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
                        if (!skillDef) return null;

                        const base = skillDef.formula ? Math.floor(skillDef.formula(data.attributes.values || {})) : 0;
                        const total = base + (skillData.manualMods || 0);

                        return (
                            <div key={skillId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{ flex: 1, fontWeight: 'bold' }}>{skillDef.name}</span>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                    {skillDef.formulaText}
                                </span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: skillData.isFree ? '#10b981' : '#f59e0b' }}>
                                    {skillData.isFree ? 'GRATIS' : '1 PC'}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#059669', minWidth: '60px', textAlign: 'center' }}>
                                    {total}%
                                </span>
                                {!skillData.isFree && (
                                    <button
                                        onClick={() => handleRemoveSkill(skillId)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        × Eliminar
                                    </button>
                                )}
                                {skillData.isFree && (
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                        (Origen)
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    {Object.entries(specifiedSkills).map(([uniqueId, spec]) => {
                        const skillDef = SPECIAL_SKILLS.find(s => s.id === spec.skillId);
                        if (!skillDef) return null;

                        const base = skillDef.formula ? Math.floor(skillDef.formula(data.attributes.values || {})) : 0;
                        const total = base + (spec.manualMods || 0);

                        return (
                            <div key={uniqueId} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                marginBottom: '0.5rem'
                            }}>
                                <input
                                    type="text"
                                    value={spec.specification}
                                    onChange={(e) => handleSpecificationChange(uniqueId, e.target.value)}
                                    placeholder={`${skillDef.name}: ${skillDef.specificationPlaceholder}`}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                    {skillDef.formulaText}
                                </span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: spec.isFree ? '#10b981' : '#f59e0b' }}>
                                    {spec.isFree ? 'GRATIS' : '1 PC'}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#059669', minWidth: '60px', textAlign: 'center' }}>
                                    {total}%
                                </span>
                                <button
                                    onClick={() => handleRemoveSpecifiedSkill(uniqueId)}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    × Eliminar
                                </button>
                            </div>
                        );
                    })}
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
