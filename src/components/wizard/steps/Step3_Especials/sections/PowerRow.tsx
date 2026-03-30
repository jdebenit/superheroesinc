import React from 'react';
import { POWERS } from '../../../../../data/powers';
import {
    calculateSkillBase,
    getCharacteristicValue,
    getRankLevel,
    getPowerPenalty,
    getPowerCostConfig,
    calculatePowerBaseCost,
    getBaseCostAdjustment,
    type PowerContext
} from '../utils';
import type { SelectedPower } from '../types';
import { Badge } from '../../../shared/ui/Badge';
import { NumberControl } from '../../../shared/forms/NumberControl';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { WizardField } from '../../../shared/forms/WizardField';
import { DeleteRowButton } from '../../../shared/ui/DeleteRowButton';

interface PowerRowProps {
    selection: SelectedPower;
    data: any;
    index: number;
    onUpdateRank: (index: number, rank: number) => void;
    onUpdateMod: (index: number, mod: number) => void;
    onUpdateSkillValue: (index: number, value: number) => void;
    onUpdateOption: (index: number, option: string) => void;
    onUpdateCustomizations: (index: number, customizations: { id: string; description: string; cost: number }[]) => void;
    onRemove: (index: number) => void;
    isParahumanoHybrid?: boolean;
    isTesKhar?: boolean;
    isAtlante?: boolean;
    isTroll?: boolean;
    isSemidemonio?: boolean;
    isThalsDiscount?: boolean;
    isThalsFree?: boolean;
    isEnano?: boolean;
    isGrifo?: boolean;
    isElfoFisico?: boolean;
    isHadaEter?: boolean;
    isHadaAire?: boolean;
    isHadaFuego?: boolean;
    isHadaAgua?: boolean;
    isHadaTierra?: boolean;
}

const getCharName = (abbr: string): string => {
    const map: Record<string, string> = {
        'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
        'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
    };
    return map[abbr] || '';
};

const ORIGIN_TAG_COLORS: Record<string, "blue" | "purple" | "red" | "orange" | "teal" | "yellow" | "indigo" | "pink" | "green" | "gray"> = {
    'Guardian': 'blue',
    'Alterado': 'purple',
    'Vampírico': 'red',
    'Sobrenatural': 'orange',
    'Thals': 'teal',
    'Divino': 'yellow',
    'Cósmico': 'indigo',
    'Mutante': 'pink',
    'Ente': 'pink',
    'Elfo Físico': 'green'
};

/* ── Sub-components for Cleaner Structure ────────────────────────────────── */

const PowerNameCell: React.FC<{
    power: any;
    selection: SelectedPower;
    index: number;
    isPenalty: boolean;
    penaltyLabel?: string;
    onUpdateOption: (index: number, val: string) => void;
}> = ({ power: p, selection, index, isPenalty, penaltyLabel, onUpdateOption }) => (
    <td className="power-cell name-cell">
        <div className="power-name-container">
            <span>{p.name}</span>
            {isPenalty && penaltyLabel && (
                <Badge label={penaltyLabel} color="yellow" className="power-penalty-badge-inline" />
            )}
        </div>
        {p.options && p.options.length > 0 && (
            <div className="power-options-container">
                <WizardField
                    label=""
                    placeholder={p.options[0]}
                    value={selection.selectedOption || ''}
                    onChange={(val: string) => onUpdateOption(index, val)}
                    noMargin
                />
            </div>
        )}
    </td>
);

const PowerRankFormula: React.FC<{
    power: any;
    selection: SelectedPower;
    data: any;
    index: number;
    context: PowerContext;
    costConfig: any;
    penaltyInfo: any;
    onUpdateRank: (index: number, val: number) => void;
}> = ({ power: p, selection, data, index, context, costConfig, penaltyInfo, onUpdateRank }) => {
    const { freeRank, isFixedCost } = costConfig;
    const adjustment = getBaseCostAdjustment(p, selection, context, penaltyInfo);

    let displayBaseCostStr = p.cost.toString();
    if (adjustment !== 0) {
        displayBaseCostStr = `${p.cost} ${adjustment > 0 ? '+' : '-'} ${Math.abs(adjustment)}`;
    }

    const renderDisplayCost = () => {
        if (isFixedCost) return <CostBadge cost={0} variant="free" />;
        if (freeRank > 0) {
            return (
                <div className="power-formula-item power-formula-item--free">
                    <CostBadge cost={0} variant="free" />
                    <span className="power-free-rank-label">({freeRank} R. Gratis)</span>
                </div>
            );
        }
        return <span className="power-base-cost-value">{displayBaseCostStr}</span>;
    };

    const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
    const extraPoints = Math.max(0, (selection.skillValue || minVal) - minVal);
    const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);
    const baseCost = calculatePowerBaseCost(p, selection, context, penaltyInfo);
    const total = baseCost + (selection.rank * 0.1) + (extraPoints * 0.1) + custCost;

    return (
        <div className="power-cost-formula-layout">
            <div className="power-cost-formula">
                <div className="power-formula-item">{renderDisplayCost()}</div>
                <span className="power-formula-operator">+</span>
                <NumberControl
                    value={selection.rank}
                    onChange={(val) => onUpdateRank(index, val)}
                    min={1} max={100} label="" description="Rango"
                />
                <span className="power-formula-operator">/10</span>
                {extraPoints > 0 && (
                    <>
                        <span className="power-formula-operator">+</span>
                        <div className="power-formula-item">
                            <span className="power-formula-value highlight-amber">{extraPoints}</span>
                            <span className="power-formula-label">Hab.</span>
                        </div>
                        <span className="power-formula-operator">/10</span>
                    </>
                )}
                {custCost !== 0 && (
                    <>
                        <span className="power-formula-operator">{custCost >= 0 ? '+' : '-'}</span>
                        <div className="power-formula-item">
                            <span className={`power-formula-value ${custCost >= 0 ? 'highlight-red' : 'highlight-green'}`}>{Math.abs(custCost)}</span>
                            <span className="power-formula-label">Pers.</span>
                        </div>
                    </>
                )}
                <span className="power-formula-operator">=</span>
                <div className="power-formula-item power-formula-item--total">
                    <Badge label={Math.max(0, total).toFixed(1)} className="power-badge-total" />
                    <span className="power-badge-label">Total</span>
                </div>
            </div>
            <span className="power-formula-label font-bold">{getRankLevel(selection.rank)}</span>
        </div>
    );
};

const PowerCharFormula: React.FC<{
    power: any;
    selection: SelectedPower;
    data: any;
    index: number;
    context: PowerContext;
    penaltyInfo: any;
    isSemidemonio: boolean;
    onUpdateMod: (index: number, val: number) => void;
}> = ({ power: p, selection, data, index, context, penaltyInfo, isSemidemonio, onUpdateMod }) => {
    const charValue = getCharacteristicValue(data, getCharName(p.characteristic || '')) - (selection.powerMod || 0);
    const effectivePowerMod = isSemidemonio && selection.origin === 'Sobrenatural' ? Math.max(0, (selection.powerMod || 0) - 10) : (selection.powerMod || 0);
    const modCost = effectivePowerMod / 10;
    const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);
    const baseCost = calculatePowerBaseCost(p, selection, context, penaltyInfo);
    const adjustment = getBaseCostAdjustment(p, selection, context, penaltyInfo);
    const total = Math.max(0, baseCost + modCost + custCost);

    return (
        <div className="power-char-formula-layout">
            <div className="power-char-info">
                <div className="power-char-component">
                    <span className="power-char-value">{charValue}</span>
                    <span className="power-char-label">{p.characteristic}</span>
                </div>
                <span className="power-formula-operator power-operator-aligned">+</span>
                <NumberControl
                    value={selection.powerMod || 0}
                    onChange={(val) => { if (charValue + val <= 200) onUpdateMod(index, val); }}
                    min={0} max={200} description="Mod. Poder" className="power-char-mod-input"
                />
                <span className="power-formula-operator power-operator-aligned">=</span>
                <div className="power-char-component">
                    <span className="power-char-value total">{charValue + (selection.powerMod || 0)}</span>
                    <span className="power-char-label">Total</span>
                </div>
            </div>
            <div className="power-summary-container">
                {p.cost}
                {adjustment !== 0 && (
                    <span className={`power-penalty-value ${adjustment > 0 ? 'penalty-positive' : 'penalty-negative'}`}>
                        {adjustment > 0 ? ' +' : ' -'} {Math.abs(adjustment)}
                    </span>
                )}
                {' + '}{modCost.toFixed(1)}
                {isSemidemonio && selection.origin === 'Sobrenatural' && (selection.powerMod || 0) >= 10 && (
                    <span className="power-discount-label">(-10 gratis)</span>
                )}
                {custCost !== 0 && (
                    <> {custCost >= 0 ? '+' : '-'} {Math.abs(custCost)} <span className="power-summary-label">(Pers.)</span></>
                )}
                {' = '}<CostBadge cost={total.toFixed(1)} />
            </div>
        </div>
    );
};

const PowerCustomizationsList: React.FC<{
    customizations: { id: string; description: string; cost: number }[];
    index: number;
    onUpdateCustomizations: (index: number, val: any[]) => void;
}> = ({ customizations, index, onUpdateCustomizations }) => (
    <div className="power-customization-section">
        {customizations.length > 0 && (
            <div className="power-customizations-list">
                {customizations.map((cust, cIdx) => (
                    <div key={cust.id} className="power-customization-row">
                        <WizardField
                            label="" value={cust.description} placeholder="Detalle personalización" noMargin className="flex-grow"
                            onChange={(val: string) => {
                                const newCusts = [...customizations];
                                newCusts[cIdx] = { ...newCusts[cIdx], description: val };
                                onUpdateCustomizations(index, newCusts);
                            }}
                        />
                        <WizardField
                            label="" type="number" min="-10" max="10" value={cust.cost} noMargin className="w-20"
                            onChange={(val: string) => {
                                const clamped = Math.max(-10, Math.min(10, parseFloat(val) || 0));
                                const newCusts = [...customizations];
                                newCusts[cIdx] = { ...newCusts[cIdx], cost: clamped };
                                onUpdateCustomizations(index, newCusts);
                            }}
                        />
                        <span className="power-customization-pcs">PCs</span>
                        <button
                            className="power-remove-customization"
                            onClick={() => onUpdateCustomizations(index, customizations.filter((_, i) => i !== cIdx))}
                        >×</button>
                    </div>
                ))}
            </div>
        )}
        <button
            className="power-add-customization-btn"
            onClick={() => onUpdateCustomizations(index, [...customizations, { id: Date.now().toString(), description: '', cost: 0 }])}
        >+ Personalización</button>
    </div>
);

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function PowerRow({
    selection, data, index, onUpdateRank, onUpdateMod, onUpdateSkillValue,
    onUpdateOption, onUpdateCustomizations, onRemove, ...context
}: PowerRowProps) {
    const p = POWERS.find(power => power.id === selection.id);
    if (!p) return null;

    const costConfig = getPowerCostConfig(p, selection, context);
    const penaltyInfo = getPowerPenalty(data, p);
    const isEven = index % 2 === 0;

    return (
        <tr className={`power-row ${isEven ? 'even' : ''}`}>
            <PowerNameCell
                power={p} selection={selection} index={index}
                isPenalty={penaltyInfo.type !== 'none'} penaltyLabel={penaltyInfo.label}
                onUpdateOption={onUpdateOption}
            />

            <td className="power-cell">
                <div className="power-formula-container">
                    {!p.characteristic ? (
                        <PowerRankFormula
                            power={p} selection={selection} data={data} index={index}
                            context={context} costConfig={costConfig} penaltyInfo={penaltyInfo}
                            onUpdateRank={onUpdateRank}
                        />
                    ) : (
                        <PowerCharFormula
                            power={p} selection={selection} data={data} index={index}
                            context={context} penaltyInfo={penaltyInfo}
                            isSemidemonio={!!context.isSemidemonio} onUpdateMod={onUpdateMod}
                        />
                    )}
                    <PowerCustomizationsList
                        customizations={selection.customizations || []}
                        index={index} onUpdateCustomizations={onUpdateCustomizations}
                    />
                </div>
            </td>

            <td className="power-cell">
                {p.skillCalc ? (
                    <div className="power-skill-container">
                        {(() => {
                            const minVal = calculateSkillBase(data, p.skillCalc);
                            return (
                                <>
                                    <NumberControl
                                        value={selection.skillValue || minVal}
                                        onChange={(val) => onUpdateSkillValue(index, Math.max(minVal, val))}
                                        min={minVal}
                                        width="60px"
                                    />
                                    <span className="power-skill-label">{p.skillCalc} ({minVal})</span>
                                </>
                            );
                        })()}
                    </div>
                ) : (
                    <span className="power-na-label">N/A</span>
                )}
            </td>

            <td className="power-cell">
                <Badge label={selection.origin} color={ORIGIN_TAG_COLORS[selection.origin] || 'gray'} />
            </td>

            <td className="power-cell">
                <DeleteRowButton onDelete={() => onRemove(index)} title="Eliminar poder" />
            </td>
        </tr>
    );
}
