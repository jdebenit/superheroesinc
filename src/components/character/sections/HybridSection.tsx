import React from 'react';
import { getCharacterOriginFlags } from '../../../utils/calculations/originFlags';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface HybridSectionProps {
    character: any;
}

export const HybridSection: React.FC<HybridSectionProps> = ({ character }) => {
    const flags = getCharacterOriginFlags(character);

    if (
        flags.isParahumanoHybrid && (
            flags.isThals ||
            flags.isTesKhar ||
            flags.isAtlante
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
