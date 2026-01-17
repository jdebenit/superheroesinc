import React, { useState } from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../../../data/cyborgImplantConfigs';
import { SectionContainer } from '../../../shared/SectionContainer';
import CyborgImplantRow from './CyborgImplantRow';
import { TableContainer } from '../../../shared/TableContainer';
import { EmptyState } from '../../../shared/EmptyState';

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
        // Reset selections if desired, or keep them for quick addition of similar implants
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
        <SectionContainer
            title="Implantes Cibernéticos"
            description="Gestiona los implantes y mejoras cibernéticas."
            theme="blue"
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
            <div className="add-implant-form" style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                padding: '1.5rem'
            }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#475569' }}>Añadir Nuevo Implante</h4>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4b5563' }}>Nombre / Ubicación</label>
                    <input
                        type="text"
                        value={newImplantName}
                        onChange={(e) => setNewImplantName(e.target.value)}
                        placeholder="Ej: Brazo derecho, Ojo cibernético..."
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Stats Selection Table */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4b5563' }}>Configuración (PV / DA)</label>
                        <div className="config-table" style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#4b5563' }}>Fuerza</label>
                        <div className="config-table" style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
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

                <button
                    onClick={handleAddImplant}
                    disabled={!newImplantName.trim()}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: newImplantName.trim() ? '#2563eb' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: newImplantName.trim() ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s'
                    }}
                >
                    Añadir Implante
                </button>
            </div>
        </SectionContainer>
    );
};
