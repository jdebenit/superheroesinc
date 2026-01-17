import React from 'react';
import { WizardButton } from './WizardButton';
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
    // Determine theme class based on color
    let themeClass = 'dynamic-list-blue';
    if (color === '#dc2626') themeClass = 'dynamic-list-red';
    else if (color === '#7c3aed' || color === '#9333ea') themeClass = 'dynamic-list-purple';
    else if (color === '#0891b2') themeClass = 'dynamic-list-cyan';

    return (
        <div className="dynamic-list">
            {items.length === 0 && emptyText && (
                <div className="dynamic-list-empty">
                    {emptyText}
                </div>
            )}

            {items.map((item, index) => (
                <div key={index} className={`dynamic-list-item ${themeClass}`}>
                    {renderItem(item, index)}

                    <div className="dynamic-list-item-actions">
                        <WizardButton
                            variant="danger"
                            onClick={() => onRemove(index)}
                            title="Eliminar elemento"
                            style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                        >
                            ✕ Eliminar
                        </WizardButton>
                    </div>
                </div>
            ))}

            <button
                onClick={onAdd}
                className={`dynamic-list-add-button ${themeClass}`}
                style={{ borderColor: `${color}66` }}
            >
                <span className="dynamic-list-add-icon">+</span> {addButtonLabel}
            </button>
        </div>
    );
}
