import React from 'react';
import '../TacticPlayerTerminal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    className?: string;
    contentStyle?: React.CSSProperties;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    headerActions,
    className = '',
    contentStyle
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${className}`}
                style={contentStyle}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <div className="modal-header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {headerActions}
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
