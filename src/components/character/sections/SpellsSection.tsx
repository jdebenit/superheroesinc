import React from 'react';
import { SPELLS } from '../../../data/spells';
import { calculateEM, hasSubtype } from '../../../components/wizard/steps/Step3_Especials/utils';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface SpellsSectionProps {
    character: any;
}

export const SpellsSection: React.FC<SpellsSectionProps> = ({ character }) => {
    if (!character.spells?.selected || character.spells.selected.length === 0) return null;

    return (
        <SheetSection title="Hechizos" className="spells">
            <div className="section-subheader" style={{ marginTop: '-10px', marginBottom: '10px' }}>
                {(() => {
                    // 1. Try to use stored value
                    if (character.spells?.calculatedEM !== undefined) {
                        return (
                            <span className="cost spells-em-cost">
                                ({character.spells.calculatedEM} EM)
                            </span>
                        );
                    }

                    // 2. Fallback: Calculate Base EM
                    const isMago = hasSubtype(character, 'Arcano', 'Mago');
                    // Default to 4 if not set, unless Mago (1)
                    let divisor = character.spells?.emFormula?.divisor || 4;
                    if (isMago) divisor = 1;

                    if (divisor === 0) return null;

                    const calculatedEM = calculateEM(character, character.powers?.selected || [], divisor);

                    return (
                        <span className="cost spells-em-cost">
                            ({calculatedEM} EM)
                        </span>
                    );
                })()}
            </div>
            <ul className="clean-list">
                {character.spells.selected.map((spell: any, idx: number) => {
                    const spellData = SPELLS.find(s => s.id === spell.id);
                    if (!spellData) return null;

                    const maxRank = spellData.maxRank || 1;
                    const rankDisplay = spell.rank > maxRank
                        ? `Maestría (${spell.rank})`
                        : `Rango ${spell.rank}`;

                    return (
                        <li key={`${spell.id}-${idx}`} className="spell-item">
                            <DetailRow
                                label={
                                    <span className="spell-name">
                                        {spellData.name}
                                        {spell.selectedOption && (
                                            <span className="spell-option">
                                                ({spell.selectedOption})
                                            </span>
                                        )}
                                    </span>
                                }
                                value={
                                    <span className={`spell-rank ${spell.rank > maxRank ? 'master' : 'normal'}`}>
                                        {rankDisplay}
                                    </span>
                                }
                            />
                        </li>
                    );
                })}
            </ul>
        </SheetSection>
    );
};
