import React from 'react';
import '../TacticPlayerTerminal.css';
import Modal from './Modal';

interface HistoryEntry {
    timestamp: string;
    type: 'health' | 'mental' | 'willpower';
    change: number;
    newValue: number;
    notes: string;
}

interface HistoryModalProps {
    show: boolean;
    type: 'health' | 'mental' | 'willpower';
    history: HistoryEntry[];
    onClose: () => void;
    onDeleteEntry: (entry: HistoryEntry) => void;
}

export default function HistoryModal({ show, type, history, onClose, onDeleteEntry }: HistoryModalProps) {
    if (!show) return null;

    const typeLabel = type === 'health' ? 'Puntos de Vida' :
        type === 'mental' ? 'Equilibrio Mental' :
            'Voluntad';

    const filteredHistory = history.filter(entry => entry.type === type);

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title={`Historial de ${typeLabel}`}
            className="history-modal"
        >
            <div className="history-modal-body">
                {filteredHistory.length === 0 ? (
                    <div className="history-empty">No hay cambios registrados</div>
                ) : (
                    <div className="history-list">
                        {filteredHistory.map((entry, index) => (
                            <div key={index} className="history-entry">
                                <div className="history-entry-header">
                                    <span className={`history-change ${entry.change > 0 ? 'positive' : 'negative'}`}>
                                        {entry.change > 0 ? '+' : ''}{entry.change}
                                    </span>
                                    <span className="history-new-value">→ {entry.newValue}</span>
                                    <span className="history-timestamp">
                                        {new Date(entry.timestamp).toLocaleString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                {entry.notes && (
                                    <div className="history-notes">{entry.notes}</div>
                                )}
                                <button
                                    className="delete-entry-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('¿Estás seguro de que quieres borrar esta entrada?')) {
                                            onDeleteEntry(entry);
                                        }
                                    }}
                                    title="Borrar entrada"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
