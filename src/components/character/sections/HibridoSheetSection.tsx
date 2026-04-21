import React from 'react';
import { SEQUELS } from '../../../data/sequels';
import { SheetSection } from '../common/SheetSection';

interface HibridoSheetSectionProps {
    character: any;
}

export const HibridoSheetSection: React.FC<HibridoSheetSectionProps> = ({ character }) => {
    const sequels: any[] = character.hibridoParams?.sequels || [];
    if (sequels.length === 0) return null;

    return (
        <SheetSection title="Híbrido Mitológico" className="hibrido-params">
            <ul className="clean-list">
                <li className="sequels-container">
                    <span className="sequels-header alterado">Secuelas</span>
                    <ul className="sequels-list alterado">
                        {sequels.map((s: any, idx: number) => {
                            const def = SEQUELS.find(d => d.id === s.id);
                            if (!def) return null;
                            return (
                                <li key={idx} className="sequel-item">
                                    <div className="sequel-name">
                                        {def.label} <span className="sequel-cost alterado">(-{def.cost} PC)</span>
                                    </div>
                                    <div className="sequel-description">
                                        {s.description ? (
                                            <>
                                                <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '0.25rem' }}>{s.description}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#666' }}>({def.description})</span>
                                            </>
                                        ) : def.description}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            </ul>
        </SheetSection>
    );
};
