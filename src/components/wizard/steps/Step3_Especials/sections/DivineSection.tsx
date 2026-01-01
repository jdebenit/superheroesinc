import React, { useMemo } from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../../../data/divineOptions';

export interface DivineParams {
    focus: string | null;
}

interface DivineSectionProps {
    divineParams: DivineParams;
    onChange: (updates: any) => void;
}

export default function DivineSection({ divineParams, onChange }: DivineSectionProps) {
    const { focus } = divineParams;

    const handleFocusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({
            divineParams: {
                ...divineParams,
                focus: e.target.value || null
            }
        });
    };

    const selectedFocus = useMemo(() =>
        DIVINE_FOCUS_OPTIONS.find(f => f.id === focus),
        [focus]);

    return (
        <div style={{
            backgroundColor: '#fffbeb', // Amber 50
            border: '2px solid #f59e0b', // Amber 500
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #fcd34d'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#b45309'
                }}>Opciones de Origen: Divino</h3>

                <div style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {selectedFocus ? `+${selectedFocus.cost} PC` : '0 PC'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    Como entidad divina, debes determinar si tu poder requiere un foco para manifestarse o alcanzar su máximo potencial.
                </p>

                {/* FOCUS SELECTOR */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#b45309',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase'
                    }}>
                        Foco del Poder
                    </label>
                    <select
                        value={focus || ''}
                        onChange={handleFocusChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '2px solid #f59e0b',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">-- Selecciona una opción --</option>
                        {DIVINE_FOCUS_OPTIONS.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label} ({opt.cost > 0 ? `+${opt.cost}` : '0'} PC)
                            </option>
                        ))}
                    </select>
                    {selectedFocus && (
                        <p style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#fff7ed',
                            borderRadius: '6px',
                            borderLeft: '4px solid #f97316',
                            color: '#9a3412',
                            fontSize: '0.9rem'
                        }}>
                            <strong>Efecto:</strong> {selectedFocus.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
