import React from 'react';

interface CombatStat {
    label: string;
    value: string;
}

interface CombatSectionProps {
    combatStats: CombatStat[];
}

export const CombatSection: React.FC<CombatSectionProps> = ({ combatStats }) => {
    if (!combatStats || combatStats.length === 0) return null;

    return (
        <div className="sheet-section combat-section">
            <div className="section-header">
                <h4>Resumen de Combate</h4>
            </div>
            <div className="combat-grid">
                {combatStats.map((item, i) => (
                    <div key={i} className="combat-stat-box">
                        <span className="stat-label">{item.label}</span>
                        <span className="stat-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
