import React from 'react';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../../../../../data/technoSuitStrengthConfigs';
import type { TechnoSuitStrengthConfig } from '../../../../../data/technoSuitStrengthConfigs';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { InfoBox } from '../../../shared/ui/InfoBox';
import { RadioSelectTable } from '../../../shared/forms/RadioSelectTable';
import type { RadioSelectColumn } from '../../../shared/forms/RadioSelectTable';

interface TechnoSuitStrengthSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

const COLUMNS: RadioSelectColumn<TechnoSuitStrengthConfig>[] = [
    {
        key: 'pcCost',
        label: 'P.C.',
        render: (row, isSelected) => (
            <span className={`cost-pill${isSelected ? ' cost-pill--selected' : ''}`}>
                {String(row.pcCost)} PC
            </span>
        ),
    },
    {
        key: 'fuerza',
        label: 'FUErza',
        cellClass: 'cell-bold',
    },
    {
        key: 'fiabilidad',
        label: 'Fiabilidad',
        cellClass: 'cell-mono',
        render: (row) => String(row.fiabilidad || '-'),
    },
];

export default function TechnoSuitStrengthSection({
    selectedConfig,
    onSelectConfig,
}: TechnoSuitStrengthSectionProps) {
    const selected = TECHNOSUIT_STRENGTH_CONFIGS.find((c) => c.id === selectedConfig);

    return (
        <WizardSection
            title="Configuración de Tecnoarmadura (Fuerza)"
            color="#334155"
            description="Selecciona la capacidad de Fuerza aumentada que proporciona tu tecnoarmadura."
            rightContent={
                selected ? (
                    <SectionHeaderBadge cost={`+${selected.pcCost}`} label="PC" variant="penalty" />
                ) : undefined
            }
        >
            <RadioSelectTable
                columns={COLUMNS}
                rows={TECHNOSUIT_STRENGTH_CONFIGS}
                selectedId={selectedConfig}
                onSelect={onSelectConfig}
            />

            <InfoBox variant="info" icon="ℹ️">
                <strong>P.C.</strong> Coste en Puntos de Creación &nbsp;·&nbsp;
                <strong>FUErza</strong> Valor de Fuerza que otorga la tecnoarmadura &nbsp;·&nbsp;
                <strong>Fiabilidad</strong> Probabilidad de que el sistema no falle bajo estrés
            </InfoBox>

            {selected && (
                <InfoBox variant="success" icon="✓">
                    <strong>Fuerza {selected.fuerza}</strong>
                    {selected.fiabilidad ? ` (Fiabilidad ${selected.fiabilidad})` : ''}
                    &nbsp;—&nbsp; <strong>+{selected.pcCost} PCs</strong>
                </InfoBox>
            )}
        </WizardSection>
    );
}


