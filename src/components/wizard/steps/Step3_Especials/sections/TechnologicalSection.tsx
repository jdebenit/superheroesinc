import React, { useMemo } from 'react';
import { INCOME_SOURCES } from '../../../../../data/technologicalOptions';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';
import { FormSelect } from '../../../shared/FormSelect';
import { InfoBox } from '../../../shared/InfoBox';

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
        <OriginOptionsContainer
            title="Tecnológico"
            cost={selectedSource?.pc || 0}
            themeColor="cyan"
            description="Selecciona cómo financia el personaje su tecnología. Esto afecta al coste en Puntos de Creación."
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
        </OriginOptionsContainer>
    );
}

