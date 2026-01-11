import React from 'react';

interface VehiclesSectionProps {
    vehicles: any;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({ vehicles }) => {
    if (!vehicles || !vehicles.items || vehicles.items.length === 0) return null;

    return (
        <div className="sheet-section vehicles">
            <div className="section-header">
                <h4>Vehículos</h4>
            </div>
            <div className="preview-section-grid">
                {vehicles.items.map((item: any, i: number) => (
                    <div key={i} className="preview-card theme-vehicle">
                        <div className="preview-card-title">{item.name}</div>
                        <div className="preview-stats-grid cols-2">
                            <div><span className="preview-stat-label">Blindaje:</span> {item.armor || '-'}</div>
                            <div><span className="preview-stat-label">PE:</span> {item.pe || '-'}</div>
                            <div><span className="preview-stat-label">Velocidad:</span> {item.speed || '-'}</div>
                            <div><span className="preview-stat-label">Autonomía:</span> {item.range || '-'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
