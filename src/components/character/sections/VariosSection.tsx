import React from 'react';
import { SheetSection } from '../common/SheetSection';

interface VariosSectionProps {
    varios: any;
}

export const VariosSection: React.FC<VariosSectionProps> = ({ varios }) => {
    if (!varios || !varios.items || varios.items.length === 0) return null;

    const totalCost = varios.items.reduce((acc: number, item: any) => acc + (parseFloat(item.cost) || 0), 0);

    return (
        <SheetSection
            title="Varios"
            className="varios"
            cost={totalCost !== 0 ? `(${totalCost} PCs)` : undefined}
        >
            <div className="varios-container">
                {varios.items.map((item: any, i: number) => (
                    <div key={i} className="varios-item-block">
                        <div className="varios-description">
                            {item.description}
                        </div>
                        {item.cost && parseFloat(item.cost) !== 0 && (
                            <div className="varios-item-cost">
                                {item.cost} PCs
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </SheetSection>
    );
};
