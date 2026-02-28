import React from 'react';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';

export interface ParahumanoParams {
    isHybridWithHuman: boolean;
}

interface ParahumanoSectionProps {
    parahumanoParams: ParahumanoParams;
    onChange: (updates: any) => void;
}

export default function ParahumanoSection({ parahumanoParams, onChange }: ParahumanoSectionProps) {
    const { isHybridWithHuman } = parahumanoParams;

    const handleHybridChange = (checked: boolean) => {
        onChange({
            parahumanoParams: {
                ...parahumanoParams,
                isHybridWithHuman: checked
            }
        });
    };

    return (
        <WizardSection
            title="Opciones de Origen: Parahumano"
            color="#166534"
        >
            <div className="wizard-padding">
                <label className="wizard-checkbox-card">
                    <input
                        type="checkbox"
                        checked={isHybridWithHuman}
                        onChange={(e) => handleHybridChange(e.target.checked)}
                        className="wizard-checkbox-card-input"
                    />
                    <div>
                        <span className="wizard-checkbox-card-title">
                            Híbrido con Humano
                        </span>
                        <span className="wizard-checkbox-card-description">
                            Acceso a poderes de Alterado con un coste adicional de <strong>+3 PCs</strong> al coste base de cada poder seleccionado.
                        </span>
                    </div>
                </label>
            </div>
        </WizardSection >
    );
}
