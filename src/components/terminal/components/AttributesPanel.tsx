import React, { useState } from 'react';
import '../TacticPlayerTerminal.css';
import AttributeRollModal from './AttributeRollModal';

interface AttributesPanelProps {
    attributes: {
        [key: string]: number;
    };
}

export default function AttributesPanel({ attributes }: AttributesPanelProps) {
    const [selectedAttribute, setSelectedAttribute] = useState<{ name: string; value: number } | null>(null);

    // Order of display
    const orderedKeys = [
        'Fuerza',
        'Agilidad',
        'Constitución',
        'Inteligencia',
        'Intuición',
        'Carisma',
        'Voluntad'
    ];

    const handleAttributeClick = (key: string, value: number) => {
        setSelectedAttribute({ name: key, value });
    };

    return (
        <div className="terminal-section">
            <h3 className="terminal-section-title">CARACTERÍSTICAS</h3>
            <div className="attributes-grid">
                {orderedKeys.map(key => (
                    <div
                        key={key}
                        className="attribute-card clickable"
                        onClick={() => handleAttributeClick(key, attributes[key] || 0)}
                    >
                        <div className="attribute-label">{key.toUpperCase()}</div>
                        <div className="attribute-value">{attributes[key] || 0}</div>
                    </div>
                ))}
            </div>

            {selectedAttribute && (
                <AttributeRollModal
                    isOpen={!!selectedAttribute}
                    onClose={() => setSelectedAttribute(null)}
                    attributeName={selectedAttribute.name}
                    attributeValue={selectedAttribute.value}
                />
            )}
        </div>
    );
}
