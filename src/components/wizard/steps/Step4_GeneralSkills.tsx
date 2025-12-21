import React, { useState, useEffect } from 'react';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { calculateGeneralSkillValues } from '../../../utils/characterCalculations';

interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step4_GeneralSkills({ data, onChange }: Step4Props) {
    const [manualMods, setManualMods] = useState<{ [key: string]: number }>(
        data.skills?.generalManualMods || {}
    );

    // Calculate skills on every render based on current props and local state
    // This ensures that if characteristics change elsewhere, this updates.
    // However, saving to 'data' needs to happen efficiently.
    const skillValues = calculateGeneralSkillValues(
        data.attributes.values, // { Fuerza: 50, ... }
        data.origin?.items || [],
        manualMods
    );

    // Save to parent whenever manualMods changes, OR we should save the derived values?
    // We should probably save the breakdown for persistence
    useEffect(() => {
        const items = Object.keys(skillValues).map(key => {
            const skillDef = GENERAL_SKILLS.find(s => s.id === key);
            const val = skillValues[key];
            return {
                name: skillDef?.name || key,
                math: skillDef?.formulaText || '',
                value: `${val.total}%` // Format as "75%"
            };
        });

        // Avoid infinite loop: only update if changed?
        // Actually, we can just update on blur or manual change.
        // But for "Preview" to work immediately, we need to update 'data'.
        // Doing it in useEffect might cause loop if onChange triggers re-render of this component.
        // We better update 'data' only when manualMods change or when mounting if empty.

        // Let's rely on manual update for manualMods. 
        // For the "items" list, we might want to update it when leaving step or on change?
        // Updating 'data' on every render is bad.

        const newSkillsData = {
            generalManualMods: manualMods,
            items: items // Update the flat list for the sheet
        };

        // Simple check to avoid loop: stringify comparison?
        if (JSON.stringify(data.skills?.items) !== JSON.stringify(items) ||
            JSON.stringify(data.skills?.generalManualMods) !== JSON.stringify(manualMods)) {
            onChange({
                ...data,
                skills: {
                    ...data.skills,
                    ...newSkillsData
                }
            });
        }
    }, [manualMods, data.attributes.values, data.origin?.items]); // Dependencies that affect calculation

    const handleModChange = (skillId: string, value: string) => {
        const num = parseInt(value) || 0;
        setManualMods(prev => ({
            ...prev,
            [skillId]: num
        }));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Habilidades Generales
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '2rem' }}>
                Estas habilidades las poseen todos los personajes. Se calculan en base a tus características y orígenes.
                Puedes añadir modificadores adicionales (por equipo, ventajas, etc.) en la columna "Otros".
            </p>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
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
                                        {val.base}
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
        </div>
    );
}
