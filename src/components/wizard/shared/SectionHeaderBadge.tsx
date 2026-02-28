import React from 'react';
import { CostBadge } from './CostBadge';

interface SectionHeaderBadgeProps {
    cost: number | string;
    label?: string;
    variant?: 'default' | 'free' | 'penalty' | 'bonus' | 'variable';
    className?: string;
}

export const SectionHeaderBadge: React.FC<SectionHeaderBadgeProps> = (props) => {
    return (
        <div className="section-header-badge">
            <CostBadge {...props} />
        </div>
    );
};
