import React from 'react';
import { EXOSKELETON_CONFIGS } from '../../../../../data/exoskeletonConfigs';
import type { ExoskeletonConfig } from '../../../../../data/exoskeletonConfigs';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { InfoBox } from '../../../shared/ui/InfoBox';
import { RadioSelectTable } from '../../../shared/forms/RadioSelectTable';
import type { RadioSelectColumn } from '../../../shared/forms/RadioSelectTable';

interface ExoskeletonSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

const COLUMNS: RadioSelectColumn<ExoskeletonConfig>[] = [
    {
        key: 'fue',
        label: 'FUE',
        cellClass: 'cell-bold',
    },
    {
        key: 'pv',
        label: 'PV',
        cellClass: 'cell-bold',
    },
    {
        key: 'da',
        label: 'D.A. Físico',
        cellClass: 'cell-mono',
        render: (row) => `${row.daCinetico}/${row.daEnergia}`,
    },
    {
        key: 'regeneracion',
        label: 'R (PV/h)',
    },
    {
        key: 'emision',
        label: 'Emisión',
        cellClass: 'cell-accent',
    },
    {
        key: 'velocidad',
        label: 'Vel.',
    },
    {
        key: 'pcCost',
        label: 'P.C.',
        render: (row, isSelected) => (
            <span className={`cost-pill${isSelected ? ' cost-pill--selected' : ''}`}>
                {String(row.pcCost)} PC
            </span>
        ),
    },
];

export default function ExoskeletonSection({
    selectedConfig,
    onSelectConfig,
}: ExoskeletonSectionProps) {
    const selected = EXOSKELETON_CONFIGS.find((c) => c.id === selectedConfig);

    return (
        <WizardSection
            title="Exoesqueleto Energético"
            color="#334155"
            description="Selecciona la configuración del campo energético de tu exoesqueleto."
            rightContent={
                selected ? (
                    <SectionHeaderBadge cost={`+${selected.pcCost}`} label="PC" variant="penalty" />
                ) : undefined
            }
        >
            <RadioSelectTable
                columns={COLUMNS}
                rows={EXOSKELETON_CONFIGS}
                selectedId={selectedConfig}
                onSelect={onSelectConfig}
            />

            <InfoBox variant="info" icon="ℹ️">
                <strong>FUE</strong> Fuerza con campo activo &nbsp;·&nbsp;
                <strong>PV</strong> PVs del campo &nbsp;·&nbsp;
                <strong>D.A. Físico</strong> Daño absorbido (cinético/energía) &nbsp;·&nbsp;
                <strong>R</strong> Recuperación PV/h &nbsp;·&nbsp;
                <strong>Emisión</strong> Daño del rayo &nbsp;·&nbsp;
                <strong>Vel.</strong> Velocidad de vuelo (Mach)
            </InfoBox>

            {selected && (
                <InfoBox variant="success" icon="✓">
                    <strong>Configuración seleccionada:</strong> FUE {selected.fue} | PV {selected.pv}
                    &nbsp;—&nbsp; <strong>+{selected.pcCost} PCs</strong>
                </InfoBox>
            )}
        </WizardSection>
    );
}


