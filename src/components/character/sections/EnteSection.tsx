import React from 'react';
import { ENTE_FORMS, ENTE_EFFECTS } from '../../../components/wizard/steps/Step3_Especials/sections/EnteSection';

interface EnteSectionProps {
    character: any;
}

export const EnteSection: React.FC<EnteSectionProps> = ({ character }) => {
    if (!character.enteParams || (!character.enteParams.formType && !character.enteParams.visualEffect)) return null;

    return (
        <div className="sheet-section ente-params">
            <div className="section-header">
                <h4>Ente</h4>
            </div>
            <ul className="clean-list">
                {character.enteParams.formType && (() => {
                    const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                    return form && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="ente-label">Forma en el plano</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="value-highlight-brown">
                                    {form.label} ({form.cost > 0 ? '+' : ''}{form.cost} PC)
                                </span>
                            </div>
                        </li>
                    );
                })()}
                {character.enteParams.visualEffect && (() => {
                    const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                    return effect && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="ente-label">Efecto visual</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="value-highlight-brown">
                                    {effect.label} ({effect.cost > 0 ? '+' : ''}{effect.cost} PC)
                                </span>
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </div>
    );
};
