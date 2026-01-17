import React from 'react';
import type { TechModule } from '../types';
import { TECH_MODULES } from '../../../../../data/techModules';
import { Badge } from '../../../shared/Badge';

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
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                {module.name}
            </td>

            {/* Tipo */}
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <Badge
                    label={type}
                    color={isInternal ? 'pink' : 'blue'}
                    variant="solid"
                />
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
                        width: '100%',
                        textAlign: 'center',
                        backgroundColor: 'white'
                    }}
                />
            </td>

            {/* Coste */}
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {isVariable ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <input
                            type="number"
                            min="0"
                            value={module.pcCost}
                            onChange={(e) => onUpdateCost(module.id, parseInt(e.target.value) || 0)}
                            style={{
                                width: '60px',
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
                    <span style={{
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        border: '1px solid #e0e7ff',
                        display: 'inline-block'
                    }}>
                        {module.pcCost} PC
                    </span>
                )}
            </td>

            {/* Acciones */}
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onRemove(module.id)}
                    style={{
                        color: '#ef4444',
                        padding: '0.5rem',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Desinstalar módulo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}
