import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import UnifiedRollModal from './UnifiedRollModal';
import InitiativeCalculatorModal from './InitiativeCalculatorModal';
import DamageRollModal from './DamageRollModal';

interface OtherStatsPanelProps {
    combatstats?: string[] | Record<string, string>;
    otherstats?: string[] | Record<string, string>;
    background?: {
        prejudiceResistance?: number;
        [key: string]: any;
    };
}

interface StatToDisplay {
    label: string;
    value: number | string;
    searchTerms: string[];
    source: 'combat' | 'other' | 'background';
    isDiceRoll?: boolean;
}

export default function OtherStatsPanel({ combatstats, otherstats, background }: OtherStatsPanelProps) {
    const [selectedStat, setSelectedStat] = useState<{
        name: string;
        value: number;
    } | null>(null);

    const [showInitiativeCalculator, setShowInitiativeCalculator] = useState(false);

    // Dice Result State
    const [diceResult, setDiceResult] = useState<{
        total: number;
        detail: string;
        originalDice: string;
    } | null>(null);

    // Damage Modal State
    const [damageModal, setDamageModal] = useState<{
        isOpen: boolean;
        title: string;
        diceString: string;
    }>({
        isOpen: false,
        title: '',
        diceString: ''
    });

    // Define which stats to display
    const statsToDisplay: StatToDisplay[] = [
        {
            label: 'Iniciativa y Reflejos',
            value: 0,
            searchTerms: ['iniciativa y reflejos', 'iniciativa'],
            source: 'combat'
        },
        {
            label: 'Resistencia a gases y venenos',
            value: 0,
            searchTerms: ['resistencia a gases y venenos', 'gases y venenos'],
            source: 'other'
        },
        {
            label: 'Resistencia a prejuicios',
            value: 0,
            searchTerms: ['resistencia a prejuicios'],
            source: 'background'
        },
        {
            label: 'Modificador de fuerza',
            value: 0,
            searchTerms: ['modificador de fuerza', 'mod fuerza', 'mod. fuerza'],
            source: 'other',
            isDiceRoll: true
        }
    ];

    // Extract stat values
    const extractStatValue = (stat: StatToDisplay): number | string => {
        // Handle background source (prejudice resistance)
        if (stat.source === 'background') {
            // First try background.prejudiceResistance (primary source)
            if (background?.prejudiceResistance !== undefined) {
                return background.prejudiceResistance;
            }

            // Fallback to otherstats
            if (otherstats) {
                for (const term of stat.searchTerms) {
                    let statString: string | undefined;
                    
                    if (Array.isArray(otherstats)) {
                        statString = otherstats.find(s =>
                            s.toLowerCase().includes(term.toLowerCase())
                        );
                    } else {
                        const matchingKey = Object.keys(otherstats).find(k =>
                            k.toLowerCase().includes(term.toLowerCase())
                        );
                        if (matchingKey) {
                            statString = `${matchingKey}: ${otherstats[matchingKey]}`;
                        }
                    }

                    if (statString) {
                        const percentMatch = statString.match(/(\d+)%/);
                        if (percentMatch) return parseInt(percentMatch[1]);
                    }
                }
            }

            return 0;
        }

        // Handle combat and other sources
        const source = stat.source === 'combat' ? combatstats : otherstats;
        if (!source) return 0;

        let statString: string | undefined;

        if (Array.isArray(source)) {
            for (const term of stat.searchTerms) {
                statString = source.find(s =>
                    s.toLowerCase().includes(term.toLowerCase())
                );
                if (statString) break;
            }
        } else {
            // Object case
            for (const term of stat.searchTerms) {
                const matchingKey = Object.keys(source).find(k =>
                    k.toLowerCase().includes(term.toLowerCase())
                );
                if (matchingKey) {
                    statString = `${matchingKey}: ${source[matchingKey]}`;
                    break;
                }
            }
        }

        if (statString) {
            // If it is a dice roll stat (like strength mod), we want the full value part (e.g. "1d4" or "1d100+30")
            if (stat.isDiceRoll) {
                // Extract part after colon
                const colonPart = statString.split(':')[1]?.trim();
                if (colonPart) return colonPart;
            }

            // Try to extract percentage first (e.g., "66%")
            const percentMatch = statString.match(/(\d+)%/);
            if (percentMatch) return parseInt(percentMatch[1]);

            // Try to extract number after colon (e.g., "Iniciativa y Reflejos: 55")
            const colonMatch = statString.split(':')[1]?.trim().match(/(\d+)/);
            if (colonMatch) return parseInt(colonMatch[1]);
        }

        return 0;
    };

    // Get stats with values
    const stats = statsToDisplay
        .map(stat => ({
            ...stat,
            value: extractStatValue(stat)
        }))
        .filter(stat => {
            if (typeof stat.value === 'number') return stat.value > 0;
            return stat.value !== "0" && stat.value !== "";
        });

    // Get initiative value for calculator
    const initiativeValue = (stats.find(s => s.label === 'Iniciativa y Reflejos')?.value as number) || 0;

    // Don't render if no stats
    if (stats.length === 0) return null;

    const handleStatClick = (stat: any) => {
        if (stat.isDiceRoll && typeof stat.value === 'string') {
            setDamageModal({
                isOpen: true,
                title: stat.label.toUpperCase(),
                diceString: stat.value
            });
        } else if (typeof stat.value === 'number') {
            setSelectedStat({ name: stat.label, value: stat.value });
        }
    };

    return (
        <div className="terminal-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="terminal-section-title" style={{ margin: 0 }}>OTRAS ESTADÍSTICAS</h3>
                {initiativeValue > 0 && (
                    <button
                        className="initiative-calc-btn"
                        onClick={() => setShowInitiativeCalculator(true)}
                        title="Calcular iniciativa"
                    >
                        🎲 Cálculo de Iniciativa
                    </button>
                )}
            </div>
            <div className="attributes-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="attribute-card clickable"
                        onClick={() => handleStatClick(stat)}
                    >
                        <div className="attribute-label">{stat.label.toUpperCase()}</div>
                        <div className="attribute-value">
                            {stat.value}
                            {(stat.source === 'other' || stat.source === 'background') && typeof stat.value === 'number' ? '%' : ''}
                        </div>
                    </div>
                ))}
            </div>

            {selectedStat && (
                <UnifiedRollModal
                    isOpen={!!selectedStat}
                    onClose={() => setSelectedStat(null)}
                    title={selectedStat.name}
                    targetValue={selectedStat.value}
                    initialMode="basic"
                    skillType="cac"
                />
            )}

            <InitiativeCalculatorModal
                isOpen={showInitiativeCalculator}
                onClose={() => setShowInitiativeCalculator(false)}
                baseInitiative={initiativeValue}
            />

            <DamageRollModal
                isOpen={damageModal.isOpen}
                onClose={() => setDamageModal({ ...damageModal, isOpen: false })}
                title={damageModal.title}
                diceString={damageModal.diceString}
            />
        </div>
    );
}
