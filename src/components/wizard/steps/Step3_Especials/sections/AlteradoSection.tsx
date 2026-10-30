import React, { useMemo } from 'react';
import SequelsSelector from '../../../shared/forms/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { FormSelect } from '../../../shared/forms/FormSelect';
import { ALTERADO_AGENTS, ALTERADO_SEQUELS, ALTERADO_DATA } from '../../../../../data/originOptions';

export { ALTERADO_AGENTS, ALTERADO_SEQUELS, ALTERADO_DATA };

interface SelectedSequel {
    id: string;
    description?: string;
}

export interface AlteradoParams {
    agent: string | null;
    sequels: SelectedSequel[];
}

interface AlteradoSectionProps {
    alteradoParams: AlteradoParams;
    onChange: (updates: any) => void;
}

export default function AlteradoSection({ alteradoParams, onChange }: AlteradoSectionProps) {
    const { agent, sequels = [] } = alteradoParams;

    const handleAgentChange = (value: string) => {
        onChange({
            alteradoParams: {
                ...alteradoParams,
                agent: value || null
            }
        });
    };

    const handleSequelsChange = (newSequels: SelectedSequel[]) => {
        onChange({
            alteradoParams: {
                ...alteradoParams,
                sequels: newSequels
            }
        });
    };

    const totalDiscount = useMemo(() => {
        let total = 0;
        if (agent) {
            const ag = ALTERADO_AGENTS.find(a => a.id === agent);
            if (ag) total += ag.cost;
        }
        sequels.forEach(s => {
            const def = SEQUELS.find(d => d.id === s.id);
            if (def) total += def.cost;
        });
        return total;
    }, [agent, sequels]);

    return (
        <WizardSection
            title="Opciones de Origen: Alterado"
            color="#166534"
            rightContent={
                <SectionHeaderBadge
                    cost={totalDiscount > 0 ? `-${totalDiscount}` : 0}
                    label="PC"
                    variant={totalDiscount === 0 ? "free" : "bonus"}
                />
            }
        >
            <FormSelect
                label="Agente del Cambio"
                value={agent || ''}
                onChange={handleAgentChange}
                options={ALTERADO_AGENTS}
                placeholder="-- Selecciona un agente --"
                labelColor="#166534"
                showCostInOption={false}
            />

            <SequelsSelector
                selectedSequels={sequels}
                onChange={handleSequelsChange}
                showWarning={sequels.length === 0}
                warningMessage="Si no seleccionas ninguna secuela, se añadirán +2 PC al coste total del personaje."
            />
        </WizardSection>
    );
}
