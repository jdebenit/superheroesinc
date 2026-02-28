import React, { useMemo } from 'react';
import { INCOME_SOURCES } from '../../../../../data/technologicalOptions';
import { WizardSection } from '../../../shared/WizardSection';
import { FormSelect } from '../../../shared/FormSelect';
import { InfoBox } from '../../../shared/InfoBox';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';

interface TechnologicalSectionProps {
    techParams: { incomeSource: string } | null;
    onChange: (params: { incomeSource: string }) => void;
}

export default function TechnologicalSection({ techParams, onChange }: TechnologicalSectionProps) {
    const selectedId = techParams?.incomeSource || '';

    const handleSourceChange = (value: string) => {
        onChange({ incomeSource: value });
    };

    const selectedSource = useMemo(() =>
        INCOME_SOURCES.find(s => s.id === selectedId),
        [selectedId]);

    return (
        <WizardSection
            title="Tecnológico"
            color="#334155"
            description="Selecciona cómo financia el personaje su tecnología. Esto afecta al coste en Puntos de Creación."
            rightContent={
                <SectionHeaderBadge
                    cost={(selectedSource?.pc || 0) > 0 ? `+${selectedSource?.pc}` : (selectedSource?.pc || 0)}
                    label="PC"
                    variant={!(selectedSource?.pc) ? "default" : (selectedSource.pc > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <FormSelect
                label="Fuente de Ingresos"
                value={selectedId}
                onChange={handleSourceChange}
                options={INCOME_SOURCES.map(src => ({
                    id: src.id,
                    label: src.label,
                    cost: src.pc,
                    description: src.description
                }))}
                placeholder="-- Selecciona una fuente --"
                labelColor="#0369a1"
                showDescription={false}
            />

            {selectedSource && (
                <InfoBox variant="info" icon="ℹ️">
                    <strong>Descripción:</strong> {selectedSource.description}
                </InfoBox>
            )}
        </WizardSection>
    );
}

