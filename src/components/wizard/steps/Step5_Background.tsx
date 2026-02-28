import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../data/backgroundTables';
import { WizardSection } from '../shared/WizardSection';
import { WizardField } from '../shared/WizardField';
import { DynamicList } from '../shared/DynamicList';
import { FormSelect } from '../shared/FormSelect';
import { CostBadge } from '../shared/CostBadge';
import { useStep5Logic } from '../hooks/useStep5Logic';
import '../shared/WizardStep.css';
import './Step5_Background.css';

interface Step5Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step5_Background({ data, onChange }: Step5Props) {
    const {
        resistanceValue,
        resistanceCost,
        currentEconomic,
        currentLegal,
        currentSocial,
        currentFriends,
        backgroundItems,
        addBackgroundItem,
        updateBackgroundItem,
        removeBackgroundItem,
        handleResistanceChange,
        updateStatus
    } = useStep5Logic(data, onChange);

    const renderStatusSelect = (
        title: string,
        options: any[],
        currentValue: string | undefined,
        field: string,
        currentObj: any
    ) => (
        <div className="step5-status-card">
            <div className="step5-status-header">
                <h4 className="step5-status-title">{title}</h4>
                <div className="section-header-badge">
                    <CostBadge
                        cost={currentObj.cost > 0 ? `+${currentObj.cost}` : currentObj.cost}
                        label="PC"
                        variant={currentObj.cost === 0 ? "default" : (currentObj.cost > 0 ? "penalty" : "bonus")}
                    />
                </div>
            </div>
            <FormSelect
                label=""
                value={currentValue || options[0].id}
                onChange={(val) => updateStatus(field, val)}
                options={options.map(opt => ({
                    id: opt.id,
                    label: opt.label,
                    cost: opt.cost,
                    description: opt.description
                }))}
                showCostInOption={true}
                showDescription={true}
                noMargin
            />
        </div>
    );

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Trasfondo y Personalidad"
                description="Define la historia, contexto, estatus social y resistencia psicológica de tu personaje."
            />

            <WizardSection
                title="Resistencia a Prejuicios"
                rightContent={
                    <div className="section-header-badge">
                        <CostBadge
                            cost={resistanceCost > 0 ? `+${resistanceCost.toFixed(1)}` : resistanceCost.toFixed(1)}
                            label="PC"
                            variant={resistanceCost === 0 ? "default" : (resistanceCost > 0 ? "penalty" : "bonus")}
                        />
                    </div>
                }
                description={
                    <>
                        La capacidad del personaje para resistir la influencia de prejuicios y estereotipos.<br />
                        <strong>50</strong> es el valor promedio. Subir cuesta PC, bajar devuelve PC.
                    </>
                }
            >
                <div className="step5-range-container">
                    <span className="step5-range-label">1</span>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={resistanceValue}
                        onChange={(e) => handleResistanceChange(parseInt(e.target.value))}
                        className="step5-range-input"
                    />
                    <span className="step5-range-label">100</span>

                    <div className="step5-number-input-wrapper">
                        <WizardField
                            label=""
                            type="number"
                            min="1"
                            max="100"
                            value={resistanceValue}
                            onChange={(val) => handleResistanceChange(parseInt(val))}
                            noMargin
                        />
                        <span className="step5-percent-symbol">%</span>
                    </div>
                </div>
            </WizardSection>

            <WizardSection title="Estatus Social y Legal">
                <div className="step5-status-grid">
                    {renderStatusSelect("Posición Económica", ECONOMIC_STATUS, data.background?.economicStatus, 'economicStatus', currentEconomic)}
                    {renderStatusSelect("Situación Legal", LEGAL_STATUS, data.background?.legalStatus, 'legalStatus', currentLegal)}
                    {renderStatusSelect("Posición Social", SOCIAL_STATUS, data.background?.socialStatus, 'socialStatus', currentSocial)}
                    {renderStatusSelect("Amistades y allegados", FRIENDS_AND_ASSOCIATES, data.background?.friendsAndAssociates, 'friendsAndAssociates', currentFriends)}
                </div>
            </WizardSection>

            <WizardSection title="Notas de Trasfondo">
                <div className="step5-help-notice">
                    <p className="step5-help-title">Ejemplos de trasfondo:</p>
                    <ul className="step5-help-list">
                        <li><strong>Identidad secreta:</strong> No la mantiene / Opuesta a la real</li>
                        <li><strong>Carácter:</strong> Depresivo / Frío / Afable</li>
                        <li><strong>Infancia:</strong> Feliz / Criado en la calle / Privilegiada</li>
                        <li><strong>Familia:</strong> Sus padres viven / Huérfano / Familia numerosa</li>
                    </ul>
                </div>

                <DynamicList
                    items={backgroundItems}
                    onAdd={addBackgroundItem}
                    onRemove={removeBackgroundItem}
                    addButtonLabel="Añadir Elemento de Trasfondo"
                    color="#4338ca"
                    renderItem={(item, index) => (
                        <WizardField
                            label=""
                            value={item as string}
                            onChange={(val) => updateBackgroundItem(index, val)}
                            noMargin
                            placeholder="Ej: Trabajo medio/bajo: mecánico"
                        />
                    )}
                />
            </WizardSection>
        </div>
    );
}
