import React from 'react';
import type { TechModule } from '../types';
import { WizardSection } from '../../../shared/layout/WizardSection';

import { PixelButton } from '../../../shared/ui/PixelButton';
import TechModuleRow from './TechModuleRow';
import { TableContainer } from '../../../shared/layout/TableContainer';
import { EmptyState } from '../../../shared/ui/EmptyState';

interface TechModulesSectionProps {
    techModules: TechModule[];
    onOpenModal: () => void;
    onUpdateLocation: (id: string, location: string) => void;
    onUpdateCost: (id: string, cost: number) => void;
    onRemove: (id: string) => void;
}

export default function TechModulesSection({
    techModules,
    onOpenModal,
    onUpdateLocation,
    onUpdateCost,
    onRemove
}: TechModulesSectionProps) {

    return (
        <WizardSection
            title="Módulos Tecnológicos"
            color="#334155"
            description="Instala módulos para aumentar tus capacidades."
            rightContent={
                <PixelButton
                    onClick={onOpenModal}
                    variant="secondary"
                    className="text-sm"
                >
                    <span>+</span> Seleccionar Módulos
                </PixelButton>
            }
        >

            {techModules.length > 0 ? (
                <TableContainer
                    headers={['Módulo', 'Tipo', 'Localización', 'Coste', 'Acciones']}
                    totalLabel="Total PCs Invertidos:"
                    totalValue={`${techModules.reduce((acc, m) => acc + m.pcCost, 0)} PC`}
                    totalColSpan={3}
                >
                    {techModules.map((module, index) => (
                        <TechModuleRow
                            key={module.id}
                            module={module}
                            index={index}
                            onUpdateLocation={onUpdateLocation}
                            onUpdateCost={onUpdateCost}
                            onRemove={onRemove}
                        />
                    ))}
                </TableContainer>
            ) : (
                <EmptyState
                    message='No hay módulos instalados. Pulsa en "Seleccionar Módulos" para añadir mejoras.'
                />
            )}
        </WizardSection>

    );
}

