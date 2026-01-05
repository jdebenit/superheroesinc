import React from 'react';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../../../../../data/technoSuitStrengthConfigs';

interface TechnoSuitStrengthSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

export default function TechnoSuitStrengthSection({
    selectedConfig,
    onSelectConfig
}: TechnoSuitStrengthSectionProps) {
    return (
        <div className="bg-slate-50 border-4 border-slate-700 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
            <div className="p-6 border-b-4 border-slate-700 bg-white">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic font-comic">Fuerza de la Tecnoarmadura</h3>
                <p className="text-gray-600 mt-2">
                    Selecciona la capacidad de Fuerza aumentada que proporciona tu tecnoarmadura.
                </p>
            </div>

            <div className="p-6 bg-slate-100">
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#334155', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'center', width: '50px' }}></th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>P.C.</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>FUErza</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>Fiabilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TECHNOSUIT_STRENGTH_CONFIGS.map((config, index) => {
                                const isSelected = selectedConfig === config.id;
                                const isEven = index % 2 === 0;

                                return (
                                    <tr
                                        key={config.id}
                                        onClick={() => onSelectConfig(isSelected ? null : config.id)}
                                        style={{
                                            backgroundColor: isSelected ? '#ecfdf5' : (isEven ? 'white' : '#f9fafb'),
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = isEven ? 'white' : '#f9fafb';
                                            }
                                        }}
                                    >
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <input
                                                type="radio"
                                                checked={isSelected}
                                                onChange={() => onSelectConfig(isSelected ? null : config.id)}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                    accentColor: '#059669'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 'bold',
                                                backgroundColor: isSelected ? '#10b981' : '#eef2ff',
                                                color: isSelected ? 'white' : '#4f46e5',
                                                padding: '6px 12px',
                                                borderRadius: '9999px',
                                                border: isSelected ? '2px solid #059669' : '1px solid #e0e7ff',
                                                display: 'inline-block'
                                            }}>
                                                {config.pcCost} PC
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                                            {config.fuerza}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', fontFamily: 'monospace' }}>
                                            {config.fiabilidad || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }}>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', fontFamily: 'var(--font-comic, sans-serif)' }}>
                        Leyenda:
                    </h4>
                    <ul style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                        <li><strong>P.C.:</strong> Coste en Puntos de Creación</li>
                        <li><strong>FUErza:</strong> Valor de Fuerza que otorga la tecnoarmadura</li>
                        <li><strong>Fiabilidad:</strong> Probabilidad de que el sistema no falle bajo estrés (solo aplicable a configuraciones extremas)</li>
                    </ul>
                </div>

                {/* Selected Configuration Summary */}
                {selectedConfig && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#ecfdf5',
                        borderRadius: '8px',
                        border: '2px solid #10b981'
                    }}>
                        {(() => {
                            const config = TECHNOSUIT_STRENGTH_CONFIGS.find(c => c.id === selectedConfig);
                            if (!config) return null;

                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#059669', fontFamily: 'var(--font-comic, sans-serif)' }}>
                                        Configuración seleccionada: Fuerza {config.fuerza} {config.fiabilidad ? `(Fiabilidad ${config.fiabilidad})` : ''}
                                    </span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                                        +{config.pcCost} PCs
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
