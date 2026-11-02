import React from 'react';
import type { StatBreakdown } from '../../../utils/characterCalculations';

interface StatBreakdownPanelProps {
    breakdown: StatBreakdown;
    panelClassName?: string;
    isImpactMod?: boolean;
}

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

export const StatBreakdownPanel: React.FC<StatBreakdownPanelProps> = ({
    breakdown,
    panelClassName = '',
    isImpactMod = false
}) => {
    const hasCustom = breakdown.personalizado !== undefined && breakdown.personalizado !== null && breakdown.personalizado !== '';

    return (
        <div className={`stat-breakdown-panel ${panelClassName}`} onClick={(e) => e.stopPropagation()}>
            {breakdown.formula && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Fórmula:</span>
                    <code className="stat-breakdown-formula">{breakdown.formula}</code>
                </div>
            )}
            {breakdown.base !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Base:</span>
                    <span className="stat-breakdown-val">{breakdown.base}</span>
                </div>
            )}
            {breakdown.multiplicadorFuerza !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Mult. Fuerza:</span>
                    <span className="stat-breakdown-val">x{breakdown.multiplicadorFuerza}</span>
                </div>
            )}
            {breakdown.alto !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Salto alto:</span>
                    <span className="stat-breakdown-val">{breakdown.alto}</span>
                </div>
            )}
            {breakdown.largo !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Salto largo:</span>
                    <span className="stat-breakdown-val">{breakdown.largo}</span>
                </div>
            )}
            {breakdown.origen !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Origen:</span>
                    <span className="stat-breakdown-val">{renderModifierRecord(breakdown.origen, isImpactMod)}</span>
                </div>
            )}
            {breakdown.habilidades !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Habilidades:</span>
                    <span className="stat-breakdown-val">{renderModifierRecord(breakdown.habilidades)}</span>
                </div>
            )}
            {breakdown.nivel !== undefined && (
                <div className="stat-breakdown-row">
                    <span className="stat-breakdown-key">Nivel:</span>
                    <span className="stat-breakdown-val">{renderModifierRecord(breakdown.nivel)}</span>
                </div>
            )}
            <div className="stat-breakdown-row stat-breakdown-total-row">
                <span className="stat-breakdown-key">Total:</span>
                <span className="stat-breakdown-val">{breakdown.total}</span>
            </div>
            {hasCustom && (
                <div className="stat-breakdown-row stat-breakdown-custom-row">
                    <span className="stat-breakdown-key">Personalizado:</span>
                    <span className="stat-breakdown-val">{breakdown.personalizado}</span>
                </div>
            )}
        </div>
    );
};
