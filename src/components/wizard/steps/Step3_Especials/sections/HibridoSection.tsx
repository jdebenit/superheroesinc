import React, { useMemo } from 'react';
import SequelsSelector from '../../../shared/forms/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';

interface SelectedSequel {
    id: string;
    description?: string;
}

export interface HibridoParams {
    sequels: SelectedSequel[];
}

interface HibridoSectionProps {
    hibridoParams: HibridoParams;
    onChange: (updates: any) => void;
}

export default function HibridoSection({ hibridoParams, onChange }: HibridoSectionProps) {
    const { sequels = [] } = hibridoParams;

    const handleSequelsChange = (newSequels: SelectedSequel[]) => {
        onChange({
            hibridoParams: {
                ...hibridoParams,
                sequels: newSequels
            }
        });
    };

    const totalDiscount = useMemo(() => {
        let total = 0;
        sequels.forEach(s => {
            const def = SEQUELS.find(d => d.id === s.id);
            if (def) total += def.cost;
        });
        return total;
    }, [sequels]);

    return (
        <WizardSection
            title="Opciones de Origen: Híbrido mitológico"
            color="#166534"
            description="Como híbrido mitológico, posees una naturaleza dual que puede manifestarse en secuelas físicas o místicas. Debes seleccionar al menos una secuela para evitar una penalización en el coste del personaje."
            rightContent={
                <SectionHeaderBadge
                    cost={totalDiscount > 0 ? `-${totalDiscount}` : (sequels.length === 0 ? "+2" : 0)}
                    label="PC"
                    variant={sequels.length === 0 ? "danger" : "bonus"}
                />
            }
        >
            <SequelsSelector
                selectedSequels={sequels}
                onChange={handleSequelsChange}
                showWarning={sequels.length === 0}
                warningMessage="Si no seleccionas ninguna secuela, se añadirán +2 PC al coste total del personaje."
            />
        </WizardSection>
    );
}
