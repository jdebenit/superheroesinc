import React, { useState } from 'react';
import { type StatBreakdown } from '../../../utils/characterCalculations';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';
import { StatBreakdownPanel } from '../common/StatBreakdownPanel';

export interface OtherStat {
    label: string;
    value: string;
    breakdown?: StatBreakdown;
}

interface OtherStatsSectionProps {
    otherStats: OtherStat[];
}

export const OtherStatsSection: React.FC<OtherStatsSectionProps> = ({ otherStats }) => {
    const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});

    if (!otherStats || otherStats.length === 0) return null;

    const toggleStat = (label: string) => {
        setExpandedStats(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    return (
        <SheetSection title="Datos de Combate" className="other-stats">
            <ul className="clean-list">
                {otherStats.map((item, i) => {
                    const hasBreakdown = !!item.breakdown;
                    const isExpanded = !!expandedStats[item.label];
                    const b = item.breakdown;
                    const hasCustom = b && b.personalizado !== undefined && b.personalizado !== null && b.personalizado !== '';

                    return (
                        <li
                            key={i}
                            className={`no-bullet-item skill-item ${hasBreakdown ? 'clickable-stat-item' : ''} ${isExpanded ? 'expanded' : ''}`}
                            onClick={hasBreakdown ? () => toggleStat(item.label) : undefined}
                            title={hasBreakdown ? 'Pulsa para ver el desglose del cálculo' : undefined}
                        >
                            <DetailRow
                                className="skill-row"
                                label={
                                    <span className="skill-name">
                                        {item.label}
                                        {hasBreakdown && (
                                            <span className="stat-toggle-indicator">{isExpanded ? ' ▲' : ' ▼'}</span>
                                        )}
                                    </span>
                                }
                                value={
                                    <span className={`skill-value ${hasCustom ? 'stat-value-custom' : ''}`}>
                                        {item.value}
                                    </span>
                                }
                                valueClassName=""
                            />
                            {hasBreakdown && isExpanded && b && (
                                <StatBreakdownPanel
                                    breakdown={b}
                                    panelClassName="other-breakdown-panel"
                                    isImpactMod={item.label === 'Modificador de impacto'}
                                />
                            )}
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
