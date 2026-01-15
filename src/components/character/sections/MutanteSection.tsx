import React from 'react';
import { SEQUELS } from '../../../data/sequels';
import { SheetSection } from '../common/SheetSection';

interface MutanteSectionProps {
    character: any;
}

export const MutanteSection: React.FC<MutanteSectionProps> = ({ character }) => {
    if (!character.mutanteParams || !character.mutanteParams.sequels || character.mutanteParams.sequels.length === 0) return null;

    return (
        <SheetSection title="Mutante" className="mutante-params">
            <ul className="clean-list">
                <li className="sequels-container">
                    <span className="sequels-header mutante">Secuelas</span>
                    <ul className="sequels-list mutante">
                        {character.mutanteParams.sequels.map((s: any, idx: number) => {
                            const def = SEQUELS.find(d => d.id === s.id);
                            if (!def) return null;
                            return (
                                <li key={idx} className="sequel-item">
                                    <div className="sequel-name">
                                        {def.label} <span className="sequel-cost mutante">(-{def.cost} PC)</span>
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
                            )
                        })}
                    </ul>
                </li>
            </ul>
        </SheetSection>
    );
};
