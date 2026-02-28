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

// Helper for Terrano Display
const TERRANO_TABLE_OPTIONS = [
    { id: 'guardian_power', label: 'Acceso a Poder de Guardián', cost: 2, costText: '+2 PC' },
    { id: '180_EM', label: 'Acceso a objetos de 180 EM', cost: 1, costText: '+1 PC' },
    { id: '120_EM', label: 'Acceso a objetos de 120 EM', cost: 0, costText: '+0 PC' },
    { id: '60_EM', label: 'Acceso a objetos de 60 EM', cost: -1, costText: '-1 PC' },
    { id: 'none', label: 'Ningún objeto', cost: -2, costText: '-2 PC' },
];

const EM_FORMULA_OPTIONS_DOTADO = [
    { id: '2|8', label: 'Dotado: (PER+INT+VOL)/2 → +8 PCs', cost: 8 },
    { id: '3|3', label: 'Dotado: (PER+INT+VOL)/3 → +3 PCs', cost: 3 },
    { id: '4|0', label: 'Dotado: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
];
const EM_FORMULA_OPTIONS_HIBRIDO = [
    { id: '2|15', label: 'Híbrido: (PER+INT+VOL)/2 → +15 PCs', cost: 15 },
    { id: '3|10', label: 'Híbrido: (PER+INT+VOL)/3 → +10 PCs', cost: 10 },
    { id: '4|7', label: 'Híbrido: (PER+INT+VOL)/4 → +7 PCs', cost: 7 },
    { id: '0|0', label: 'Híbrido: No EM', cost: 0 },
];
const EM_FORMULA_OPTIONS_TERRANO = [
    { id: '4|0', label: 'Terrano: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
    { id: '0|-5', label: 'Terrano Ajeno: No EM → -5 PCs', cost: -5 },
];
const EM_FORMULA_OPTIONS_POSEIDO = [
    { id: '2|3', label: 'Poseído: (INT+PER+VOL)/2 → +3 PCs', cost: 3 },
    { id: '0|0', label: 'Poseído: No accede a hechizos → +0 PCs', cost: 0 },
];

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
    const getRollLabel = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.label || id;
    const getRollCost = (id: string) => TERRANO_TABLE_OPTIONS.find((o) => o.id === id)?.costText || '';

    // Build em formula options for FormSelect
    const emFormulaOptions = isDotado
        ? EM_FORMULA_OPTIONS_DOTADO
        : isHibrido
            ? EM_FORMULA_OPTIONS_HIBRIDO
            : isTerrano
                ? EM_FORMULA_OPTIONS_TERRANO
                : isPoseido
                    ? EM_FORMULA_OPTIONS_POSEIDO
                    : [];

    const emFormulaValue = `${emFormula.divisor}|${emFormula.pcCost}`;

    const totalCost = selectedSpells.reduce((acc, s) => {
        const baseCost = parseInt(s.cost, 10) || 0;
        return acc + baseCost * s.rank;
    }, 0);

    let divisor = emFormula.divisor;
    if (isMago || isElfoMagico) divisor = 1;
    else if (isHadaEter) divisor = 2;
    const maxEM = emFormula.divisor !== 0 ? calculateEM(data, selectedPowers, divisor) : 0;

    const emExceeded = totalCost > maxEM;
    const pcPenalty = emExceeded ? (totalCost - maxEM) / 10 : 0;

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
                    onChange={(val) => {
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
                                const guardianPowerCount = selectedPowers.filter((p) => p.origin === 'Guardian').length;
                                const rollCount = magicTableRolls.length;
                                return `Slots Usados: ${guardianPowerCount + rollCount} / ${maxSlots}`;
                            })()}
                        </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
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
                            {magicTableRolls.map((rollId, idx) => (
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
                    {selectedSpells.map((s, idx) => {
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
