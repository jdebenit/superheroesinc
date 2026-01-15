import React, { useState, useEffect } from 'react';
import '../TacticPlayerTerminal.css';

interface AdvancedCombatModalProps {
    isOpen: boolean;
    onClose: () => void;
    skillName: string;
    skillValue: number;
}

export const SITUATIONS = [
    { id: 'normal', label: 'Normal / Frontal', mod: 0, parry: 'normal' },
    { id: 'inconsciente', label: 'Defensor inconsciente', mod: 0, parry: 'none', note: 'Solo falla con pifia' },
    { id: 'aturdido', label: 'Defensor aturdido', mod: 50, parry: 'half' },
    { id: 'espaldas', label: 'Defensor de espaldas', mod: 70, parry: 'normal' },
    { id: 'costado', label: 'Defensor de costado', mod: 30, parry: 'normal' },
    { id: 'desequilibrado', label: 'Defensor desequilibrado', mod: 20, parry: 'normal' },
    { id: 'debajo', label: 'Defensor por debajo', mod: 15, parry: 'normal' },
    { id: 'inmovilizado', label: 'Defensor inmovilizado', mod: 0, parry: 'none', note: 'Solo falla con pifia' },
];

export const COVERAGES = [
    { id: 'ninguna', label: 'Ninguna', mod: 0 },
    { id: 'ligera', label: 'Ligera', mod: -25 },
    { id: 'media', label: 'Media', mod: -50 },
    { id: 'alta', label: 'Alta', mod: -75 },
    { id: 'completa', label: 'Completa', mod: -100 },
];

export default function AdvancedCombatModal({ isOpen, onClose, skillName, skillValue }: AdvancedCombatModalProps) {
    const [situation, setSituation] = useState(SITUATIONS[0].id);
    const [coverage, setCoverage] = useState(COVERAGES[0].id);
    const [targetParry, setTargetParry] = useState<string>('');
    const [rollResult, setRollResult] = useState<{
        roll: number;
        success: boolean;
        isCrit: boolean;
        isFumble: boolean;
        finalFunction: number;
        margin: number;
    } | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setSituation(SITUATIONS[0].id);
            setCoverage(COVERAGES[0].id);
            setTargetParry('');
            setRollResult(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentSituation = SITUATIONS.find(s => s.id === situation) || SITUATIONS[0];
    const currentCoverage = COVERAGES.find(c => c.id === coverage) || COVERAGES[0];

    // Calculate Final Probability
    const numericParry = parseInt(targetParry) || 0;

    // Calculate effective parry based on situation
    let effectiveParry = numericParry;
    if (currentSituation.parry === 'half') effectiveParry = Math.floor(numericParry / 2);
    if (currentSituation.parry === 'none') effectiveParry = 0;

    const modifiers = currentSituation.mod + currentCoverage.mod;
    const finalProbability = (skillValue + modifiers) - effectiveParry;

    // Special auto-hit note
    const isAutoHit = currentSituation.parry === 'none'; // "Solo se falla con pifia"

    // Handlers
    const handleRoll = () => {
        const roll = Math.floor(Math.random() * 100) + 1;

        let isSuccess = false;
        let isCrit = false;
        let isFumble = false;

        // Determine success based on rules
        if (isAutoHit) {
            // Auto hit: fails only on fumble
            // Define standard fumble range (usually > 95 or 00, depends on game vars)
            // Assuming standard logic: 96-00 is fumble, or >95. 
            // The prompt says "Solo se falla con pifia".
            // Let's assume standard fumble rules apply generally.
            // For now, let's say fumble is > 95 + mastery... I'll use common SHI default: > 95 is fumble.
            // Or usually > Critical Failure Range.
            // Without specific fumble tables, I'll assume > 95 is Fumble.
            if (roll > 95) isFumble = true;
            else isSuccess = true;

            // Crit check (usually 1/10th of skill or specific range)
            // If auto-hit, is crit possible? Yes.
            if (roll <= Math.ceil(finalProbability / 10)) isCrit = true; // Use final prob for crit chance even in auto hit? Or base?
            // "Solo se falla con pifia" implies probability is effectively 100% or close.
        } else {
            // Standard check
            if (roll <= finalProbability) isSuccess = true;

            // Crit/Fumble
            // Crit: usually <= 10% of Final Value? Or specific range.
            // Fumble: > 95 usually.
            if (roll <= Math.ceil(finalProbability / 10)) isCrit = true;
            if (roll > 95) {
                // Check if mastery alters fumble range (not implemented here yet)
                isFumble = true;
                isSuccess = false; // Fumble overrides success if prob > 95?
            }
        }

        // Margin
        const margin = finalProbability - roll;

        setRollResult({
            roll,
            success: isSuccess,
            isCrit,
            isFumble,
            finalFunction: finalProbability,
            margin
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content advanced-combat-modal" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>Combate Avanzado: {skillName}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Base Stats */}
                    <div className="stat-row">
                        <span>Habilidad Base:</span>
                        <span className="bold">{skillValue}%</span>
                    </div>

                    {/* Controls Grid */}
                    <div className="advanced-controls-grid">
                        <div className="control-group">
                            <label>Situación</label>
                            <select
                                value={situation}
                                onChange={(e) => setSituation(e.target.value)}
                                className="terminal-select"
                            >
                                {SITUATIONS.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.label} {s.mod > 0 ? `(+${s.mod})` : ''}
                                    </option>
                                ))}
                            </select>
                            <small className="help-text">
                                {currentSituation.note || `Parada: ${currentSituation.parry === 'half' ? '÷2' : currentSituation.parry === 'none' ? 'NO' : 'Normal'}`}
                            </small>
                        </div>

                        <div className="control-group">
                            <label>Cobertura</label>
                            <select
                                value={coverage}
                                onChange={(e) => setCoverage(e.target.value)}
                                className="terminal-select"
                            >
                                {COVERAGES.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.label} ({c.mod})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group full-width">
                            <label>Parada Física del Objetivo</label>
                            <input
                                type="number"
                                value={targetParry}
                                onChange={(e) => setTargetParry(e.target.value)}
                                placeholder="0"
                                className="terminal-input"
                                disabled={currentSituation.parry === 'none'}
                            />
                            {currentSituation.parry === 'half' && numericParry > 0 && (
                                <small className="info-text">Efectiva: {effectiveParry}</small>
                            )}
                        </div>
                    </div>

                    {/* Summary Calculation */}
                    <div className="calculation-summary">
                        <div className="calc-row">
                            <span>Base</span>
                            <span>{skillValue}</span>
                        </div>
                        <div className="calc-row">
                            <span>Modificadores</span>
                            <span className={modifiers >= 0 ? "positive" : "negative"}>
                                {modifiers > 0 ? '+' : ''}{modifiers}
                            </span>
                        </div>
                        <div className="calc-row">
                            <span>- Parada</span>
                            <span className="negative">-{effectiveParry}</span>
                        </div>
                        <div className="calc-divider"></div>
                        <div className="calc-row final">
                            <span>Probabilidad Final</span>
                            <span className="total">{isAutoHit ? 'AUTO (Pifia)' : `${finalProbability}%`}</span>
                        </div>
                    </div>

                    {/* Roll Button */}
                    {!rollResult && (
                        <button
                            className="btn-roll-terminal large"
                            onClick={handleRoll}
                        >
                            🎲 LANZAR D100
                        </button>
                    )}

                    {/* Result */}
                    {rollResult && (
                        <div className={`roll-result-box ${rollResult.success ? 'success' : 'failure'} ${rollResult.isCrit ? 'crit' : ''} ${rollResult.isFumble ? 'fumble' : ''}`}>
                            <div className="roll-number">{rollResult.roll}</div>
                            <div className="roll-status">
                                {rollResult.isCrit ? '¡CRÍTICO!' :
                                    rollResult.isFumble ? '¡PIFIA!' :
                                        rollResult.success ? 'ÉXITO' : 'FALLO'}
                            </div>
                            <div className="roll-details">
                                Margen: {rollResult.margin > 0 ? '+' : ''}{rollResult.margin}
                            </div>
                            <button className="btn-retry" onClick={() => setRollResult(null)}>
                                🔄 Repetir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
