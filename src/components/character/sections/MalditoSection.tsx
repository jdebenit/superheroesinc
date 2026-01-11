import React from 'react';
import { MALDITO_DATA } from '../../../components/wizard/steps/Step3_Especials/sections/MalditoSection';

interface MalditoSectionProps {
    character: any;
}

export const MalditoSection: React.FC<MalditoSectionProps> = ({ character }) => {
    if (!character.malditoParams || (!character.malditoParams.magnitude && !character.malditoParams.source)) return null;

    return (
        <div className="sheet-section maldito-params">
            <div className="section-header">
                <h4>Maldito</h4>
            </div>
            <ul className="clean-list">
                {character.malditoParams.magnitude && (() => {
                    const mag = MALDITO_DATA.MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
                    return mag && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="maldito-label">Magnitud de la maldición</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="value-highlight-brown">
                                    {mag.label} ({mag.cost > 0 ? '+' : ''}{mag.cost} PC)
                                </span>
                            </div>
                            <div className="maldito-description">
                                {mag.description}
                            </div>
                        </li>
                    );
                })()}
                {character.malditoParams.source && (() => {
                    const src = MALDITO_DATA.SOURCE.find(s => s.id === character.malditoParams.source);
                    return src && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="maldito-label">Fuente de la maldición</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="value-highlight-brown">
                                    {src.label}
                                </span>
                            </div>
                            <div className="maldito-description">
                                {src.description}
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </div>
    );
};
