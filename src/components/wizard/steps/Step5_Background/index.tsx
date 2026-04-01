import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES, BASE_COVERAGE } from '../../../../data/backgroundTables';
import { WizardSection } from '../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../shared/ui/SectionHeaderBadge';
import { WizardField } from '../../shared/forms/WizardField';
import { WizardRange } from '../../shared/forms/WizardRange';
import { StatusSelectCard } from '../../shared/forms/StatusSelectCard';
import { DynamicList } from '../../shared/layout/DynamicList';
import { useStep5Logic } from './useStep5Logic';
import '../../shared/layout/WizardStep.css';
import './Step5_Background.css';

interface Step5Props {
    data: any;
    onChange: (updates: any) => void;
    onShowHelp?: () => void;
}

export default function Step5_Background({ data, onChange, onShowHelp }: Step5Props) {
    const {
        resistanceValue,
        resistanceCost,
        currentEconomic,
        currentLegal,
        currentSocial,
        currentFriends,
        currentBase,
        backgroundItems,
        addBackgroundItem,
        updateBackgroundItem,
        removeBackgroundItem,
        handleResistanceChange,
        updateStatus
    } = useStep5Logic(data, onChange);

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Trasfondo y Personalidad"
                description="Define la historia, contexto, estatus social y resistencia psicológica de tu personaje."
                onHelp={onShowHelp}
            />

            <WizardSection
                title="Resistencia a Prejuicios"
                rightContent={
                    <SectionHeaderBadge
                        cost={resistanceCost > 0 ? `+${resistanceCost.toFixed(1)}` : resistanceCost.toFixed(1)}
                        label="PC"
                        variant={resistanceCost === 0 ? "default" : (resistanceCost > 0 ? "penalty" : "bonus")}
                    />
                }
                description={
                    <>
                        La capacidad del personaje para resistir la influencia de prejuicios y estereotipos.<br />
                        <strong>50</strong> es el valor promedio. Subir cuesta PC, bajar devuelve PC.
                    </>
                }
            >
                <WizardRange
                    min={1}
                    max={100}
                    value={resistanceValue}
                    onChange={(val) => handleResistanceChange(val)}
                    suffix="%"
                />
            </WizardSection>

            <WizardSection title="Estatus Social y Legal">
                <div className="step5-status-grid">
                    <StatusSelectCard title="Posición Económica" options={ECONOMIC_STATUS} currentValue={data.background?.economicStatus} field="economicStatus" currentObj={currentEconomic} onChange={(field, val) => updateStatus(field, val)} />
                    <StatusSelectCard title="Situación Legal" options={LEGAL_STATUS} currentValue={data.background?.legalStatus} field="legalStatus" currentObj={currentLegal} onChange={(field, val) => updateStatus(field, val)} />
                    <StatusSelectCard title="Posición Social" options={SOCIAL_STATUS} currentValue={data.background?.socialStatus} field="socialStatus" currentObj={currentSocial} onChange={(field, val) => updateStatus(field, val)} />
                    <StatusSelectCard title="Amistades y allegados" options={FRIENDS_AND_ASSOCIATES} currentValue={data.background?.friendsAndAssociates} field="friendsAndAssociates" currentObj={currentFriends} onChange={(field, val) => updateStatus(field, val)} />
                </div>
            </WizardSection>

            <WizardSection title="Bases y Cobertura">
                <div className="step5-status-grid">
                    <StatusSelectCard title="Tipo de base" options={BASE_COVERAGE} currentValue={data.background?.baseCoverage} field="baseCoverage" currentObj={currentBase} onChange={(field, val) => updateStatus(field, val)} />
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
