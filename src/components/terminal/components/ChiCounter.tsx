import React from 'react';
import '../TacticPlayerTerminal.css';

export const CHI_MAX_BY_LEVEL: { [level: number]: number } = {
    1: 1, 2: 3, 3: 5, 4: 6, 5: 9,
    6: 11, 7: 12, 8: 15, 9: 17, 10: 19
};

interface ChiCounterProps {
    level: number;
    usedChi: number;
    onUpdate: (newUsed: number, max: number) => void;
    onReset: () => void;
    onViewHistory: () => void;
}

export default function ChiCounter({ level, usedChi, onUpdate, onReset, onViewHistory }: ChiCounterProps) {
    const maxChi = CHI_MAX_BY_LEVEL[Math.min(Math.max(level, 1), 10)] ?? 1;
    const remaining = maxChi - usedChi;
    const pct = Math.max(0, Math.min(100, (remaining / maxChi) * 100));

    return (
        <div className="terminal-stat-card health-variant">
            <div className="stat-card-label">CHI</div>

            <div className="health-content-row">
                {/* Center: [+1] big-number [−1] */}
                <div className="health-current-container">
                    <div className="chi-center-row">
                        <button
                            className="chi-side-btn chi-side-btn--recover"
                            onClick={() => onUpdate(usedChi - 1, maxChi)}
                            disabled={usedChi === 0}
                            title="Recuperar 1 Chi"
                        >+1</button>

                        <span className="health-current" style={{ color: remaining === 0 ? '#d1d5db' : '#7c3aed' }}>
                            {remaining}
                        </span>

                        <button
                            className="chi-side-btn chi-side-btn--use"
                            onClick={() => onUpdate(usedChi + 1, maxChi)}
                            disabled={usedChi >= maxChi}
                            title="Usar 1 Chi"
                        >−1</button>
                    </div>
                </div>

                {/* Right column: same as StatCard */}
                <div className="health-secondary-stats">
                    <button
                        className="history-icon-btn"
                        onClick={onViewHistory}
                        title="Ver historial"
                    >📋</button>
                    <button
                        className="history-icon-btn"
                        onClick={onReset}
                        disabled={usedChi === 0}
                        style={{ opacity: usedChi === 0 ? 0.35 : 1 }}
                        title="Recuperar todo el Chi"
                    >↺</button>
                    <div className="health-sub-stat compact">
                        <span className="sub-stat-label">MAX</span>
                        <span className="sub-stat-box">{maxChi}</span>
                    </div>
                </div>
            </div>

            <div className="terminal-stat-bar health-bar-bottom">
                <div className="terminal-stat-bar-fill chi-fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

