import React, { useState, useEffect } from 'react';
import { ORIGIN_CHARACTERISTIC_MODIFIERS, VIGILANTE_SPECIALTY_MODIFIERS } from '../../../data/characteristicModifiers';
import { POWERS } from '../../../data/powers';

interface Step2Props {
    data: any;
    onChange: (updates: any) => void;
}

const CHARACTERISTICS = [
    { id: 'fuerza', name: 'Fuerza', abbr: 'FUE' },
    { id: 'constitucion', name: 'Constitución', abbr: 'CON' },
    { id: 'agilidad', name: 'Agilidad', abbr: 'AGI' },
    { id: 'inteligencia', name: 'Inteligencia', abbr: 'INT' },
    { id: 'percepcion', name: 'Percepción', abbr: 'PER' },
    { id: 'apariencia', name: 'Apariencia', abbr: 'APA' },
    { id: 'voluntad', name: 'Voluntad', abbr: 'VOL' }
];

import {
    calculateOriginModifiers,
    calculateLimits,
    hasChoosableCharacteristic,
    hasDistributablePoints,
    getDistributablePointsInfo,
    calculateSpecialtyModifiers,
    hasSpecialtyDistributablePoints,
    getSpecialtyDistributablePointsInfo,
    calculateSpecialtyAllowedCharacteristics,
    calculateCreationPoints
} from '../../../utils/characterCalculations';
import { WizardSection } from '../shared/WizardSection';
import { WizardField } from '../shared/WizardField';
import { CostBadge } from '../shared/CostBadge';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../shared/stepStyles';
import '../shared/WizardStep.css';
import './Step2_Characteristics.css';


export default function Step2_Characteristics({ data, onChange }: Step2Props) {
    const [characteristics, setCharacteristics] = useState<{
        [key: string]: {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
            otherMod: number;
        }
    }>(() => {
        // Recuperar estado previo si existe
        if (data.attributes?.breakdown) {
            const restored = { ...data.attributes.breakdown };
            Object.keys(restored).forEach(key => {
                if (typeof restored[key].otherMod !== 'number') {
                    restored[key].otherMod = 0;
                }
            });
            return restored;
        }
        return {
            fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 }
        };
    });

    // Estado para guardar la característica elegida para el bonus fijo (ej: Heraldo Cósmico)
    const [chosenBonusCharacteristic, setChosenBonusCharacteristic] = useState<string | null>(null);

    // Actualizar modificadores de origen y especialidad cuando cambian los orígenes o la característica elegida
    useEffect(() => {
        const origins = data.origin?.items || [];
        const originMods = calculateOriginModifiers(origins, chosenBonusCharacteristic);
        const specialtyMods = calculateSpecialtyModifiers(origins);

        const hasDistributable = hasDistributablePoints(origins);
        const choosable = hasChoosableCharacteristic(origins);
        const isDistributable = hasDistributable || !!choosable;

        if (isDistributable) {
            if (choosable && chosenBonusCharacteristic) {
                setCharacteristics(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = {
                            ...updated[key],
                            originMod: originMods[key] || 0,
                            specialtyMod: specialtyMods[key] || 0
                        };
                    });
                    return updated;
                });
            } else {
                setCharacteristics(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = {
                            ...updated[key],
                            originMod: originMods[key] || 0,
                            specialtyMod: specialtyMods[key] || 0
                        };
                    });
                    return updated;
                });
            }
            return;
        }

        setCharacteristics(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                updated[key] = {
                    ...updated[key],
                    originMod: originMods[key] || 0,
                    specialtyMod: specialtyMods[key] || 0
                };
            });
            return updated;
        });
    }, [data.origin, chosenBonusCharacteristic]);

    // Update power modifiers from selected powers
    useEffect(() => {
        const selectedPowers = data.powers?.selected || [];
        const powerMods: { [key: string]: number } = {};

        // Calculate total mods per characteristic
        selectedPowers.forEach((p: any) => {
            const powerData = POWERS.find(pd => pd.id === p.id);
            if (powerData?.characteristic) {
                const charMap: Record<string, string> = {
                    'FUE': 'fuerza',
                    'AGI': 'agilidad',
                    'CON': 'constitucion',
                    'INT': 'inteligencia',
                    'PER': 'percepcion',
                    'APA': 'apariencia',
                    'VOL': 'voluntad'
                };
                const charId = charMap[powerData.characteristic];
                if (charId) {
                    const mod = Number(p.powerMod) || 0;
                    powerMods[charId] = (powerMods[charId] || 0) + mod;
                }
            }
        });

        // Update state if different
        setCharacteristics(prev => {
            let hasChanges = false;
            const updated = { ...prev };

            Object.keys(updated).forEach(key => {
                const currentMod = updated[key].powerMod;
                const newMod = powerMods[key] || 0;

                if (currentMod !== newMod) {
                    updated[key] = { ...updated[key], powerMod: newMod };
                    hasChanges = true;
                }
            });

            return hasChanges ? updated : prev;
        });

    }, [JSON.stringify(data.powers?.selected)]);

    // Update internal state when props data changes (but NOT powerMod - that's calculated from powers)
    useEffect(() => {
        if (data.attributes?.breakdown) {
            setCharacteristics(prev => {
                const newState = { ...prev };
                let hasChanges = false;

                Object.keys(data.attributes.breakdown).forEach(key => {
                    // Only sync otherMod, NOT powerMod (powerMod is calculated from data.powers.selected)
                    if (typeof data.attributes.breakdown[key].otherMod === 'number' && newState[key].otherMod !== data.attributes.breakdown[key].otherMod) {
                        newState[key] = {
                            ...newState[key],
                            otherMod: data.attributes.breakdown[key].otherMod || 0
                        };
                        hasChanges = true;
                    }
                });

                return hasChanges ? newState : prev;
            });
        }
    }, [data.attributes?.breakdown]);

    useEffect(() => {
        const values: { [key: string]: number } = {};
        let changed = false;

        CHARACTERISTICS.forEach(char => {
            const c = characteristics[char.id];
            const total = c.base + c.originMod + c.specialtyMod + c.powerMod + (c.otherMod || 0);
            values[char.name] = total;

            if (data.attributes?.values?.[char.name] !== total) {
                changed = true;
            }
        });

        if (changed) {
            onChange({
                ...data,
                attributes: {
                    values,
                    breakdown: characteristics
                }
            });
        }
    }, [characteristics, data.attributes]);

    const handleCharacteristicChange = (charId: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        const origins = data.origin?.items || [];

        // Determine limits: override if powerMod > 0
        const defaultLimits = calculateLimits(origins, charId);
        const hasPowerMod = characteristics[charId].powerMod > 0;
        const limits = {
            min: defaultLimits.min,
            max: hasPowerMod ? 200 : defaultLimits.max
        };

        // Validate max
        let clampedValue = Math.max(0, Math.min(limits.max, numValue));

        const hasSpecialtyPoints = hasSpecialtyDistributablePoints(origins);

        if (field === 'specialtyMod' && hasSpecialtyPoints) {
            const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
            if (allowedChars && !allowedChars.includes(charId)) return;

            const specialtyInfo = getSpecialtyDistributablePointsInfo(origins, characteristics);
            const currentSpecialtyMod = characteristics[charId].specialtyMod;
            const fixedMods = calculateSpecialtyModifiers(origins);
            const fixedMod = fixedMods[charId] || 0;

            if (clampedValue < fixedMod) clampedValue = fixedMod;

            const newManualPoints = Math.max(0, clampedValue - fixedMod);
            const currentManualPoints = Math.max(0, currentSpecialtyMod - fixedMod);
            const pointsDiff = newManualPoints - currentManualPoints;

            if (specialtyInfo.remaining - pointsDiff < 0) return;
        }

        const isDistributableMode = hasDistributablePoints(origins) || !!hasChoosableCharacteristic(origins);

        if (field === 'originMod' && isDistributableMode) {
            const fixedOriginMods = calculateOriginModifiers(origins, chosenBonusCharacteristic);
            const minAllowed = fixedOriginMods[charId] || 0;
            if (clampedValue < minAllowed) clampedValue = minAllowed;

            const pointsInfo = getDistributablePointsInfo(origins, characteristics, chosenBonusCharacteristic);
            const currentOriginMod = characteristics[charId].originMod;
            const difference = clampedValue - currentOriginMod;
            const newTotal = pointsInfo.used + difference;

            if (newTotal > pointsInfo.total) {
                clampedValue = currentOriginMod + (pointsInfo.total - pointsInfo.used);
            }
        }

        const currentChar = characteristics[charId];
        const projectedTotal =
            (field === 'base' ? clampedValue : currentChar.base) +
            (field === 'originMod' ? clampedValue : currentChar.originMod) +
            (field === 'specialtyMod' ? clampedValue : currentChar.specialtyMod) +
            (field === 'powerMod' ? clampedValue : currentChar.powerMod) +
            (field === 'otherMod' ? clampedValue : (currentChar.otherMod || 0));

        if (projectedTotal > limits.max) {
            const otherValues =
                (field !== 'base' ? currentChar.base : 0) +
                (field !== 'originMod' ? currentChar.originMod : 0) +
                (field !== 'specialtyMod' ? currentChar.specialtyMod : 0) +
                (field !== 'powerMod' ? currentChar.powerMod : 0) +
                (field !== 'otherMod' ? (currentChar.otherMod || 0) : 0);
            clampedValue = Math.max(0, limits.max - otherValues);
        }

        const newCharacteristics = {
            ...characteristics,
            [charId]: {
                ...characteristics[charId],
                [field]: clampedValue
            }
        };

        setCharacteristics(newCharacteristics);
        updateCharacterData(newCharacteristics);
    };

    const updateCharacterData = (chars: typeof characteristics) => {
        const values: { [key: string]: number } = {};

        CHARACTERISTICS.forEach(char => {
            const c = chars[char.id];
            values[char.name] = c.base + c.originMod + c.specialtyMod + c.powerMod + (c.otherMod || 0);
        });

        onChange({
            ...data,
            attributes: {
                values,
                breakdown: chars
            }
        });
    };

    const getTotal = (charId: string) => {
        const c = characteristics[charId];
        return c.base + c.originMod + c.specialtyMod + c.powerMod + (c.otherMod || 0);
    };

    const origins = data.origin?.items || [];
    const isDistributableMode = hasDistributablePoints(origins) || !!hasChoosableCharacteristic(origins);
    const pointsInfo = isDistributableMode ? getDistributablePointsInfo(origins, characteristics, chosenBonusCharacteristic) : null;
    const choosableInfo = hasChoosableCharacteristic(origins);
    const specialtyPointsInfo = hasSpecialtyDistributablePoints(origins) ? getSpecialtyDistributablePointsInfo(origins, characteristics) : null;
    const { pcValues } = calculateCreationPoints(characteristics, origins);

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Características del Personaje"
                description={isDistributableMode
                    ? 'Distribuye los puntos de origen entre las características.'
                    : 'Define las características base y sus modificadores.'}
            >
                {choosableInfo && (
                    <div className="step2-bonus-box">
                        <h4 className="step2-bonus-title">
                            ⭐ Elige la característica para el bonus de +{choosableInfo.bonus}
                        </h4>
                        <div className="step2-bonus-grid">
                            {CHARACTERISTICS.map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setChosenBonusCharacteristic(char.id)}
                                    className={`step2-bonus-btn ${chosenBonusCharacteristic === char.id ? 'selected' : 'unselected'}`}
                                >
                                    {char.name} {chosenBonusCharacteristic === char.id && '✓'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </WizardSection>

            <WizardSection
                title="Características"
                rightContent={
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {isDistributableMode && pointsInfo && (
                            <CostBadge
                                cost={`${pointsInfo.used}/${pointsInfo.total}`}
                                label="Bal."
                                variant={pointsInfo.remaining < 0 ? "penalty" : "default"}
                            />
                        )}
                        {specialtyPointsInfo && (
                            <CostBadge
                                cost={`${specialtyPointsInfo.used}/${specialtyPointsInfo.total}`}
                                label="Esp."
                                variant={specialtyPointsInfo.remaining < 0 ? "penalty" : "default"}
                            />
                        )}
                        <CostBadge cost={pcValues.total} label="PC" variant="penalty" />
                    </div>
                }
            >
                <div className="step2-chars-grid">

                    {CHARACTERISTICS.map((char) => {
                        const total = getTotal(char.id);
                        const c = characteristics[char.id];

                        // Limit Override Logic in Render
                        const defaultLimits = calculateLimits(origins, char.id);
                        const hasPowerMod = c.powerMod > 0;
                        const charLimits = {
                            min: defaultLimits.min,
                            max: hasPowerMod ? 200 : defaultLimits.max
                        };

                        return (
                            <div key={char.id} className="step2-char-card">
                                <div className="step2-char-header">
                                    <div>
                                        <span className="step2-char-name">
                                            {char.name}
                                        </span>
                                        <span className="step2-char-abbr">
                                            ({char.abbr})
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div className="step2-char-total-badge">
                                            {total}
                                        </div>
                                        <div className="step2-char-limits">
                                            <div style={{ color: '#dc2626' }}>Min: {charLimits.min}</div>
                                            <div style={{ color: hasPowerMod ? '#9333ea' : '#16a34a' }}>
                                                Max: {charLimits.max} {hasPowerMod && '⚡'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="step2-input-grid">
                                    <div>
                                        <label className="step2-input-label">
                                            Base
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="200" // Always allow typing up to 200, but logic clamps
                                            value={c.base}
                                            onChange={(e) => handleCharacteristicChange(char.id, 'base', e.target.value)}
                                            className="step2-input-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="step2-input-label">
                                            {isDistributableMode ? 'Mod. Origen' : 'Mod. Origen (Auto)'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="200"
                                            value={c.originMod}
                                            readOnly={!isDistributableMode}
                                            onChange={isDistributableMode ? (e) => handleCharacteristicChange(char.id, 'originMod', e.target.value) : undefined}
                                            className={`step2-input-origin ${isDistributableMode ? 'distributable' : 'fixed'}`}
                                        />
                                    </div>

                                    <div>
                                        <label className="step2-input-label">
                                            Mod. Especialidad
                                            {(() => {
                                                const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
                                                if (allowedChars && !allowedChars.includes(char.id)) {
                                                    return <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>🔒</span>;
                                                }
                                                return null;
                                            })()}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="200"
                                            value={c.specialtyMod}
                                            readOnly={(() => {
                                                if (!specialtyPointsInfo) return true;
                                                const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
                                                return allowedChars ? !allowedChars.includes(char.id) : false;
                                            })()}
                                            disabled={(() => {
                                                if (!specialtyPointsInfo) return true;
                                                const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
                                                return allowedChars ? !allowedChars.includes(char.id) : false;
                                            })()}
                                            onChange={(e) => handleCharacteristicChange(char.id, 'specialtyMod', e.target.value)}
                                            className="step2-input-specialty"
                                        />
                                    </div>

                                    <div>
                                        <label className="step2-input-label">
                                            Mod. Poder
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="200"
                                            value={c.powerMod}
                                            readOnly={true}
                                            className="step2-input-readonly"
                                        />
                                    </div>

                                    <div>
                                        <label className="step2-input-label">
                                            Mod. Otros
                                        </label>
                                        <input
                                            type="number"
                                            min="-200"
                                            max="200"
                                            value={c.otherMod || 0}
                                            disabled={true}
                                            onChange={(e) => handleCharacteristicChange(char.id, 'otherMod', e.target.value)}
                                            className="step2-input-other"
                                        />
                                    </div>
                                </div>

                                <div className="step2-char-footer">
                                    {/* Formula */}
                                    <span className="step2-formula-text">
                                        {c.base} + {c.originMod} + {c.specialtyMod} + {c.powerMod} + {c.otherMod || 0} = <strong style={{ color: '#2563eb' }}>{total}</strong>
                                    </span>

                                    {/* PC Cost Badge */}
                                    <div className="step2-pc-badge">
                                        <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>PC</span>
                                        <span>{pcValues[char.id].toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── STICKY SUMMARY BAR ── */}
                <div className="step2-sticky-summary">
                    {CHARACTERISTICS.map(char => {
                        const total = getTotal(char.id);
                        const limits = calculateLimits(origins, char.id);
                        const isValid = total >= limits.min && total <= limits.max;
                        return (
                            <div key={char.id} className={`step2-summary-item ${isValid ? 'valid' : 'invalid'}`}>
                                <span style={{ color: '#93c5fd', fontSize: '0.65rem', fontWeight: 'bold' }}>{char.abbr}</span>
                                <span style={{ color: isValid ? 'white' : '#fca5a5', fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.1 }}>{total}</span>
                            </div>
                        );
                    })}

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Total PC badge */}
                    <div className="step2-summary-total">
                        <span style={{ color: '#bfdbfe', fontSize: '0.75rem', fontWeight: 'bold' }}>Total</span>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            {Object.values(pcValues).reduce((a: number, b: number) => a + b, 0).toFixed(1)} PC
                        </span>
                    </div>
                </div>
            </WizardSection>
        </div>
    );
}

