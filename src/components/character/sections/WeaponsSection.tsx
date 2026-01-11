import React from 'react';

interface WeaponsSectionProps {
    weapons: any;
}

export const WeaponsSection: React.FC<WeaponsSectionProps> = ({ weapons }) => {
    if (!weapons || !weapons.items || weapons.items.length === 0) return null;

    return (
        <div className="sheet-section weapons">
            <div className="section-header">
                <h4>Armas</h4>
            </div>
            <div className="preview-section-grid">
                {weapons.items.map((item: any, i: number) => (
                    <div key={i} className="preview-card theme-weapon">
                        <div className="preview-card-title">{item.name}</div>
                        <div className="preview-stats-grid cols-2">
                            <div><span className="preview-stat-label">Daño:</span> {item.damage || '-'}</div>
                            <div><span className="preview-stat-label">DxA:</span> {item.dxa || '-'}</div>
                            <div><span className="preview-stat-label">CAR:</span> {item.car || '-'}</div>
                            {item.notes && <div className="preview-notes">{item.notes}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
