import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface SkillsGeneralSectionProps {
    character: any;
}

export const SkillsGeneralSection: React.FC<SkillsGeneralSectionProps> = ({ character }) => {
    // Debug logging
    console.log('SkillsGeneralSection - character:', character);
    console.log('SkillsGeneralSection - skills:', character?.skills);
    console.log('SkillsGeneralSection - generalItems:', character?.skills?.generalItems);

    if (!character.skills || !character.skills.generalItems || character.skills.generalItems.length === 0) return null;

    return (
        <SheetSection title="Habilidades Generales" className="skills-general">
            <ul className="clean-list">
                {character.skills.generalItems.map((item: any, i: number) => (
                    <li key={i} className="no-bullet-item skill-item">
                        <DetailRow
                            className="skill-row"
                            label={
                                <>
                                    <span className="skill-name">{item.name}</span>
                                    {item.math && <span className="skill-math">{item.math}</span>}
                                </>
                            }
                            value={<span className="skill-value">{item.value}</span>}
                            valueClassName=""
                        />
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
