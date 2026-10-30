import React from 'react';
import { SheetSection } from '../common/SheetSection';
import {
    hasHombreLobo,
    getWerewolfSubtypeConfig,
    buildWerewolfTransitionForm,
    WEREWOLF_TRANSITION_FORM_ID,
    TRANSITION_CHARACTERISTICS_ORDER,
    type CharacterForm
} from '../../../data/werewolfOptions';

interface WerewolfSheetSectionProps {
    character: any;
    baseCharacter?: any;
}

export const WerewolfSheetSection: React.FC<WerewolfSheetSectionProps> = ({ character, baseCharacter }) => {
    const sourceChar = baseCharacter || character;
    if (!hasHombreLobo(sourceChar)) return null;

    const subtype = sourceChar.werewolfParams?.subtype || 'hibrido';
    const config = getWerewolfSubtypeConfig(subtype);
    const humanVoluntad = Number(sourceChar.attributes?.values?.Voluntad) || 40;

    const forms: CharacterForm[] = Array.isArray(sourceChar.forms) ? sourceChar.forms : [];
    const existingForm = forms.find(f => f.id === WEREWOLF_TRANSITION_FORM_ID);
    const transitionForm = existingForm || buildWerewolfTransitionForm(subtype, humanVoluntad, null, sourceChar.attributes?.breakdown);

    const totalWerewolfCost = config.cost + (transitionForm.cost || 0);

    return (
        <SheetSection
            title={`Licantropía: ${config.name}`}
            className="werewolf-params"
            cost={totalWerewolfCost > 0 ? <span>(+{totalWerewolfCost} PC)</span> : <span>(0 PC)</span>}
        >
            <div className="liberado-cards-list">
                {/* Casta y Naturaleza */}
                <div className="liberado-card liberado-card-equidad">
                    <div className="liberado-card-header">
                        <span className="liberado-card-title">{config.name}</span>
                        <span className="liberado-badge liberado-badge-cost">
                            {config.cost > 0 ? `+${config.cost} PC` : '0 PC'}
                        </span>
                    </div>
                    <p className="liberado-card-desc">{config.description}</p>
                </div>

                {/* Características en Forma de Transición */}
                <div className="liberado-card liberado-card-equidad">
                    <div className="liberado-card-header">
                        <span className="liberado-card-title">Características en Forma de Transición</span>
                        <span className="liberado-badge liberado-badge-cost">
                            +{transitionForm.cost} PC
                        </span>
                    </div>
                    <div className="sheet-werewolf-stats-grid">
                        {TRANSITION_CHARACTERISTICS_ORDER.map(({ id, key, abbr }) => {
                            const val = transitionForm.attributes?.values?.[key as keyof typeof transitionForm.attributes.values]
                                ?? config.transitionStats[id].base;
                            return (
                                <div key={id} className="sheet-werewolf-stat-box">
                                    <span className="sheet-ww-abbr">{abbr}</span>
                                    <span className="sheet-ww-val">{val}</span>
                                </div>
                            );
                        })}
                        <div className="sheet-werewolf-stat-box">
                            <span className="sheet-ww-abbr">VOL</span>
                            <span className="sheet-ww-val">{humanVoluntad}</span>
                        </div>
                    </div>
                </div>

                {/* Alergia a la Plata */}
                <div className="liberado-card werewolf-card-silver">
                    <div className="liberado-card-header">
                        <span className="liberado-card-title">Alergia a la Plata</span>
                        <span className="liberado-badge werewolf-badge-alert">
                            +{config.silverDamageBonus} Daño
                        </span>
                    </div>
                    <p className="liberado-card-desc">{config.silverDescription}</p>
                </div>

                {/* Control y Rabia */}
                <div className="liberado-card liberado-card-equidad">
                    <div className="liberado-card-header">
                        <span className="liberado-card-title">Rabia y Control en Forma Híbrida</span>
                        <span className="liberado-badge liberado-badge-innate">Tirada VOL</span>
                    </div>
                    <p className="liberado-card-desc">{config.rageDescription}</p>
                    {config.extraRules && (
                        <div className="liberado-subchoice-box">
                            <span className="liberado-subchoice-label">Contagio:</span>
                            <span className="liberado-subchoice-val">{config.extraRules}</span>
                        </div>
                    )}
                </div>
            </div>
        </SheetSection>
    );
};
