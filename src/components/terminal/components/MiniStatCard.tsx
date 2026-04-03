import React from 'react';

interface MiniStatCardProps {
    label: string;
    max: number;
    current: number;
    type: 'health' | 'mental';
    onEdit: () => void;
    onViewHistory: () => void;
}

export default function MiniStatCard({
    label,
    max,
    current,
    type,
    onEdit,
    onViewHistory
}: MiniStatCardProps) {
    const barFillClass = type === 'mental' ? 'mental' : 'health';
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
        <div className="terminal-mini-stat-card" onClick={onEdit} onDoubleClick={(e) => {
            e.stopPropagation();
            onViewHistory();
        }} style={{ cursor: 'pointer' }}>
            <div className="mini-stat-header">
                <span className="mini-stat-label">{label}</span>
                <span className="mini-stat-values">
                    {current}/{max}
                </span>
            </div>
            <div className="terminal-stat-bar mini">
                <div
                    className={`terminal-stat-bar-fill ${barFillClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
