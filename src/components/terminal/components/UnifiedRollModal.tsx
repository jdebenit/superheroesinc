import React, { useState, useEffect } from 'react';
import '../TacticPlayerTerminal.css';
import { SITUATIONS, DISTANCE_SITUATIONS, RANGES, COVERAGES } from '../../../data/combatData';
import { calculateProbability, determineHitLocation } from '../../../utils/combatLogic';
import { playDiceRollSound } from '../../../utils/diceSound';
import { RollModalFormula } from './roll-modal/RollModalFormula';
import { RollModalControls } from './roll-modal/RollModalControls';
import { RollModalResult } from './roll-modal/RollModalResult';
import Modal from './Modal';

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
    const [mode, setMode] = useState<'basic' | 'combat' | 'opposed'>(initialMode);

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
    const [opposedValue, setOpposedValue] = useState<string>('');
    const [divisionFactor, setDivisionFactor] = useState<string>('');

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
        hitLocation?: { roll: number, location: string, effect: string };
    } | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setSubMode(getInitialSubMode());
            setDifficultyModifier(0);
            setCustomModifier('');
            setOpposedValue('');
            setDivisionFactor('');
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

    const calculation = calculateProbability({
        mode,
        subMode,
        targetValue,
        difficultyModifier,
        customModifier: parsedCustomMod,
        opposedValue: parseInt(opposedValue) || 0,
        divisionFactor: parseInt(divisionFactor) || 1,
        situation,
        distSituation,
        range,
        coverage,
        targetParry
    });

    const { finalProbability, modifiersSum, effectiveParry, numericParry, currentSituation, isAutoHit } = calculation;


    // --- Actions ---
    const handleRoll = () => {
        // Play dice roll sound
        playDiceRollSound();

        setIsRolling(true);
        setRollResult(null);

        setTimeout(() => {
            const roll = Math.floor(Math.random() * 100) + 1;

            let isSuccess = false;
            let isCrit = false;
            let isFumble = false;

            // Fumble check: only on 99 or 100
            if (roll >= 99) {
                isFumble = true;
                isSuccess = false;
            } else if (isAutoHit) {
                // Auto-hit: always succeeds except on fumble
                isSuccess = true;
            } else {
                // Normal check: roll must be <= finalProbability
                if (roll <= finalProbability) {
                    isSuccess = true;
                }
            }

            // Critical check: always on 1-2, or if roll is within 10% of success probability
            if (roll <= 2) {
                isCrit = true;
            } else if (isSuccess && roll <= Math.ceil(finalProbability / 10) && finalProbability > 0) {
                isCrit = true;
            }

            const margin = finalProbability - roll;

            // Determine Hit Location
            let hitLocation = undefined;
            if (mode === 'combat' && isSuccess) {
                hitLocation = determineHitLocation(subMode);
            }

            setRollResult({
                roll,
                success: isSuccess,
                isCrit,
                isFumble,
                finalFunction: finalProbability,
                margin,
                hitLocation
            });
            setIsRolling(false);
        }, mode === 'basic' ? 600 : 300); // Shorter anim for combat usually preferred
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className={mode === 'combat' ? 'advanced-combat-modal' : 'attribute-roll-modal'}
            contentStyle={{ maxWidth: mode === 'combat' ? '500px' : '420px', transition: 'max-width 0.3s' }}
            headerActions={(
                <div className="mode-selector-container">
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as any)}
                        className="mode-selector-dropdown"
                        style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="basic">⚙️ Básico</option>
                        <option value="combat">⚔️ Avanzado</option>
                        <option value="opposed">🤝 Enfrentada</option>
                    </select>
                </div>
            )}
        >
            <div className="roll-modal-body">

                {/* COMBAT SUB-MODE TOGGLE (Only if skillType is 'both' and in combat mode) */}
                {rollResult === null && mode === 'combat' && skillType === 'both' && (
                    <div className="submode-toggle-container">
                        <button
                            className={`btn-retry submode-btn ${subMode === 'melee' ? 'active' : 'outline'}`}
                            onClick={() => setSubMode('melee')}
                        >
                            ⚔️ Cuerpo a Cuerpo
                        </button>
                        <button
                            className={`btn-retry submode-btn ${subMode === 'distance' ? 'active' : 'outline'}`}
                            onClick={() => setSubMode('distance')}
                        >
                            🎯 Distancia
                        </button>
                    </div>
                )}

                {/* COMMON FORMULA (Derived from state) */}
                {rollResult === null && (
                    <RollModalFormula
                        targetValue={targetValue}
                        modifiersSum={modifiersSum}
                        parsedCustomMod={parsedCustomMod}
                        mode={mode}
                        subMode={subMode}
                        parryValue={subMode === 'distance' ? numericParry : effectiveParry}
                        opposedValue={parseInt(opposedValue) || 0}
                        divisionFactor={parseInt(divisionFactor) || 1}
                        isAutoHit={isAutoHit}
                        finalProbability={finalProbability}
                    />
                )}

                <div className="roll-main-content">
                    {rollResult === null ? (
                        <>
                            {/* LEFT COLUMN: CONTROLS */}
                            <RollModalControls
                                mode={mode}
                                subMode={subMode}
                                difficultyModifier={difficultyModifier}
                                setDifficultyModifier={setDifficultyModifier}
                                customModifier={customModifier}
                                setCustomModifier={setCustomModifier}
                                situation={situation}
                                setSituation={setSituation}
                                distSituation={distSituation}
                                setDistSituation={setDistSituation}
                                range={range}
                                setRange={setRange}
                                coverage={coverage}
                                setCoverage={setCoverage}
                                targetParry={targetParry}
                                setTargetParry={setTargetParry}
                                currentSituation={currentSituation}
                                effectiveParry={effectiveParry}
                                numericParry={numericParry}
                                opposedValue={opposedValue}
                                setOpposedValue={setOpposedValue}
                                divisionFactor={divisionFactor}
                                setDivisionFactor={setDivisionFactor}
                            />

                            {/* RIGHT COLUMN: BUTTON */}
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
                        <RollModalResult
                            rollResult={rollResult}
                            onRetry={() => setRollResult(null)}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
}
