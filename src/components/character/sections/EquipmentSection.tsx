import React from 'react';

interface EquipmentSectionProps {
    equipment: any;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({ equipment }) => {
    if (!equipment || !equipment.items || equipment.items.length === 0) return null;

    return (
        <div className="sheet-section equipment">
            <div className="section-header">
                <h4>Equipamiento</h4>
                {equipment.cost && <span className="cost">({equipment.cost} PCs)</span>}
            </div>
            <ul>
                {equipment.items.map((item: any, i: number) => (
                    <li key={i}>
                        <strong>{item.name}</strong>
                        {item.notes && <span>: {item.notes}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
