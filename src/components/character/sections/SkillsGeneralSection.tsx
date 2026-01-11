import React from 'react';

interface SkillsGeneralSectionProps {
    character: any;
}

export const SkillsGeneralSection: React.FC<SkillsGeneralSectionProps> = ({ character }) => {
    if (!character.skills || !character.skills.generalItems || character.skills.generalItems.length === 0) return null;

    return (
        <div className="sheet-section skills-general">
            <div className="section-header">
                <h4>Habilidades Generales</h4>
            </div>
            <ul className="clean-list">
                {character.skills.generalItems.map((item: any, i: number) => (
                    <li key={i} className="no-bullet-item skill-item">
                        <div className="skill-row">
                            <span className="skill-name">
                                {item.name}
                                {item.math && <span className="skill-math">{item.math}</span>}
                            </span>
                            <span className="flex-spacer-dotted"></span>
                            <span className="skill-value">
                                {item.value}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
