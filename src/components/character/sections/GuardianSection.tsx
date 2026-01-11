import React from 'react';
import {
    GUARDIAN_QUALITIES,
    GUARDIAN_OBJECTS,
    GUARDIAN_FEATURES,
    GUARDIAN_TRANSFORMATIONS
} from '../../../data/guardianOptions';

interface GuardianSectionProps {
    character: any;
}

export const GuardianSection: React.FC<GuardianSectionProps> = ({ character }) => {
    if (!character.guardianParams || (!character.guardianParams.objectType && !character.guardianParams.quality)) return null;

    return (
        <div className="sheet-section guardian-params">
            <div className="section-header">
                <h4>Guardián</h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {/* Object Type */}
                {character.guardianParams.objectType && (() => {
                    const obj = GUARDIAN_OBJECTS.find(o => o.id === character.guardianParams.objectType);
                    return obj && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="guardian-label">Objeto de Poder</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="guardian-value">{obj.label}</span>
                            </div>
                        </li>
                    );
                })()}

                {/* Quality */}
                {character.guardianParams.quality && (() => {
                    const qual = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
                    return qual && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="guardian-label">Cualidad</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="guardian-value">
                                    {qual.label} ({qual.cost > 0 ? '+' : ''}{qual.cost} PC)
                                </span>
                            </div>
                        </li>
                    );
                })()}

                {/* Feature */}
                {character.guardianParams.feature && (() => {
                    const feat = GUARDIAN_FEATURES.find(f => f.id === character.guardianParams.feature);
                    return feat && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="guardian-label">Rasgo Especial</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="guardian-value">{feat.label}</span>
                            </div>
                        </li>
                    );
                })()}

                {/* Transformation */}
                {character.guardianParams.transformation && (() => {
                    const trans = GUARDIAN_TRANSFORMATIONS.find(t => t.id === character.guardianParams.transformation);
                    return trans && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="guardian-label">Transformación</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="guardian-value">{trans.label}</span>
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </div>
    );
};
