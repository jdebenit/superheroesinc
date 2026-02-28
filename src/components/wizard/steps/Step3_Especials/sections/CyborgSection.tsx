import React, { useState } from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../../../data/cyborgImplantConfigs';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';
import { WizardField } from '../../../shared/WizardField';
import { FormSelect } from '../../../shared/FormSelect';
import CyborgImplantRow from './CyborgImplantRow';
import { TableContainer } from '../../../shared/TableContainer';
import { EmptyState } from '../../../shared/EmptyState';
import { PixelButton } from '../../../shared/PixelButton';

interface CyborgSectionProps {
    implants: CyborgImplant[];
    onChange: (implants: CyborgImplant[]) => void;
}

export const CyborgSection: React.FC<CyborgSectionProps> = ({ implants = [], onChange }) => {
    const [newImplantName, setNewImplantName] = useState('');
    const [selectedStatId, setSelectedStatId] = useState<string>(CYBORG_IMPLANT_STATS[0].id);
    const [selectedStrengthId, setSelectedStrengthId] = useState<string>(CYBORG_IMPLANT_STRENGTHS[0].id);

    const handleAddImplant = () => {
        if (!newImplantName.trim()) return;

        const newImplant: CyborgImplant = {
            id: crypto.randomUUID(),
            name: newImplantName.trim(),
            statConfigId: selectedStatId,
            strengthConfigId: selectedStrengthId
        };

        onChange([...implants, newImplant]);
        setNewImplantName('');
    };

    const handleDeleteImplant = (id: string) => {
        onChange(implants.filter(imp => imp.id !== id));
    };

    const totalCost = implants.reduce((acc, imp) => {
        const stat = CYBORG_IMPLANT_STATS.find(s => s.id === imp.statConfigId);
        const str = CYBORG_IMPLANT_STRENGTHS.find(s => s.id === imp.strengthConfigId);
        return acc + (stat?.pcCost || 0) + (str?.pcCost || 0);
    }, 0);

    return (
        <WizardSection
            title="Implantes Cibernéticos"
            description="Gestiona los implantes y mejoras cibernéticas del personaje."
            rightContent={
                totalCost > 0 ? (
                    <CostBadge cost={`+${totalCost}`} label="PC" variant="penalty" />
                ) : undefined
            }
        >
            {implants.length > 0 ? (
                <TableContainer
                    headers={['Nombre / Ubicación', 'Configuración', 'Fuerza', 'Coste', 'Acciones']}
                    totalLabel="Total PCs Invertidos:"
                    totalValue={`${totalCost} PC`}
                    totalColSpan={3}
                >
                    {implants.map((implant, index) => (
                        <CyborgImplantRow
                            key={implant.id}
                            implant={implant}
                            index={index}
                            onRemove={handleDeleteImplant}
                        />
                    ))}
                </TableContainer>
            ) : (
                <EmptyState
                    message="No hay implantes instalados. Añade implantes usando el formulario de abajo."
                />
            )}

            {/* Add New Implant Form */}
            <div style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                padding: '1.25rem',
                borderLeft: '4px solid #3b82f6'
            }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#3b82f6', marginBottom: '1rem', marginTop: 0 }}>
                    Añadir Nuevo Implante
                </p>

                <WizardField
                    label="Nombre / Ubicación"
                    value={newImplantName}
                    onChange={(val: string) => setNewImplantName(val)}
                    placeholder="Ej: Brazo derecho, Ojo cibernético..."
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
                    {/* Stats Selection Table */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4b5563', fontSize: '0.875rem' }}>Configuración (PV / DA)</label>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                <div style={{ width: '40px' }}></div>
                                <div style={{ flex: 1 }}>Coste</div>
                                <div style={{ flex: 1 }}>PV</div>
                                <div style={{ flex: 1 }}>DA Físico</div>
                            </div>
                            {CYBORG_IMPLANT_STATS.map(stat => (
                                <label key={stat.id} style={{
                                    display: 'flex',
                                    padding: '0.5rem',
                                    borderTop: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    background: selectedStatId === stat.id ? '#eff6ff' : 'white',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            type="radio"
                                            name="implantStats"
                                            checked={selectedStatId === stat.id}
                                            onChange={() => setSelectedStatId(stat.id)}
                                        />
                                    </div>
                                    <div style={{ flex: 1, fontWeight: 'bold', color: '#2563eb' }}>{stat.pcCost} PC</div>
                                    <div style={{ flex: 1 }}>+{stat.pvBonus}</div>
                                    <div style={{ flex: 1 }}>{stat.daFisico}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Strength Selection Table */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4b5563', fontSize: '0.875rem' }}>Fuerza</label>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                <div style={{ width: '40px' }}></div>
                                <div style={{ flex: 1 }}>Fuerza</div>
                                <div style={{ flex: 1 }}>Coste</div>
                            </div>
                            {CYBORG_IMPLANT_STRENGTHS.map(str => (
                                <label key={str.id} style={{
                                    display: 'flex',
                                    padding: '0.5rem',
                                    borderTop: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    background: selectedStrengthId === str.id ? '#eff6ff' : 'white',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                        <input
                                            type="radio"
                                            name="implantStrength"
                                            checked={selectedStrengthId === str.id}
                                            onChange={() => setSelectedStrengthId(str.id)}
                                        />
                                    </div>
                                    <div style={{ flex: 1, fontWeight: 'bold' }}>{str.fuerza}</div>
                                    <div style={{ flex: 1, color: str.pcCost > 0 ? '#2563eb' : '#64748b' }}>
                                        {str.pcCost} PC
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <PixelButton
                    onClick={handleAddImplant}
                    disabled={!newImplantName.trim()}
                    variant="primary"
                    className="w-full justify-center"
                >
                    Añadir Implante
                </PixelButton>
            </div>
        </WizardSection>
    );
};
