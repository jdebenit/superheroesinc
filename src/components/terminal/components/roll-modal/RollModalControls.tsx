import React from 'react';
import { DIFFICULTIES, SITUATIONS, COVERAGES, DISTANCE_SITUATIONS, RANGES } from '../../../../data/combatData';

interface RollModalControlsProps {
    mode: 'basic' | 'combat' | 'opposed';
    subMode: 'melee' | 'distance';
    // Basic Params
    difficultyModifier: number;
    setDifficultyModifier: (val: number) => void;
    customModifier: string;
    setCustomModifier: (val: string) => void;
    // Combat Params
    situation: string;
    setSituation: (val: string) => void;
    distSituation: string;
    setDistSituation: (val: string) => void;
    range: string;
    setRange: (val: string) => void;
    coverage: string;
    setCoverage: (val: string) => void;
    targetParry: string;
    setTargetParry: (val: string) => void;
    currentSituation: any;
    effectiveParry: number;
    numericParry: number;
    opposedValue?: string;
    setOpposedValue?: (val: string) => void;
    divisionFactor?: string;
    setDivisionFactor?: (val: string) => void;
}

export const RollModalControls: React.FC<RollModalControlsProps> = ({
    mode,
    subMode,
    difficultyModifier,
    setDifficultyModifier,
    customModifier,
    setCustomModifier,
    situation,
    setSituation,
    distSituation,
    setDistSituation,
    range,
    setRange,
    coverage,
    setCoverage,
    targetParry,
    setTargetParry,
    currentSituation,
    effectiveParry,
    numericParry,
    opposedValue,
    setOpposedValue,
    divisionFactor,
    setDivisionFactor
}) => {
    return (
        <div className="roll-modifiers-column">
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
                        <label>Divisor</label>
                        <input
                            type="number"
                            value={divisionFactor || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setDivisionFactor && setDivisionFactor('');
                                } else {
                                    const intVal = parseInt(val);
                                    if (!isNaN(intVal) && intVal >= 1) {
                                        setDivisionFactor && setDivisionFactor(intVal.toString());
                                    }
                                }
                            }}
                            placeholder="1"
                            min="1"
                            className="roll-modifier-input"
                        />
                    </div>

                    <div className="roll-modifier-group">
                        <label>Situación</label>
                        <select
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            className="roll-modifier-select small-text"
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
                    <small className="help-text-block">
                        {currentSituation.note || (currentSituation.parry === 'half' ? 'Parada efectiva: ÷2' : currentSituation.parry === 'none' ? 'Sin parada' : '')}
                        {currentSituation.parry === 'half' && numericParry > 0 && ` (${effectiveParry})`}
                    </small>
                </>
            )}

            {/* ADVANCED - DISTANCE CONTROLS */}
            {mode === 'combat' && subMode === 'distance' && (
                <>
                    <div className="roll-modifier-group">
                        <label>Divisor</label>
                        <input
                            type="number"
                            value={divisionFactor || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                    setDivisionFactor && setDivisionFactor('');
                                } else {
                                    const intVal = parseInt(val);
                                    if (!isNaN(intVal) && intVal >= 1) {
                                        setDivisionFactor && setDivisionFactor(intVal.toString());
                                    }
                                }
                            }}
                            placeholder="1"
                            min="1"
                            className="roll-modifier-input"
                        />
                    </div>

                    <div className="roll-modifier-group">
                        <label>Situación</label>
                        <select
                            value={distSituation}
                            onChange={(e) => setDistSituation(e.target.value)}
                            className="roll-modifier-select small-text"
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

            {/* OPPOSED CONTROLS */}
            {mode === 'opposed' && (
                <>
                    <div className="roll-modifier-group">
                        <label>Valor Oponente</label>
                        <input
                            type="number"
                            value={opposedValue || ''}
                            onChange={(e) => setOpposedValue && setOpposedValue(e.target.value)}
                            placeholder="0"
                            className="roll-modifier-input"
                            autoFocus
                        />
                    </div>
                    <small className="help-text-block">
                        La probabilidad base es 50% +/- la diferencia de habilidad.
                    </small>
                </>
            )}
        </div>
    );
};
