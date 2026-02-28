import React from 'react';
import { POSEIDO_FORMS } from '../../../components/wizard/steps/Step3_Especials/sections/PoseidoSection';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface PoseidoSectionProps {
    character: any;
}

export const PoseidoSection: React.FC<PoseidoSectionProps> = ({ character }) => {
    if (!character.poseidoParams || !character.poseidoParams.formType) return null;

    return (
        <SheetSection title="Poseído" className="poseido-params">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(() => {
                    const form = POSEIDO_FORMS.find(f => f.id === character.poseidoParams.formType);
                    return form && (
                        <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                            <DetailRow
                                label="Tipo de Forma"
                                value={`${form.label} (${form.cost > 0 ? '+' : ''}${form.cost} PC)`}
                                valueClassName=""
                            />
                            <div className="poseido-description">
                                {form.description}
                            </div>
                        </li>
                    );
                })()}
            </ul>
        </SheetSection>
    );
};
