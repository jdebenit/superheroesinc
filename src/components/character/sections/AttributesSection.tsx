import React from 'react';
import { SheetSection } from '../common/SheetSection';

interface AttributesSectionProps {
    character: any;
}

export const AttributesSection: React.FC<AttributesSectionProps> = ({ character }) => {
    if (!character.attributes || Object.keys(character.attributes.values).length === 0) return null;

    return (
        <SheetSection
            title="Características"
            className="attributes"
            cost={character.attributes.cost ? `(${character.attributes.cost} PCs)` : undefined}
        >
            <div className="attr-grid">
                {Object.entries(character.attributes.values).map(([key, value]: [string, any]) => (
                    <div key={key} className="attr-item">
                        <span className="attr-label">{key}</span>
                        <span className="attr-value">{value}</span>
                    </div>
                ))}
            </div>
        </SheetSection>
    );
};
