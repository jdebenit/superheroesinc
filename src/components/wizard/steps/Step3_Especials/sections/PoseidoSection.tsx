import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { POSEIDO_FORMS } from '../../../../../data/originOptions';

export { POSEIDO_FORMS };

interface PoseidoParams {
    formType: string | null;
}

interface PoseidoSectionProps {
    poseidoParams: PoseidoParams;
    onChange: (updates: any) => void;
}

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
        <WizardSection
            title="Opciones de Origen: Poseído"
            color="#7e22ce"
            rightContent={
                <SectionHeaderBadge
                    cost={totalCost > 0 ? `+${totalCost}` : totalCost}
                    label="PC"
                    variant={totalCost === 0 ? "free" : (totalCost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <FormSelect
                label="Tipo de Forma"
                value={poseidoParams?.formType || ''}
                onChange={handleFormChange}
                options={POSEIDO_FORMS}
                placeholder="Selecciona el tipo de forma..."
                labelColor="#c2410c"
            />
        </WizardSection>
    );
}
