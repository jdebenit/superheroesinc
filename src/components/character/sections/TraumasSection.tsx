import React from 'react';

interface TraumasSectionProps {
    character: any;
}

export const TraumasSection: React.FC<TraumasSectionProps> = ({ character }) => {
    if (!character.traumas || Object.keys(character.traumas).length === 0) return null;

    return (
        <div className="sheet-section traumas">
            <div className="section-header">
                <h4>Traumas</h4>
            </div>
            <ul className="clean-list">
                {Object.entries(character.traumas).map(([specialty, trauma]: [string, any], idx: number) => (
                    <li key={idx} className="trauma-item">
                        <div className="trauma-header">
                            {specialty}
                        </div>
                        <div className="trauma-description">
                            "{trauma}"
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
