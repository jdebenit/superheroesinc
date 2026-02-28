import React from 'react';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';

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
        <WizardSection
            title="Opciones de Origen: Parahumano"
            rightContent={
                <CostBadge
                    cost={isHybridWithHuman ? "+3" : 0}
                    label="PC extra"
                    variant={isHybridWithHuman ? "penalty" : "default"}
                />
            }
        >
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
        </WizardSection >
    );
}
