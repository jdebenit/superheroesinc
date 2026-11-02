import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { SequelsList } from '../common/SequelsList';

interface MutanteSectionProps {
    character: any;
}

export const MutanteSection: React.FC<MutanteSectionProps> = ({ character }) => {
    if (!character.mutanteParams?.sequels || character.mutanteParams.sequels.length === 0) return null;

    return (
        <SheetSection title="Mutante" className="mutante-params">
            <ul className="clean-list">
                <SequelsList sequels={character.mutanteParams.sequels} variant="mutante" />
            </ul>
        </SheetSection>
    );
};
