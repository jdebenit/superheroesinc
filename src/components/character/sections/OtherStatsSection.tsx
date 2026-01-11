import React from 'react';

interface OtherStatsSectionProps {
    otherStats: string[];
}

export const OtherStatsSection: React.FC<OtherStatsSectionProps> = ({ otherStats }) => {
    if (!otherStats || otherStats.length === 0) return null;

    return (
        <div className="sheet-section other">
            <div className="section-header">
                <h4>Datos de Combate</h4>
            </div>
            <ul>
                {otherStats.map((item: string, i: number) => (
                    <li key={i} className="no-bullet-item">{item}</li>
                ))}
            </ul>
        </div>
    );
};
