import React from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../../../data/cyborgImplantConfigs';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';
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
                    <SectionHeaderBadge cost={`+${totalCost}`} label="PC" variant="penalty" />
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

                <div className="wizard-grid-2 wizard-gap-lg wizard-margin-bottom">
                    {/* Stats Selection Table */}
                    <div>
                        <label className="form-field-label">Configuración (PV / DA)</label>
                        <div className="cyborg-selection-table">
                            <div className="cyborg-table-header">
                                <div className="cyborg-table-radio-cell"></div>
                                <div className="cyborg-table-cell">Coste</div>
                                <div className="cyborg-table-cell">PV</div>
                                <div className="cyborg-table-cell">DA Físico</div>
                            </div>
                            {CYBORG_IMPLANT_STATS.map(stat => (
                                <label key={stat.id} className={`cyborg-table-row ${selectedStatId === stat.id ? 'selected' : ''}`}>
                                    <div className="cyborg-table-radio-cell">
                                        <input
                                            type="radio"
                                            name="implantStats"
                                            checked={selectedStatId === stat.id}
                                            onChange={() => setSelectedStatId(stat.id)}
                                        />
                                    </div>
                                    <div className="cyborg-table-cell cost">{stat.pcCost} PC</div>
                                    <div className="cyborg-table-cell">+{stat.pvBonus}</div>
                                    <div className="cyborg-table-cell">{stat.daFisico}</div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Strength Selection Table */}
                    <div>
                        <label className="form-field-label">Fuerza</label>
                        <div className="cyborg-selection-table">
                            <div className="cyborg-table-header">
                                <div className="cyborg-table-radio-cell"></div>
                                <div className="cyborg-table-cell">Fuerza</div>
                                <div className="cyborg-table-cell">Coste</div>
                            </div>
                            {CYBORG_IMPLANT_STRENGTHS.map(str => (
                                <label key={str.id} className={`cyborg-table-row ${selectedStrengthId === str.id ? 'selected' : ''}`}>
                                    <div className="cyborg-table-radio-cell">
                                        <input
                                            type="radio"
                                            name="implantStrength"
                                            checked={selectedStrengthId === str.id}
                                            onChange={() => setSelectedStrengthId(str.id)}
                                        />
                                    </div>
                                    <div className="cyborg-table-cell font-bold">{str.fuerza}</div>
                                    <div className={`cyborg-table-cell ${str.pcCost > 0 ? 'cost' : 'cost-muted'}`}>
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
