import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { InfoCard } from '../common/InfoCard';

interface VehiclesSectionProps {
    vehicles: any;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({ vehicles }) => {
    if (!vehicles || !vehicles.items || vehicles.items.length === 0) return null;

    return (
        <SheetSection title="Vehículos" className="vehicles">
            <div className="preview-section-grid">
                {vehicles.items.map((item: any, i: number) => (
                    <InfoCard
                        key={i}
                        title={item.name}
                        theme="theme-vehicle"
                        cols={2}
                        stats={[
                            { label: 'Blindaje:', value: item.armor || '-' },
                            { label: 'PE:', value: item.pe || '-' },
                            { label: 'Velocidad:', value: item.speed || '-' },
                            { label: 'Autonomía:', value: item.range || '-' },
                            { label: 'Maniobrabilidad:', value: item.maneuverability != null ? String(item.maneuverability) : '-' },
                        ]}
                    />
                ))}
            </div>
        </SheetSection>
    );
};
