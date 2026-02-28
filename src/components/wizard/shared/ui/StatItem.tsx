import React from 'react';
import './StatItem.css';

interface StatItemProps {
    label: string;
    value: string;
    theme: 'red' | 'purple';
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, theme }) => (
    <div className={`stat-item stat-item-${theme}`}>
        <span className="stat-item-label">{label}</span>
        <span className="stat-item-value">{value || '-'}</span>
    </div>
);
