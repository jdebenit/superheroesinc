import React from 'react';
import { SPELLS, type Spell } from '../../../../../data/spells';
import { calculateEM, hasSubtype } from '../utils';
import type { SelectedPower, SelectedSpell } from '../types';
import { WizardSection } from '../../../shared/WizardSection';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';
import { CostBadge } from '../../../shared/CostBadge';
import { FormSelect } from '../../../shared/FormSelect';
import { TableContainer } from '../../../shared/TableContainer';
import { EmptyState } from '../../../shared/EmptyState';
import { InfoBox } from '../../../shared/InfoBox';
import { PixelButton } from '../../../shared/PixelButton';
import { useMagicSectionLogic } from '../hooks/useMagicSectionLogic';

interface MagicSectionProps {
    data: any;
    selectedSpells: Array<Spell & { rank: number; selectedOption?: string }>;
    selectedPowers: SelectedPower[];
    emFormula: { divisor: number; pcCost: number };
    hasEMFormula: boolean;
    isMago: boolean;
    isDotado: boolean;
    isHibrido: boolean;
    isTerrano: boolean;
    isPoseido?: boolean;
    isElfoMagico?: boolean;
    isHadaEter?: boolean;
    onOpenSpellModal: () => void;
    onUpdateEMFormula: (divisor: number, pcCost: number) => void;
    onUpdateSpellRank: (index: number, rank: number) => void;
    onUpdateOption: (index: number, option: string) => void;
    onRemoveSpell: (index: number) => void;
    // Terrano Magic Table
    magicTableRolls?: string[];
    onAddMagicTableRoll?: (rollId: string) => void;
    onRemoveMagicTableRoll?: (index: number) => void;
}

export default function MagicSection({
    data,
    selectedSpells,
    selectedPowers,
    emFormula,
    hasEMFormula,
    isMago,
    isDotado,
    isHibrido,
    isTerrano,
    isPoseido,
    isElfoMagico,
    isHadaEter,
    onOpenSpellModal,
    onUpdateEMFormula,
    onUpdateSpellRank,
    onUpdateOption,
    onRemoveSpell,
    magicTableRolls = [],
    onAddMagicTableRoll,
    onRemoveMagicTableRoll,
}: MagicSectionProps) {
    const {
        TERRANO_TABLE_OPTIONS,
        getRollLabel,
        getRollCost,
        emFormulaOptions,
        emFormulaValue,
        totalCost,
        maxEM,
        emExceeded,
        pcPenalty
    } = useMagicSectionLogic({
        data,
        selectedSpells,
        selectedPowers,
        emFormula,
        isMago,
        isDotado,
        isHibrido,
        isTerrano,
        isPoseido,
        isElfoMagico,
        isHadaEter
    });

    return (
        <WizardSection
            title="Magia"
            color="#4f46e5"
            rightContent={
                <div className="magic-section-header-actions">
                    <PixelButton
                        onClick={onOpenSpellModal}
                        disabled={emFormula.divisor === 0}
                        variant="primary"
                        className="small"
                    >
                        + Lista de Hechizos
                    </PixelButton>
                    {emFormula.divisor !== 0 && (
                        <CostBadge
                            cost={`${totalCost}/${maxEM}`}
                            label="EM"
                            variant={emExceeded ? 'penalty' : 'default'}
                        />
                    )}
                    {pcPenalty > 0 && (
                        <CostBadge
                            cost={`+${pcPenalty}`}
                            label="PC"
                            variant="penalty"
                        />
                    )}
                </div>
            }
        >
            {/* EM Formula Selector (for Dotado/Híbrido/Terrano/Poseido, not Mago) */}
            {hasEMFormula && emFormulaOptions.length > 0 && (
                <FormSelect
                    label="Fórmula de Energía Mágica"
                    value={emFormulaValue}
                    onChange={(val: string) => {
                        const [divisor, pcCost] = val.split('|').map(Number);
                        onUpdateEMFormula(divisor, pcCost);
                    }}
                    options={emFormulaOptions.map((o) => ({ id: o.id, label: o.label, cost: o.cost }))}
                    labelColor="#4f46e5"
                    showCostInOption={false}
                />
            )}

            {/* Terrano Magic Table Selector */}
            {isTerrano && onAddMagicTableRoll && onRemoveMagicTableRoll && (
                <div className="terrano-magic-table">
                    <div className="terrano-magic-table__header">
                        <h4 className="terrano-magic-table__title">Tabla de Objetos Mágicos</h4>
                        <span className="terrano-magic-table__slots">
                            {(() => {
                                const isAjeno = emFormula.divisor === 0;
                                const maxSlots = isAjeno ? 2 : 1;
                                const guardianPowerCount = selectedPowers.filter((p: SelectedPower) => p.origin === 'Guardian').length;
                                const rollCount = magicTableRolls.length;
                                return `Slots Usados: ${guardianPowerCount + rollCount} / ${maxSlots}`;
                            })()}
                        </span>
                    </div>

                    <div className="wizard-margin-bottom">
                        <InfoBox variant="info" icon="ℹ️">
                            Puedes intercambiar tus slots de Poder de Guardián por las siguientes opciones.
                        </InfoBox>
                    </div>

                    <div className="terrano-magic-table__options">
                        {TERRANO_TABLE_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => onAddMagicTableRoll(opt.id)}
                                className="terrano-magic-table__option-btn"
                            >
                                <span className="terrano-magic-table__option-label">{opt.label}</span>
                                <span className="terrano-magic-table__option-cost">{opt.costText}</span>
                            </button>
                        ))}
                    </div>

                    {magicTableRolls.length > 0 && (
                        <div className="terrano-magic-table__rolls">
                            {magicTableRolls.map((rollId: string, idx: number) => (
                                <div key={idx} className={`terrano-magic-table__roll-row${idx < magicTableRolls.length - 1 ? ' terrano-magic-table__roll-row--bordered' : ''}`}>
                                    <div>
                                        <span className="terrano-magic-table__roll-name">{getRollLabel(rollId)}</span>
                                        <span className="terrano-magic-table__roll-cost">({getRollCost(rollId)})</span>
                                    </div>
                                    <DeleteRowButton onDelete={() => onRemoveMagicTableRoll(idx)} title="Eliminar" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Spells Table */}
            {selectedSpells.length > 0 ? (
                <TableContainer
                    headers={['Hechizo', 'Rango', 'Coste', 'Requisitos', 'Acciones']}
                    showTotal={false}
                >
                    {selectedSpells.map((s: Spell & { rank: number; selectedOption?: string }, idx: number) => {
                        const baseCost = parseInt(s.cost, 10) || 0;
                        const maestriaValue = s.maxRank + 2;
                        const isMaestria = s.rank === maestriaValue;
                        const effectiveRank = isMaestria ? maestriaValue : s.rank;
                        const spellTotalCost = baseCost * effectiveRank;

                        return (
                            <tr key={`${s.id}-${idx}`} className={idx % 2 === 0 ? 'wizard-table-row--even' : 'wizard-table-row--odd'}>
                                <td className="wizard-table-cell wizard-table-cell--left wizard-table-cell--bold">
                                    {s.name}
                                    {s.options && s.options.length > 0 && (
                                        <input
                                            type="text"
                                            className="wizard-table-spell-option"
                                            placeholder={s.options[0]}
                                            value={s.selectedOption || ''}
                                            onChange={(e) => onUpdateOption(idx, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </td>
                                <td className="wizard-table-cell">
                                    <select
                                        className="spell-rank-select"
                                        value={s.rank}
                                        onChange={(e) => onUpdateSpellRank(idx, parseInt(e.target.value, 10))}
                                    >
                                        {Array.from({ length: s.maxRank }, (_, i) => i + 1).map((rank) => (
                                            <option key={rank} value={rank}>{rank}</option>
                                        ))}
                                        <option key="maestria" value={s.maxRank + 2}>Maestría</option>
                                    </select>
                                </td>
                                <td className="wizard-table-cell">
                                    <span className={`spell-cost-badge${isMaestria ? ' spell-cost-badge--maestria' : ''}`}>
                                        {baseCost} × {isMaestria ? `${maestriaValue} (M)` : effectiveRank} = {spellTotalCost} EM
                                    </span>
                                </td>
                                <td className="wizard-table-cell wizard-table-cell--secondary">
                                    {s.requirements !== 'No especificado'
                                        ? s.requirements
                                        : <span className="spell-req-none">—</span>}
                                </td>
                                <td className="wizard-table-cell">
                                    <DeleteRowButton onDelete={() => onRemoveSpell(idx)} title="Eliminar hechizo" />
                                </td>
                            </tr>
                        );
                    })}
                </TableContainer>
            ) : (
                <EmptyState message="No hay hechizos seleccionados" />
            )}
        </WizardSection>
    );
}
