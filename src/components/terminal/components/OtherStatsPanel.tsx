import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import UnifiedRollModal from './UnifiedRollModal';
import InitiativeCalculatorModal from './InitiativeCalculatorModal';

interface OtherStatsPanelProps {
    combatstats?: string[];
    otherstats?: string[];
    background?: {
        prejudiceResistance?: number;
        [key: string]: any;
    };
}

interface StatToDisplay {
    label: string;
    value: number;
    searchTerms: string[];
    source: 'combat' | 'other' | 'background';
}

export default function OtherStatsPanel({ combatstats, otherstats, background }: OtherStatsPanelProps) {
    const [selectedStat, setSelectedStat] = useState<{
        name: string;
        value: number;
    } | null>(null);

    const [showInitiativeCalculator, setShowInitiativeCalculator] = useState(false);

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
        }
    ];

    // Extract stat values
    const extractStatValue = (stat: StatToDisplay): number => {
        // Handle background source (prejudice resistance)
        if (stat.source === 'background') {
            // First try background.prejudiceResistance (primary source)
            if (background?.prejudiceResistance !== undefined) {
                return background.prejudiceResistance;
            }

            // Fallback to otherstats
            if (otherstats) {
                for (const term of stat.searchTerms) {
                    const statString = otherstats.find(s =>
                        s.toLowerCase().includes(term.toLowerCase())
                    );

                    if (statString) {
                        const percentMatch = statString.match(/(\d+)%/);
                        if (percentMatch) return parseInt(percentMatch[1]);
                    }
                }
            }

            return 0;
        }

        // Handle combat and other sources
        const sourceArray = stat.source === 'combat' ? combatstats : otherstats;
        if (!sourceArray) return 0;

        for (const term of stat.searchTerms) {
            const statString = sourceArray.find(s =>
                s.toLowerCase().includes(term.toLowerCase())
            );

            if (statString) {
                // Try to extract percentage first (e.g., "66%")
                const percentMatch = statString.match(/(\d+)%/);
                if (percentMatch) return parseInt(percentMatch[1]);

                // Try to extract number after colon (e.g., "Iniciativa y Reflejos: 55")
                const colonMatch = statString.split(':')[1]?.trim().match(/(\d+)/);
                if (colonMatch) return parseInt(colonMatch[1]);
            }
        }

        return 0;
    };

    // Get stats with values
    const stats = statsToDisplay
        .map(stat => ({
            ...stat,
            value: extractStatValue(stat)
        }))
        .filter(stat => stat.value > 0);

    // Get initiative value for calculator
    const initiativeValue = stats.find(s => s.label === 'Iniciativa y Reflejos')?.value || 0;

    // Don't render if no stats
    if (stats.length === 0) return null;

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
                        onClick={() => setSelectedStat({ name: stat.label, value: stat.value })}
                    >
                        <div className="attribute-label">{stat.label.toUpperCase()}</div>
                        <div className="attribute-value">{stat.value}{(stat.source === 'other' || stat.source === 'background') ? '%' : ''}</div>
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
        </div>
    );
}
