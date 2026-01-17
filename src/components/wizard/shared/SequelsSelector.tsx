import React, { useState } from 'react';
import SelectionModal from '../steps/Step3_Especials/modals/SelectionModal';
import { SEQUELS } from '../../../data/sequels';
import { DeleteRowButton } from './DeleteRowButton';

interface SelectedSequel {
    id: string;
    description?: string;
}

interface SequelsSelectorProps {
    selectedSequels: SelectedSequel[]; // Array of objects { id: string, description?: string }
    onChange: (sequels: SelectedSequel[]) => void;
    showWarning?: boolean;
    warningMessage?: React.ReactNode;
}

export default function SequelsSelector({
    selectedSequels,
    onChange,
    showWarning = false,
    warningMessage
}: SequelsSelectorProps) {
    const [isSequelModalOpen, setIsSequelModalOpen] = useState(false);

    const handleSequelSelect = (sequelId: string) => {
        const isSelected = selectedSequels.some(s => s.id === sequelId);
        let newSequels;

        if (isSelected) {
            newSequels = selectedSequels.filter(s => s.id !== sequelId);
        } else {
            newSequels = [...selectedSequels, { id: sequelId, description: '' }];
        }

        onChange(newSequels);
    };

    const handleRemoveSequel = (sequelId: string) => {
        const newSequels = selectedSequels.filter(s => s.id !== sequelId);
        onChange(newSequels);
    };

    const handleDescriptionChange = (sequelId: string, description: string) => {
        const newSequels = selectedSequels.map(s =>
            s.id === sequelId ? { ...s, description } : s
        );
        onChange(newSequels);
    };

    return (
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

            {/* Selected Sequels List */}
            {selectedSequels.length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {selectedSequels.map(s => {
                        const def = SEQUELS.find(d => d.id === s.id);
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
                                        <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.5rem 0' }}>
                                            {def.description}
                                        </p>

                                        {/* Description Input */}
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: '#166534',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Descripción de la secuela (Opcional):
                                            </label>
                                            <textarea
                                                value={s.description || ''}
                                                onChange={(e) => handleDescriptionChange(s.id, e.target.value)}
                                                placeholder="Describe cómo se manifiesta esta secuela..."
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    fontSize: '0.875rem',
                                                    border: '1px solid #86efac',
                                                    borderRadius: '4px',
                                                    resize: 'vertical',
                                                    minHeight: '60px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <DeleteRowButton
                                        onDelete={() => handleRemoveSequel(s.id)}
                                        title="Eliminar secuela"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                showWarning ? (
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
                                {warningMessage || "Si no seleccionas ninguna secuela, se aplicará una penalización estándar."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                        No hay secuelas seleccionadas. Haz clic en "Añadir Secuela" para elegir.
                    </p>
                )
            )}

            {/* Sequel Selection Modal */}
            <SelectionModal
                isOpen={isSequelModalOpen}
                onClose={() => setIsSequelModalOpen(false)}
                type="spells" // Using 'spells' type to display simple 'cost' field
                originFilter={null}
                customTitle="Seleccionar Secuelas"
                customPlaceholder="Buscar secuela..."
                items={SEQUELS.map(seq => ({
                    id: seq.id,
                    name: seq.label,
                    description: seq.description,
                    cost: `${seq.cost} PC`
                }))}
                selectedItems={selectedSequels.map(s => {
                    const def = SEQUELS.find(d => d.id === s.id);
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

