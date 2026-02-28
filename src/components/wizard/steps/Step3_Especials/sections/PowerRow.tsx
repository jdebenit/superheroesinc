import React from 'react';
import { POWERS } from '../../../../../data/powers';
import { calculateSkillBase, getCharacteristicValue, getRankLevel, getPowerPenalty, getPowerCostConfig, calculatePowerBaseCost, getBaseCostAdjustment, type PowerContext } from '../utils';
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
    'Elfo Físico': 'green'
};

export default function PowerRow({
    selection,
    data,
    index,
    onUpdateRank,
    onUpdateMod,
    onUpdateSkillValue,
    onUpdateOption,
    onUpdateCustomizations,
    onRemove,
    isParahumanoHybrid,
    isTesKhar,
    isAtlante,
    isTroll,
    isSemidemonio,
    isThalsDiscount,
    isThalsFree,
    isEnano,
    isGrifo,
    isElfoFisico,
    isHadaEter,
    isHadaAire,
    isHadaFuego,
    isHadaAgua,
    isHadaTierra
}: PowerRowProps) {
    const p = POWERS.find(power => power.id === selection.id);
    if (!p) return null;

    const context: PowerContext = {
        isParahumanoHybrid, isTesKhar, isAtlante, isTroll, isSemidemonio,
        isThalsDiscount, isThalsFree, isEnano, isGrifo, isElfoFisico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra
    };

    const costConfig = getPowerCostConfig(p, selection, context);
    const { freeRank, isFixedCost } = costConfig;

    const penaltyInfo = getPowerPenalty(data, p);
    const isPenalty = penaltyInfo.type !== 'none';
    const adjustment = getBaseCostAdjustment(p, selection, context, penaltyInfo);

    let displayBaseCostStr = p.cost.toString();
    if (adjustment !== 0) {
        displayBaseCostStr = `${p.cost} ${adjustment > 0 ? '+' : '-'} ${Math.abs(adjustment)}`;
    }

    const renderDisplayCost = () => {
        if (isFixedCost) { // Thals Free
            return <CostBadge cost={0} variant="free" />;
        }
        if (freeRank > 0) {
            return (
                <div className="flex flex-col items-center">
                    <CostBadge cost={0} variant="free" />
                    <span className="text-[9px] text-green-600 mt-0.5">({freeRank} R. Gratis)</span>
                </div>
            );
        }
        return <span className='font-bold text-gray-700'>{displayBaseCostStr}</span>;
    };

    const isEven = index % 2 === 0;

    return (
        <tr key={`${selection.id}-${selection.origin}-${index}`} className={`power-row ${isEven ? 'even' : ''}`}>
            <td className="power-cell name-cell">
                <div className="power-name-container">
                    <span>{p.name}</span>
                    {isPenalty && penaltyInfo.label && (
                        <Badge label={penaltyInfo.label} color="yellow" className="text-xs" />
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
            <td className="power-cell">
                {!p.characteristic ? (
                    <div className="power-formula-component" style={{ gap: '0.5rem' }}>
                        <div className="power-cost-formula">
                            <div className="flex items-center">
                                {renderDisplayCost()}
                            </div>
                            <span className="power-formula-operator">+</span>

                            <NumberControl
                                value={selection.rank}
                                onChange={(val) => onUpdateRank(index, val)}
                                min={1}
                                max={100}
                                label=""
                                description="Rango"
                            />

                            <span className="power-formula-operator">/10</span>

                            {(() => {
                                const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                const currentVal = selection.skillValue || minVal;
                                const extraPoints = Math.max(0, currentVal - minVal);

                                if (extraPoints > 0) {
                                    return (
                                        <>
                                            <span className="power-formula-operator">+</span>
                                            <div className="power-formula-component">
                                                <span className="power-formula-value highlight-amber">{extraPoints}</span>
                                                <span className="power-formula-label">Hab.</span>
                                            </div>
                                            <span className="power-formula-operator">/10</span>
                                        </>
                                    );
                                }
                                return null;
                            })()}

                            {(() => {
                                // Calculate total customization cost for display
                                const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);
                                if (custCost !== 0) {
                                    return (
                                        <>
                                            <span className="power-formula-operator">{custCost >= 0 ? '+' : '-'}</span>
                                            <div className="power-formula-component">
                                                <span className={`power-formula-value ${custCost >= 0 ? 'highlight-red' : 'highlight-green'}`}>{Math.abs(custCost)}</span>
                                                <span className="power-formula-label">Pers.</span>
                                            </div>
                                        </>
                                    );
                                }
                                return null;
                            })()}

                            <span className="power-formula-operator">=</span>

                            {(() => {
                                const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                const currentVal = selection.skillValue || minVal;
                                const extraCost = Math.max(0, currentVal - minVal) * 0.1;

                                const baseCost = calculatePowerBaseCost(p, selection, context, penaltyInfo);

                                // Recalculate total
                                const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);
                                const rank = selection.rank || 1;
                                const rankCost = rank * 0.1;

                                const total = baseCost + rankCost + extraCost + custCost;

                                return (
                                    <div className="flex flex-col items-center">
                                        <Badge
                                            label={Math.max(0, total).toFixed(1)}
                                            className="text-lg font-bold"
                                        />
                                        <span className="text-xs text-gray-400">Total</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Customizations List */}
                        {(selection.customizations || []).length > 0 && (
                            <div className="power-customizations-list">
                                {selection.customizations?.map((cust, cIdx) => (
                                    <div key={cust.id} className="power-customization-row">
                                        <WizardField
                                            label=""
                                            value={cust.description}
                                            placeholder="Detalle personalización"
                                            onChange={(val: string) => {
                                                const newCusts = [...(selection.customizations || [])];
                                                newCusts[cIdx] = { ...newCusts[cIdx], description: val };
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            noMargin
                                            className="flex-grow"
                                        />
                                        <WizardField
                                            label=""
                                            type="number"
                                            min="-10"
                                            max="10"
                                            value={cust.cost}
                                            onChange={(val: string) => {
                                                const newCusts = [...(selection.customizations || [])];
                                                const parseVal = parseFloat(val) || 0;
                                                const clamped = Math.max(-10, Math.min(10, parseVal));
                                                newCusts[cIdx] = { ...newCusts[cIdx], cost: clamped };
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            noMargin
                                            className="w-20"
                                        />
                                        <span className="power-customization-pcs">PCs</span>
                                        <button
                                            onClick={() => {
                                                const newCusts = selection.customizations?.filter((_, i) => i !== cIdx) || [];
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            className="power-remove-customization"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div>
                            <button
                                onClick={() => {
                                    const newCusts = [...(selection.customizations || [])];
                                    newCusts.push({ id: Date.now().toString(), description: '', cost: 0 });
                                    onUpdateCustomizations(index, newCusts);
                                }}
                                className="power-add-customization-btn"
                            >
                                + Personalización
                            </button>
                        </div>

                        <span className="power-formula-label font-bold">
                            {getRankLevel(selection.rank)}
                        </span>
                    </div>
                ) : (
                    <div className="power-formula-component" style={{ gap: '0.5rem' }}>
                        <div className="power-char-info">
                            {/* Characteristic Value */}
                            <div className="power-char-component">
                                <span className="power-char-value">
                                    {getCharacteristicValue(data, getCharName(p.characteristic || '')) - (selection.powerMod || 0)}
                                </span>
                                <span className="power-char-label">
                                    {p.characteristic}
                                </span>
                            </div>

                            <span className="power-formula-operator pt-1">+</span>

                            {/* Power Mod Input */}
                            <NumberControl
                                value={selection.powerMod || 0}
                                onChange={(val) => {
                                    const charValue = getCharacteristicValue(data, getCharName(p.characteristic || '')) - (selection.powerMod || 0);
                                    const total = charValue + val;
                                    if (total <= 200) {
                                        onUpdateMod(index, val);
                                    }
                                }}
                                min={0}
                                max={200}
                                description="Mod. Poder"
                                className="text-green-600"
                            />

                            <span className="power-formula-operator pt-1">=</span>

                            {/* Total */}
                            <div className="power-char-component">
                                <span className="power-char-value total">
                                    {getCharacteristicValue(data, getCharName(p.characteristic || ''))}
                                </span>
                                <span className="power-char-label">
                                    Total
                                </span>
                            </div>
                        </div>
                        <span className="power-cost-summary">
                            <>{(() => {
                                const powerMod = (selection.powerMod || 0);

                                // Apply Semidemonio discount logic for display
                                // "10 points free" in value (1 PC worth)
                                let effectivePowerMod = powerMod;
                                let discountText = null;

                                if (isSemidemonio && selection.origin === 'Sobrenatural') {
                                    effectivePowerMod = Math.max(0, powerMod - 10);
                                    discountText = "(-10 gratis)";
                                }

                                const modCost = effectivePowerMod / 10;
                                const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);

                                const baseCost = calculatePowerBaseCost(p, selection, context, penaltyInfo);
                                const total = Math.max(0, baseCost + modCost + custCost);

                                let penaltyDisplay = null;
                                const adjustment = getBaseCostAdjustment(p, selection, context, penaltyInfo);
                                if (adjustment !== 0) {
                                    penaltyDisplay = <span style={{ color: adjustment > 0 ? '#92400e' : '#16a34a', fontWeight: 'bold' }}> {adjustment > 0 ? '+' : '-'} {Math.abs(adjustment)}</span>;
                                }

                                return (
                                    <div className="flex items-center gap-1">
                                        {p.cost}
                                        {penaltyDisplay}
                                        {' + '}{modCost.toFixed(1)}
                                        {discountText && <span style={{ color: '#16a34a', marginLeft: '2px', fontSize: '10px' }}>{discountText}</span>}
                                        {custCost !== 0 && (
                                            <> {custCost >= 0 ? '+' : '-'} {Math.abs(custCost)} (Pers.)</>
                                        )}
                                        {' = '}<CostBadge cost={total.toFixed(1)} />
                                    </div>
                                );
                            })()}</>
                        </span>
                    </div>
                )}
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
                                    <span className="power-skill-label">
                                        {p.skillCalc} ({minVal})
                                    </span>
                                </>
                            );
                        })()}
                    </div>
                ) : (
                    <span className="power-na-label">N/A</span>
                )}
            </td>
            <td className="power-cell">
                <Badge
                    label={selection.origin}
                    color={ORIGIN_TAG_COLORS[selection.origin] || 'gray'}
                />
            </td>
            <td className="power-cell">
                <DeleteRowButton onDelete={() => onRemove(index)} title="Eliminar poder" />
            </td>
        </tr>
    );
}

