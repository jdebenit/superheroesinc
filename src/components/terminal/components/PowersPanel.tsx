import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import UnifiedRollModal from './UnifiedRollModal';
import { POWERS } from '../../../data/powers';

interface PowersPanelProps {
    powers?: {
        selected?: Array<{
            id: string;
            origin: string;
            rank: number;
            customizations?: any[];
            skillValue?: number;
        }>;
    };
}

export default function PowersPanel({ powers }: PowersPanelProps) {
    const [selectedPower, setSelectedPower] = useState<{
        name: string;
        value: number;
    } | null>(null);

    if (!powers?.selected || powers.selected.length === 0) {
        return null;
    }

    const handlePowerClick = (power: any, powerDef: any) => {
        // Only allow clicking if the power has a skillCalc (meaning it can be rolled)
        if (!powerDef?.skillCalc) return;

        // Use skillValue if available, otherwise default to 0
        const skillValue = power.skillValue || 0;

        setSelectedPower({
            name: powerDef.name,
            value: skillValue
        });
    };

    return (
        <div className="terminal-section">
            <h3 className="terminal-section-title">PODERES</h3>
            <div className="powers-grid">
                {powers.selected.map((power, index) => {
                    const powerDef = POWERS.find(p => p.id === power.id);
                    const hasSkill = powerDef?.skillCalc;

                    return (
                        <div
                            key={`${power.id}-${index}`}
                            className={`power-card ${hasSkill ? 'clickable' : 'non-clickable'}`}
                            onClick={() => hasSkill && handlePowerClick(power, powerDef)}
                        >
                            <div className="power-name">{powerDef?.name || power.id}</div>
                            <div className="power-details">
                                <span className="power-rank">Rango {power.rank}</span>
                                {power.origin && (
                                    <span className="power-origin"> • {power.origin}</span>
                                )}
                            </div>
                            {hasSkill && power.skillValue !== undefined && power.skillValue > 0 && (
                                <div className="power-skill-value">{power.skillValue}%</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedPower && (
                <UnifiedRollModal
                    isOpen={!!selectedPower}
                    onClose={() => setSelectedPower(null)}
                    title={selectedPower.name}
                    targetValue={selectedPower.value}
                    initialMode="basic"
                    skillType="cac"
                />
            )}
        </div>
    );
}
