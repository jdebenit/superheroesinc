import React from 'react';
import {
    GUARDIAN_QUALITIES,
    GUARDIAN_OBJECTS,
    GUARDIAN_FEATURES,
    GUARDIAN_TRANSFORMATIONS
} from '../../../data/guardianOptions';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface GuardianSectionProps {
    character: any;
}

export const GuardianSection: React.FC<GuardianSectionProps> = ({ character }) => {
    if (!character.guardianParams || (!character.guardianParams.objectType && !character.guardianParams.quality)) return null;

    return (
        <SheetSection title="Guardián" className="guardian-params">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {character.guardianParams.objectType && (() => {
                    const obj = GUARDIAN_OBJECTS.find(o => o.id === character.guardianParams.objectType);
                    return obj && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Objeto de Poder"
                                value={obj.label}
                                valueClassName="guardian-value"
                            />
                        </li>
                    );
                })()}

                {character.guardianParams.quality && (() => {
                    const qual = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
                    return qual && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Cualidad"
                                value={`${qual.label} (${qual.cost > 0 ? '+' : ''}${qual.cost} PC)`}
                                valueClassName="guardian-value"
                            />
                        </li>
                    );
                })()}

                {character.guardianParams.feature && (() => {
                    const feat = GUARDIAN_FEATURES.find(f => f.id === character.guardianParams.feature);
                    return feat && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Rasgo Especial"
                                value={feat.label}
                                valueClassName="guardian-value"
                            />
                        </li>
                    );
                })()}

                {character.guardianParams.transformation && (() => {
                    const trans = GUARDIAN_TRANSFORMATIONS.find(t => t.id === character.guardianParams.transformation);
                    return trans && (
                        <li className="no-bullet-item mb-2">
                            <DetailRow
                                label="Transformación"
                                value={trans.label}
                                valueClassName="guardian-value"
                            />
                        </li>
                    );
                })()}
            </ul>
        </SheetSection>
    );
};
