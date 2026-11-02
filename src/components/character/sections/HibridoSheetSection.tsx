import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { SequelsList } from '../common/SequelsList';

interface HibridoSheetSectionProps {
    character: any;
}

export const HibridoSheetSection: React.FC<HibridoSheetSectionProps> = ({ character }) => {
    const sequels = character.hibridoParams?.sequels || [];
    if (sequels.length === 0) return null;

    return (
        <SheetSection title="Híbrido Mitológico" className="hibrido-params">
            <ul className="clean-list">
                <SequelsList sequels={sequels} variant="alterado" />
            </ul>
        </SheetSection>
    );
};
