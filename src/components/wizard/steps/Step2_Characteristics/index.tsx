import React from 'react';
import { calculateLimits, calculateSpecialtyAllowedCharacteristics } from '../../../../utils/characterCalculations';
import { WizardSection } from '../../shared/layout/WizardSection';
import { WizardField } from '../../shared/forms/WizardField';
import { CostBadge } from '../../shared/ui/CostBadge';
import { CHARACTERISTICS_CONFIG, useStep2Logic } from './useStep2Logic';
import '../../shared/layout/WizardStep.css';
import './Step2_Characteristics.css';

interface Step2Props {
    data: any;
    onChange: (updates: any) => void;
    onShowHelp?: () => void;
}

export default function Step2_Characteristics({ data, onChange, onShowHelp }: Step2Props) {
    const {
        characteristics,
        chosenBonusCharacteristic,
        setChosenBonusCharacteristic,
        isDistributableMode,
        pointsInfo,
        choosableInfo,
        specialtyPointsInfo,
        pcValues,
        getTotal,
        handleCharacteristicChange,
        origins,
        unlockManualMod,
        setUnlockManualMod
    } = useStep2Logic(data, onChange);

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Características del Personaje"
                description={(isDistributableMode || specialtyPointsInfo)
                    ? 'Tu origen o especialidad te otorga puntos extra. Repártelos sumando en el modificador que corresponda.'
                    : 'Define las características base y sus modificadores.'}
                onHelp={onShowHelp}
            >
                {(isDistributableMode || specialtyPointsInfo) && (
                    <div className="step2-info-banner">
                        <span className="info-icon">💡</span>
                        <p>
                            <strong>Puntos libres para distribuir</strong>
                            Tienes puntos extra disponibles por tu Origen o Especialidad. Aumenta los valores numéricos correspondientes en las casillas <strong style={{ display: 'inline' }}>Mod. Origen (✏️)</strong> o <strong style={{ display: 'inline' }}>Mod. Especialidad (✏️)</strong> para gastarlos. Vigila tu reserva total en los indicadores redondos de la derecha.
                        </p>
                    </div>
                )}
                {choosableInfo && (
                    <div className="step2-bonus-box">
                        <h4 className="step2-bonus-title">
                            ⭐ Elige la característica para el bonus de +{choosableInfo.bonus}
                        </h4>
                        <div className="step2-bonus-grid">
                            {CHARACTERISTICS_CONFIG.map(char => (
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
                                label="Ori."
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
                <div className="wizard-unlock-container">
                    <div className="wizard-unlock-header">
                        <label className="wizard-unlock-label">
                            <input
                                type="checkbox"
                                checked={unlockManualMod}
                                onChange={(e) => setUnlockManualMod(e.target.checked)}
                                className="wizard-unlock-checkbox"
                            />
                            🔓 Desbloquear Modificadores Manuales
                        </label>
                        <span className="wizard-unlock-badge">Avanzado</span>
                    </div>
                    {unlockManualMod && (
                        <p className="wizard-unlock-description">
                            Usa esta opción para aplicar bonos o penalizadores manuales (objetos mágicos, ajustes del DJ o dotes no automáticas) en la casilla <strong>Mod. Otros</strong> de cada característica. Estos puntos no consumen PC.
                        </p>
                    )}
                </div>

                <div className="step2-chars-grid">
                    {CHARACTERISTICS_CONFIG.map((char) => {
                        const total = getTotal(char.id);
                        const c = characteristics[char.id];

                        // Limit Override Logic in Render
                        const defaultLimits = calculateLimits(origins, char.id);
                        const hasPowerMod = c.powerMod > 0;
                        const unlockedLimit = hasPowerMod || unlockManualMod;
                        const charLimits = {
                            min: defaultLimits.min,
                            max: unlockedLimit ? 200 : defaultLimits.max
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
                                            <div style={{ color: unlockedLimit ? (hasPowerMod ? '#9333ea' : '#2563eb') : '#16a34a' }}>
                                                Max: {charLimits.max} {hasPowerMod && '⚡'}{(!hasPowerMod && unlockManualMod) && '🔓'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="step2-input-grid">
                                    <WizardField
                                        label="Base"
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.base}
                                        onChange={(val) => handleCharacteristicChange(char.id, 'base', val)}
                                        noMargin
                                        inputWidth="70px"
                                        textAlign="center"
                                    />

                                    <WizardField
                                        label={isDistributableMode ? 'Mod. Origen (✏️)' : 'Mod. Origen (Auto)'}
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.originMod}
                                        readOnly={!isDistributableMode}
                                        onChange={isDistributableMode ? (val) => handleCharacteristicChange(char.id, 'originMod', val) : () => { }}
                                        noMargin
                                        inputWidth="70px"
                                        textAlign="center"
                                    />

                                    <WizardField
                                        label={
                                            <>
                                                {specialtyPointsInfo ? 'Mod. Especialidad (✏️)' : 'Mod. Especialidad'}
                                                {(() => {
                                                    const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
                                                    if (allowedChars && !allowedChars.includes(char.id)) {
                                                        return <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>🔒</span>;
                                                    }
                                                    return null;
                                                })()}
                                            </>
                                        }
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
                                        onChange={(val) => handleCharacteristicChange(char.id, 'specialtyMod', val)}
                                        noMargin
                                        inputWidth="70px"
                                        textAlign="center"
                                    />

                                    <WizardField
                                        label="Mod. Poder"
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.powerMod}
                                        readOnly={true}
                                        onChange={() => { }}
                                        noMargin
                                        inputWidth="70px"
                                        textAlign="center"
                                    />

                                    <WizardField
                                        label="Mod. Otros"
                                        type="number"
                                        min="-200"
                                        max="200"
                                        value={c.otherMod || 0}
                                        readOnly={!unlockManualMod}
                                        disabled={!unlockManualMod}
                                        onChange={(val) => handleCharacteristicChange(char.id, 'otherMod', val)}
                                        noMargin
                                        inputWidth="70px"
                                        textAlign="center"
                                        className={unlockManualMod ? 'unlocked-field-wrapper' : ''}
                                    />
                                </div>

                                <div className="step2-char-footer">
                                    <span className="step2-formula-text">
                                        {c.base} + {c.originMod} + {c.specialtyMod} + {c.powerMod} + {c.otherMod || 0} = <strong style={{ color: '#2563eb' }}>{total}</strong>
                                    </span>
                                    <CostBadge
                                        cost={pcValues[char.id].toFixed(1)}
                                        label="PC"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── STICKY SUMMARY BAR ── */}
                <div className="step2-sticky-summary">
                    {CHARACTERISTICS_CONFIG.map(char => {
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
                    <div style={{ flex: 1 }} />
                    <div className="step2-summary-total">
                        <span style={{ color: '#bfdbfe', fontSize: '0.75rem', fontWeight: 'bold' }}>Total</span>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            {Object.values(pcValues).reduce((a: number, b: number) => a + Number(b), 0).toFixed(1)} PC
                        </span>
                    </div>
                </div>
            </WizardSection>
        </div>
    );
}
