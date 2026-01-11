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
                                        {def.description}
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
