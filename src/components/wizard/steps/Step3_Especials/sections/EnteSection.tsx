import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/WizardSection';
import { FormSelect } from '../../../shared/FormSelect';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';

export const ENTE_FORMS = [
    { id: 'humanoid', label: 'Humanoide', cost: 1, description: 'Aspecto humanoide en el plano' },
    { id: 'animal_major', label: 'Animal mayor', cost: 0, description: 'Oso, ciervo, toro...' },
    { id: 'animal_minor', label: 'Animal menor', cost: -1, description: 'Perro, gato, zorro...' }
];

export const ENTE_EFFECTS = [
    { id: 'hidden', label: 'Fácil ocultación', cost: 2, description: 'Ojos con brillo, mechones de pelo de otro color...' },
    { id: 'evident', label: 'Más evidentes', cost: 1, description: 'Cola, cuernos, pelaje de otro color llamativo...' },
    { id: 'obvious', label: 'Difíciles de ocultar', cost: 0, description: 'Emite vapor, alas, múltiples apéndices, aura brillante...' }
];

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


