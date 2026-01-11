import React from 'react';

interface CombatSectionProps {
    combatStats: string[];
}

export const CombatSection: React.FC<CombatSectionProps> = ({ combatStats }) => {
    if (!combatStats || combatStats.length === 0) return null;

    return (
        <div className="sheet-section combat-section">
            <div className="section-header">
                <h4>Resumen de Combate</h4>
            </div>
            <div className="combat-grid">
                {combatStats.map((item: string, i: number) => {
                    const [label, value] = item.split(':').map(s => s.trim());
                    return (
                        <div key={i} className="combat-stat-box">
                            <span className="stat-label">{label}</span>
                            <span className="stat-value">{value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
