import React from 'react';
import {
    findSpellByNameOrId,
    normalizeCharacterSpells,
    getCharacterMaxEM
} from '../../../utils/calculations/magicCalculations';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface SpellsSectionProps {
    character: any;
}

export const SpellsSection: React.FC<SpellsSectionProps> = ({ character }) => {
    const selectedSpells = (character.spells?.selected && character.spells.selected.length > 0)
        ? character.spells.selected
        : normalizeCharacterSpells(character.spells);

    if (selectedSpells.length === 0) return null;

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
                    const calculatedEM = getCharacterMaxEM(character, character.powers?.selected || []);
                    if (calculatedEM <= 0 && character.spells?.emFormula?.divisor === 0) return null;

                    return (
                        <span className="cost spells-em-cost">
                            ({calculatedEM} EM)
                        </span>
                    );
                })()}
            </div>
            <ul className="clean-list">
                {selectedSpells.map((spell: any, idx: number) => {
                    const spellData = findSpellByNameOrId(spell.id || spell.name);
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
