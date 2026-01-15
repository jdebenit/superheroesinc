
import React, { useState, useEffect } from 'react';
import '../TacticPlayerTerminal.css';

// --- Data Constants from AdvancedCombatModal ---
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

export const DISTANCE_SITUATIONS = [
    { id: 'normal', label: 'Normal', mod: 0 },
    { id: 'atacante_mov', label: 'Atacante en movimiento', mod: -15 },
    { id: 'objetivo_mov', label: 'Objetivo en movimiento', mod: -15 },
    { id: 'objetivo_pared', label: 'Objetivo pegado a pared', mod: -10 },
    { id: 'objetivo_suelo', label: 'Objetivo tumbado', mod: -10 },
    { id: 'noche', label: 'Noche', mod: -20 },
];

export const RANGES = [
    { id: 'media', label: 'Distancia Media (DM)', mod: 0 },
    { id: 'quemarropa', label: 'Quemarropa (Q)', mod: 40 },
    { id: 'corta', label: 'Distancia Corta (DC)', mod: 15 },
    { id: 'larga', label: 'Distancia Larga (DL)', mod: -30 },
];

export const DIFFICULTIES = [
    { value: -100, label: 'Imposible (-100)' },
    { value: -75, label: 'Extrema (-75)' },
    { value: -50, label: 'Difícil (-50)' },
    { value: -25, label: 'Poca (-25)' },
    { value: 0, label: 'Normal (0)' },
    { value: 15, label: 'Fácil (+15)' },
    { value: 30, label: 'Bastante (+30)' },
    { value: 50, label: 'Muy fácil (+50)' },
];

interface UnifiedRollModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    targetValue: number;
    initialMode?: 'basic' | 'combat'; // Default mode
    skillType?: 'cac' | 'distance' | 'both' | string;
}

export default function UnifiedRollModal({
    isOpen,
    onClose,
    title,
    targetValue,
    initialMode = 'basic',
    skillType = 'cac'
}: UnifiedRollModalProps) {
    const [mode, setMode] = useState<'basic' | 'combat'>(initialMode);

    // Determine initial sub-mode (melee vs distance)
    const getInitialSubMode = () => {
        if (skillType === 'distance') return 'distance';
        if (skillType === 'both') return 'melee'; // Default to melee for 'both'
        return 'melee';
    };
    const [subMode, setSubMode] = useState<'melee' | 'distance'>(getInitialSubMode());

    // Basic Mode State
    const [difficultyModifier, setDifficultyModifier] = useState<number>(0);
    const [customModifier, setCustomModifier] = useState<string>('');

    // Advanced/Combat Mode State
    const [situation, setSituation] = useState(SITUATIONS[0].id);
    const [distSituation, setDistSituation] = useState(DISTANCE_SITUATIONS[0].id);
    const [range, setRange] = useState(RANGES[0].id);
    const [coverage, setCoverage] = useState(COVERAGES[0].id);
    const [targetParry, setTargetParry] = useState<string>(''); // Used for Parry or Defender Impact Mod

    // Roll State
    const [rollResult, setRollResult] = useState<{
        roll: number;
        success: boolean;
        isCrit: boolean;
        isFumble: boolean;
        finalFunction: number;
        margin: number;
    } | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setSubMode(getInitialSubMode());
            setDifficultyModifier(0);
            setCustomModifier('');
            setSituation(SITUATIONS[0].id);
            setDistSituation(DISTANCE_SITUATIONS[0].id);
            setRange(RANGES[0].id);
            setCoverage(COVERAGES[0].id);
            setTargetParry('');
            setRollResult(null);
            setIsRolling(false);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    // --- Calculations ---
    const parsedCustomMod = parseInt(customModifier) || 0;


    // Melee Logic
    const currentSituation = SITUATIONS.find(s => s.id === situation) || SITUATIONS[0];

    // Distance Logic
    const currentDistSituation = DISTANCE_SITUATIONS.find(s => s.id === distSituation) || DISTANCE_SITUATIONS[0];
    const currentRange = RANGES.find(r => r.id === range) || RANGES[0];

    const currentCoverage = COVERAGES.find(c => c.id === coverage) || COVERAGES[0];

    // Combat logic
    const numericParry = parseInt(targetParry) || 0;
    let effectiveParry = numericParry;
    if (currentSituation.parry === 'half') effectiveParry = Math.floor(numericParry / 2);
    if (currentSituation.parry === 'none') effectiveParry = 0;

    // Calculate Final Probability
    let finalProbability = 0;
    let modifiersSum = 0;

    if (mode === 'basic') {
        modifiersSum = difficultyModifier + parsedCustomMod;
        finalProbability = targetValue + modifiersSum;
    } else {
        // Combat Mode
        const isDistance = subMode === 'distance';

        if (isDistance) {
            // Distance Formula: Base + Range + DistSituation - Coverage - DefenderMod
            // Note: Coverage is negative in constant, so we ADD it. same for DistSituation.
            modifiersSum = currentRange.mod + currentDistSituation.mod + currentCoverage.mod;
            // Defender Impact Mod (entered in targetParry input) is subtracted
            finalProbability = (targetValue + modifiersSum) - numericParry;
        } else {
            // Melee Formula
            modifiersSum = currentSituation.mod + currentCoverage.mod;
            finalProbability = (targetValue + modifiersSum) - effectiveParry;
        }
    }

    // Clamp logic (usually 0-100, though some games allow >100)
    // Basic modal clipped 0-100. Advanced didn't explicit clip but math implies potential range.
    // Let's safe-clamp for visual consistency, but keep raw for logic if needed?
    // Usually probability > 100 just means less chance of fumble.
    // For now, allow > 100 but display might look weird. Basic clipped. Let's keep consistent.
    // Actually advanced could go negative.

    // Special auto-hit note (Melee only)
    const isAutoHit = mode === 'combat' && subMode === 'melee' && currentSituation.parry === 'none';

    // --- Actions ---
    const handleRoll = () => {
        setIsRolling(true);
        setRollResult(null);

        setTimeout(() => {
            const roll = Math.floor(Math.random() * 100) + 1;

            let isSuccess = false;
            let isCrit = false;
            let isFumble = false;

            // Logic
            if (isAutoHit) {
                if (roll > 95) isFumble = true;
                else isSuccess = true;
                if (roll <= Math.ceil(finalProbability / 10)) isCrit = true;
            } else {
                if (roll <= finalProbability) isSuccess = true;
                if (roll <= Math.ceil(finalProbability / 10) && finalProbability > 0) isCrit = true;
                if (roll > 95) {
                    isFumble = true;
                    isSuccess = false;
                }
            }

            const margin = finalProbability - roll;

            setRollResult({
                roll,
                success: isSuccess,
                isCrit,
                isFumble,
                finalFunction: finalProbability,
                margin
            });
            setIsRolling(false);
        }, mode === 'basic' ? 600 : 300); // Shorter anim for combat usually preferred
    };

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${mode === 'combat' ? 'advanced-combat-modal' : 'attribute-roll-modal'}`} style={{ maxWidth: mode === 'combat' ? '500px' : '380px', transition: 'max-width 0.3s' }}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Toggle Mode Button */}
                        <button
                            className="btn-retry"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                            onClick={() => setMode(prev => prev === 'basic' ? 'combat' : 'basic')}
                        >
                            {mode === 'basic' ? '⚙️ Avanzado' : '⏪ Básico'}
                        </button>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                </div>

                <div className="modal-body roll-modal-body">

                    {/* COMBAT SUB-MODE TOGGLE (Only if skillType is 'both' and in combat mode) */}
                    {mode === 'combat' && skillType === 'both' && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                            <button
                                className={`btn-retry ${subMode === 'melee' ? '' : 'outline'}`}
                                style={{
                                    backgroundColor: subMode === 'melee' ? '#2563eb' : 'transparent',
                                    color: subMode === 'melee' ? 'white' : '#6b7280',
                                    border: '1px solid #2563eb'
                                }}
                                onClick={() => setSubMode('melee')}
                            >
                                ⚔️ Cuerpo a Cuerpo
                            </button>
                            <button
                                className={`btn-retry ${subMode === 'distance' ? '' : 'outline'}`}
                                style={{
                                    backgroundColor: subMode === 'distance' ? '#2563eb' : 'transparent',
                                    color: subMode === 'distance' ? 'white' : '#6b7280',
                                    border: '1px solid #2563eb'
                                }}
                                onClick={() => setSubMode('distance')}
                            >
                                🎯 Distancia
                            </button>
                        </div>
                    )}

                    {/* COMMON FORMULA (Derived from state) */}
                    <div className="roll-attribute-info compact">
                        <div className="roll-formula">
                            <span className="formula-part" title="Valor Base">{targetValue}</span>

                            {/* Modifiers Sum */}
                            <span className="formula-op">{modifiersSum >= 0 ? '+' : ''}</span>
                            <span className={`formula-part ${modifiersSum < 0 ? 'negative' : 'positive'}`} title="Modificadores">
                                {Math.abs(modifiersSum)}
                            </span>

                            {/* Deduction */}
                            <span className="formula-op">-</span>
                            {mode === 'basic' ? (
                                <span className={`formula-part ${parsedCustomMod !== 0 ? 'active' : ''}`} title="Personalizado (ya incluido arriba)">
                                    0
                                </span>
                            ) : (
                                <span className="formula-part negative" title={subMode === 'distance' ? 'Mod. Defensor' : 'Parada'}>
                                    {subMode === 'distance' ? numericParry : effectiveParry}
                                </span>
                            )}

                            <span className="formula-eq">=</span>
                            <span className="formula-result">{isAutoHit ? 'AUTO' : `${finalProbability}%`}</span>
                        </div>
                        <div className="roll-formula-label">
                            Probabilidad de Éxito {isAutoHit && '(Solo Pifia)'}
                        </div>
                    </div>

                    <div className="roll-main-content">
                        {rollResult === null ? (
                            <>
                                <div className="roll-modifiers-column" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {/* BASIC CONTROLS */}
                                    {mode === 'basic' && (
                                        <>
                                            <div className="roll-modifier-group">
                                                <label>Dificultad</label>
                                                <select
                                                    value={difficultyModifier}
                                                    onChange={(e) => setDifficultyModifier(parseInt(e.target.value))}
                                                    className="roll-modifier-select"
                                                >
                                                    {DIFFICULTIES.map(d => (
                                                        <option key={d.value} value={d.value}>{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Pers.</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={customModifier}
                                                    onChange={(e) => setCustomModifier(e.target.value)}
                                                    className="roll-modifier-input"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* ADVANCED - MELEE CONTROLS */}
                                    {mode === 'combat' && subMode === 'melee' && (
                                        <>
                                            <div className="roll-modifier-group">
                                                <label>Situación</label>
                                                <select
                                                    value={situation}
                                                    onChange={(e) => setSituation(e.target.value)}
                                                    className="roll-modifier-select"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    {SITUATIONS.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.label} ({s.mod > 0 ? '+' : ''}{s.mod})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Cobertura</label>
                                                <select
                                                    value={coverage}
                                                    onChange={(e) => setCoverage(e.target.value)}
                                                    className="roll-modifier-select"
                                                >
                                                    {COVERAGES.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.label} ({c.mod})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Parada</label>
                                                <input
                                                    type="number"
                                                    value={targetParry}
                                                    onChange={(e) => setTargetParry(e.target.value)}
                                                    placeholder="0"
                                                    className="roll-modifier-input"
                                                    disabled={currentSituation.parry === 'none'}
                                                />
                                            </div>
                                            {/* Parry Note */}
                                            <small className="help-text" style={{ display: 'block', marginTop: '-0.5rem', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.75rem' }}>
                                                {currentSituation.note || (currentSituation.parry === 'half' ? 'Parada efectiva: ÷2' : currentSituation.parry === 'none' ? 'Sin parada' : '')}
                                                {currentSituation.parry === 'half' && numericParry > 0 && ` (${effectiveParry})`}
                                            </small>
                                        </>
                                    )}

                                    {/* ADVANCED - DISTANCE CONTROLS */}
                                    {mode === 'combat' && subMode === 'distance' && (
                                        <>
                                            <div className="roll-modifier-group">
                                                <label>Situación</label>
                                                <select
                                                    value={distSituation}
                                                    onChange={(e) => setDistSituation(e.target.value)}
                                                    className="roll-modifier-select"
                                                    style={{ fontSize: '0.9rem' }}
                                                >
                                                    {DISTANCE_SITUATIONS.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.label} ({s.mod})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Alcance</label>
                                                <select
                                                    value={range}
                                                    onChange={(e) => setRange(e.target.value)}
                                                    className="roll-modifier-select"
                                                >
                                                    {RANGES.map(r => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.label} ({r.mod > 0 ? '+' : ''}{r.mod})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Cobertura</label>
                                                <select
                                                    value={coverage}
                                                    onChange={(e) => setCoverage(e.target.value)}
                                                    className="roll-modifier-select"
                                                >
                                                    {COVERAGES.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.label} ({c.mod})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="roll-modifier-group">
                                                <label>Defensor</label>
                                                <input
                                                    type="number"
                                                    value={targetParry}
                                                    onChange={(e) => setTargetParry(e.target.value)}
                                                    placeholder="Mod. Impacto"
                                                    className="roll-modifier-input"
                                                />
                                            </div>
                                        </>
                                    )}
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
                        ) : (
                            <div className="roll-result-display">
                                <div className="roll-result-label">
                                    {rollResult.isCrit ? '¡CRÍTICO!' :
                                        rollResult.isFumble ? '¡PIFIA!' :
                                            rollResult.success ? 'ÉXITO' : 'FALLO'}
                                </div>
                                <div className={`roll-result-number ${rollResult.success ? 'success' : 'failure'} ${rollResult.isCrit ? 'critical-success' : ''} ${rollResult.isFumble ? 'critical-failure' : ''}`}>
                                    {rollResult.roll}
                                </div>
                                <div className="roll-details">
                                    <small>Margen: {rollResult.margin > 0 ? '+' : ''}{rollResult.margin}</small>
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
