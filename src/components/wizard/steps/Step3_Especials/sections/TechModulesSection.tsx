import React from 'react';
import { TECH_MODULES } from '../../../../../data/techModules';
import type { TechModule } from '../types';
import { SectionContainer } from '../components/atomic/SectionContainer';
import { PixelButton } from '../components/atomic/PixelButton';
import { DataTable, type Column } from '../components/atomic/DataTable';

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
    const columns: Column<TechModule>[] = [
        {
            header: 'Módulo',
            accessor: 'name',
            render: (module) => (
                <span className="font-bold text-gray-800">{module.name}</span>
            )
        },
        {
            header: 'Tipo',
            align: 'center',
            render: (module) => {
                const definition = TECH_MODULES.find(d => d.id === module.definitionId);
                const type = definition?.type || 'General';
                const isInternal = type === 'Mejora Interna';
                return (
                    <span
                        className={`text-xs px-2 py-1 rounded-full border font-bold ${isInternal
                                ? 'bg-pink-100 text-pink-700 border-pink-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                    >
                        {type}
                    </span>
                );
            }
        },
        {
            header: 'Localización',
            align: 'center',
            render: (module) => (
                <input
                    type="text"
                    value={module.location}
                    onChange={(e) => onUpdateLocation(module.id, e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm font-bold text-indigo-600 w-full text-center bg-white"
                    placeholder="Ubicación"
                />
            )
        },
        {
            header: 'Coste',
            align: 'center',
            render: (module) => {
                const isVariable = module.definitionId === 'equipacion_combate' || module.definitionId === 'prototipo_alta_tecnologia';
                if (isVariable) {
                    return (
                        <div className="flex items-center justify-center gap-1">
                            <input
                                type="number"
                                min="0"
                                value={module.pcCost}
                                onChange={(e) => onUpdateCost(module.id, parseInt(e.target.value) || 0)}
                                className="w-[60px] px-1 py-0.5 border border-gray-300 rounded text-center font-bold text-indigo-600"
                            />
                            <span className="text-xs font-bold text-gray-500">PC</span>
                        </div>
                    );
                }
                return (
                    <span className="text-sm font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                        {module.pcCost} PC
                    </span>
                );
            }
        },
        {
            header: 'Acciones',
            align: 'center',
            render: (module) => (
                <button
                    onClick={() => onRemove(module.id)}
                    className="text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Desinstalar módulo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )
        }
    ];

    return (
        <SectionContainer
            title="Módulos Tecnológicos"
            description="Instala módulos para aumentar tus capacidades."
            theme="slate"
        >
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 italic">
                    Selecciona los módulos tecnológicos instalados en la tecnoarmadura o tus tecnoimplantes.
                </p>
                <PixelButton
                    onClick={onOpenModal}
                    variant="secondary"
                    className="text-sm"
                >
                    <span>+</span> Seleccionar Módulos
                </PixelButton>
            </div>

            <DataTable
                columns={columns}
                data={techModules}
                rowKey={(module) => module.id}
                emptyState={(
                    <div className="p-12 text-center text-gray-400 font-bold italic">
                        No hay módulos instalados.<br />
                        <span className="text-sm font-normal">Pulsa en "Seleccionar Módulos" para añadir mejoras.</span>
                    </div>
                )}
                footer={techModules.length > 0 ? (
                    <tr>
                        <td colSpan={3} className="p-4 text-right font-bold text-gray-700">
                            Total PCs Invertidos:
                        </td>
                        <td className="p-4 text-center font-black text-indigo-600">
                            {techModules.reduce((acc, m) => acc + m.pcCost, 0)} PC
                        </td>
                        <td></td>
                    </tr>
                ) : undefined}
            />
        </SectionContainer>
    );
}
