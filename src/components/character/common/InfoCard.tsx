import React from 'react';

export interface InfoCardStat {
    label: string;
    value: React.ReactNode;
    className?: string;
}

interface InfoCardProps {
    title: React.ReactNode;
    theme?: string; // e.g. "theme-weapon", "theme-artifact"
    stats?: InfoCardStat[];
    cols?: 1 | 2 | 3 | 4;
    notes?: React.ReactNode;
    children?: React.ReactNode; // specific custom content like magic cost
}

export const InfoCard: React.FC<InfoCardProps> = ({
    title,
    theme = '',
    stats = [],
    cols = 2,
    notes,
    children
}) => {
    return (
        <div className={`preview-card ${theme}`}>
            <div className="preview-card-title">{title}</div>

            {stats.length > 0 && (
                <div className={`preview-stats-grid cols-${cols}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className={stat.className}>
                            <span className="preview-stat-label">{stat.label}</span> {stat.value}
                        </div>
                    ))}
                </div>
            )}

            {children}

            {notes && (
                <div className="preview-notes">
                    {notes}
                </div>
            )}
        </div>
    );
};
