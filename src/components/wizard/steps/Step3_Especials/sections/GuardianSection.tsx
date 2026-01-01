import React, { useMemo } from 'react';
import {
    GUARDIAN_QUALITIES,
    GUARDIAN_OBJECTS,
    GUARDIAN_FEATURES,
    GUARDIAN_TRANSFORMATIONS
} from '../../../../../data/guardianOptions';

export interface GuardianParams {
    quality: string | null;
    objectType: string | null;
    feature: string | null;
    transformation: string | null;
}

interface GuardianSectionProps {
    guardianParams: GuardianParams;
    onChange: (updates: any) => void;
}

export default function GuardianSection({ guardianParams, onChange }: GuardianSectionProps) {
    const { quality, objectType, feature, transformation } = guardianParams;

    const handleChange = (field: keyof GuardianParams, value: string | null) => {
        onChange({
            guardianParams: {
                ...guardianParams,
                [field]: value
            }
        });
    };

    const selectedQuality = useMemo(() =>
        GUARDIAN_QUALITIES.find(q => q.id === quality),
        [quality]);

    return (
        <div style={{
            backgroundColor: '#eff6ff', // Light blue
            border: '2px solid #2563eb', // Blue border
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #bfdbfe'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#1e40af'
                }}>Opciones de Origen: Guardián</h3>

                <div style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {selectedQuality ? (
                        selectedQuality.cost > 0 ? `+${selectedQuality.cost} PC` : `${selectedQuality.cost} PC`
                    ) : '0 PC'}
                </div>
            </div>

            <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>

                {/* QUALITY */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                        Cualidad del Objeto
                    </label>
                    <select
                        value={quality || ''}
                        onChange={(e) => handleChange('quality', e.target.value || null)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {GUARDIAN_QUALITIES.map(q => (
                            <option key={q.id} value={q.id}>
                                {q.label} ({q.cost > 0 ? '+' : ''}{q.cost} PC)
                            </option>
                        ))}
                    </select>
                    {selectedQuality && (
                        <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                            {selectedQuality.description}
                        </p>
                    )}
                </div>

                {/* OBJECT TYPE */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                        Objeto
                    </label>
                    <select
                        value={objectType || ''}
                        onChange={(e) => handleChange('objectType', e.target.value || null)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {GUARDIAN_OBJECTS.map(o => (
                            <option key={o.id} value={o.id}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* FEATURE */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                        Rasgo Especial
                    </label>
                    <select
                        value={feature || ''}
                        onChange={(e) => handleChange('feature', e.target.value || null)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {GUARDIAN_FEATURES.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>
                </div>

                {/* TRANSFORMATION */}
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e40af' }}>
                        Transformación
                    </label>
                    <select
                        value={transformation || ''}
                        onChange={(e) => handleChange('transformation', e.target.value || null)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {GUARDIAN_TRANSFORMATIONS.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

            </div>
        </div>
    );
}
