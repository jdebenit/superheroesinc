import React, { useMemo } from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../../../data/divineOptions';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';
import { FormSelect } from '../../../shared/FormSelect';
import { InfoBox } from '../../../shared/InfoBox';

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
        <OriginOptionsContainer
            title="Opciones de Origen: Divino"
            cost={selectedFocus?.cost || 0}
            themeColor="amber"
            description="Como entidad divina, debes determinar si tu poder requiere un foco para manifestarse o alcanzar su máximo potencial."
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
        </OriginOptionsContainer>
    );
}


