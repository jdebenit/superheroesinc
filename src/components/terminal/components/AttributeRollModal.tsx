import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';

interface AttributeRollModalProps {
    isOpen: boolean;
    onClose: () => void;
    attributeName: string;
    attributeValue: number;
}

export default function AttributeRollModal({
    isOpen,
    onClose,
    attributeName,
    attributeValue
}: AttributeRollModalProps) {
    const [result, setResult] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    if (!isOpen) return null;

    const handleRoll = () => {
        setIsRolling(true);
        setResult(null);

        // Simulate rolling animation briefly
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 100) + 1;
            setResult(roll);
            setIsRolling(false);
        }, 600);
    };

    const handleClose = () => {
        setResult(null);
        setIsRolling(false);
        onClose();
    };

    return (
        <div className="history-modal-overlay" onClick={handleClose}>
            <div className="history-modal attribute-roll-modal" onClick={e => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>Tirada de {attributeName}</h2>
                    <button className="close-modal-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="history-modal-body roll-modal-body">
                    <div className="roll-attribute-info">
                        <span className="roll-label">Valor Base:</span>
                        <span className="roll-value">{attributeValue}</span>
                    </div>

                    <div className="roll-action-area">
                        {result === null ? (
                            <button
                                className={`roll-circular-btn ${isRolling ? 'rolling' : ''}`}
                                onClick={handleRoll}
                                disabled={isRolling}
                            >
                                {isRolling ? '...' : 'LANZAR'}
                            </button>
                        ) : (
                            <div className="roll-result-display">
                                <div className="roll-result-label">Resultado</div>
                                <div className={`roll-result-number ${result <= attributeValue ? 'success' : 'failure'}`}>
                                    {result}
                                </div>
                                <button className="roll-again-btn" onClick={handleRoll}>
                                    Tirar de nuevo
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
