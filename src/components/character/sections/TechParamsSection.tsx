import React from 'react';
import { INCOME_SOURCES } from '../../../data/technologicalOptions';
import { SheetSection } from '../common/SheetSection';

interface TechParamsSectionProps {
    character: any;
}

export const TechParamsSection: React.FC<TechParamsSectionProps> = ({ character }) => {
    const hasTechOrigin = character.origin?.items?.some((i: any) => Object.keys(i)[0] === 'Tecnológico');
    if (!hasTechOrigin) return null;

    const incomeSourceId = character.techParams?.incomeSource;
    if (!incomeSourceId) return null;

    const source = INCOME_SOURCES.find(s => s.id === incomeSourceId);
    if (!source) return null;

    return (
        <SheetSection
            title="Financiación de Tecnología"
            className="tech-params"
            cost={<span>({source.pc} PCs)</span>}
        >
            <div className="tech-params-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div className="origin-detail-row" style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                    <span className="origin-detail-label" style={{ fontWeight: 'bold', color: '#8B4513', paddingRight: '0.5rem' }}>
                        Fuente de ingresos:
                    </span>
                    <span className="flex-spacer-dotted" style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', alignSelf: 'stretch', height: '1em' }}></span>
                    <span className="origin-detail-value" style={{ fontWeight: 'bold' }}>
                        {source.label}
                    </span>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#666', fontStyle: 'italic', lineHeight: '1.4' }}>
                    {source.description}
                </p>
            </div>
        </SheetSection>
    );
};
