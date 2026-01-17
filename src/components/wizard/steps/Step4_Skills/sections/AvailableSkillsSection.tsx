import React from 'react';
import { SKILL_CATEGORIES } from '../../../../../data/specialSkills';
import { WizardButton } from '../../../shared/WizardButton';

interface AvailableSkillsSectionProps {
    skillsByCategory: { [category: string]: any[] };
    originItems: any[];
    selectedSkills: { [skillId: string]: any };
    skillBaseCost: number;
    onAddSkill: (skillId: string) => void;
    onAddSpecifiedSkill: (skillId: string) => void;
}

const isSkillAllowed = (skill: any, originItems: any[]) => {
    if (!skill.allowedCriteria || skill.allowedCriteria.length === 0) return true;

    return skill.allowedCriteria.some((criteria: any) => {
        if (criteria.origin) {
            const hasOrigin = originItems.some(item => Object.keys(item)[0] === criteria.origin);
            if (!hasOrigin) return false;
        }

        if (criteria.subtype) {
            const hasSubtype = originItems.some(item => {
                const originName = Object.keys(item)[0];
                const subtypes = item[originName];
                return Array.isArray(subtypes) && subtypes.includes(criteria.subtype);
            });
            if (!hasSubtype) return false;
        }

        return true;
    });
};

export const AvailableSkillsSection: React.FC<AvailableSkillsSectionProps> = ({
    skillsByCategory,
    originItems,
    selectedSkills,
    skillBaseCost,
    onAddSkill,
    onAddSpecifiedSkill
}) => {
    return (
        <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>
                Habilidades Disponibles
            </h3>

            {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        marginBottom: '0.75rem',
                        color: '#374151',
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '0.5rem'
                    }}>
                        {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]}
                    </h4>

                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        padding: '1rem',
                        border: '1px solid #e5e7eb'
                    }}>
                        {skills.filter(skill => isSkillAllowed(skill, originItems)).map(skill => {
                            const isSelected = selectedSkills[skill.id] !== undefined;
                            const isParametrizable = skill.requiresSpecification;
                            const displayCost = `${skillBaseCost} PC`;

                            if (isParametrizable) {
                                return (
                                    <div key={skill.id} style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid #e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <strong>{skill.name}</strong>
                                            {skill.description && (
                                                <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                                    ({skill.description})
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                            {skill.formulaText}
                                        </span>
                                        <WizardButton
                                            variant="primary"
                                            onClick={() => onAddSpecifiedSkill(skill.id)}
                                            style={{ backgroundColor: '#10b981' }}
                                        >
                                            + Añadir ({displayCost})
                                        </WizardButton>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={skill.id} style={{
                                        padding: '0.75rem',
                                        borderBottom: '1px solid #e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        opacity: isSelected ? 0.5 : 1
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <strong>{skill.name}</strong>
                                            {skill.description && (
                                                <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                                    ({skill.description})
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                            {skill.formulaText}
                                        </span>
                                        {!isSelected ? (
                                            <WizardButton
                                                variant="primary"
                                                onClick={() => onAddSkill(skill.id)}
                                                style={{ backgroundColor: '#10b981' }}
                                            >
                                                + Añadir ({displayCost})
                                            </WizardButton>
                                        ) : (
                                            <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
