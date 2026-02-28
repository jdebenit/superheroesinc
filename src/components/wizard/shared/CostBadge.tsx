import React from 'react';
import './CostBadge.css';

interface CostBadgeProps {
    cost: number | string;
    label?: string;
    variant?: 'default' | 'free' | 'penalty' | 'bonus' | 'variable';
    className?: string;
}

export const CostBadge: React.FC<CostBadgeProps> = ({
    cost,
    label = 'PCs',
    variant = 'default',
    className = ''
}) => {
    if (variant === 'free') {
        return (
            <span className={`cost-badge cost-badge-free ${className}`}>
                0 <span className="cost-badge-subtext">(Gratis)</span>
            </span>
        );
    }

    if (variant === 'variable') {
        return (
            <span className={`cost-badge cost-badge-variable ${className}`}>
                {cost} <span className="cost-badge-subtext">(Variable)</span>
            </span>
        );
    }

    if (variant === 'penalty') {
        return (
            <span className={`cost-badge cost-badge-penalty ${className}`}>
                {cost}
            </span>
        );
    }

    if (variant === 'bonus') {
        return (
            <span className={`cost-badge cost-badge-bonus ${className}`}>
                {cost}
            </span>
        );
    }

    // Default
    return (
        <span className={`cost-badge cost-badge-default ${className}`}>
            {cost} {label}
        </span>
    );
};
