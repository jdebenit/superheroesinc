import React, { useMemo } from 'react';
import {
    GUARDIAN_QUALITIES,
    GUARDIAN_OBJECTS,
    GUARDIAN_FEATURES,
    GUARDIAN_TRANSFORMATIONS
} from '../../../../../data/guardianOptions';
import { WizardSection } from '../../../shared/WizardSection';
import { FormSelect } from '../../../shared/FormSelect';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';

export interface GuardianParams {
    quality: string | null;
    objectType: string | null;
    feature: string | null;
    transformation: string | null;
}

interface GuardianSectionProps {
    guardianParams: GuardianParams;
    onChange: (updates: any) => void;
}

export default function GuardianSection({ guardianParams, onChange }: GuardianSectionProps) {
    const { quality, objectType, feature, transformation } = guardianParams;

    const handleChange = (field: keyof GuardianParams, value: string | null) => {
        onChange({
            guardianParams: {
                ...guardianParams,
                [field]: value
            }
        });
    };

    const selectedQuality = useMemo(() =>
        GUARDIAN_QUALITIES.find(q => q.id === quality),
        [quality]);

    return (
        <WizardSection
            title="Opciones de Origen: Guardián"
            color="#1e40af"
            rightContent={
                <SectionHeaderBadge
                    cost={(selectedQuality?.cost || 0) > 0 ? `+${selectedQuality?.cost}` : (selectedQuality?.cost || 0)}
                    label="PC"
                    variant={!(selectedQuality?.cost) ? "free" : (selectedQuality.cost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <div className="wizard-grid wizard-gap-lg">
                <FormSelect
                    label="Cualidad del Objeto"
                    value={quality || ''}
                    onChange={(value) => handleChange('quality', value || null)}
                    options={GUARDIAN_QUALITIES}
                    placeholder="-- Seleccionar --"
                    labelColor="#1e40af"
                    showDescription={false}
                />
                {selectedQuality && (
                    <p className="form-field-description" style={{ marginTop: '-1rem' }}>
                        {selectedQuality.description}
                    </p>
                )}

                <FormSelect
                    label="Objeto"
                    value={objectType || ''}
                    onChange={(value) => handleChange('objectType', value || null)}
                    options={GUARDIAN_OBJECTS.map(o => ({ ...o, cost: 0 }))}
                    placeholder="-- Seleccionar --"
                    labelColor="#1e40af"
                    showCostInOption={false}
                />

                <FormSelect
                    label="Rasgo Especial"
                    value={feature || ''}
                    onChange={(value) => handleChange('feature', value || null)}
                    options={GUARDIAN_FEATURES.map(f => ({ ...f, cost: 0 }))}
                    placeholder="-- Seleccionar --"
                    labelColor="#1e40af"
                    showCostInOption={false}
                />

                <FormSelect
                    label="Transformación"
                    value={transformation || ''}
                    onChange={(value) => handleChange('transformation', value || null)}
                    options={GUARDIAN_TRANSFORMATIONS.map(t => ({ ...t, cost: 0 }))}
                    placeholder="-- Seleccionar --"
                    labelColor="#1e40af"
                    showCostInOption={false}
                />
            </div>
        </WizardSection>
    );
}

