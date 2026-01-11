import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../data/backgroundTables';

interface BackgroundSectionProps {
    character: any;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({ character }) => {
    if (
        (!character.background || (
            !character.background.items?.length &&
            !character.background.economicStatus &&
            !character.background.legalStatus &&
            !character.background.socialStatus &&
            !character.background.prejudiceResistance
        )) &&
        !character.profession &&
        !character.sexualIdentity
    ) {
        return null;
    }

    return (
        <div className="sheet-section background">
            <div className="section-header">
                <h4>Historial</h4>
            </div>

            <div className="background-col-layout">

                {/* Status Grid */}
                {(character.background?.economicStatus || character.background?.legalStatus || character.background?.socialStatus || character.background?.friendsAndAssociates || character.profession || character.sexualIdentity) && (
                    <div className="background-grid">
                        {character.profession && (
                            <div>
                                <span className="background-label">PROFESIÓN</span>
                                <span className="background-value">{character.profession}</span>
                            </div>
                        )}
                        {character.sexualIdentity && (
                            <div>
                                <span className="background-label">IDENTIDAD SEXUAL</span>
                                <span className="background-value">{character.sexualIdentity}</span>
                            </div>
                        )}
                        {character.background?.economicStatus && (
                            <div>
                                <span className="background-label">POSICIÓN ECONÓMICA</span>
                                <span className="background-value">{ECONOMIC_STATUS.find(e => e.id === character.background.economicStatus)?.label}</span>
                            </div>
                        )}
                        {character.background?.legalStatus && (
                            <div>
                                <span className="background-label">SITUACIÓN LEGAL</span>
                                <span className="background-value">{LEGAL_STATUS.find(l => l.id === character.background.legalStatus)?.label}</span>
                            </div>
                        )}
                        {character.background?.socialStatus && (
                            <div>
                                <span className="background-label">POSICIÓN SOCIAL</span>
                                <span className="background-value">{SOCIAL_STATUS.find(s => s.id === character.background.socialStatus)?.label}</span>
                            </div>
                        )}
                        {character.background?.friendsAndAssociates && (
                            <div>
                                <span className="background-label">AMISTADES Y ALLEGADOS</span>
                                <span className="background-value">{FRIENDS_AND_ASSOCIATES.find(f => f.id === character.background.friendsAndAssociates)?.label}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Background Items */}
                {character.background?.items?.length > 0 && (
                    <div>
                        <span className="bg-notes-label">NOTAS DE TRASFONDO</span>
                        <ul className="bg-notes-list">
                            {character.background.items.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Prejudice Resistance */}
                {character.background?.prejudiceResistance && (
                    <div className="prejudice-container">
                        <div>
                            <span className="prejudice-label">RESISTENCIA A PREJUICIOS</span>
                            <span className="prejudice-value">{character.background.prejudiceResistance}%</span>
                        </div>
                        <span className="prejudice-cost">
                            ({((character.background.prejudiceResistance - 50) * 0.1).toFixed(1)} PCs)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
