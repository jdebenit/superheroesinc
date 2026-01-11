import React from 'react';
import { SheetSection } from '../common/SheetSection';

interface EquipmentSectionProps {
    equipment: any;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({ equipment }) => {
    if (!equipment || !equipment.items || equipment.items.length === 0) return null;

    return (
        <SheetSection
            title="Equipamiento"
            className="equipment"
            cost={equipment.cost ? `(${equipment.cost} PCs)` : undefined}
        >
            <ul>
                {equipment.items.map((item: any, i: number) => (
                    <li key={i}>
                        <strong>{item.name}</strong>
                        {item.notes && <span>: {item.notes}</span>}
                    </li>
                ))}
            </ul>
        </SheetSection>
    );
};
