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
    const [difficultyModifier, setDifficultyModifier] = useState<number>(0);
    const [customModifier, setCustomModifier] = useState<string>(''); // String to handle empty input
    const [result, setResult] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    if (!isOpen) return null;

    const parsedCustomMod = parseInt(customModifier) || 0;
    const finalTargetValue = Math.max(0, Math.min(100, targetValue + difficultyModifier + parsedCustomMod));

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
        setDifficultyModifier(0);
        setCustomModifier('');
        onClose();
    };

    // Determine result status
    const getResultStatus = (roll: number, target: number) => {
        if (roll <= 5) return 'critical-success';
        if (roll >= 96) return 'critical-failure';
        if (roll <= target) return 'success';
        return 'failure';
    };

    const resultStatus = result !== null ? getResultStatus(result, finalTargetValue) : '';

    return (
        <div className="history-modal-overlay" onClick={handleClose}>
            <div className={`history-modal attribute-roll-modal ${resultStatus}`} onClick={e => e.stopPropagation()}>
                <div className="history-modal-header">
                    <h2>{title}</h2>
                    <button className="close-modal-btn" onClick={handleClose}>&times;</button>
                </div>

                <div className="history-modal-body roll-modal-body">

                    {/* Formula Section - Always at top */}
                    <div className="roll-attribute-info compact">
                        <div className="roll-formula">
                            <span className="formula-part" title="Valor Base">{targetValue}</span>
                            <span className="formula-op">{difficultyModifier >= 0 ? '+' : '-'}</span>
                            <span className={`formula-part ${difficultyModifier < 0 ? 'negative' : 'positive'}`} title="Dificultad">
                                {Math.abs(difficultyModifier)}
                            </span>
                            <span className="formula-op">{parsedCustomMod >= 0 ? '+' : '-'}</span>
                            <span className={`formula-part ${parsedCustomMod !== 0 ? 'active' : ''}`} title="Personalizado">
                                {Math.abs(parsedCustomMod)}
                            </span>
                            <span className="formula-eq">=</span>
                            <span className="formula-result">{finalTargetValue}%</span>
                        </div>
                        <div className="roll-formula-label">Probabilidad de Éxito</div>
                    </div>

                    <div className="roll-main-content">
                        {/* Pre-Roll: Modifiers Left + Button Right */}
                        {result === null && (
                            <>
                                <div className="roll-modifiers-column">
                                    <div className="roll-modifier-group">
                                        <label>Dificultad</label>
                                        <select
                                            value={difficultyModifier}
                                            onChange={(e) => setDifficultyModifier(parseInt(e.target.value))}
                                            className="roll-modifier-select"
                                        >
                                            <option value={-100}>Imposible (-100)</option>
                                            <option value={-75}>Extrema (-75)</option>
                                            <option value={-50}>Difícil (-50)</option>
                                            <option value={-25}>Poca (-25)</option>
                                            <option value={0}>Normal (0)</option>
                                            <option value={15}>Fácil (+15)</option>
                                            <option value={30}>Bastante (+30)</option>
                                            <option value={50}>Muy fácil (+50)</option>
                                        </select>
                                    </div>

                                    <div className="roll-modifier-group">
                                        <label>Pers.</label>
                                        <input
                                            type="number"
                                            placeholder="Mod."
                                            value={customModifier}
                                            onChange={(e) => setCustomModifier(e.target.value)}
                                            className="roll-modifier-input"
                                        />
                                    </div>
                                </div>

                                <div className="roll-button-column">
                                    <button
                                        className={`roll-circular-btn ${isRolling ? 'rolling' : ''}`}
                                        onClick={handleRoll}
                                        disabled={isRolling}
                                    >
                                        {isRolling ? '...' : 'LANZAR'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Post-Roll: Result Centered */}
                        {result !== null && (
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
                                <div className="roll-target-reference">
                                    Objetivo: {finalTargetValue}
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
