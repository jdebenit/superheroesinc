import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { InfoCard } from '../common/InfoCard';

interface WeaponsSectionProps {
    weapons: any;
}

export const WeaponsSection: React.FC<WeaponsSectionProps> = ({ weapons }) => {
    if (!weapons || !weapons.items || weapons.items.length === 0) return null;

    return (
        <SheetSection title="Armas" className="weapons">
            <div className="preview-section-grid">
                {weapons.items.map((item: any, i: number) => (
                    <InfoCard
                        key={i}
                        title={item.name}
                        theme="theme-weapon"
                        cols={2}
                        stats={[
                            { label: 'Daño:', value: item.damage || '-' },
                            { label: 'DxA:', value: item.dxa || '-' },
                            { label: 'CAR:', value: item.car || '-' },
                        ]}
                        notes={item.notes}
                    />
                ))}
            </div>
        </SheetSection>
    );
};
