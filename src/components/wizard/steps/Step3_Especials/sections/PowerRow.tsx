import React from 'react';
import { POWERS } from '../../../../../data/powers';
import { calculateSkillBase, getCharacteristicValue, getRankLevel, getPowerPenalty, getPowerCostConfig, calculatePowerBaseCost, getBaseCostAdjustment, type PowerContext } from '../utils';
import type { SelectedPower } from '../types';
import { Badge } from '../../../shared/Badge';
import { NumberControl } from '../../../shared/NumberControl';
import { CostBadge } from '../../../shared/CostBadge';
import { WizardField } from '../../../shared/WizardField';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';

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
        <tr key={`${selection.id}-${selection.origin}-${index}`} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{p.name}</span>
                    {isPenalty && penaltyInfo.label && (
                        <Badge label={penaltyInfo.label} color="yellow" className="text-xs" />
                    )}
                </div>
                {p.options && p.options.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
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
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {!p.characteristic ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            <div className="flex items-center">
                                {renderDisplayCost()}
                            </div>
                            <span style={{ color: '#9ca3af' }}>+</span>

                            <NumberControl
                                value={selection.rank}
                                onChange={(val) => onUpdateRank(index, val)}
                                min={1}
                                max={100}
                                label=""
                                description="Rango"
                            />

                            <span style={{ color: '#9ca3af' }}>/10</span>

                            {(() => {
                                const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                const currentVal = selection.skillValue || minVal;
                                const extraPoints = Math.max(0, currentVal - minVal);

                                if (extraPoints > 0) {
                                    return (
                                        <>
                                            <span style={{ color: '#9ca3af' }}>+</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#d97706' }}>{extraPoints}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Hab.</span>
                                            </div>
                                            <span style={{ color: '#9ca3af' }}>/10</span>
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
                                            <span style={{ color: '#9ca3af' }}>{custCost >= 0 ? '+' : '-'}</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: custCost >= 0 ? '#b91c1c' : '#10b981' }}>{Math.abs(custCost)}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Pers.</span>
                                            </div>
                                        </>
                                    );
                                }
                                return null;
                            })()}

                            <span style={{ color: '#9ca3af' }}>=</span>

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
                                            // color="gray" // Default
                                            className="text-lg font-bold"
                                        />
                                        <span className="text-xs text-gray-400">Total</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Customizations List */}
                        {(selection.customizations || []).length > 0 && (
                            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {selection.customizations?.map((cust, cIdx) => (
                                    <div key={cust.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
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
                                            style={{ flexGrow: 1 }}
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
                                            style={{ width: '80px' }}
                                        />
                                        <span style={{ color: '#6b7280' }}>PCs</span>
                                        <button
                                            onClick={() => {
                                                const newCusts = selection.customizations?.filter((_, i) => i !== cIdx) || [];
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            style={{ color: '#ef4444', fontWeight: 'bold', padding: '0 4px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: '0.25rem' }}>
                            <button
                                onClick={() => {
                                    const newCusts = [...(selection.customizations || [])];
                                    newCusts.push({ id: Date.now().toString(), description: '', cost: 0 });
                                    onUpdateCustomizations(index, newCusts);
                                }}
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#4f46e5',
                                    background: 'transparent',
                                    border: '1px dashed #4f46e5',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    cursor: 'pointer'
                                }}
                            >
                                + Personalización
                            </button>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>
                            {getRankLevel(selection.rank)}
                        </span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                            {/* Characteristic Value */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ color: '#6b7280', fontWeight: 'bold' }}>
                                    {getCharacteristicValue(data, getCharName(p.characteristic || '')) - (selection.powerMod || 0)}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                    {p.characteristic}
                                </span>
                            </div>

                            <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>+</span>

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

                            <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>=</span>

                            {/* Total */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                    {getCharacteristicValue(data, getCharName(p.characteristic || ''))}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                    Total
                                </span>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                            <>{(() => {
                                const powerMod = (selection.powerMod || 0);

                                // Apply Semidemonio discount logic for display
                                // "10 points free" in value (1 PC worth)
                                let effectivePowerMod = powerMod;
                                let discountText = null;

                                if (isSemidemonio && selection.origin === 'Sobrenatural') {
                                    // The first 10 points are free.
                                    // Cost is based on (powerMod - 10)
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
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                {p.skillCalc ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
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
                                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                                        {p.skillCalc} ({minVal})
                                    </span>
                                </>
                            );
                        })()}
                    </div>
                ) : (
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>N/A</span>
                )}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <Badge
                    label={selection.origin}
                    color={ORIGIN_TAG_COLORS[selection.origin] || 'gray'}
                />
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <DeleteRowButton onDelete={() => onRemove(index)} title="Eliminar poder" />
            </td>
        </tr>
    );
}
