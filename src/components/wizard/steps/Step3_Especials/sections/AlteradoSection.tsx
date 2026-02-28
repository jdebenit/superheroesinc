import React, { useMemo } from 'react';
import SequelsSelector from '../../../shared/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';
import { FormSelect } from '../../../shared/FormSelect';

// --- Data Constants ---

export const ALTERADO_AGENTS = [
    { id: 'nuclear', label: 'Energía nuclear', cost: 0 },
    { id: 'electromagnetic', label: 'Accidente con energía electromagnética', cost: 0 },
    { id: 'space_energy', label: 'Energía espacial desconocida', cost: 0 },
    { id: 'other_energy', label: 'Otras energías', cost: 0 },
    { id: 'radiation', label: 'Radiación diversa', cost: 0 },
    { id: 'biological', label: 'Agente biológico', cost: 0 },
    { id: 'mutagen', label: 'Agente mutágeno', cost: 0 },
    { id: 'chemical', label: 'Sustancia química', cost: 0 },
    { id: 'treatment', label: 'Tratamiento', cost: 2 }, // Disadvantage: -2 PC effectively
    { id: 'other', label: 'Otro (a determinar con el Guionista)', cost: 0 },
];

export const ALTERADO_SEQUELS = SEQUELS;

// --- Types ---

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

export const ALTERADO_DATA = {
    AGENTS: ALTERADO_AGENTS,
    SEQUELS: ALTERADO_SEQUELS
};

// --- Component ---

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

            {/* SEQUELS SELECTOR */}
            <SequelsSelector
                selectedSequels={sequels}
                onChange={handleSequelsChange}
                showWarning={sequels.length === 0}
                warningMessage="Si no seleccionas ninguna secuela, se añadirán +2 PC al coste total del personaje."
            />
        </WizardSection>
    );
}

