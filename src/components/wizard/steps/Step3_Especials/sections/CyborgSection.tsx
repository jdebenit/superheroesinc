import React from 'react';
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
import { useCyborgSectionLogic } from '../../../hooks/useCyborgSectionLogic';

interface CyborgSectionProps {
    implants: CyborgImplant[];
    onChange: (implants: CyborgImplant[]) => void;
}

export const CyborgSection: React.FC<CyborgSectionProps> = ({ implants = [], onChange }) => {
    const {
        newImplantName,
        setNewImplantName,
        selectedStatId,
        setSelectedStatId,
        selectedStrengthId,
        setSelectedStrengthId,
        handleAddImplant,
        handleDeleteImplant,
        totalCost
    } = useCyborgSectionLogic(implants, onChange);

    return (
        <WizardSection
            title="Implantes Cibernéticos"
            color="#334155"
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
            <div className="section-add-form section-add-form--blue">
                <p className="section-add-form__label">
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

                <div className="cyborg-add-button-wrapper">
                    <PixelButton
                        onClick={handleAddImplant}
                        disabled={!newImplantName.trim()}
                        variant="primary"
                    >
                        Añadir Implante
                    </PixelButton>
                </div>
            </div>
        </WizardSection>
    );
};
