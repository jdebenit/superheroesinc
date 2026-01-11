import React from 'react';
import { hasSubtype } from '../../../components/wizard/steps/Step3_Especials/utils';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

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
            <SheetSection title="Híbrido" className="hybrid-params">
                <ul className="clean-list">
                    <li className="no-bullet-item mb-2">
                        <DetailRow
                            label={<span className="hybrid-condition-label">Condición</span>}
                            value="Híbrido con Humano"
                            valueClassName="value-highlight-brown"
                        />
                        <div className="section-note">
                            Acceso a poderes de Alterado (+3 PC/poder)
                        </div>
                    </li>
                </ul>
            </SheetSection>
        );
    }
    return null;
};
