import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { MALDITO_MAGNITUDE, MALDITO_SOURCE, MALDITO_DATA } from '../../../../../data/originOptions';

export { MALDITO_MAGNITUDE, MALDITO_SOURCE, MALDITO_DATA };

interface MalditoParams {
    magnitude: string | null;
    source: string | null;
}

interface MalditoSectionProps {
    malditoParams: MalditoParams;
    onChange: (updates: any) => void;
}

export default function MalditoSection({ malditoParams, onChange }: MalditoSectionProps) {
    const handleMagnitudeChange = (value: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                magnitude: value || null
            }
        });
    };

    const handleSourceChange = (value: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                source: value || null
            }
        });
    };

    const totalCost = useMemo(() => {
        let total = 0;
        if (malditoParams.magnitude) {
            const mag = MALDITO_MAGNITUDE.find(m => m.id === malditoParams.magnitude);
            if (mag) total += mag.cost;
        }
        return total;
    }, [malditoParams]);

    return (
        <WizardSection
            title="Opciones de Origen: Maldito"
            color="#c2410c"
            rightContent={
                <SectionHeaderBadge
                    cost={(totalCost || 0) > 0 ? `+${totalCost}` : (totalCost || 0)}
                    label="PC"
                    variant={!(totalCost) ? "free" : (totalCost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <div className="wizard-flex-column wizard-gap-lg">
                <FormSelect
                    label="Magnitud de la maldición"
                    value={malditoParams?.magnitude || ''}
                    onChange={handleMagnitudeChange}
                    options={MALDITO_MAGNITUDE}
                    placeholder="Selecciona la magnitud..."
                    labelColor="#c2410c"
                />

                <FormSelect
                    label="Origen de la maldición"
                    value={malditoParams?.source || ''}
                    onChange={handleSourceChange}
                    options={MALDITO_SOURCE.map(s => ({ ...s, cost: 0 }))}
                    placeholder="Selecciona el origen..."
                    labelColor="#c2410c"
                    showCostInOption={false}
                />
            </div>
        </WizardSection>
    );
}
