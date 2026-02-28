import React, { type ReactNode } from 'react';

type BadgeColor = 'blue' | 'purple' | 'red' | 'orange' | 'teal' | 'yellow' | 'indigo' | 'pink' | 'green' | 'gray';

interface BadgeProps {
    label: ReactNode;
    color?: BadgeColor;
    className?: string;
    variant?: 'solid' | 'outline';
}

const colorStyles: Record<BadgeColor, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};

export const Badge: React.FC<BadgeProps> = ({ label, color = 'gray', className = '', variant = 'solid' }) => {
    const styles = colorStyles[color];
    const baseClasses = "text-xs px-2 py-1 rounded-full font-bold inline-flex items-center justify-center";

    // For now we primarily use the solid/light-bg style
    // The previous implementation used custom hexes, we map them to tailwind now.

    return (
        <span className={`${baseClasses} ${styles.bg} ${styles.text} border ${styles.border} ${className}`}>
            {label}
        </span>
    );
};
