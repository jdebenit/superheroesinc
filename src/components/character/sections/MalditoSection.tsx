import React from 'react';
import { MALDITO_DATA } from '../../../components/wizard/steps/Step3_Especials/sections/MalditoSection';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface MalditoSectionProps {
    character: any;
}

export const MalditoSection: React.FC<MalditoSectionProps> = ({ character }) => {
    if (!character.malditoParams || (!character.malditoParams.magnitude && !character.malditoParams.source)) return null;

    return (
        <SheetSection title="Maldito" className="maldito-params">
            <ul className="clean-list">
                {character.malditoParams.magnitude && (() => {
                    const mag = MALDITO_DATA.MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
                    return mag && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Magnitud de la maldición"
                                value={`${mag.label} (${mag.cost > 0 ? '+' : ''}${mag.cost} PC)`}
                                valueClassName="value-highlight-brown"
                            />
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
                            <DetailRow
                                label="Fuente de la maldición"
                                value={src.label}
                                valueClassName="value-highlight-brown"
                            />
                            <div className="maldito-description">
                                {src.description}
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </SheetSection>
    );
};
