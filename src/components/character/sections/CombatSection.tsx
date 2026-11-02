import React, { useState } from 'react';
import { type StatBreakdown } from '../../../utils/characterCalculations';
import { StatBreakdownPanel } from '../common/StatBreakdownPanel';

export interface CombatStat {
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
                                <StatBreakdownPanel
                                    breakdown={b}
                                    panelClassName="combat-breakdown-panel"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
