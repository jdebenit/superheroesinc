import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';
import { applyLevelModsToSkillItems } from '../../../utils/characterCalculations';

interface SkillsLearningSectionProps {
    character: any;
    items?: any[];
}

export const SkillsLearningSection: React.FC<SkillsLearningSectionProps> = ({ character, items: precalculatedItems }) => {
    const resolvedItems = precalculatedItems || (
        character?.skills?.specialItems?.length
            ? applyLevelModsToSkillItems(
                character.skills.specialItems,
                character.level,
                character.modPerLevel
            )
            : []
    );

    if (!resolvedItems || resolvedItems.length === 0) return null;

    return (
        <SheetSection title="Habilidades de Aprendizaje" className="skills-learning">
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
