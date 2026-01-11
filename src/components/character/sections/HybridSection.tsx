import React from 'react';
import { hasSubtype } from '../../../components/wizard/steps/Step3_Especials/utils';

interface HybridSectionProps {
    character: any;
}

export const HybridSection: React.FC<HybridSectionProps> = ({ character }) => {
    if (
        character.isParahumanoHybrid && (
            hasSubtype(character, 'Parahumano', 'Thals') ||
            hasSubtype(character, 'Parahumano', 'Tes-khar') ||
            hasSubtype(character, 'Parahumano', 'Atlante')
        )
    ) {
        return (
            <div className="sheet-section hybrid-params">
                <div className="section-header">
                    <h4>Híbrido</h4>
                </div>
                <ul className="clean-list">
                    <li className="no-bullet-item mb-2">
                        <div className="flex-row-baseline">
                            <span className="hybrid-condition-label">Condición</span>
                            <span className="flex-spacer-dotted"></span>
                            <span className="value-highlight-brown">
                                Híbrido con Humano
                            </span>
                        </div>
                        <div className="section-note">
                            Acceso a poderes de Alterado (+3 PC/poder)
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
    return null;
};
