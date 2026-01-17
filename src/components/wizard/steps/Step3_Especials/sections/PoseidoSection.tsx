import React, { useMemo } from 'react';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';
import { FormSelect } from '../../../shared/FormSelect';

interface PoseidoParams {
    formType: string | null;
}

interface PoseidoSectionProps {
    poseidoParams: PoseidoParams;
    onChange: (updates: any) => void;
}

export const POSEIDO_FORMS = [
    { id: 'humano', label: 'Humano', cost: 3, description: 'Apariencia completamente humana.' },
    { id: 'cambia_forma', label: 'Cambia de forma', cost: 0, description: 'Puede alternar entre forma humana y otra forma.' },
    { id: 'no_humana', label: 'Forma no humana', cost: -3, description: 'Apariencia monstruosa o extraña permanentemente. (Descuento de 3 PC)' },
];

export default function PoseidoSection({ poseidoParams, onChange }: PoseidoSectionProps) {
    const handleFormChange = (value: string) => {
        onChange({
            poseidoParams: {
                ...poseidoParams,
                formType: value || null
            }
        });
    };

    const totalCost = useMemo(() => {
        if (poseidoParams.formType) {
            const form = POSEIDO_FORMS.find(f => f.id === poseidoParams.formType);
            if (form) return form.cost;
        }
        return 0;
    }, [poseidoParams]);

    return (
        <OriginOptionsContainer
            title="Opciones de Origen: Poseído"
            cost={totalCost}
            themeColor="orange"
        >
            <FormSelect
                label="Tipo de Forma"
                value={poseidoParams?.formType || ''}
                onChange={handleFormChange}
                options={POSEIDO_FORMS}
                placeholder="Selecciona el tipo de forma..."
                labelColor="#c2410c"
            />
        </OriginOptionsContainer>
    );
}


