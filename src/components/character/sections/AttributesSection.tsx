import React from 'react';

interface AttributesSectionProps {
    character: any;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({ character }) => {
    if (!character.attributes || Object.keys(character.attributes.values).length === 0) return null;

    return (
        <div className="sheet-section attributes">
            <div className="section-header">
                <h4>Características</h4>
                {character.attributes.cost && <span className="cost">({character.attributes.cost} PCs)</span>}
            </div>
            <div className="attr-grid">
                {Object.entries(character.attributes.values).map(([key, value]: [string, any]) => (
                    <div key={key} className="attr-item">
                        <span className="attr-label">{key}</span>
                        <span className="attr-value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
