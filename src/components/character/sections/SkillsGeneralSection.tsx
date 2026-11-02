import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';
import { applyLevelModsToSkillItems } from '../../../utils/characterCalculations';

interface SkillsGeneralSectionProps {
    character: any;
    items?: any[];
}

export const SkillsGeneralSection: React.FC<SkillsGeneralSectionProps> = ({ character, items: precalculatedItems }) => {
    const resolvedItems = precalculatedItems || (
        character?.skills?.generalItems?.length
            ? applyLevelModsToSkillItems(
                character.skills.generalItems,
                character.level,
                character.modPerLevel
            )
            : []
    );

    if (!resolvedItems || resolvedItems.length === 0) return null;

    return (
        <SheetSection title="Habilidades Generales" className="skills-general">
            <ul className="clean-list">
                {resolvedItems.map((item: any, i: number) => (
                    <li key={i} className="no-bullet-item skill-item">
                        <DetailRow
                            className="skill-row"
                            label={
                                <>
                                    <span className="skill-name">{item.name}</span>
                                    {item.math && <span className="skill-math">{item.math}</span>}
                                </>
                            }
                            value={
                                <span
                                    className="skill-value"
                                    title={item.levelBonus ? `Base: ${item.baseValue} | Nivel: +${item.levelBonus}%` : undefined}
                                >
                                    {item.value}
                                </span>
                            }
                            valueClassName=""
                        />
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
