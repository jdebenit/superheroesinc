import React from 'react';
import { EXOSKELETON_ARMOR_CONFIGS } from '../../../../../data/exoskeletonArmorConfigs';
import type { ExoskeletonArmorConfig } from '../../../../../data/exoskeletonArmorConfigs';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';
import { InfoBox } from '../../../shared/InfoBox';
import { RadioSelectTable } from '../../../shared/RadioSelectTable';
import type { RadioSelectColumn } from '../../../shared/RadioSelectTable';

interface ExoskeletonArmorSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

const COLUMNS: RadioSelectColumn<ExoskeletonArmorConfig>[] = [
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
        key: 'pv',
        label: 'PV',
        cellClass: 'cell-bold',
    },
    {
        key: 'daFisico',
        label: 'D.A. Físico',
        cellClass: 'cell-mono',
    },
];

export default function ExoskeletonArmorSection({
    selectedConfig,
    onSelectConfig,
}: ExoskeletonArmorSectionProps) {
    const selected = EXOSKELETON_ARMOR_CONFIGS.find((c) => c.id === selectedConfig);

    return (
        <WizardSection
            title="Exoesqueleto / Tecnoarmadura"
            description="Selecciona el nivel de blindaje y protección de tu armadura o vehículo."
            rightContent={
                selected ? (
                    <CostBadge cost={`+${selected.pcCost}`} label="PC" variant="penalty" />
                ) : undefined
            }
        >
            <RadioSelectTable
                columns={COLUMNS}
                rows={EXOSKELETON_ARMOR_CONFIGS}
                selectedId={selectedConfig}
                onSelect={onSelectConfig}
            />

            <InfoBox variant="info" icon="ℹ️">
                <strong>P.C.</strong> Coste en Puntos de Creación &nbsp;·&nbsp;
                <strong>PV</strong> Puntos de vida adicionales de la armadura &nbsp;·&nbsp;
                <strong>D.A. Físico</strong> Daño absorbido (protección)
            </InfoBox>

            {selected && (
                <InfoBox variant="success" icon="✓">
                    <strong>Configuración seleccionada:</strong> PV {selected.pv} | D.A. {selected.daFisico}
                    &nbsp;—&nbsp; <strong>+{selected.pcCost} PCs</strong>
                </InfoBox>
            )}
        </WizardSection>
    );
}
