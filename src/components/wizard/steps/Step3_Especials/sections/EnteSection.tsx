import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { ENTE_FORMS, ENTE_EFFECTS } from '../../../../../data/originOptions';

export { ENTE_FORMS, ENTE_EFFECTS };

interface EnteSectionProps {
    enteParams: {
        formType: string | null;
        visualEffect: string | null;
    };
    onChange: (updates: any) => void;
}

export default function EnteSection({ enteParams, onChange }: EnteSectionProps) {
    const handleFormChange = (value: string) => {
        onChange({
            enteParams: {
                ...enteParams,
                formType: value || null
            }
        });
    };

    const handleEffectChange = (value: string) => {
        onChange({
            enteParams: {
                ...enteParams,
                visualEffect: value || null
            }
        });
    };

    const totalCost = useMemo(() => {
        let total = 0;
        if (enteParams.formType) {
            const form = ENTE_FORMS.find(f => f.id === enteParams.formType);
            if (form) total += form.cost;
        }
        if (enteParams.visualEffect) {
            const effect = ENTE_EFFECTS.find(e => e.id === enteParams.visualEffect);
            if (effect) total += effect.cost;
        }
        return total;
    }, [enteParams]);

    return (
        <WizardSection
            title="Opciones de Origen: Ente"
            color="#7e22ce"
            rightContent={
                <SectionHeaderBadge
                    cost={totalCost > 0 ? `+${totalCost}` : totalCost}
                    label="PC"
                    variant={totalCost === 0 ? "free" : (totalCost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <div className="wizard-flex-column wizard-gap-lg">
                <FormSelect
                    label="Tipo de forma en el plano"
                    value={enteParams?.formType || ''}
                    onChange={handleFormChange}
                    options={ENTE_FORMS}
                    placeholder="Selecciona una forma..."
                    labelColor="#7e22ce"
                />

                <FormSelect
                    label="Efectos en la forma adoptada"
                    value={enteParams?.visualEffect || ''}
                    onChange={handleEffectChange}
                    options={ENTE_EFFECTS}
                    placeholder="Selecciona un efecto visual..."
                    labelColor="#7e22ce"
                />
            </div>
        </WizardSection>
    );
}
