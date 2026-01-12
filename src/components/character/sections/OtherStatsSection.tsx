import React from 'react';

interface OtherStatsSectionProps {
    otherStats: string[];
}

import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

export const OtherStatsSection: React.FC<OtherStatsSectionProps> = ({ otherStats }) => {
    if (!otherStats || otherStats.length === 0) return null;

    return (
        <SheetSection title="Datos de Combate" className="other-stats">
            <ul className="clean-list">
                {otherStats.map((item: string, i: number) => {
                    const [label, value] = item.split(':').map(s => s.trim());
                    return (
                        <li key={i} className="no-bullet-item skill-item">
                            <DetailRow
                                className="skill-row"
                                label={<span className="skill-name">{label}</span>}
                                value={<span className="skill-value">{value}</span>}
                                valueClassName=""
                            />
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
