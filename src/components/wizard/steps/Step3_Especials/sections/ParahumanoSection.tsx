import React from 'react';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';

export interface ParahumanoParams {
    isHybridWithHuman: boolean;
}

interface ParahumanoSectionProps {
    parahumanoParams: ParahumanoParams;
    onChange: (updates: any) => void;
}

export default function ParahumanoSection({ parahumanoParams, onChange }: ParahumanoSectionProps) {
    const { isHybridWithHuman } = parahumanoParams;

    const handleHybridChange = (checked: boolean) => {
        onChange({
            parahumanoParams: {
                ...parahumanoParams,
                isHybridWithHuman: checked
            }
        });
    };

    return (
        <div style={{
            backgroundColor: '#faf5ff',
            border: '2px solid #9333ea',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e9d5ff'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6b21a8'
                }}>Opciones de Origen: Parahumano</h3>

                <div style={{
                    backgroundColor: isHybridWithHuman ? '#9333ea' : '#d1d5db',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {isHybridWithHuman ? 'HÍBRIDO ACTIVO' : 'NO HÍBRIDO'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #fbbf24',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s'
                }}>
                    <input
                        type="checkbox"
                        checked={isHybridWithHuman}
                        onChange={(e) => handleHybridChange(e.target.checked)}
                        style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            cursor: 'pointer',
                            accentColor: '#9333ea'
                        }}
                    />
                    <div>
                        <span style={{
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            display: 'block'
                        }}>
                            Híbrido con Humano
                        </span>
                        <span style={{
                            fontSize: '0.875rem',
                            color: '#4b5563',
                            display: 'block',
                            marginTop: '0.25rem'
                        }}>
                            Acceso a poderes de Alterado con un coste adicional de <strong>+3 PCs</strong> al coste base de cada poder seleccionado.
                        </span>
                    </div>
                </label>
            </div>
        </div>
    );
}

