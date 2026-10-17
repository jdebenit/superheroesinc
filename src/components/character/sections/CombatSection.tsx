import React, { useState } from 'react';
import { type StatBreakdown } from '../../../utils/characterCalculations';

interface CombatStat {
    label: string;
    value: string;
    breakdown?: StatBreakdown;
}

interface CombatSectionProps {
    combatStats: CombatStat[];
}

export const CombatSection: React.FC<CombatSectionProps> = ({ combatStats }) => {
    const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

    if (!combatStats || combatStats.length === 0) return null;

    const toggleStat = (label: string) => {
        setExpandedStats(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const renderModifierRecord = (mod: Record<string, number> | number) => {
        if (typeof mod === 'number') return <span>{mod}</span>;
        const entries = Object.entries(mod);
        if (entries.length === 0) return <span>0</span>;
        return (
            <span className="stat-breakdown-sublist">
                {entries.map(([k, v], idx) => (
                    <span key={k} className="stat-breakdown-tag">
                        {k}: {v >= 0 ? `+${v}` : v}{idx < entries.length - 1 ? ', ' : ''}
                    </span>
                ))}
            </span>
        );
    };

    return (
        <div className="sheet-section combat-section">
            <div className="section-header">
                <h4>Resumen de Combate</h4>
            </div>
            <div className="combat-grid">
                {combatStats.map((item, i) => {
                    const hasBreakdown = !!item.breakdown;
                    const isExpanded = !!expandedStats[item.label];
                    const b = item.breakdown;
                    const hasCustom = b && b.personalizado !== undefined && b.personalizado !== null && b.personalizado !== '';

                    return (
                        <div
                            key={i}
                            className={`combat-stat-box ${hasBreakdown ? 'clickable-stat-box' : ''} ${isExpanded ? 'expanded' : ''}`}
                            onClick={hasBreakdown ? () => toggleStat(item.label) : undefined}
                            title={hasBreakdown ? 'Pulsa para ver el desglose del cálculo' : undefined}
                        >
                            <span className="stat-label">
                                {item.label}
                                {hasBreakdown && (
                                    <span className="stat-toggle-indicator">{isExpanded ? ' ▲' : ' ▼'}</span>
                                )}
                            </span>
                            <span className={`stat-value ${hasCustom ? 'stat-value-custom' : ''}`}>
                                {item.value}
                            </span>

                            {hasBreakdown && isExpanded && b && (
                                <div className="stat-breakdown-panel combat-breakdown-panel" onClick={(e) => e.stopPropagation()}>
                                    {b.formula && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Fórmula:</span>
                                            <code className="stat-breakdown-formula">{b.formula}</code>
                                        </div>
                                    )}
                                    {b.base !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Base:</span>
                                            <span className="stat-breakdown-val">{b.base}</span>
                                        </div>
                                    )}
                                    {b.origen !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Origen:</span>
                                            <span className="stat-breakdown-val">{renderModifierRecord(b.origen)}</span>
                                        </div>
                                    )}
                                    {b.habilidades !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Habilidades:</span>
                                            <span className="stat-breakdown-val">{renderModifierRecord(b.habilidades)}</span>
                                        </div>
                                    )}
                                    {b.nivel !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Nivel:</span>
                                            <span className="stat-breakdown-val">{renderModifierRecord(b.nivel)}</span>
                                        </div>
                                    )}
                                    <div className="stat-breakdown-row stat-breakdown-total-row">
                                        <span className="stat-breakdown-key">Total:</span>
                                        <span className="stat-breakdown-val">{b.total}</span>
                                    </div>
                                    {hasCustom && (
                                        <div className="stat-breakdown-row stat-breakdown-custom-row">
                                            <span className="stat-breakdown-key">Personalizado:</span>
                                            <span className="stat-breakdown-val">{b.personalizado}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
