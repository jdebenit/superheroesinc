import React, { useState, useEffect } from 'react';
import '../TacticPlayerTerminal.css'; // Reusing existing styles for now or add specific ones

interface EditStatModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    currentValue: number;
    changeValue: string;
    notes: string;
    onChangeValueChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onApply: () => void;
}

export default function EditStatModal({
    isOpen,
    onClose,
    title,
    currentValue,
    changeValue,
    notes,
    onChangeValueChange,
    onNotesChange,
    onApply
}: EditStatModalProps) {
    if (!isOpen) return null;

    const handleApply = () => {
        onApply();
        onClose();
    };

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal edit-stat-modal" onClick={e => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>{title}</h2>
                    <button className="close-modal-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="history-modal-body">
                    <div className="edit-stat-current">
                        <span className="label">Valor Actual:</span>
                        <span className="value">{currentValue}</span>
                    </div>

                    <div className="edit-stat-form">
                        <div className="form-group">
                            <label>Cambio (+/-):</label>
                            <input
                                type="number"
                                className="change-input large"
                                value={changeValue}
                                onChange={(e) => onChangeValueChange(e.target.value)}
                                placeholder="0"
                                autoFocus
                            />
                            <div className="quick-adjust-grid">
                                <button className="quick-btn positive" onClick={() => onChangeValueChange(String((parseInt(changeValue || '0') || 0) + 1))}>+1</button>
                                <button className="quick-btn positive" onClick={() => onChangeValueChange(String((parseInt(changeValue || '0') || 0) + 5))}>+5</button>
                                <button className="quick-btn negative" onClick={() => onChangeValueChange(String((parseInt(changeValue || '0') || 0) - 1))}>-1</button>
                                <button className="quick-btn negative" onClick={() => onChangeValueChange(String((parseInt(changeValue || '0') || 0) - 5))}>-5</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notas:</label>
                            <input
                                type="text"
                                className="notes-input"
                                value={notes}
                                onChange={(e) => onNotesChange(e.target.value)}
                                placeholder="Razón del cambio..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={onClose}>Cancelar</button>
                            <button className="apply-btn large" onClick={handleApply}>Aplicar Cambio</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
