import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { InfoCard } from '../common/InfoCard';

interface MagicObjectsSectionProps {
    magicObjects: any;
    magicTableRolls: string[];
}

export const MagicObjectsSection: React.FC<MagicObjectsSectionProps> = ({ magicObjects, magicTableRolls }) => {
    return (
        <>
            {/* Magic Objects (Normal) */}
            {magicObjects && magicObjects.items && magicObjects.items.length > 0 && (
                <SheetSection title="Objetos Mágicos" className="magic-objects">
                    <div className="preview-section-grid">
                        {magicObjects.items.map((item: any, i: number) => (
                            <InfoCard
                                key={i}
                                title={item.name}
                                theme="theme-magic"
                            >
                                <div className="magic-object-cost">
                                    <span className="magic-object-cost-label">Coste EM:</span> {item.em}
                                </div>
                                <div className="magic-object-desc">
                                    {item.description}
                                </div>
                            </InfoCard>
                        ))}
                    </div>
                </SheetSection>
            )}

            {/* Magic Objects Table (Terrano) */}
            {magicTableRolls && magicTableRolls.length > 0 && (
                <SheetSection title="Tabla de Objetos (Terrano)" className="magic-objects-terrano">
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
                                <InfoCard
                                    key={i}
                                    title={opt.label}
                                    theme="theme-magic-table magic-table-row"
                                >
                                    <div className="magic-table-cost">
                                        {opt.cost}
                                    </div>
                                </InfoCard>
                            );
                        })}
                    </div>
                </SheetSection>
            )}
        </>
    );
};
