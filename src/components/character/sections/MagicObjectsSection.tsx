import React from 'react';

interface MagicObjectsSectionProps {
    magicObjects: any;
    magicTableRolls: string[];
}

export const MagicObjectsSection: React.FC<MagicObjectsSectionProps> = ({ magicObjects, magicTableRolls }) => {
    return (
        <>
            {/* Magic Objects (Normal) */}
            {magicObjects && magicObjects.items && magicObjects.items.length > 0 && (
                <div className="sheet-section magic-objects">
                    <div className="section-header">
                        <h4>Objetos Mágicos</h4>
                    </div>
                    <div className="preview-section-grid">
                        {magicObjects.items.map((item: any, i: number) => (
                            <div key={i} className="preview-card theme-magic">
                                <div className="preview-card-title">{item.name}</div>
                                <div className="magic-object-cost">
                                    <span className="magic-object-cost-label">Coste EM:</span> {item.em}
                                </div>
                                <div className="magic-object-desc">
                                    {item.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Magic Objects Table (Terrano) */}
            {magicTableRolls && magicTableRolls.length > 0 && (
                <div className="sheet-section magic-objects-terrano">
                    <div className="section-header">
                        <h4>Tabla de Objetos (Terrano)</h4>
                    </div>
                    <div className="preview-section-grid">
                        {magicTableRolls.map((rollId: string, i: number) => {
                            const options = [
                                { id: '180_EM', label: 'Acceso a objetos de 180 EM', cost: '+1 PC' },
                                { id: '120_EM', label: 'Acceso a objetos de 120 EM', cost: '+0 PC' },
                                { id: '60_EM', label: 'Acceso a objetos de 60 EM', cost: '-1 PC' },
                                { id: 'none', label: 'Ningún objeto', cost: '-2 PC' },
                                { id: 'guardian_power', label: 'Acceso a Poder de Guardián', cost: '+2 PC' },
                            ];
                            const opt = options.find(o => o.id === rollId) || { label: rollId, cost: '' };

                            return (
                                <div key={i} className="preview-card theme-magic-table magic-table-row">
                                    <div className="preview-card-title magic-table-title">{opt.label}</div>
                                    <div className="magic-table-cost">
                                        {opt.cost}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
};
