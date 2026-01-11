import React from 'react';
import '../TacticPlayerTerminal.css';

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
}

export default function HistoryModal({ show, type, history, onClose }: HistoryModalProps) {
    if (!show) return null;

    const typeLabel = type === 'health' ? 'Puntos de Vida' :
        type === 'mental' ? 'Equilibrio Mental' :
            'Voluntad';

    const filteredHistory = history.filter(entry => entry.type === type);

    return (
        <div className="history-modal-overlay" onClick={onClose}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>Historial de {typeLabel}</h2>
                    <button onClick={onClose} className="close-modal-btn">✕</button>
                </div>
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
