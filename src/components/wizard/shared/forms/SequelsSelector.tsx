import React, { useState } from 'react';
import SelectionModal from '../../steps/Step3_Especials/modals/SelectionModal';
import { SEQUELS } from '../../../../data/sequels';
import { DeleteRowButton } from '../ui/DeleteRowButton';
import './SequelsSelector.css';

interface SelectedSequel {
    id: string;
    description?: string;
}

interface SequelsSelectorProps {
    selectedSequels: SelectedSequel[];
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
            <div className="wizard-sequels-header">
                <h4 className="wizard-sequels-title">
                    Secuelas (Opcional)
                </h4>
                <button
                    onClick={() => setIsSequelModalOpen(true)}
                    className="wizard-sequels-add-button"
                >
                    + Añadir Secuela
                </button>
            </div>

            {/* Selected Sequels List */}
            {selectedSequels.length > 0 ? (
                <div className="wizard-sequels-list">
                    {selectedSequels.map(s => {
                        const def = SEQUELS.find(d => d.id === s.id);
                        if (!def) return null;

                        return (
                            <div key={s.id} className="wizard-sequel-item">
                                <div className="wizard-sequel-item-content">
                                    <div className="wizard-sequel-item-info">
                                        <div className="wizard-sequel-item-header">
                                            <span className="wizard-sequel-item-label">{def.label}</span>
                                            <span className="wizard-sequel-item-cost">
                                                -{def.cost} PC
                                            </span>
                                        </div>
                                        <p className="wizard-sequel-item-description">
                                            {def.description}
                                        </p>

                                        {/* Description Input */}
                                        <div>
                                            <label className="wizard-sequel-input-label">
                                                Descripción de la secuela (Opcional):
                                            </label>
                                            <textarea
                                                value={s.description || ''}
                                                onChange={(e) => handleDescriptionChange(s.id, e.target.value)}
                                                placeholder="Describe cómo se manifiesta esta secuela..."
                                                className="wizard-sequel-input-textarea"
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
                    <div className="wizard-sequels-warning">
                        <span className="wizard-sequels-warning-icon">⚠️</span>
                        <div>
                            <p className="wizard-sequels-warning-title">
                                Sin secuelas seleccionadas
                            </p>
                            <p className="wizard-sequels-warning-message">
                                {warningMessage || "Si no seleccionas ninguna secuela, se aplicará una penalización estándar."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="wizard-sequels-empty">
                        No hay secuelas seleccionadas. Haz clic en "Añadir Secuela" para elegir.
                    </p>
                )
            )}

            {/* Sequel Selection Modal */}
            <SelectionModal
                isOpen={isSequelModalOpen}
                onClose={() => setIsSequelModalOpen(false)}
                type="spells"
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
