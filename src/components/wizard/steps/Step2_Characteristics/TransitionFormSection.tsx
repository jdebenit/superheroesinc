import React from 'react';
import { WizardSection } from '../../shared/layout/WizardSection';
import { WizardField } from '../../shared/forms/WizardField';
import { CostBadge } from '../../shared/ui/CostBadge';
import {
    WEREWOLF_TRANSITION_FORM_ID,
    TRANSITION_CHARACTERISTICS_ORDER,
    getWerewolfSubtypeConfig,
    buildWerewolfTransitionForm,
    type WerewolfSubtypeId,
    type CharacterForm
} from '../../../../data/werewolfOptions';

interface TransitionFormSectionProps {
    data: any;
    onChange: (updates: any) => void;
    unlockManualMod: boolean;
    setUnlockManualMod: (val: boolean) => void;
    humanBreakdown?: Record<string, any>;
}

export const TransitionFormSection: React.FC<TransitionFormSectionProps> = ({
    data,
    onChange,
    unlockManualMod,
    setUnlockManualMod,
    humanBreakdown
}) => {
    const effectiveHumanBreakdown = humanBreakdown || data.attributes?.breakdown || {};
    const currentSubtype: WerewolfSubtypeId = data.werewolfParams?.subtype || 'hibrido';
    const subtypeConfig = getWerewolfSubtypeConfig(currentSubtype);
    const humanVolChar = effectiveHumanBreakdown.voluntad;
    const humanVoluntad = humanVolChar
        ? (humanVolChar.base || 0) + (humanVolChar.originMod || 0) + (humanVolChar.specialtyMod || 0) + (humanVolChar.powerMod || 0) + (humanVolChar.otherMod || 0)
        : (Number(data.attributes?.values?.Voluntad) || 40);

    const currentForms: CharacterForm[] = Array.isArray(data.forms) ? data.forms : [];
    const existingForm = currentForms.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
    const transitionForm = buildWerewolfTransitionForm(currentSubtype, humanVoluntad, existingForm, effectiveHumanBreakdown);

    const updateCharacteristicField = (charId: string, field: 'base' | 'otherMod', rawVal: string) => {
        const numVal = parseInt(rawVal, 10) || 0;
        const statCfg = subtypeConfig.transitionStats[charId];
        if (!statCfg) return;

        const humanChar = effectiveHumanBreakdown[charId];
        const prevBreakdown = transitionForm.attributes?.breakdown?.[charId] || {
            base: statCfg.base,
            originMod: humanChar?.originMod || 0,
            specialtyMod: humanChar?.specialtyMod || 0,
            powerMod: humanChar?.powerMod || 0,
            otherMod: 0,
            min: statCfg.base,
            max: statCfg.max
        };

        const hasPowerMod = (humanChar?.powerMod || prevBreakdown.powerMod || 0) > 0;
        const maxBase = (unlockManualMod || hasPowerMod) ? 200 : statCfg.max;

        let nextBase = prevBreakdown.base;
        let nextOtherMod = prevBreakdown.otherMod || 0;

        if (field === 'base') {
            nextBase = Math.max(statCfg.base, Math.min(maxBase, numVal));
        } else if (field === 'otherMod') {
            nextOtherMod = Math.max(-200, Math.min(200, numVal));
        }

        const newBreakdown: Record<string, any> = {
            ...(transitionForm.attributes.breakdown || {})
        };

        const newValues: any = { ...transitionForm.attributes.values, Voluntad: humanVoluntad };
        let totalPc = 0;

        TRANSITION_CHARACTERISTICS_ORDER.forEach(({ id, key }) => {
            const cfg = subtypeConfig.transitionStats[id];
            const hChar = effectiveHumanBreakdown[id];
            const prevBd = transitionForm.attributes?.breakdown?.[id];

            const baseVal = id === charId ? nextBase : (prevBd?.base ?? cfg.base);
            const originMod = hChar ? (hChar.originMod || 0) : (prevBd?.originMod || 0);
            const specialtyMod = hChar ? (hChar.specialtyMod || 0) : (prevBd?.specialtyMod || 0);
            const powerMod = hChar ? (hChar.powerMod || 0) : (prevBd?.powerMod || 0);
            const otherMod = id === charId ? nextOtherMod : (prevBd?.otherMod || 0);

            newBreakdown[id] = {
                base: baseVal,
                originMod,
                specialtyMod,
                powerMod,
                otherMod,
                min: cfg.base,
                max: cfg.max
            };

            newValues[key] = baseVal + originMod + specialtyMod + powerMod + otherMod;
            totalPc += Math.max(0, baseVal - cfg.base) / 10;
        });

        const updatedForm: CharacterForm = {
            ...transitionForm,
            name: `Forma de Transición (${subtypeConfig.shortName})`,
            subtype: currentSubtype,
            cost: Number(totalPc.toFixed(2)),
            attributes: {
                values: newValues,
                breakdown: newBreakdown
            }
        };

        const otherForms = currentForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        onChange({
            ...data,
            forms: [updatedForm, ...otherForms]
        });
    };

    const handleResetToBase = () => {
        const updatedForm = buildWerewolfTransitionForm(currentSubtype, humanVoluntad, null, effectiveHumanBreakdown);
        const otherForms = currentForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        onChange({
            ...data,
            forms: [updatedForm, ...otherForms]
        });
    };

    return (
        <WizardSection
            title={`Características en Forma de Transición (${subtypeConfig.name})`}
            description="Cada característica parte de su valor mínimo gratuito y hereda los modificadores de otros orígenes, especializaciones y poderes de la Forma Humana. Subir la Base cuesta 1 PC por cada +10 puntos sobre el mínimo. (La casta de Hombre Lobo se elige en el Paso 3)."
            rightContent={
                <div className="step2-werewolf-actions">
                    <button
                        type="button"
                        onClick={handleResetToBase}
                        className="step2-action-btn reset-btn"
                        title="Restablece todas las características a su valor mínimo gratuito"
                    >
                        ↺ Restablecer a Base
                    </button>
                    <CostBadge cost={`+${transitionForm.cost.toFixed(1)}`} label="PC" variant="penalty" />
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
                {TRANSITION_CHARACTERISTICS_ORDER.map(({ id, key, abbr }) => {
                    const cfg = subtypeConfig.transitionStats[id];
                    const bd = transitionForm.attributes?.breakdown?.[id] || {
                        base: cfg.base,
                        originMod: 0,
                        specialtyMod: 0,
                        powerMod: 0,
                        otherMod: 0
                    };
                    const baseVal = bd.base ?? cfg.base;
                    const originMod = bd.originMod || 0;
                    const specialtyMod = bd.specialtyMod || 0;
                    const powerMod = bd.powerMod || 0;
                    const otherMod = bd.otherMod || 0;
                    const total = baseVal + originMod + specialtyMod + powerMod + otherMod;
                    const pcCost = Math.max(0, baseVal - cfg.base) / 10;
                    const hasPowerMod = powerMod > 0;
                    const unlockedLimit = hasPowerMod || unlockManualMod;
                    const maxLimit = unlockedLimit ? 200 : cfg.max;

                    return (
                        <div key={id} className="step2-char-card">
                            <div className="step2-char-header">
                                <div>
                                    <span className="step2-char-name">{cfg.label}</span>
                                    <span className="step2-char-abbr">({abbr})</span>
                                </div>
                                <div className="step2-char-header-right">
                                    <div className="step2-char-total-badge">{total}</div>
                                    <div className="step2-char-limits">
                                        <div className="step2-char-limit-min">Min: {cfg.base}</div>
                                        <div className={`step2-char-limit-max ${unlockedLimit ? (hasPowerMod ? 'power' : 'manual') : 'normal'}`}>
                                            Max: {maxLimit} {hasPowerMod && '⚡'}{(!hasPowerMod && unlockManualMod) && '🔓'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="step2-input-grid">
                                <WizardField
                                    label="Base"
                                    type="number"
                                    min={String(cfg.base)}
                                    max={String(maxLimit)}
                                    value={baseVal}
                                    onChange={(val) => updateCharacteristicField(id, 'base', val)}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Origen (Auto)"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={originMod}
                                    readOnly={true}
                                    onChange={() => {}}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Especialidad (Auto)"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={specialtyMod}
                                    readOnly={true}
                                    onChange={() => {}}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Poder"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={powerMod}
                                    readOnly={true}
                                    onChange={() => {}}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Otros"
                                    type="number"
                                    min="-200"
                                    max="200"
                                    value={otherMod}
                                    readOnly={!unlockManualMod}
                                    disabled={!unlockManualMod}
                                    onChange={(val) => updateCharacteristicField(id, 'otherMod', val)}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                    className={unlockManualMod ? 'unlocked-field-wrapper' : ''}
                                />
                            </div>

                            <div className="step2-char-footer">
                                <span className="step2-formula-text">
                                    {baseVal} + {originMod} + {specialtyMod} + {powerMod} + {otherMod} = <strong className="step2-char-total-highlight">{total}</strong>
                                </span>
                                <CostBadge cost={pcCost.toFixed(1)} label="PC" />
                            </div>
                        </div>
                    );
                })}

                {/* Voluntad (Heredada de Forma Humana) */}
                <div className="step2-char-card werewolf-voluntad-card">
                    <div className="step2-char-header">
                        <div>
                            <span className="step2-char-name">Voluntad</span>
                            <span className="step2-char-abbr">(VOL)</span>
                        </div>
                        <div className="step2-char-header-right">
                            <div className="step2-char-total-badge">{humanVoluntad}</div>
                            <div className="step2-char-limits">
                                <div className="step2-char-limit-min">Forma Humana</div>
                            </div>
                        </div>
                    </div>
                    <p className="step2-voluntad-note">
                        La Voluntad (VOL) es común a todas las formas del personaje y se toma directamente de su Forma Humana (incluyendo sus modificadores de origen, especialidad y poder).
                    </p>
                    <div className="step2-char-footer">
                        <span className="step2-formula-text">
                            Sincronizada con Forma Humana: <strong className="step2-char-total-highlight">{humanVoluntad}</strong>
                        </span>
                        <CostBadge cost="0.0" label="PC" variant="free" />
                    </div>
                </div>
            </div>

            {/* Sticky Summary Bar para la Forma de Transición */}
            <div className="step2-sticky-summary">
                {TRANSITION_CHARACTERISTICS_ORDER.map(({ id, key, abbr }) => {
                    const cfg = subtypeConfig.transitionStats[id];
                    const val = transitionForm.attributes?.values?.[key as keyof typeof transitionForm.attributes.values] ?? cfg.base;
                    const bd = transitionForm.attributes?.breakdown?.[id];
                    const baseVal = bd?.base ?? cfg.base;
                    const maxLimit = unlockManualMod ? 200 : cfg.max;
                    const isValid = baseVal >= cfg.base && baseVal <= maxLimit;
                    return (
                        <div key={id} className={`step2-summary-item ${isValid ? 'valid' : 'invalid'}`}>
                            <span className="step2-summary-abbr">{abbr}</span>
                            <span className={`step2-summary-value ${isValid ? '' : 'invalid'}`}>{val}</span>
                        </div>
                    );
                })}
                <div className="step2-summary-item valid">
                    <span className="step2-summary-abbr">VOL</span>
                    <span className="step2-summary-value">{humanVoluntad}</span>
                </div>
                <div className="step2-summary-spacer" />
                <div className="step2-summary-total">
                    <span className="step2-summary-total-label">Coste Transición</span>
                    <span className="step2-summary-total-val">
                        +{transitionForm.cost.toFixed(1)} PC
                    </span>
                </div>
            </div>
        </WizardSection>
    );
};
