import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../data/backgroundTables';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../shared/stepStyles';
import { WizardSection } from '../shared/WizardSection';
import { WizardField } from '../shared/WizardField';
import { DynamicList } from '../shared/DynamicList';
import { FormSelect } from '../shared/FormSelect';
import { CostBadge } from '../shared/CostBadge';
import './Step5_Background.css';

interface Step5Props {
    data: {
        background: {
            items: string[];
            prejudiceResistance?: number;
            economicStatus?: string;
            legalStatus?: string;
            socialStatus?: string;
            friendsAndAssociates?: string;
        };
    };
    onChange: (updates: any) => void;
}

export default function Step5_Background({ data, onChange }: Step5Props) {
    const resistanceValue = data.background?.prejudiceResistance || 50;
    const resistanceCost = (resistanceValue - 50) * 0.1;

    // Get current selections (defaulting if undefined)
    const currentEconomic = ECONOMIC_STATUS.find(e => e.id === data.background?.economicStatus) || ECONOMIC_STATUS[3];
    const currentLegal = LEGAL_STATUS.find(l => l.id === data.background?.legalStatus) || LEGAL_STATUS[0];
    const currentSocial = SOCIAL_STATUS.find(s => s.id === data.background?.socialStatus) || SOCIAL_STATUS[2];
    const currentFriends = FRIENDS_AND_ASSOCIATES.find(f => f.id === data.background?.friendsAndAssociates) || FRIENDS_AND_ASSOCIATES[2];

    const addBackgroundItem = () => {
        onChange({
            background: {
                ...data.background,
                items: [...data.background.items, "Nuevo elemento de trasfondo"]
            }
        });
    };

    const updateBackgroundItem = (index: number, value: string) => {
        const newItems = [...data.background.items];
        newItems[index] = value;
        onChange({ background: { ...data.background, items: newItems } });
    };

    const removeBackgroundItem = (index: number) => {
        const newItems = [...data.background.items];
        newItems.splice(index, 1);
        onChange({ background: { ...data.background, items: newItems } });
    };

    const handleResistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= 100) {
            onChange({ background: { ...data.background, prejudiceResistance: val } });
        }
    };

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
                onChange={(val) => onChange({ background: { ...data.background, [field]: val } })}
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
        <div className="step5-container">

            {/* Header Description */}
            <h2 style={stepPageTitleStyle}>
                Trasfondo y Personalidad
            </h2>
            <p style={stepPageSubtitleStyle}>
                Define la historia, contexto, estatus social y resistencia psicológica de tu personaje.
            </p>

            {/* PREJUDICE RESISTANCE */}
            <WizardSection
                title="Resistencia a Prejuicios"
                rightContent={
                    <div className="section-header-badge"><CostBadge
                        cost={resistanceCost > 0 ? `+${resistanceCost.toFixed(1)}` : resistanceCost.toFixed(1)}
                        label="PC"
                        variant={resistanceCost === 0 ? "default" : (resistanceCost > 0 ? "penalty" : "bonus")}
                    /></div>
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
                        onChange={handleResistanceChange}
                        className="step5-range-input"
                    />
                    <span className="step5-range-label">100</span>

                    <div className="step5-number-input-wrapper">
                        <WizardField
                            label=""
                            type="number"
                            min="1"
                            value={resistanceValue}
                            onChange={(val) => {
                                const parseVal = parseInt(val);
                                if (!isNaN(parseVal)) {
                                    handleResistanceChange({ target: { value: val } } as any);
                                }
                            }}
                            noMargin
                        />
                        <span className="step5-percent-symbol">%</span>
                    </div>
                </div>
            </WizardSection>

            {/* ADVANCED STATUS OPTIONS */}
            <WizardSection
                title="Estatus Social y Legal"
            >
                <div className="step5-status-grid">
                    {renderStatusSelect("Posición Económica", ECONOMIC_STATUS, data.background?.economicStatus, 'economicStatus', currentEconomic)}
                    {renderStatusSelect("Situación Legal", LEGAL_STATUS, data.background?.legalStatus, 'legalStatus', currentLegal)}
                    {renderStatusSelect("Posición Social", SOCIAL_STATUS, data.background?.socialStatus, 'socialStatus', currentSocial)}
                    {renderStatusSelect("Amistades y allegados", FRIENDS_AND_ASSOCIATES, data.background?.friendsAndAssociates, 'friendsAndAssociates', currentFriends)}
                </div>
            </WizardSection>

            {/* BACKGROUND ITEMS */}
            <WizardSection
                title="Notas de Trasfondo"
            >
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
                    items={data.background.items}
                    onAdd={addBackgroundItem}
                    onRemove={removeBackgroundItem}
                    addButtonLabel="Añadir Elemento de Trasfondo"
                    color="#4338ca"
                    renderItem={(item, index) => (
                        <WizardField
                            label=""
                            value={item}
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
