import React from 'react';

interface ChangeInputSectionProps {
    changeValue: string;
    notes: string;
    onChangeValueChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onApply: () => void;
}

export default function ChangeInputSection({
    changeValue,
    notes,
    onChangeValueChange,
    onNotesChange,
    onApply
}: ChangeInputSectionProps) {
    return (
        <div className="change-input-section">
            <input
                type="number"
                placeholder="+/- Cambio"
                value={changeValue}
                onChange={(e) => onChangeValueChange(e.target.value)}
                className="change-input"
            />
            <input
                type="text"
                placeholder="Notas (opcional)"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="notes-input"
            />
            <button onClick={onApply} className="apply-btn">
                Aplicar
            </button>
        </div>
    );
}
