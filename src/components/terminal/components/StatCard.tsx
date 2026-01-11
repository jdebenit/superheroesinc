import React from 'react';
import ChangeInputSection from './ChangeInputSection';

interface StatCardProps {
    label: string;
    max: number;
    current: number;
    type: 'health' | 'mental' | 'willpower';
    changeValue: string;
    notes: string;
    onChangeValueChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onApply: () => void;
    onViewHistory: () => void;
    showBar?: boolean;
    customDisplay?: React.ReactNode;
}

export default function StatCard({
    label,
    max,
    current,
    type,
    changeValue,
    notes,
    onChangeValueChange,
    onNotesChange,
    onApply,
    onViewHistory,
    showBar = true,
    customDisplay
}: StatCardProps) {
    const barFillClass = type === 'health' ? 'health' :
        type === 'mental' ? 'mental' :
            'willpower';

    return (
        <div className="terminal-stat-card">
            <div className="terminal-stat-label">{label}</div>
            <div className="terminal-stat-max">Máximo: {max}</div>

            <div className="terminal-stat-current-display" onClick={onViewHistory}>
                <span className="current-label">Actual:</span>
                <span className="current-value">{current}</span>
                <span className="history-hint">📋 Ver historial</span>
            </div>

            {showBar && (
                <div className="terminal-stat-bar">
                    <div
                        className={`terminal-stat-bar-fill ${barFillClass}`}
                        style={{ width: `${Math.max(0, Math.min(100, (current / max) * 100))}%` }}
                    />
                </div>
            )}

            {customDisplay}

            <ChangeInputSection
                changeValue={changeValue}
                notes={notes}
                onChangeValueChange={onChangeValueChange}
                onNotesChange={onNotesChange}
                onApply={onApply}
            />
        </div>
    );
}
