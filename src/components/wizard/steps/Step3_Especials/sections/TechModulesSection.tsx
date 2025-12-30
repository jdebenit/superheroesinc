import React from 'react';
import { TECH_MODULES } from '../../../../../data/techModules';
import type { TechModule } from '../types';

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
        <div className="bg-slate-50 border-4 border-slate-700 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
            <div className="p-6 border-b-4 border-slate-700 bg-white">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic font-comic">Módulos Tecnológicos</h3>
                <p className="text-gray-600 mt-2">
                    Instala módulos para aumentar tus capacidades.
                </p>
            </div>

            <div className="p-6 bg-slate-100">
                {/* Add Module Form */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600 italic">
                        Selecciona los módulos tecnológicos instalados en la tecnoarmadura o tus tecnoimplantes.
                    </p>
                    <button
                        onClick={onOpenModal}
                        className="pixel-button bg-slate-700 text-white hover:bg-slate-800 text-sm flex items-center gap-2"
                    >
                        <span>+</span> Seleccionar Módulos
                    </button>
                </div>

                {/* Modules List - Table Format */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    marginTop: '1.5rem'
                }}>
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
                            {techModules.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                        No hay módulos instalados.<br />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Pulsa en "Seleccionar Módulos" para añadir mejoras.</span>
                                    </td>
                                </tr>
                            ) : (
                                techModules.map((module, index) => {
                                    const definition = TECH_MODULES.find(d => d.id === module.definitionId);
                                    const type = definition?.type || 'General';
                                    const isEven = index % 2 === 0;

                                    return (
                                        <tr key={module.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                {module.name}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <span className="type-tag" style={{
                                                    backgroundColor: type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                    color: type === 'Mejora Interna' ? '#be123c' : undefined,
                                                    borderColor: type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                }}>
                                                    {type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={module.location}
                                                    onChange={(e) => onUpdateLocation(module.id, e.target.value)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 'bold',
                                                        color: '#4f46e5',
                                                        width: '100%',
                                                        textAlign: 'center'
                                                    }}
                                                    placeholder="Ubicación"
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                {(module.definitionId === 'equipacion_combate' || module.definitionId === 'prototipo_alta_tecnologia') ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={module.pcCost}
                                                            onChange={(e) => onUpdateCost(module.id, parseInt(e.target.value) || 0)}
                                                            style={{
                                                                width: '60px',
                                                                padding: '2px 4px',
                                                                border: '1px solid #d1d5db',
                                                                borderRadius: '4px',
                                                                textAlign: 'center',
                                                                fontWeight: 'bold',
                                                                color: '#4f46e5'
                                                            }}
                                                        />
                                                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold' }}>PC</span>
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#eef2ff',
                                                        color: '#4f46e5',
                                                        padding: '4px 12px',
                                                        borderRadius: '9999px',
                                                        border: '1px solid #e0e7ff',
                                                        display: 'inline-block'
                                                    }}>
                                                        {module.pcCost} PC
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => onRemove(module.id)}
                                                    style={{
                                                        color: '#ef4444',
                                                        padding: '8px',
                                                        borderRadius: '9999px',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
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
                                })
                            )}
                        </tbody>
                        {techModules.length > 0 && (
                            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                                <tr>
                                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#374151' }}>
                                        Total PCs Invertidos:
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '900', color: '#4f46e5' }}>
                                        {techModules.reduce((acc, m) => acc + m.pcCost, 0)} PC
                                    </td>
                                    <td colSpan={1}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
