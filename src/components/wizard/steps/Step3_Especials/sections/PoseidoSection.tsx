import React, { useMemo } from 'react';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';

interface PoseidoParams {
    formType: string | null;
}

interface PoseidoSectionProps {
    poseidoParams: PoseidoParams;
    onChange: (updates: any) => void;
}

export const POSEIDO_FORMS = [
    { id: 'humano', label: 'Humano', pc: 3, description: 'Apariencia completamente humana.' },
    { id: 'cambia_forma', label: 'Cambia de forma', pc: 0, description: 'Puede alternar entre forma humana y otra forma.' },
    { id: 'no_humana', label: 'Forma no humana', pc: -3, description: 'Apariencia monstruosa o extraña permanentemente. (Descuento de 3 PC)' },
];

export default function PoseidoSection({ poseidoParams, onChange }: PoseidoSectionProps) {
    const handleFormChange = (id: string) => {
        onChange({
            poseidoParams: {
                ...poseidoParams,
                formType: id
            }
        });
    };

    const totalCost = useMemo(() => {
        if (poseidoParams.formType) {
            const form = POSEIDO_FORMS.find(f => f.id === poseidoParams.formType);
            if (form) return form.pc;
        }
        return 0;
    }, [poseidoParams]);

    const getCostLabel = (cost: number) => {
        if (cost > 0) return `+${cost} PC`;
        if (cost < 0) return `${cost} PC`;
        return '+0 PC';
    };

    return (
        <OriginOptionsContainer
            title="Opciones de Origen: Poseído"
            cost={totalCost}
            themeColor="orange"
        >
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    color: '#c2410c', // orange-700
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase'
                }}>
                    Tipo de Forma
                </label>
                <select
                    value={poseidoParams?.formType || ""}
                    onChange={(e) => handleFormChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #f97316', // orange-500
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#c2410c', // orange-700
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="" disabled>Selecciona el tipo de forma...</option>
                    {POSEIDO_FORMS.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label} ({option.description}) → {getCostLabel(option.pc)}
                        </option>
                    ))}
                </select>
            </div>
        </OriginOptionsContainer>
    );
}

