import React from 'react';

interface SkillsLearningSectionProps {
    character: any;
}

export const SkillsLearningSection: React.FC<SkillsLearningSectionProps> = ({ character }) => {
    if (!character.skills || !character.skills.specialItems || character.skills.specialItems.length === 0) return null;

    return (
        <div className="sheet-section skills-learning">
            <div className="section-header">
                <h4>Habilidades de Aprendizaje</h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {character.skills.specialItems.map((item: any, i: number) => (
                    <li key={i} className="no-bullet-item" style={{ marginBottom: '0.5rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                            <span style={{ paddingRight: '0.5rem' }}>
                                {item.name}
                                {item.math && <span style={{ fontSize: '0.7em', color: '#999', marginLeft: '0.5ch', fontFamily: 'monospace' }}>{item.math}</span>}
                            </span>
                            <span style={{
                                flexGrow: 1,
                                borderBottom: '1px dotted #ccc',
                                margin: '0 0.5rem',
                                position: 'relative',
                                top: '-4px',
                                minWidth: '20px'
                            }}></span>
                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                {item.value}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
