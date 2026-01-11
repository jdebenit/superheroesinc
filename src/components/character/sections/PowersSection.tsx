import React from 'react';
import { POWERS } from '../../../data/powers';

interface PowersSectionProps {
    character: any;
}

const calculatePowerSkillBase = (char: any, formula: string): number => {
    if (!formula) return 0;
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        const fullKey = map[abbr];
        return char.attributes?.values?.[fullKey] || 0;
    };
    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)()) || 0;
    } catch (e) {
        return 0;
    }
};

export const PowersSection: React.FC<PowersSectionProps> = ({ character }) => {
    if (!character.powers?.selected || character.powers.selected.length === 0) return null;

    return (
        <div className="sheet-section powers">
            <div className="section-header">
                <h4>Poderes</h4>
            </div>
            <ul className="clean-list">
                {character.powers.selected.map((power: any, idx: number) => {
                    const powerData = POWERS.find(p => p.id === power.id);
                    if (!powerData) return null;

                    const getRankLevel = (rank: number) => {
                        if (rank <= 20) return 'Bajo';
                        if (rank <= 40) return 'Medio';
                        if (rank <= 70) return 'Elevado';
                        if (rank <= 95) return 'Alto';
                        return 'Cósmico';
                    };

                    return (
                        <li key={`${power.id}-${idx}`} className="power-item">

                            <div className="power-row">
                                <span className="power-name-container">
                                    <span className="power-name">
                                        {powerData.name}
                                        {power.selectedOption && (
                                            <span className="power-option">
                                                ({power.selectedOption})
                                            </span>
                                        )}
                                    </span>
                                    {power.customizations && power.customizations.length > 0 && (
                                        <div className="power-customizations">
                                            {power.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`).join(', ')}
                                        </div>
                                    )}
                                </span>
                                <span style={{
                                    flexGrow: 1,
                                    borderBottom: '1px dotted #ccc',
                                    margin: '0 0.5rem',
                                    position: 'relative',
                                    top: '-4px',
                                    minWidth: '20px'
                                }}></span>
                                <span className="power-rank">
                                    {!powerData.characteristic ? (
                                        <>
                                            {getRankLevel(power.rank)} <span className="power-rank-value">({power.rank})</span>
                                        </>
                                    ) : (
                                        <>Mod: +{power.powerMod || 0}</>
                                    )}
                                </span>
                                {powerData.skillCalc && (
                                    <span className="power-skill-value">
                                        {power.skillValue || calculatePowerSkillBase(character, powerData.skillCalc)}%
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
