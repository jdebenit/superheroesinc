import React from 'react';

interface StatCardProps {
    label: string;
    max: number;
    current: number;
    type: 'health' | 'mental' | 'willpower';
    onViewHistory: () => void;
    showBar?: boolean;
    unconsciousness?: number;
    onEdit?: () => void;
    onRoll?: () => void;
}

export default function StatCard({
    label,
    max,
    current,
    type,
    onViewHistory,
    showBar = true,
    unconsciousness,
    onEdit,
    onRoll
}: StatCardProps) {
    const barFillClass = type === 'mental' ? 'mental' : (type === 'willpower' ? 'willpower' : 'health');

    return (
        <div className="terminal-stat-card health-variant">
            <div className="stat-card-label">{label}</div>
            <div className="health-content-row" onClick={onEdit} style={{ cursor: 'pointer' }}>
                <div className="health-current-container">
                    <span className="health-current">{current}</span>
                </div>

                <div className="health-secondary-stats">
                    <button
                        className="history-icon-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory();
                        }}
                        title="Ver historial"
                    >
                        📋
                    </button>
                    <div className="health-sub-stat compact">
                        <span className="sub-stat-label">MAX</span>
                        <span className="sub-stat-box">{max}</span>
                    </div>
                    {unconsciousness !== undefined && (
                        <div className="health-sub-stat compact">
                            <span className="sub-stat-label">INC</span>
                            <span className="sub-stat-box">{unconsciousness}</span>
                        </div>
                    )}
                    {onRoll && (
                        <button
                            className="roll-icon-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRoll();
                            }}
                            title="Tirar dado"
                        >
                            🎲
                        </button>
                    )}
                </div>
            </div>

            {showBar && (
                <div className="terminal-stat-bar health-bar-bottom">
                    <div
                        className={`terminal-stat-bar-fill ${barFillClass}`}
                        style={{ width: `${Math.max(0, Math.min(100, (current / max) * 100))}%` }}
                    />
                </div>
            )}

            {/* Hidden Input Section removed as all use modal now */}
        </div>
    );
}
