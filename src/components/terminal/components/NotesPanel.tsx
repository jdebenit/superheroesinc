import React from 'react';
import '../TacticPlayerTerminal.css';

interface NotesPanelProps {
    notes: string;
    onChange: (value: string) => void;
}

export default function NotesPanel({ notes, onChange }: NotesPanelProps) {
    return (
        <div className="terminal-section">
            <h3 className="terminal-section-title">
                NOTAS DE SESIÓN
                {notes && (
                    <button
                        className="notes-clear-btn"
                        onClick={() => onChange('')}
                        title="Borrar notas"
                    >
                        ✕ Borrar
                    </button>
                )}
            </h3>
            <textarea
                className="notes-textarea"
                value={notes}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Efectos activos, condiciones, recordatorios de sesión..."
                rows={5}
                spellCheck={false}
            />
        </div>
    );
}

