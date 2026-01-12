import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface SkillsLearningSectionProps {
    character: any;
}

export const SkillsLearningSection: React.FC<SkillsLearningSectionProps> = ({ character }) => {
    if (!character.skills || !character.skills.specialItems || character.skills.specialItems.length === 0) return null;

    return (
        <SheetSection title="Habilidades de Aprendizaje" className="skills-learning">
            <ul className="clean-list">
                {character.skills.specialItems.map((item: any, i: number) => (
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

// Re-writing the component effectively to ensure I match strictly.
// The original used:
// <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}> ... </div>
// DetailRow uses:
// <div className={className} style={className === 'flex-row-baseline' ? {} : { display: 'flex', alignItems: 'baseline', width: '100%' }}>
// So if I pass className "flex-row-baseline", it uses class. If I pass something else (or nothing and default is flex-row-baseline).
// The original had specific inline styles for the value: { fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }
// This matches .value-highlight-brown usually, but let's be precise.

export const SkillsLearningSectionRefactored: React.FC<SkillsLearningSectionProps> = ({ character }) => {
    if (!character.skills || !character.skills.specialItems || character.skills.specialItems.length === 0) return null;

    return (
        <SheetSection title="Habilidades de Aprendizaje" className="skills-learning">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {character.skills.specialItems.map((item: any, i: number) => (
                    <li key={i} className="no-bullet-item" style={{ marginBottom: '0.5rem', position: 'relative' }}>
                        <DetailRow
                            label={
                                <>
                                    {item.name}
                                    {item.math && <span style={{ fontSize: '0.7em', color: '#999', marginLeft: '0.5ch', fontFamily: 'monospace' }}>{item.math}</span>}
                                </>
                            }
                            value={
                                <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                    {item.value}
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
