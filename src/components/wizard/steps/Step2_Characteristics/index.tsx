import React, { useMemo, useState } from 'react';
import { calculateLimits, calculateSpecialtyAllowedCharacteristics } from '../../../../utils/characterCalculations';
import { WizardSection } from '../../shared/layout/WizardSection';
import { WizardField } from '../../shared/forms/WizardField';
import { CostBadge } from '../../shared/ui/CostBadge';
import { CHARACTERISTICS_CONFIG, useStep2Logic } from './useStep2Logic';
import { TransitionFormSection } from './TransitionFormSection';
import { hasHombreLobo, WEREWOLF_TRANSITION_FORM_ID, getWerewolfSubtypeConfig } from '../../../../data/werewolfOptions';
import '../../shared/layout/WizardStep.css';
import './Step2_Characteristics.css';

interface Step2Props {
    data: any;
    onChange: (updates: any) => void;
    onShowHelp?: () => void;
}

export default function Step2_Characteristics({ data, onChange, onShowHelp }: Step2Props) {
    const [activeFormTab, setActiveFormTab] = useState<'base' | string>('base');

    const {
        characteristics,
        chosenBonusCharacteristic,
        chosenCharacteristics,
        choosableEntries,
        setChosenCharacteristic,
        isDistributableMode,
        pointsInfo,
        specialtyPointsInfo,
        pcValues,
        totalPC,
        getTotal,
        handleCharacteristicChange,
        origins,
        unlockManualMod,
        setUnlockManualMod
    } = useStep2Logic(data, onChange);

    const allowedSpecialtyChars = useMemo(() => {
        return calculateSpecialtyAllowedCharacteristics(origins);
    }, [origins]);

    const isWerewolf = useMemo(() => hasHombreLobo(data), [data]);
    const transitionForm = useMemo(() => {
        if (!Array.isArray(data.forms)) return null;
        return data.forms.find((f: any) => f.id === WEREWOLF_TRANSITION_FORM_ID) || null;
    }, [data.forms]);

    const wwSubtypeConfig = useMemo(() => {
        return getWerewolfSubtypeConfig(data.werewolfParams?.subtype);
    }, [data.werewolfParams?.subtype]);

    const effectiveTab = (activeFormTab === WEREWOLF_TRANSITION_FORM_ID && !isWerewolf) ? 'base' : activeFormTab;

    return (
        <div className="wizard-step-container">
            {isWerewolf && (
                <div className="step2-forms-tabs-bar">
                    <button
                        type="button"
                        onClick={() => setActiveFormTab('base')}
                        className={`step2-form-tab ${effectiveTab === 'base' ? 'active' : ''}`}
                    >
                        <span className="step2-form-tab-icon">👤</span>
                        <span className="step2-form-tab-title">Forma Humana / Base</span>
                        <span className="step2-form-tab-cost">{totalPC.toFixed(1)} PC</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveFormTab(WEREWOLF_TRANSITION_FORM_ID)}
                        className={`step2-form-tab werewolf-tab ${effectiveTab === WEREWOLF_TRANSITION_FORM_ID ? 'active' : ''}`}
                    >
                        <span className="step2-form-tab-icon">🐺</span>
                        <span className="step2-form-tab-title">
                            Forma de Transición ({wwSubtypeConfig.shortName})
                        </span>
                        <span className="step2-form-tab-cost">
                            +{(transitionForm?.cost || 0).toFixed(1)} PC
                        </span>
                    </button>
                </div>
            )}

            {effectiveTab === WEREWOLF_TRANSITION_FORM_ID && isWerewolf ? (
                <TransitionFormSection
                    data={data}
                    onChange={onChange}
                    unlockManualMod={unlockManualMod}
                    setUnlockManualMod={setUnlockManualMod}
                    humanBreakdown={characteristics}
                />
            ) : (
                <>
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
                        {choosableEntries.map(entry => {
                            const selectedChar = chosenCharacteristics[entry.originKey] || (choosableEntries.length === 1 ? chosenBonusCharacteristic : null);
                            return (
                                <div key={entry.originKey} className="step2-bonus-box">
                                    <h4 className="step2-bonus-title">
                                        ⭐ {entry.title || (entry.bonus ? `${entry.originKey}: Elige la característica para el bonus de +${entry.bonus}` : `${entry.originKey}: Elige la característica para el bonus de límite (+${entry.maxLimitBonus})`)}
                                    </h4>
                                    <div className="step2-bonus-grid">
                                        {CHARACTERISTICS_CONFIG
                                            .filter(char => !entry.allowedCharacteristics || entry.allowedCharacteristics.includes(char.id))
                                            .map(char => {
                                                const isSelected = selectedChar === char.id;
                                                return (
                                                    <button
                                                        key={char.id}
                                                        type="button"
                                                        onClick={() => setChosenCharacteristic(entry.originKey, char.id)}
                                                        className={`step2-bonus-btn ${isSelected ? 'selected' : 'unselected'}`}
                                                    >
                                                        {char.name} {isSelected && (entry.maxLimitBonus ? `✓ (Máx. ${100 + entry.maxLimitBonus})` : '✓')}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            );
                        })}
                    </WizardSection>

                    <WizardSection
                        title={isWerewolf ? "Características en Forma Humana" : "Características"}
                        rightContent={
                            <div className="step2-header-badges">
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
                                <CostBadge cost={totalPC} label="PC" variant="penalty" />
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
                                const defaultLimits = calculateLimits(origins, char.id, chosenCharacteristics, data.liberadoParams);
                                const hasPowerMod = c.powerMod > 0;
                                const unlockedLimit = hasPowerMod || unlockManualMod;
                                const charLimits = {
                                    min: defaultLimits.min,
                                    max: unlockedLimit ? 200 : defaultLimits.max
                                };

                                const isSpecialtyBlocked = !specialtyPointsInfo || (allowedSpecialtyChars ? !allowedSpecialtyChars.includes(char.id) : false);

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
                                            <div className="step2-char-header-right">
                                                <div className="step2-char-total-badge">
                                                    {total}
                                                </div>
                                                <div className="step2-char-limits">
                                                    <div className="step2-char-limit-min">Min: {charLimits.min}</div>
                                                    <div className={`step2-char-limit-max ${unlockedLimit ? (hasPowerMod ? 'power' : 'manual') : 'normal'}`}>
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
                                                        {allowedSpecialtyChars && !allowedSpecialtyChars.includes(char.id) && (
                                                            <span className="step2-specialty-locked-icon">🔒</span>
                                                        )}
                                                    </>
                                                }
                                                type="number"
                                                min="0"
                                                max="200"
                                                value={c.specialtyMod}
                                                readOnly={isSpecialtyBlocked}
                                                disabled={isSpecialtyBlocked}
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
                                                {c.base} + {c.originMod} + {c.specialtyMod} + {c.powerMod} + {c.otherMod || 0} = <strong className="step2-char-total-highlight">{total}</strong>
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
                                const limits = calculateLimits(origins, char.id, chosenCharacteristics, data.liberadoParams);
                                const isValid = total >= limits.min && total <= limits.max;
                                return (
                                    <div key={char.id} className={`step2-summary-item ${isValid ? 'valid' : 'invalid'}`}>
                                        <span className="step2-summary-abbr">{char.abbr}</span>
                                        <span className={`step2-summary-value ${isValid ? '' : 'invalid'}`}>{total}</span>
                                    </div>
                                );
                            })}
                            <div className="step2-summary-spacer" />
                            <div className="step2-summary-total">
                                <span className="step2-summary-total-label">Total</span>
                                <span className="step2-summary-total-val">
                                    {totalPC.toFixed(1)} PC
                                </span>
                            </div>
                        </div>
                    </WizardSection>
                </>
            )}
        </div>
    );
}
