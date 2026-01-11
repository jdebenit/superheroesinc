import React from 'react';
import { POSEIDO_FORMS } from '../../../components/wizard/steps/Step3_Especials/sections/PoseidoSection';

interface PoseidoSectionProps {
    character: any;
}

export const PoseidoSection: React.FC<PoseidoSectionProps> = ({ character }) => {
    if (!character.poseidoParams || !character.poseidoParams.formType) return null;

    return (
        <div className="sheet-section poseido-params">
            <div className="section-header">
                <h4>Poseído</h4>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(() => {
                    const form = POSEIDO_FORMS.find(f => f.id === character.poseidoParams.formType);
                    return form && (
                        <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                <span className="poseido-form-label">Tipo de Forma</span>
                                <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                    {form.label} ({form.pc > 0 ? '+' : ''}{form.pc} PC)
                                </span>
                            </div>
                            <div className="poseido-description">
                                {form.description}
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </div>
    );
};
