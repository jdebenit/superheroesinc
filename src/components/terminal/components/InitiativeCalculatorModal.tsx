import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';

interface InitiativeCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseInitiative: number;
}

type InitiativeModifier = 'none' | 'surprised' | 'stunned' | 'prone' | 'concentrated';

const INITIATIVE_MODIFIERS: Record<InitiativeModifier, { label: string; value: number }> = {
    none: { label: 'Ninguno', value: 0 },
    surprised: { label: 'Sorprendido', value: -50 },
    stunned: { label: 'Aturdido', value: -30 },
    prone: { label: 'Caído en el suelo', value: -15 },
    concentrated: { label: 'Concentrado', value: -20 }
};

export default function InitiativeCalculatorModal({ isOpen, onClose, baseInitiative }: InitiativeCalculatorModalProps) {
    const [selectedModifier, setSelectedModifier] = useState<InitiativeModifier>('none');
    const [customModifier, setCustomModifier] = useState<string>('0');
    const [result, setResult] = useState<number | null>(null);
    const [diceRoll, setDiceRoll] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    if (!isOpen) return null;

    const handleRoll = () => {
        setIsRolling(true);

        // Simulate dice roll animation
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 100) + 1;
            const modifierValue = INITIATIVE_MODIFIERS[selectedModifier].value;
            const custom = parseInt(customModifier) || 0;
            const total = roll + baseInitiative + modifierValue + custom;

            setDiceRoll(roll);
            setResult(total);
            setIsRolling(false);
        }, 300);
    };

    const handleReset = () => {
        setResult(null);
        setDiceRoll(null);
        setSelectedModifier('none');
        setCustomModifier('0');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const modifierValue = INITIATIVE_MODIFIERS[selectedModifier].value;
    const customValue = parseInt(customModifier) || 0;
    const totalModifier = baseInitiative + modifierValue + customValue;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content attribute-roll-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Cálculo de Iniciativa</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="roll-modal-body">
                    {!result ? (
                        <>
                            <div className="roll-attribute-info compact" style={{
                                background: '#f9fafb',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    Fórmula de Cálculo
                                </div>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontFamily: 'monospace',
                                    padding: '0.5rem 0'
                                }}>
                                    1d100 + {baseInitiative} + <span style={{ color: (modifierValue + customValue) < 0 ? '#ef4444' : '#10b981' }}>
                                        {modifierValue + customValue}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                                    = 1d100 + {totalModifier}
                                </div>
                            </div>

                            <div className="roll-main-content" style={{ gap: '2rem', alignItems: 'stretch' }}>
                                <div className="roll-modifiers-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="roll-modifier-group">
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                            ESTADO DEL PERSONAJE
                                        </label>
                                        <select
                                            className="roll-modifier-select"
                                            value={selectedModifier}
                                            onChange={(e) => setSelectedModifier(e.target.value as InitiativeModifier)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                                backgroundColor: 'white',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            {Object.entries(INITIATIVE_MODIFIERS).map(([key, mod]) => (
                                                <option key={key} value={key}>
                                                    {mod.label} ({mod.value >= 0 ? '+' : ''}{mod.value})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="roll-modifier-group">
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                            MODIFICADOR EXTRA
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                className="roll-modifier-input"
                                                value={customModifier}
                                                onChange={(e) => setCustomModifier(e.target.value)}
                                                placeholder="0"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    paddingRight: '1rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #d1d5db',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'left'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="roll-button-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button
                                        className={`roll-circular-btn ${isRolling ? 'rolling' : ''}`}
                                        onClick={handleRoll}
                                        disabled={isRolling}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4), 0 2px 4px -1px rgba(37, 99, 235, 0.1)'
                                        }}
                                    >
                                        {isRolling ? '...' : 'TIRAR'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="roll-result-display">
                            <div className="roll-result-label">Resultado</div>
                            <div className="roll-result-number" style={{ color: '#2563eb' }}>
                                {result}
                            </div>
                            <div style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                                Dado: {diceRoll} + Base: {baseInitiative} + Modificadores: {modifierValue + customValue}
                            </div>
                            <button className="roll-again-btn" onClick={handleReset}>
                                Tirar de nuevo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
