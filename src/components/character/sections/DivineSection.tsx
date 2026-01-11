import React from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../data/divineOptions';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface DivineSectionProps {
    character: any;
}

export const DivineSection: React.FC<DivineSectionProps> = ({ character }) => {
    if (!character.divineParams || !character.divineParams.focus) return null;

    return (
        <SheetSection title="Divinidad" className="divine-params">
            <ul className="clean-list">
                {(() => {
                    const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
                    return focus && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Foco del Poder"
                                value={`${focus.label} (${focus.cost > 0 ? `+${focus.cost}` : '0'} PC)`}
                                valueClassName=""
                            />
                        </li>
                    );
                })()}
            </ul>
        </SheetSection>
    );
};
