import React from 'react';
import { SheetSection } from '../common/SheetSection';

interface VariosSectionProps {
    varios: any;
}

export const VariosSection: React.FC<VariosSectionProps> = ({ varios }) => {
    if (!varios || !varios.items || varios.items.length === 0) return null;

    const totalCost = varios.items.reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0);

    return (
        <SheetSection
            title="Varios"
            className="varios"
            cost={totalCost > 0 ? `(${totalCost} PCs)` : undefined}
        >
            <ul className="varios-list">
                {varios.items.map((item: any, i: number) => (
                    <li key={i} className="varios-item">
                        <span>{item.description}</span>
                        {item.cost > 0 && <span className="item-cost" style={{ marginLeft: '6px', color: '#666', fontSize: '0.85em' }}>({item.cost} PCs)</span>}
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
