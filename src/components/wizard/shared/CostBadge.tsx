import React from 'react';

interface CostBadgeProps {
    cost: number | string;
    label?: string;
    variant?: 'default' | 'free' | 'penalty' | 'variable';
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
            <span className={`text-sm font-bold text-green-600 ${className}`}>
                0 <span className="text-xs font-normal text-gray-500">(Gratis)</span>
            </span>
        );
    }

    if (variant === 'variable') {
        return (
            <span className={`text-sm font-bold text-indigo-600 ${className}`}>
                {cost} <span className="text-xs font-normal text-gray-500">(Variable)</span>
            </span>
        );
    }

    if (variant === 'penalty') {
        return (
            <span className={`text-sm font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded ${className}`}>
                {cost}
            </span>
        );
    }

    // Default
    return (
        <span className={`text-sm font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 inline-block ${className}`}>
            {cost} {label}
        </span>
    );
};
