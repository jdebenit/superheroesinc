import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import UnifiedRollModal from './UnifiedRollModal';
import { POWERS } from '../../../data/powers';

interface PowersPanelProps {
    powers?: {
        selected?: Array<{
            id: string;
            origin: string;
            name?: string;
            rank: number;
            customizations?: any[];
            skillValue?: number;
        }>;
    };
    attributes?: Record<string, number>;
}

export default function PowersPanel({ powers, attributes }: PowersPanelProps) {
    const [selectedPower, setSelectedPower] = useState<{
        name: string;
        value: number;
    } | null>(null);

    if (!powers?.selected || powers.selected.length === 0) {
        return null;
    }

    const calculatePowerSkill = (powerDef: any) => {
        if (!powerDef?.skillCalc || !attributes) return 0;

        const getVal = (abbr: string) => {
            const map: Record<string, string> = {
                'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
                'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
            };
            const fullName = map[abbr];
            return attributes[fullName] || 0;
        };

        try {
            const evalFormula = powerDef.skillCalc.replace(/[A-Z]{3}/g, (match: string) => getVal(match).toString());
            return Math.floor(new Function('return ' + evalFormula)());
        } catch (e) {
            return 0;
        }
    };

    const handlePowerClick = (power: any, powerDef: any) => {
        if (!powerDef?.skillCalc) return;

        const skillValue = power.skillValue || calculatePowerSkill(powerDef);

        setSelectedPower({
            name: powerDef.name || power.name || power.id,
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
                    const calculatedSkill = hasSkill ? (power.skillValue || calculatePowerSkill(powerDef)) : 0;

                    return (
                        <div
                            key={`${power.id}-${index}`}
                            className={`power-card ${hasSkill ? 'clickable' : 'non-clickable'}`}
                            onClick={() => hasSkill && handlePowerClick(power, powerDef)}
                        >
                            <div className="power-name">{powerDef?.name || power.name || power.id}</div>
                            <div className="power-details">
                                <span className="power-rank">Rango {power.rank}</span>
                                {power.origin && (
                                    <span className="power-origin"> • {power.origin}</span>
                                )}
                            </div>
                            {hasSkill && calculatedSkill > 0 && (
                                <div className="power-skill-value">{calculatedSkill}%</div>
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
