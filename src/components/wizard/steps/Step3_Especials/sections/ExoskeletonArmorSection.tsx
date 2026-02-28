import React from 'react';
import { EXOSKELETON_ARMOR_CONFIGS } from '../../../../../data/exoskeletonArmorConfigs';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';

interface ExoskeletonArmorSectionProps {
    selectedConfig: string | null;
    onSelectConfig: (configId: string | null) => void;
}

export default function ExoskeletonArmorSection({
    selectedConfig,
    onSelectConfig
}: ExoskeletonArmorSectionProps) {
    const selected = EXOSKELETON_ARMOR_CONFIGS.find(c => c.id === selectedConfig);

    return (
        <WizardSection
            title="Exoesqueleto / Tecnoarmadura"
            description="Selecciona el nivel de blindaje y protección de tu armadura o vehículo."
            rightContent={selected ? (
                <CostBadge
                    cost={`+${selected.pcCost}`}
                    label="PC"
                    variant="penalty"
                />
            ) : undefined}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#334155', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'center', width: '50px' }}></th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>P.C.</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>PV</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>D.A. Físico</th>
                        </tr>
                    </thead>
                    <tbody>
                        {EXOSKELETON_ARMOR_CONFIGS.map((config, index) => {
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
                                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = isEven ? 'white' : '#f9fafb';
                                    }}
                                >
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <input
                                            type="radio"
                                            checked={isSelected}
                                            onChange={() => onSelectConfig(isSelected ? null : config.id)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#059669' }}
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
                                        {config.pv}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#4b5563', fontFamily: 'monospace' }}>
                                        {config.daFisico}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#0c4a6e'
            }}>
                ℹ️ &nbsp;
                <strong>P.C.</strong> Coste en Puntos de Creación &nbsp;·&nbsp;
                <strong>PV</strong> Puntos de vida adicionales de la armadura &nbsp;·&nbsp;
                <strong>D.A. Físico</strong> Daño absorbido (protección)
            </div>

            {/* Selected Configuration Summary */}
            {selected && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    border: '2px solid #10b981',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontWeight: 'bold', color: '#059669' }}>
                        ✓ Configuración seleccionada: PV {selected.pv} | D.A. {selected.daFisico}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
                        +{selected.pcCost} PCs
                    </span>
                </div>
            )}
        </WizardSection>
    );
}
