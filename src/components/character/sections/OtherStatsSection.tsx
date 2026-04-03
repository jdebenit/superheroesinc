import React from 'react';

interface OtherStat {
    label: string;
    value: string;
}

interface OtherStatsSectionProps {
    otherStats: OtherStat[];
}

import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

export const OtherStatsSection: React.FC<OtherStatsSectionProps> = ({ otherStats }) => {
    if (!otherStats || otherStats.length === 0) return null;

    return (
        <SheetSection title="Datos de Combate" className="other-stats">
            <ul className="clean-list">
                {otherStats.map((item, i) => (
                    <li key={i} className="no-bullet-item skill-item">
                        <DetailRow
                            className="skill-row"
                            label={<span className="skill-name">{item.label}</span>}
                            value={<span className="skill-value">{item.value}</span>}
                            valueClassName=""
                        />
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
