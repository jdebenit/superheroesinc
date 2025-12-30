import React from 'react';
import { EXOSKELETON_CONFIGS } from '../../../../../data/exoskeletonConfigs';

interface ExoskeletonSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

export default function ExoskeletonSection({
    selectedConfig,
    onSelectConfig
}: ExoskeletonSectionProps) {
    return (
        <div className="bg-slate-50 border-4 border-slate-700 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
            <div className="p-6 border-b-4 border-slate-700 bg-white">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic font-comic">Exoesqueleto Energético</h3>
                <p className="text-gray-600 mt-2">
                    Selecciona la configuración del campo energético de tu exoesqueleto.
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
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>FUE</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>PV</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>D.A. Físico</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>R (PV/h)</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>Emisión</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>Vel.</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-comic, sans-serif)' }}>P.C.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXOSKELETON_CONFIGS.map((config, index) => {
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
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                                            {config.fue}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937' }}>
                                            {config.pv}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', fontFamily: 'monospace' }}>
                                            {config.daCinetico}/{config.daEnergia}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#4b5563' }}>
                                            {config.regeneracion}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#7c3aed', fontFamily: 'monospace' }}>
                                            {config.emision}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#4b5563' }}>
                                            {config.velocidad}
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
                        <li><strong>FUE:</strong> Fuerza que adquiere el personaje mientras está activado el campo</li>
                        <li><strong>PV:</strong> Puntos de vida que aguanta el campo antes de desintegrarse</li>
                        <li><strong>D.A. Físico:</strong> Daño absorbido (cinético/energía)</li>
                        <li><strong>R (PV/h):</strong> Puntos de vida que recupera por hora el exoesqueleto energético</li>
                        <li><strong>Emisión:</strong> Daño que provoca cada emisión de un rayo</li>
                        <li><strong>Vel:</strong> Velocidad de vuelo especificada en Mach</li>
                        <li><strong>P.C.:</strong> Coste en Puntos de Creación</li>
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
                            const config = EXOSKELETON_CONFIGS.find(c => c.id === selectedConfig);
                            if (!config) return null;

                            return (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#059669', fontFamily: 'var(--font-comic, sans-serif)' }}>
                                        Configuración seleccionada: FUE {config.fue} | PV {config.pv}
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
