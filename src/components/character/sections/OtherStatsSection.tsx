import React, { useState } from 'react';
import { type StatBreakdown } from '../../../utils/characterCalculations';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface OtherStat {
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

    const renderModifierRecord = (mod: Record<string, number> | number, isMaxOnly: boolean = false) => {
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
                {isMaxOnly && entries.length > 1 && <span className="stat-breakdown-hint"> (se aplica el mayor)</span>}
            </span>
        );
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
                                <div className="stat-breakdown-panel other-breakdown-panel" onClick={(e) => e.stopPropagation()}>
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
                                    {b.multiplicadorFuerza !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Mult. Fuerza:</span>
                                            <span className="stat-breakdown-val">x{b.multiplicadorFuerza}</span>
                                        </div>
                                    )}
                                    {b.alto !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Salto alto:</span>
                                            <span className="stat-breakdown-val">{b.alto}</span>
                                        </div>
                                    )}
                                    {b.largo !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Salto largo:</span>
                                            <span className="stat-breakdown-val">{b.largo}</span>
                                        </div>
                                    )}
                                    {b.origen !== undefined && (
                                        <div className="stat-breakdown-row">
                                            <span className="stat-breakdown-key">Origen:</span>
                                            <span className="stat-breakdown-val">{renderModifierRecord(b.origen, item.label === 'Modificador de impacto')}</span>
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
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
