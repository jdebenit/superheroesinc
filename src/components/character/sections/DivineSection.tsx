import React from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../data/divineOptions';

interface DivineSectionProps {
    character: any;
}

export const DivineSection: React.FC<DivineSectionProps> = ({ character }) => {
    if (!character.divineParams || !character.divineParams.focus) return null;

    return (
        <div className="sheet-section divine-params">
            <div className="section-header">
                <h4>Divinidad</h4>
            </div>
            <ul className="clean-list">
                {(() => {
                    const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
                    return focus && (
                        <li className="no-bullet-item mb-2">
                            <div className="flex-row-baseline">
                                <span className="divine-label">Foco del Poder</span>
                                <span className="flex-spacer-dotted"></span>
                                <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                    {focus.label} ({focus.cost > 0 ? `+${focus.cost}` : '0'} PC)
                                </span>
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </div>
    );
};
