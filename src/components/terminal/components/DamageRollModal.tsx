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
                setResult({
                    total: rollResult.total,
                    detail: rollResult.detail,
                    finalFormula: finalDiceString
                });
            }

            setIsRolling(false);
        }, 500);
    };

    const handleClose = () => {
        setResult(null);
        setAdditionalModifier('');
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
                    <div className="roll-result-overlay" style={{
                        animation: 'fadeIn 0.3s',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.98)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        padding: '1rem'
                    }}>
                        <div className="roll-result-label" style={{ fontSize: '1rem', fontWeight: 700, color: '#4b5563' }}>
                            DAÑO TOTAL
                        </div>

                        <div className={`roll-result-value ${result.total >= 0 ? 'success' : ''}`} style={{
                            fontSize: '4rem',
                            fontWeight: 900,
                            lineHeight: 1,
                            margin: '0.5rem 0',
                            color: '#16a34a',
                            textShadow: '0 2px 10px rgba(22, 163, 74, 0.2)'
                        }}>
                            {result.total}
                        </div>

                        <div className="roll-result-details" style={{
                            color: '#6b7280',
                            fontSize: '1rem',
                            textAlign: 'center',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ marginBottom: '0.25rem' }}>Fórmula: <strong>{result.finalFormula}</strong></div>
                            <div style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                {result.detail}
                            </div>
                        </div>

                        <button
                            className="btn-retry"
                            onClick={() => setResult(null)}
                            style={{
                                padding: '0.5rem 1.5rem',
                                fontSize: '1rem',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '30px',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
                            }}
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
                            <div style={{
                                padding: '10px',
                                backgroundColor: '#222',
                                borderRadius: '4px',
                                color: '#eee',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                border: '1px solid #444',
                                fontSize: '1.1rem'
                            }}>
                                {diceString}
                            </div>
                        </div>

                        <div className="roll-modifier-group" style={{ overflow: 'hidden', marginTop: '1rem' }}>
                            <label style={{ whiteSpace: 'nowrap' }}>Extra</label>
                            <input
                                type="number"
                                value={additionalModifier}
                                onChange={(e) => setAdditionalModifier(e.target.value)}
                                placeholder="0"
                                className="roll-modifier-input"
                                autoFocus
                                style={{
                                    padding: '0.5rem',
                                    fontSize: '1.5rem',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
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
