import React, { useMemo } from 'react';
import { INCOME_SOURCES } from '../../../../../data/technologicalOptions';

interface TechnologicalSectionProps {
    techParams: { incomeSource: string } | null;
    onChange: (params: { incomeSource: string }) => void;
}

export default function TechnologicalSection({ techParams, onChange }: TechnologicalSectionProps) {
    const selectedId = techParams?.incomeSource || '';

    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ incomeSource: e.target.value });
    };

    const selectedSource = useMemo(() =>
        INCOME_SOURCES.find(s => s.id === selectedId),
        [selectedId]);

    return (
        <div style={{
            backgroundColor: '#f0f9ff', // Sky 50
            border: '2px solid #0ea5e9', // Sky 500
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#0369a1' // Sky 700
                }}>Tecnológico</h3>

                <div style={{
                    backgroundColor: '#0ea5e9', // Sky 500
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {selectedSource ? `+${selectedSource.pc} PC` : '0 PC'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    Selecciona cómo financia el personaje su tecnología. Esto afecta al coste en Puntos de Creación.
                </p>

                {/* SOURCE SELECTOR */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#0369a1', // Sky 700
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase'
                    }}>
                        Fuente de Ingresos
                    </label>
                    <select
                        value={selectedId}
                        onChange={handleSourceChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '2px solid #0ea5e9', // Sky 500
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">-- Selecciona una opción --</option>
                        {INCOME_SOURCES.map(opt => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label} ({opt.pc > 0 ? `+${opt.pc}` : '0'} PC)
                            </option>
                        ))}
                    </select>
                    {selectedSource && (
                        <p style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#e0f2fe', // Sky 100
                            borderRadius: '6px',
                            borderLeft: '4px solid #0284c7', // Sky 600
                            color: '#075985', // Sky 800
                            fontSize: '0.9rem'
                        }}>
                            <strong>Descripción:</strong> {selectedSource.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
