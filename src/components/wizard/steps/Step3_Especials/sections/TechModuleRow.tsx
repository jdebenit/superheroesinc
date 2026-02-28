import React from 'react';
import type { TechModule } from '../types';
import { TECH_MODULES } from '../../../../../data/techModules';
import { CostBadge } from '../../../shared/CostBadge';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';

interface TechModuleRowProps {
    module: TechModule;
    index: number;
    onUpdateLocation: (id: string, location: string) => void;
    onUpdateCost: (id: string, cost: number) => void;
    onRemove: (id: string) => void;
}

export default function TechModuleRow({
    module,
    index,
    onUpdateLocation,
    onUpdateCost,
    onRemove
}: TechModuleRowProps) {
    const definition = TECH_MODULES.find(d => d.id === module.definitionId);
    const type = definition?.type || 'General';
    const isInternal = type === 'Mejora Interna';
    const isVariable = module.definitionId === 'equipacion_combate' || module.definitionId === 'prototipo_alta_tecnologia';
    const isEven = index % 2 === 0;

    return (
        <tr style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            {/* Módulo */}
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937', textAlign: 'left' }}>
                {module.name}
            </td>

            {/* Tipo */}
            <td style={{ padding: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: isInternal ? '#fce7f3' : '#dbeafe',
                    color: isInternal ? '#be123c' : '#1d4ed8',
                    border: `1px solid ${isInternal ? '#fbcfe8' : '#bfdbfe'}`
                }}>
                    {type}
                </span>
            </td>

            {/* Localización */}
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <input
                    type="text"
                    value={module.location}
                    onChange={(e) => onUpdateLocation(module.id, e.target.value)}
                    placeholder="Ubicación"
                    style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#4f46e5',
                        width: '8rem',
                        textAlign: 'center',
                        backgroundColor: 'white'
                    }}
                />
            </td>

            {/* Coste */}
            <td style={{ padding: '0.75rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {isVariable ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <input
                            type="number"
                            min="0"
                            value={module.pcCost}
                            onChange={(e) => onUpdateCost(module.id, parseInt(e.target.value) || 0)}
                            style={{
                                width: '50px',
                                padding: '0.125rem 0.25rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#4f46e5'
                            }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280' }}>PC</span>
                    </div>
                ) : (
                    <CostBadge cost={module.pcCost} label="PC" />
                )}
            </td>

            {/* Acciones */}
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <DeleteRowButton onDelete={() => onRemove(module.id)} title="Desinstalar módulo" />
            </td>
        </tr>
    );
}
