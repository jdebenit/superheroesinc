import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import Modal from './Modal';
import { parseAndRollDice } from '../../../utils/diceLogic';
import { playDiceRollSound } from '../../../utils/diceSound';

interface DamageRollModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    diceString: string;
}

export default function DamageRollModal({ isOpen, onClose, title, diceString }: DamageRollModalProps) {
    const [additionalModifier, setAdditionalModifier] = useState<string>('');
    const [multiplier, setMultiplier] = useState<number>(1);
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState<{
        total: number;
        detail: string;
        finalFormula: string;
    } | null>(null);

    if (!isOpen) return null;

    const handleRoll = () => {
        playDiceRollSound();
        setIsRolling(true);
        setResult(null);

        setTimeout(() => {
            // Combine dice string with additional modifier
            let finalDiceString = diceString;
            const mod = parseInt(additionalModifier) || 0;

            if (mod !== 0) {
                finalDiceString += `${mod >= 0 ? '+' : ''}${mod}`;
            }

            const rollResult = parseAndRollDice(finalDiceString);

            if (rollResult) {
                const total = rollResult.total * multiplier;
                let finalFormula = finalDiceString;
                if (multiplier > 1) {
                    finalFormula = `(${finalDiceString}) x ${multiplier}`;
                }

                setResult({
                    total: total,
                    detail: multiplier > 1 ? `${rollResult.detail} (x${multiplier})` : rollResult.detail,
                    finalFormula: finalFormula
                });
            }

            setIsRolling(false);
        }, 500);
    };

    const handleClose = () => {
        setResult(null);
        setAdditionalModifier('');
        setMultiplier(1);
        setIsRolling(false);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            className="attribute-roll-modal" // Reusing basic roll modal style
            contentStyle={{ maxWidth: '350px' }}
        >
            <div className="roll-modal-body" style={{ position: 'relative', minHeight: '200px' }}>
                {/* Result Overlay - Takes full space when active */}
                {result && (
                    <div className="roll-result-overlay-absolute">
                        <div className="roll-result-label" style={{ fontSize: '1rem', fontWeight: 700, color: '#4b5563' }}>
                            DAÑO TOTAL
                        </div>

                        <div className={`roll-result-value-large ${result.total >= 0 ? 'success' : ''}`}>
                            {result.total}
                        </div>

                        <div className="roll-result-details-text">
                            <div>Fórmula: <strong>{result.finalFormula}</strong></div>
                            <div className="roll-result-details-code">
                                {result.detail}
                            </div>
                        </div>

                        <button
                            className="btn-retry-large"
                            onClick={() => setResult(null)}
                        >
                            🔄 Nueva Tirada
                        </button>
                    </div>
                )}

                {/* Input Form */}
                <div className="roll-main-content">
                    <div className="roll-modifiers-column" style={{ flex: 1 }}>
                        <div className="roll-modifier-group">
                            <label>Base</label>
                            <div className="roll-base-display">
                                {diceString}
                            </div>
                        </div>

                        <div className="roll-modifier-group" style={{ overflow: 'hidden', marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ whiteSpace: 'nowrap' }}>Extra</label>
                                <input
                                    type="number"
                                    value={additionalModifier}
                                    onChange={(e) => setAdditionalModifier(e.target.value)}
                                    placeholder="0"
                                    className="roll-modifier-input-large"
                                    autoFocus
                                />
                            </div>
                            <div style={{ width: '80px' }}>
                                <label style={{ whiteSpace: 'nowrap' }}>xM</label>
                                <select
                                    value={multiplier}
                                    onChange={(e) => setMultiplier(parseInt(e.target.value))}
                                    className="roll-modifier-input-large"
                                    style={{ padding: '0.5rem 0.2rem', cursor: 'pointer' }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>x{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="roll-button-column" style={{ marginLeft: '1rem' }}>
                        <button
                            className={`roll-circular-btn ${isRolling ? 'rolling' : ''}`}
                            onClick={handleRoll}
                            disabled={isRolling}
                        >
                            {isRolling ? '...' : 'LANZAR'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
