import React from 'react';
import { WizardButton } from './WizardButton';

interface DynamicListProps<T> {
    items: T[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    title?: string;
    addButtonLabel?: string;
    itemContainerStyle?: React.CSSProperties;
    emptyText?: string;
    color?: string; // Main color for theming (button, borders)
}

export function DynamicList<T>({
    items = [],
    onAdd,
    onRemove,
    renderItem,
    addButtonLabel = 'Añadir Elemento',
    itemContainerStyle,
    emptyText,
    color = '#3b82f6'
}: DynamicListProps<T>) {

    // Helper to blend color with white for background (simulating logic from original code)
    // For now we just use a generic light background if not fully implemented with color generic logic
    const bgColor = color === '#dc2626' ? '#fef2f2' : // Red
        color === '#7c3aed' ? '#f5f3ff' : // Purple
            color === '#0891b2' ? '#ecfeff' : // Cyan
                color === '#9333ea' ? '#faf5ff' : // Purple Light ?
                    '#f9fafb'; // Default gray

    const borderColor = color === '#dc2626' ? '#fee2e2' :
        color === '#7c3aed' ? '#ede9fe' :
            color === '#0891b2' ? '#cffafe' :
                color === '#9333ea' ? '#f3e8ff' :
                    '#e5e7eb';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.length === 0 && emptyText && (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#9ca3af',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '8px'
                }}>
                    {emptyText}
                </div>
            )}

            {items.map((item, index) => (
                <div key={index} style={{
                    position: 'relative',
                    padding: '1rem',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    ...itemContainerStyle
                }}>
                    {renderItem(item, index)}

                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
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
                style={{
                    width: '100%',
                    padding: '1rem',
                    border: `2px dashed ${color}66`, // opacity
                    backgroundColor: bgColor,
                    color: color,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                }}
            >
                <span style={{ fontSize: '1.25rem' }}>+</span> {addButtonLabel}
            </button>
        </div>
    );
}
