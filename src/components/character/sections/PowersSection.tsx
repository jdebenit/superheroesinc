import React from 'react';
import {
    findPowerByNameOrId,
    calculatePowerSkillBase,
    getRankLevel
} from '../../../utils/calculations/powerCalculations';

interface PowersSectionProps {
    character: any;
}

export const PowersSection: React.FC<PowersSectionProps> = ({ character }) => {
    if (!character.powers?.selected || character.powers.selected.length === 0) return null;

    return (
        <div className="sheet-section powers">
            <div className="section-header">
                <h4>Poderes</h4>
            </div>
            <ul className="clean-list">
                {character.powers.selected.map((power: any, idx: number) => {
                    const powerData = findPowerByNameOrId(power.id || power.name);
                    if (!powerData) return null;

                    return (
                        <li key={`${power.id}-${idx}`} className="power-item">
                            <div className="power-row">
                                <span className="power-name">
                                    {powerData.name}
                                    {power.selectedOption && (
                                        <span className="power-option">
                                            ({power.selectedOption})
                                        </span>
                                    )}
                                </span>
                                <span className="flex-spacer-dotted"></span>
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
                            {power.customizations && power.customizations.length > 0 && (
                                <div className="power-customizations">
                                    {power.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`).join(', ')}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
