import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import { GENERAL_SKILLS } from '../../../data/generalSkills';
import { SPECIAL_SKILLS } from '../../../data/specialSkills';

interface SkillItem {
    name: string;
    value: number | string;
    math?: string;
    id?: string;
    category?: string;
    [key: string]: any;
}

interface SkillsPanelProps {
    generalSkills?: SkillItem[];
    learningSkills?: SkillItem[];
    onSkillClick?: (skill: SkillItem) => void;
}

export default function SkillsPanel({ generalSkills, learningSkills, onSkillClick }: SkillsPanelProps) {
    // const [selectedSkill, setSelectedSkill] = useState<{ name: string; value: number } | null>(null);

    const handleSkillClick = (skill: SkillItem) => {
        if (onSkillClick) {
            onSkillClick(skill);
        }
    };

    if ((!generalSkills || generalSkills.length === 0) && (!learningSkills || learningSkills.length === 0)) return null;

    return (
        <div className="terminal-section">
            {generalSkills && generalSkills.length > 0 && (
                <>
                    <h3 className="terminal-section-title">HABILIDADES GENERALES</h3>
                    <div className="attributes-grid skills-grid">
                        {generalSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="attribute-card clickable skill-card"
                                onClick={() => handleSkillClick(skill)}
                            >
                                <div className="attribute-label skill-label">{skill.name.toUpperCase()}</div>
                                <div className="attribute-value skill-value">{skill.value}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {learningSkills && learningSkills.length > 0 && (
                <>
                    <h3 className="terminal-section-title" style={{ marginTop: '2rem' }}>HABILIDADES DE APRENDIZAJE</h3>
                    <div className="attributes-grid skills-grid">
                        {learningSkills.map((skill, index) => (
                            <div
                                key={index}
                                className="attribute-card clickable skill-card"
                                onClick={() => handleSkillClick(skill)}
                            >
                                <div className="attribute-label skill-label">{skill.name.toUpperCase()}</div>
                                <div className="attribute-value skill-value">{skill.value}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
