import React from 'react';
import { SKILL_CATEGORIES, isSkillAllowed } from '../../../../../data/specialSkills';
import { WizardButton } from '../../../shared/ui/WizardButton';
import './AvailableSkillsSection.css';

interface AvailableSkillsSectionProps {
    skillsByCategory: { [category: string]: any[] };
    originItems: any[];
    characterData?: any;
    selectedSkills: { [skillId: string]: any };
    skillBaseCost: number;
    onAddSkill: (skillId: string) => void;
    onAddSpecifiedSkill: (skillId: string) => void;
}



export const AvailableSkillsSection: React.FC<AvailableSkillsSectionProps> = ({
    skillsByCategory,
    originItems,
    characterData,
    selectedSkills,
    skillBaseCost,
    onAddSkill,
    onAddSpecifiedSkill
}) => {
    return (
        <div>
            <h3 className="available-skills-title">
                Habilidades Disponibles
            </h3>

            {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="skill-category-container">
                    <h4 className="skill-category-title">
                        {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]}
                    </h4>

                    <div className="available-skills-list">
                        {skills.filter(skill => isSkillAllowed(skill, originItems, characterData)).map(skill => {
                            const isSelected = selectedSkills[skill.id] !== undefined;
                            const isParametrizable = skill.requiresSpecification;
                            const displayCost = `${skillBaseCost} PC`;

                            if (isParametrizable) {
                                return (
                                    <div key={skill.id} className="available-skill-item">
                                        <div className="available-skill-info">
                                            <strong>{skill.name}</strong>
                                            {skill.description && (
                                                <span className="available-skill-description">
                                                    ({skill.description})
                                                </span>
                                            )}
                                        </div>
                                        <span className="available-skill-formula">
                                            {skill.formulaText}
                                        </span>
                                        <WizardButton
                                            variant="primary"
                                            onClick={() => onAddSpecifiedSkill(skill.id)}
                                            className="add-btn-style"
                                        >
                                            + Añadir ({displayCost})
                                        </WizardButton>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={skill.id} className={`available-skill-item ${isSelected ? 'selected' : ''}`}>
                                        <div className="available-skill-info">
                                            <strong>{skill.name}</strong>
                                            {skill.description && (
                                                <span className="available-skill-description">
                                                    ({skill.description})
                                                </span>
                                            )}
                                        </div>
                                        <span className="available-skill-formula">
                                            {skill.formulaText}
                                        </span>
                                        {!isSelected ? (
                                            <WizardButton
                                                variant="primary"
                                                onClick={() => onAddSkill(skill.id)}
                                                className="add-btn-style"
                                            >
                                                + Añadir ({displayCost})
                                            </WizardButton>
                                        ) : (
                                            <span className="selected-indicator">
                                                ✓ Seleccionada
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

