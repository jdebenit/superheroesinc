import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../data/backgroundTables';
import {
    sectionCardStyle,
    sectionTitleStyle,
    innerCardStyle,
    textInputStyle,
    dangerButtonStyle,
    stepPageTitleStyle,
    stepPageSubtitleStyle,
} from '../shared/stepStyles';
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
        <div style={innerCardStyle}>
            <div className="step5-status-header">
                <h4 className="step5-status-title">{title}</h4>
                <div className={`step5-cost-small step5-cost-${currentObj.cost > 0 ? 'positive' : currentObj.cost < 0 ? 'negative' : 'neutral'}`}>
                    {currentObj.cost > 0 ? '+' : ''}{currentObj.cost} PC
                </div>
            </div>
            <select
                value={currentValue || options[0].id}
                onChange={(e) => onChange({ background: { ...data.background, [field]: e.target.value } })}
                style={{ ...textInputStyle, marginBottom: '0.5rem', padding: '0.5rem' }}
            >
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.cost > 0 ? '+' : ''}{opt.cost} PC)
                    </option>
                ))}
            </select>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                {currentObj.description}
            </p>
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
            <div style={sectionCardStyle}>
                <div className="step5-section-title">
                    <h3>🛡️ Resistencia a Prejuicios</h3>
                    <div className={`step5-cost-display step5-cost-${resistanceCost > 0 ? 'positive' : resistanceCost < 0 ? 'negative' : 'neutral'}`}>
                        Coste: {resistanceCost > 0 ? '+' : ''}{resistanceCost.toFixed(1)} PC
                    </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                    La capacidad del personaje para resistir la influencia de prejuicios y estereotipos.
                    <br />
                    <strong>50</strong> es el valor promedio. Subir cuesta PC, bajar devuelve PC.
                </p>

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
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={resistanceValue}
                            onChange={handleResistanceChange}
                            className="step5-number-input"
                        />
                        <span className="step5-percent-symbol">%</span>
                    </div>
                </div>
            </div>

            {/* ADVANCED STATUS OPTIONS */}
            <div style={sectionCardStyle}>
                <h3 style={{ ...sectionTitleStyle, color: '#0f766e', borderBottomColor: '#99f6e4' }}>🏛️ Estatus Social y Legal</h3>
                <div className="step5-status-grid">
                    {renderStatusSelect("Posición Económica", ECONOMIC_STATUS, data.background?.economicStatus, 'economicStatus', currentEconomic)}
                    {renderStatusSelect("Situación Legal", LEGAL_STATUS, data.background?.legalStatus, 'legalStatus', currentLegal)}
                    {renderStatusSelect("Posición Social", SOCIAL_STATUS, data.background?.socialStatus, 'socialStatus', currentSocial)}
                    {renderStatusSelect("Amistades y allegados", FRIENDS_AND_ASSOCIATES, data.background?.friendsAndAssociates, 'friendsAndAssociates', currentFriends)}
                </div>
            </div>

            {/* BACKGROUND ITEMS */}
            <div style={sectionCardStyle}>
                <h3 style={{ ...sectionTitleStyle, color: '#4338ca', borderBottomColor: '#c7d2fe' }}>📝 Notas de Trasfondo</h3>

                <div className="step5-help-notice">
                    <p className="step5-help-title">💡 Ejemplos de trasfondo:</p>
                    <ul className="step5-help-list">
                        <li><strong>Identidad secreta:</strong> No la mantiene / Opuesta a la real</li>
                        <li><strong>Carácter:</strong> Depresivo / Frío / Afable</li>
                        <li><strong>Infancia:</strong> Feliz / Criado en la calle / Privilegiada</li>
                        <li><strong>Familia:</strong> Sus padres viven / Huérfano / Familia numerosa</li>
                    </ul>
                </div>

                <div className="step5-items-list">
                    {data.background.items.map((item, index) => (
                        <div key={index} className="step5-item-row">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateBackgroundItem(index, e.target.value)}
                                style={textInputStyle}
                                placeholder="Ej: Trabajo medio/bajo: mecánico"
                            />
                            <button
                                onClick={() => removeBackgroundItem(index)}
                                style={dangerButtonStyle}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addBackgroundItem}
                        className="step5-add-item-btn"
                    >
                        + Añadir Elemento de Trasfondo
                    </button>
                </div>
            </div>
        </div>
    );
}
