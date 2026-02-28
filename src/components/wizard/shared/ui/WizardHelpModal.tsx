import React, { useRef, useEffect } from 'react';
import type { HelpContent } from '../../../data/wizardHelp';

interface WizardHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: HelpContent | null;
}

export const WizardHelpModal: React.FC<WizardHelpModalProps> = ({ isOpen, onClose, content }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Sync dialog open state with prop
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) {
            if (isOpen && !dialog.open) {
                dialog.showModal();
            } else if (!isOpen && dialog.open) {
                dialog.close();
            }
        }
    }, [isOpen]);

    // Handle ESC key or click outside to close
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog) {
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (
                rect.top <= e.clientY &&
                e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX &&
                e.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                onClose();
            }
        }
    };

    if (!content) return null;

    return (
        <dialog
            ref={dialogRef}
            onClick={handleDialogClick}
            className="wizard-help-dialog"
            style={{
                padding: 0,
                border: 'none',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backgroundColor: 'white'
            }}
        >
            <div style={{
                backgroundColor: '#eff6ff', // blue-50
                padding: '1.5rem',
                borderBottom: '1px solid #bfdbfe', // blue-200
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1e40af', // blue-800
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    💡 {content.title}
                </h3>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        color: '#6b7280',
                        padding: '0.25rem',
                        lineHeight: 1
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    {content.content.map((tip, index) => (
                        <li key={index} style={{
                            fontSize: '1rem',
                            color: '#374151', // gray-700
                            lineHeight: 1.5
                        }}>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #f3f4f6', // gray-100
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb', // blue-600
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                    Entendido
                </button>
            </div>
        </dialog>
    );
};
