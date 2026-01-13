import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import AttributeRollModal from './AttributeRollModal';

interface SkillItem {
    name: string;
    value: number | string;
    math?: string;
}

interface SkillsPanelProps {
    skills: SkillItem[];
}

export default function SkillsPanel({ skills }: SkillsPanelProps) {
    const [selectedSkill, setSelectedSkill] = useState<{ name: string; value: number } | null>(null);

    const handleSkillClick = (name: string, value: number | string) => {
        // Parse value if it's a string (e.g. "45%")
        let numericValue = typeof value === 'number' ? value : parseInt(value.toString().replace('%', ''));
        if (isNaN(numericValue)) numericValue = 0;

        setSelectedSkill({ name, value: numericValue });
    };

    if (!skills || skills.length === 0) return null;

    return (
        <div className="terminal-section">
            <h3 className="terminal-section-title">HABILIDADES</h3>
            <div className="attributes-grid skills-grid">
                {skills.map((skill, index) => (
                    <div
                        key={index}
                        className="attribute-card clickable skill-card"
                        onClick={() => handleSkillClick(skill.name, skill.value)}
                    >
                        <div className="attribute-label skill-label">{skill.name.toUpperCase()}</div>
                        <div className="attribute-value skill-value">{skill.value}</div>
                    </div>
                ))}
            </div>

            {selectedSkill && (
                <AttributeRollModal
                    isOpen={!!selectedSkill}
                    onClose={() => setSelectedSkill(null)}
                    attributeName={selectedSkill.name}
                    attributeValue={selectedSkill.value}
                />
            )}
        </div>
    );
}
