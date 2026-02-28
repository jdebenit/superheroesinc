import React, { useMemo } from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../../../data/divineOptions';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { InfoBox } from '../../../shared/ui/InfoBox';

export interface DivineParams {
    focus: string | null;
}

interface DivineSectionProps {
    divineParams: DivineParams;
    onChange: (updates: any) => void;
}

export default function DivineSection({ divineParams, onChange }: DivineSectionProps) {
    const { focus } = divineParams;

    const handleFocusChange = (value: string) => {
        onChange({
            divineParams: {
                ...divineParams,
                focus: value || null
            }
        });
    };

    const selectedFocus = useMemo(() =>
        DIVINE_FOCUS_OPTIONS.find(f => f.id === focus),
        [focus]);

    return (
        <WizardSection
            title="Opciones de Origen: Divino / Semidiós"
            color="#b45309"
            description="Como entidad divina, debes determinar si tu poder requiere un foco para manifestarse o alcanzar su máximo potencial."
            rightContent={
                <SectionHeaderBadge
                    cost={(selectedFocus?.cost || 0) > 0 ? `+${selectedFocus?.cost}` : (selectedFocus?.cost || 0)}
                    label="PC"
                    variant={!(selectedFocus?.cost) ? "free" : (selectedFocus.cost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <FormSelect
                label="Foco del Poder"
                value={focus || ''}
                onChange={handleFocusChange}
                options={DIVINE_FOCUS_OPTIONS}
                placeholder="-- Selecciona una opción --"
                labelColor="#b45309"
                showDescription={false}
            />

            {selectedFocus && (
                <InfoBox variant="warning" icon="⚡">
                    <strong>Efecto:</strong> {selectedFocus.description}
                </InfoBox>
            )}
        </WizardSection>
    );
}




