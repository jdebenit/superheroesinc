import React from 'react';
import { TERRANO_TABLE_OPTIONS } from '../../../utils/calculations/magicCalculations';
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
                            const opt = TERRANO_TABLE_OPTIONS.find(o => o.id === rollId);
                            const label = opt?.label || rollId;
                            const costText = opt?.costText || '';

                            return (
                                <InfoCard
                                    key={i}
                                    title={label}
                                    theme="theme-magic-table magic-table-row"
                                >
                                    <div className="magic-table-cost">
                                        {costText}
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
