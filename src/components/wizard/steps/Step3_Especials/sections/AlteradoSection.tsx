import React, { useMemo } from 'react';
import SequelsSelector from './shared/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';

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

    const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const agentId = e.target.value || null;
        onChange({
            alteradoParams: {
                ...alteradoParams,
                agent: agentId
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
        <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #15803d',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #bbf7d0'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#14532d'
                }}>Opciones de Origen: Alterado</h3>

                <div style={{
                    backgroundColor: '#15803d',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {totalDiscount > 0 ? `-${totalDiscount} PC` : '0 PC'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {/* AGENT SELECT */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#166534',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase'
                    }}>
                        Agente del Cambio
                    </label>
                    <select
                        value={agent || ''}
                        onChange={handleAgentChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '2px solid #16a34a',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#1f2937',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">-- Selecciona un agente --</option>
                        {ALTERADO_AGENTS.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.label} {item.cost > 0 ? `(Bonificación: ${item.cost} PC)` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SEQUELS SELECTOR */}
                <SequelsSelector
                    selectedSequels={sequels}
                    onChange={handleSequelsChange}
                    showWarning={sequels.length === 0}
                    warningMessage="Si no seleccionas ninguna secuela, se añadirán +2 PC al coste total del personaje."
                />
            </div>
        </div>
    );
}
