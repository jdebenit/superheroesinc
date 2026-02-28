import React from 'react';
import { MAGICAL_BONDS } from '../../../../../data/magicalBonds';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';
import { WizardSection } from '../../../shared/WizardSection';
import { WizardField } from '../../../shared/WizardField';
import { EmptyState } from '../../../shared/EmptyState';
import { PixelButton } from '../../../shared/PixelButton';

interface MagicalBondsSectionProps {
    data: any;
    onChange: (updates: any) => void;
    onOpenModal: () => void;
}

export default function MagicalBondsSection({
    data,
    onChange,
    onOpenModal
}: MagicalBondsSectionProps) {
    return (
        <WizardSection
            title="Vinculaciones Mágicas"
            description="Como Mago, debes elegir al menos una vinculación mágica que canalice tu poder."
            rightContent={
                <PixelButton onClick={onOpenModal} variant="custom" className="bg-purple-600 text-white hover:bg-purple-700">
                    <span>+</span> Añadir Vinculación
                </PixelButton>
            }
        >
            {/* Selected Bonds List Table */}
            {data.magicalBonds && data.magicalBonds.length > 0 ? (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    marginBottom: '1.5rem'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Vinculación</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280' }}>Descripción</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.magicalBonds.map((bondId: string, idx: number) => {
                                const bond = MAGICAL_BONDS.find(b => b.id === bondId);
                                if (!bond) return null;
                                const isEven = idx % 2 === 0;
                                return (
                                    <tr key={bondId} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937', verticalAlign: 'top' }}>
                                            {bond.name}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.9rem', verticalAlign: 'top' }}>
                                            {bond.description}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                                            <DeleteRowButton
                                                onDelete={() => {
                                                    const current = data.magicalBonds || [];
                                                    onChange({ ...data, magicalBonds: current.filter((id: string) => id !== bondId) });
                                                }}
                                                title="Eliminar vinculación"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState message="No hay vinculaciones mágicas seleccionadas. Usa el botón de arriba para añadir." />
            )}

            {/* Custom Bond Form */}
            <div style={{
                padding: '1.25rem',
                backgroundColor: '#faf5ff',
                border: '1px dashed #a855f7',
                borderRadius: '8px',
                borderLeft: '4px solid #a855f7'
            }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7e22ce', marginBottom: '1rem', marginTop: 0 }}>
                    Otra Vinculación (Personalizada)
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <WizardField
                        label="Nombre de la Vinculación"
                        value={data.magicalBondsCustomName || ''}
                        onChange={(val: string) => onChange({ ...data, magicalBondsCustomName: val })}
                        placeholder="Ej: Pacto con el Dragón Carmesí..."
                    />
                    <WizardField
                        type="textarea"
                        label="Descripción y efectos"
                        value={data.magicalBondsCustomDescription || ''}
                        onChange={(val: string) => onChange({ ...data, magicalBondsCustomDescription: val })}
                        placeholder="Describe en qué consiste esta vinculación, qué beneficios otorga y qué sacrificios requiere..."
                        style={{ marginBottom: 0 }}
                    />
                </div>
            </div>
        </WizardSection>
    );
}
