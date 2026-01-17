import React from 'react';
import type { TechModule } from '../types';
import { SectionContainer } from '../../../shared/SectionContainer';
import { PixelButton } from '../../../shared/PixelButton';
import TechModuleRow from './TechModuleRow'; // Import the new component

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
        <SectionContainer
            title="Módulos Tecnológicos"
            description="Instala módulos para aumentar tus capacidades."
            theme="slate"
            headerAction={
                <PixelButton
                    onClick={onOpenModal}
                    variant="secondary"
                    className="text-sm"
                >
                    <span>+</span> Seleccionar Módulos
                </PixelButton>
            }
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
            }}>
                {techModules.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Módulo</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Tipo</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Localización</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Coste</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
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
                            {/* Footer Row for Totals */}
                            <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#475569' }}>
                                    Total PCs Invertidos:
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '900', color: '#4f46e5', fontSize: '1.1em' }}>
                                    {techModules.reduce((acc, m) => acc + m.pcCost, 0)} PC
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                        No hay modulos instalados. Pulsa en "Seleccionar Módulos" para añadir mejoras.
                    </div>
                )}
            </div>
        </SectionContainer >
    );
}
