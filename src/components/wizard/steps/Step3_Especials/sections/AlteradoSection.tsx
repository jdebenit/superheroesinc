import React, { useMemo, useState } from 'react';
import SelectionModal from '../modals/SelectionModal';

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

export const ALTERADO_SEQUELS = [
    // Discapacidad (1-4 PC) -> 4 separate entries
    { id: 'disability_1', label: 'Discapacidad (Grado 1)', description: 'Ciego, tuerto, paralítico, etc.', cost: 1 },
    { id: 'disability_2', label: 'Discapacidad (Grado 2)', description: 'Ciego, tuerto, paralítico, etc.', cost: 2 },
    { id: 'disability_3', label: 'Discapacidad (Grado 3)', description: 'Ciego, tuerto, paralítico, etc.', cost: 3 },
    { id: 'disability_4', label: 'Discapacidad (Grado 4)', description: 'Ciego, tuerto, paralítico, etc.', cost: 4 },

    { id: 'compulsion', label: 'Manía compulsiva', description: 'Tics nerviosos, rascarse, bizquear...', cost: 1 },
    { id: 'prosthesis', label: 'Prótesis', description: 'Extremidad protésica, requiere 2h mantenimiento/día.', cost: 2 },
    { id: 'amnesia', label: 'Amnesia', description: 'Sufre ataques de amnesia.', cost: 2 },

    // Pérdida intelectual (1-10 PC) -> 10 separate entries
    { id: 'intellectual_loss_1', label: 'Pérdida intelectual (10 pts INT)', description: 'Reduce en 1d10 su inteligencia.', cost: 1 },
    { id: 'intellectual_loss_2', label: 'Pérdida intelectual (20 pts INT)', description: 'Reduce en 2d10 su inteligencia.', cost: 2 },
    { id: 'intellectual_loss_3', label: 'Pérdida intelectual (30 pts INT)', description: 'Reduce en 3d10 su inteligencia.', cost: 3 },
    { id: 'intellectual_loss_4', label: 'Pérdida intelectual (40 pts INT)', description: 'Reduce en 4d10 su inteligencia.', cost: 4 },
    { id: 'intellectual_loss_5', label: 'Pérdida intelectual (50 pts INT)', description: 'Reduce en 5d10 su inteligencia.', cost: 5 },
    { id: 'intellectual_loss_6', label: 'Pérdida intelectual (60 pts INT)', description: 'Reduce en 6d10 su inteligencia.', cost: 6 },
    { id: 'intellectual_loss_7', label: 'Pérdida intelectual (70 pts INT)', description: 'Reduce en 7d10 su inteligencia.', cost: 7 },
    { id: 'intellectual_loss_8', label: 'Pérdida intelectual (80 pts INT)', description: 'Reduce en 8d10 su inteligencia.', cost: 8 },
    { id: 'intellectual_loss_9', label: 'Pérdida intelectual (90 pts INT)', description: 'Reduce en 9d10 su inteligencia.', cost: 9 },
    { id: 'intellectual_loss_10', label: 'Pérdida intelectual (100 pts INT)', description: 'Reduce en 10d10 su inteligencia.', cost: 10 },

    { id: 'no_vitals', label: 'Signos vitales ausentes', description: 'No tiene pulso, no respira, no necesita comer.', cost: 2 },

    // Alteración estética (1-10 PC) -> 10 separate entries
    { id: 'aesthetic_alteration_1', label: 'Alteración estética (10 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 1 },
    { id: 'aesthetic_alteration_2', label: 'Alteración estética (20 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 2 },
    { id: 'aesthetic_alteration_3', label: 'Alteración estética (30 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 3 },
    { id: 'aesthetic_alteration_4', label: 'Alteración estética (40 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 4 },
    { id: 'aesthetic_alteration_5', label: 'Alteración estética (50 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 5 },
    { id: 'aesthetic_alteration_6', label: 'Alteración estética (60 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 6 },
    { id: 'aesthetic_alteration_7', label: 'Alteración estética (70 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 7 },
    { id: 'aesthetic_alteration_8', label: 'Alteración estética (80 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 8 },
    { id: 'aesthetic_alteration_9', label: 'Alteración estética (90 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 9 },
    { id: 'aesthetic_alteration_10', label: 'Alteración estética (100 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 10 },

    // Poder incontrolado (1-4 PC) -> 4 separate entries
    { id: 'uncontrolled_power_1', label: 'Poder incontrolado (Grado 1)', description: 'Uno de los poderes no puede ser controlado.', cost: 1 },
    { id: 'uncontrolled_power_2', label: 'Poder incontrolado (Grado 2)', description: 'Uno de los poderes no puede ser controlado.', cost: 2 },
    { id: 'uncontrolled_power_3', label: 'Poder incontrolado (Grado 3)', description: 'Uno de los poderes no puede ser controlado.', cost: 3 },
    { id: 'uncontrolled_power_4', label: 'Poder incontrolado (Grado 4)', description: 'Uno de los poderes no puede ser controlado.', cost: 4 },

    { id: 'psychosis', label: 'Psicosis', description: 'Odia todo lo relacionado con su mutación.', cost: 1 },
    { id: 'phobia', label: 'Fobia', description: 'Miedo incapacitante hacia algo relacionado.', cost: 1 },
    { id: 'dependency', label: 'Dependencia', description: 'Necesita requisito regular para poderes operativos.', cost: 2 },
    { id: 'social_displacement', label: 'Desplazamiento social', description: 'Incapacitado emocionalmente.', cost: 1 },
    { id: 'unsociableness', label: 'Insociabilidad', description: 'Carácter huraño.', cost: 1 },
    { id: 'character_inversion', label: 'Inversión carácter', description: 'Resistencia a prejuicios modificada (100 - actual).', cost: 1 },
    { id: 'aggressiveness', label: 'Agresividad', description: 'No puede reprimir tendencias violentas.', cost: 1 },
    { id: 'vulnerable_point', label: 'Punto vulnerable', description: 'Punto u objeto letal para el personaje.', cost: 3 },
    { id: 'involuntary_transformation', label: 'Transformación involuntaria', description: 'Pierde control y se transforma.', cost: 3 },
];

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
    const [isSequelModalOpen, setIsSequelModalOpen] = useState(false);

    const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const agentId = e.target.value || null;
        onChange({
            alteradoParams: {
                ...alteradoParams,
                agent: agentId
            }
        });
    };

    const handleSequelSelect = (sequelId: string) => {
        const isSelected = sequels.some(s => s.id === sequelId);
        let newSequels;

        if (isSelected) {
            newSequels = sequels.filter(s => s.id !== sequelId);
        } else {
            newSequels = [...sequels, { id: sequelId }];
        }

        onChange({
            alteradoParams: {
                ...alteradoParams,
                sequels: newSequels
            }
        });
    };



    const handleRemoveSequel = (sequelId: string) => {
        const newSequels = sequels.filter(s => s.id !== sequelId);
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
            const def = ALTERADO_SEQUELS.find(d => d.id === s.id);
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

                {/* SEQUELS SECTION */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: '#166534',
                            textTransform: 'uppercase',
                            margin: 0
                        }}>
                            Secuelas (Opcional)
                        </h4>
                        <button
                            onClick={() => setIsSequelModalOpen(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#16a34a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.875rem'
                            }}
                        >
                            + Añadir Secuela
                        </button>
                    </div>

                    {/* Selected Sequels */}
                    {sequels.length > 0 ? (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {sequels.map(s => {
                                const def = ALTERADO_SEQUELS.find(d => d.id === s.id);
                                if (!def) return null;

                                return (
                                    <div
                                        key={s.id}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#dcfce7',
                                            border: '1px solid #16a34a',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flexGrow: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{def.label}</span>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        backgroundColor: '#15803d',
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        -{def.cost} PC
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0' }}>
                                                    {def.description}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSequel(s.id)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: '#dc2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    marginLeft: '0.5rem'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#fef3c7',
                            border: '2px solid #f59e0b',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                            <div>
                                <p style={{ color: '#92400e', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                                    Sin secuelas seleccionadas
                                </p>
                                <p style={{ color: '#78350f', fontSize: '0.875rem', margin: 0 }}>
                                    Si no seleccionas ninguna secuela, se añadirán <strong>+2 PC</strong> al coste total del personaje.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sequel Selection Modal */}
            <SelectionModal
                isOpen={isSequelModalOpen}
                onClose={() => setIsSequelModalOpen(false)}
                type="spells"
                originFilter={null}
                customTitle="Seleccionar Secuelas"
                customPlaceholder="Buscar secuela..."
                items={ALTERADO_SEQUELS.map(seq => ({
                    id: seq.id,
                    name: seq.label,
                    description: seq.description,
                    cost: `${seq.cost} PC`
                }))}
                selectedItems={sequels.map(s => {
                    const def = ALTERADO_SEQUELS.find(d => d.id === s.id);
                    return {
                        id: s.id,
                        name: def?.label || '',
                        description: def?.description || '',
                        cost: def?.cost ? `${def.cost} PC` : '0 PC'
                    };
                })}
                onToggleItem={handleSequelSelect}
            />
        </div>
    );
}
