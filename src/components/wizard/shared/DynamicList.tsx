import React, { useState } from 'react';
import { DeleteRowButton } from './DeleteRowButton';
import { WizardConfirm } from './WizardDialogs';
import './DynamicList.css';

interface DynamicListProps<T> {
    items: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    title?: string;
    addButtonLabel?: string;
    itemContainerStyle?: React.CSSProperties;
    emptyText?: string;
    color?: string;
}

export function DynamicList<T>({
    items = [],
    onAdd,
    onRemove,
    renderItem,
    addButtonLabel = 'Añadir Elemento',
    emptyText,
    color = '#3b82f6'
}: DynamicListProps<T>) {
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Determine theme class based on color
    let themeClass = 'wizard-dynamic-list-blue';
    if (color === '#dc2626') themeClass = 'wizard-dynamic-list-red';
    else if (color === '#7c3aed' || color === '#9333ea') themeClass = 'wizard-dynamic-list-purple';
    else if (color === '#0891b2') themeClass = 'wizard-dynamic-list-cyan';

    const handleConfirmDelete = () => {
        if (itemToDelete !== null) {
            onRemove(itemToDelete);
            setItemToDelete(null);
        }
    };

    return (
        <div className="wizard-dynamic-list">
            {items.length === 0 && emptyText && (
                <div className="wizard-dynamic-list-empty">
                    {emptyText}
                </div>
            )}

            {items.map((item, index) => (
                <div key={index} className={`wizard-dynamic-list-item ${themeClass}`}>
                    {renderItem(item, index)}

                    <div className="wizard-dynamic-list-item-actions">
                        <DeleteRowButton
                            onDelete={() => setItemToDelete(index)}
                            title="Eliminar elemento"
                        />
                    </div>
                </div>
            ))}

            <button
                onClick={onAdd}
                className={`wizard-dynamic-list-add-button ${themeClass}`}
                style={{ borderColor: `${color}66` }}
            >
                <span className="wizard-dynamic-list-add-icon">+</span> {addButtonLabel}
            </button>

            {itemToDelete !== null && (
                <WizardConfirm
                    message="¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer."
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
}
