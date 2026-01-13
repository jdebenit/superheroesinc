import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';

interface DiceRollModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    targetValue: number;
    rollType?: 'd100'; // Prepared for future expansion
    onRoll?: (result: number) => void;
}

export default function DiceRollModal({
    isOpen,
    onClose,
    title,
    targetValue,
    rollType = 'd100',
    onRoll
}: DiceRollModalProps) {
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
            if (onRoll) onRoll(roll);
        }, 600);
    };

    const handleClose = () => {
        setResult(null);
        setIsRolling(false);
        onClose();
    };

    // Determine result status
    const getResultStatus = (roll: number, target: number) => {
        if (roll <= 5) return 'critical-success';
        if (roll >= 96) return 'critical-failure';
        if (roll <= target) return 'success';
        return 'failure';
    };

    const resultStatus = result !== null ? getResultStatus(result, targetValue) : '';

    return (
        <div className="history-modal-overlay" onClick={handleClose}>
            <div className={`history-modal attribute-roll-modal ${resultStatus}`} onClick={e => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>{title}</h2>
                    <button className="close-modal-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="history-modal-body roll-modal-body">
                    <div className="roll-attribute-info">
                        <span className="roll-label">Objetivo:</span>
                        <span className="roll-value">{targetValue}</span>
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
                                <div className="roll-result-label">
                                    {resultStatus === 'critical-success' && '¡ÉXITO CRÍTICO!'}
                                    {resultStatus === 'critical-failure' && '¡FALLO CRÍTICO!'}
                                    {resultStatus === 'success' && 'Éxito'}
                                    {resultStatus === 'failure' && 'Fallo'}
                                </div>
                                <div className={`roll-result-number ${resultStatus}`}>
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
