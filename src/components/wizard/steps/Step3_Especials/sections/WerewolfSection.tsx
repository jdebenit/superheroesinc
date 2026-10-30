import React from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { CostBadge } from '../../../shared/ui/CostBadge';
import {
    WEREWOLF_SUBTYPES,
    WEREWOLF_TRANSITION_FORM_ID,
    TRANSITION_CHARACTERISTICS_ORDER,
    getWerewolfSubtypeConfig,
    buildWerewolfTransitionForm,
    type WerewolfSubtypeId,
    type CharacterForm
} from '../../../../../data/werewolfOptions';

interface WerewolfSectionProps {
    data: any;
    onChange: (updates: any) => void;
}

export default function WerewolfSection({ data, onChange }: WerewolfSectionProps) {
    const currentSubtype: WerewolfSubtypeId = data.werewolfParams?.subtype || 'hibrido';
    const subtypeConfig = getWerewolfSubtypeConfig(currentSubtype);
    const humanVoluntad = Number(data.attributes?.values?.Voluntad) || 40;

    const currentForms: CharacterForm[] = Array.isArray(data.forms) ? data.forms : [];
    const existingForm = currentForms.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
    const transitionForm = existingForm || buildWerewolfTransitionForm(currentSubtype, humanVoluntad, null, data.attributes?.breakdown);

    const handleSelectSubtype = (newSubtype: WerewolfSubtypeId) => {
        const updatedForm = buildWerewolfTransitionForm(newSubtype, humanVoluntad, transitionForm, data.attributes?.breakdown);
        const otherForms = currentForms.filter(f => f.id !== WEREWOLF_TRANSITION_FORM_ID);
        onChange({
            ...data,
            werewolfParams: {
                ...(data.werewolfParams || {}),
                subtype: newSubtype
            },
            forms: [updatedForm, ...otherForms]
        });
    };

    return (
        <WizardSection
            title="Hombre Lobo (Licantropía)"
            description="Selecciona la casta de tu hombre lobo. Los poderes innatos se añaden automáticamente sin coste de PC a tu lista de poderes."
            rightContent={
                <div className="wizard-flex-center wizard-gap-sm">
                    <CostBadge
                        cost={subtypeConfig.cost > 0 ? `+${subtypeConfig.cost}` : 0}
                        label="PC Casta"
                        variant={subtypeConfig.cost > 0 ? 'penalty' : 'free'}
                    />
                </div>
            }
        >
            <div className="step3-werewolf-grid">
                {Object.values(WEREWOLF_SUBTYPES).map(sub => {
                    const isSelected = currentSubtype === sub.id;
                    return (
                        <div
                            key={sub.id}
                            onClick={() => handleSelectSubtype(sub.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectSubtype(sub.id); }}
                            className={`step3-werewolf-card ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="step3-werewolf-card-header">
                                <h4 className="step3-werewolf-title" style={{ margin: 0 }}>{sub.name}</h4>
                                <CostBadge
                                    cost={sub.cost > 0 ? `+${sub.cost}` : 0}
                                    label="PC"
                                    variant={sub.cost > 0 ? 'penalty' : 'free'}
                                />
                            </div>
                            <p className="step3-werewolf-desc">{sub.description}</p>
                            <div className="step3-werewolf-details">
                                <div className="step3-werewolf-detail-item">
                                    <strong>Poderes innatos:</strong> Multiformidad (Lobo, R. Elevado), Regeneración ({sub.regenRankLabel}), Arma Natural ({sub.naturalWeaponRankLabel}){sub.hasPurePowers ? ', Empatía animal (R. Medio), Donación de vida (R. Elevado)' : ''}.
                                </div>
                                <div className="step3-werewolf-detail-item alert">
                                    <strong>Plata:</strong> {sub.silverDescription}
                                </div>
                                <div className="step3-werewolf-detail-item">
                                    <strong>Control y Rabia:</strong> {sub.rageDescription}
                                </div>
                                {sub.extraRules && (
                                    <div className="step3-werewolf-detail-item warning">
                                        <strong>Licantropía:</strong> {sub.extraRules}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="step3-werewolf-transition-summary">
                <div className="step3-werewolf-summary-header">
                    <div>
                        <h5 className="step3-werewolf-summary-title">
                            🐺 Resumen de Características en Forma de Transición ({subtypeConfig.shortName})
                        </h5>
                        <p className="step3-werewolf-summary-sub">
                            Puedes personalizar los puntos invertidos en la pestaña <strong>Forma de Transición</strong> del Paso 2 (Características).
                        </p>
                    </div>
                    <div className="wizard-flex-center wizard-gap-sm">
                        <CostBadge cost={`+${transitionForm.cost.toFixed(1)}`} label="PC Transición" variant="penalty" />
                        <button
                            type="button"
                            onClick={() => {
                                const charsTab = document.querySelector<HTMLButtonElement>('button[title="Características"]');
                                if (charsTab) charsTab.click();
                            }}
                            className="wizard-button primary small"
                        >
                            💪 Configurar en Paso 2
                        </button>
                    </div>
                </div>
                <div className="step3-werewolf-stats-strip">
                    {TRANSITION_CHARACTERISTICS_ORDER.map(({ id, key, abbr }) => {
                        const cfg = subtypeConfig.transitionStats[id];
                        const val = transitionForm.attributes?.values?.[key as keyof typeof transitionForm.attributes.values] ?? cfg.base;
                        return (
                            <div key={id} className="step3-werewolf-stat-pill">
                                <span className="ww-pill-abbr">{abbr}</span>
                                <span className="ww-pill-val">{val}</span>
                                <span className="ww-pill-limit">(Base {cfg.base} / Máx {cfg.max})</span>
                            </div>
                        );
                    })}
                    <div className="step3-werewolf-stat-pill">
                        <span className="ww-pill-abbr">VOL</span>
                        <span className="ww-pill-val">{humanVoluntad}</span>
                        <span className="ww-pill-limit">(Forma Humana)</span>
                    </div>
                </div>
            </div>
        </WizardSection>
    );
}
