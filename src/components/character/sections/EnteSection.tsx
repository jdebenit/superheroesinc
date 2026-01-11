import React from 'react';
import { ENTE_FORMS, ENTE_EFFECTS } from '../../../components/wizard/steps/Step3_Especials/sections/EnteSection';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface EnteSectionProps {
    character: any;
}

export const EnteSection: React.FC<EnteSectionProps> = ({ character }) => {
    if (!character.enteParams || (!character.enteParams.formType && !character.enteParams.visualEffect)) return null;

    return (
        <SheetSection title="Ente" className="ente-params">
            <ul className="clean-list">
                {character.enteParams.formType && (() => {
                    const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                    return form && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Forma en el plano"
                                value={`${form.label} (${form.cost > 0 ? '+' : ''}${form.cost} PC)`}
                                valueClassName="value-highlight-brown"
                            />
                        </li>
                    );
                })()}
                {character.enteParams.visualEffect && (() => {
                    const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                    return effect && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Efecto visual"
                                value={`${effect.label} (${effect.cost > 0 ? '+' : ''}${effect.cost} PC)`}
                                valueClassName="value-highlight-brown"
                            />
                        </li>
                    );
                })()}
            </ul>
        </SheetSection>
    );
};
