import React from 'react';
import { POWERS } from '../../../../../data/powers';
import { calculateSkillBase, getCharacteristicValue, getRankLevel, getPowerPenalty } from '../utils';
import type { SelectedPower } from '../types';
import { Badge } from '../../../shared/Badge';
import { NumberControl } from '../../../shared/NumberControl';
import { CostBadge } from '../../../shared/CostBadge';
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
    isElfoFisico
}: PowerRowProps) {
    const p = POWERS.find(power => power.id === selection.id);
    if (!p) return null;

    const isHybridPenalty = isParahumanoHybrid && selection.origin === 'Alterado';
    const isSemidemonioBonus = isSemidemonio && selection.origin === 'Sobrenatural';
    const isEnanoGuardian = isEnano && selection.origin === 'Guardian';

    // Check for free powers
    const isTesKharFree = isTesKhar && p.id === 'superhabilidad';
    const isAtlanteFree = isAtlante && (p.id === 'superhabilidad' || p.id === 'control_del_agua' || p.id === 'empatia_animal');
    const isTrollFree = isTroll && p.id === 'regeneracion_de_tejidos';
    const isGrifoFree = isGrifo && p.id === 'volar';
    const isElfoFisicoFree = isElfoFisico && p.id === 'supervelocidad';

    const isFree = isTesKharFree || isTrollFree || isElfoFisicoFree;

    const penaltyInfo = getPowerPenalty(data, p);
    const isPenalty = penaltyInfo.type !== 'none';

    let displayBaseCostStr = p.cost.toString();
    if (isPenalty) {
        displayBaseCostStr = `${p.cost} + ${penaltyInfo.cost}`;
    } else if (isHybridPenalty) {
        displayBaseCostStr = `${p.cost} + 3`;
    } else if (isSemidemonioBonus && !p.characteristic) {
        displayBaseCostStr = `${p.cost} - 1`;
    } else if (isThalsDiscount) {
        displayBaseCostStr = `${p.cost} - 2`;
    } else if (isEnanoGuardian) {
        displayBaseCostStr = `${p.cost} + 2`;
    }

    const renderDisplayCost = () => {
        if (isFree) {
            return <span className="line-through text-red-500">{p.cost}</span>;
        }
        if (isThalsFree) {
            return <CostBadge cost={0} variant="free" />;
        }
        if (isAtlanteFree || isGrifoFree) {
            // Logic to show "Gratis" or difference based on rank
            let freeRank = 0;
            if (p.id === 'control_del_agua') freeRank = 11;
            else if (p.id === 'superhabilidad' && selection.selectedOption === 'Idioma nativo') freeRank = 41;
            else if (p.id === 'superhabilidad' && selection.selectedOption === 'Nadar') freeRank = 81;
            else if (p.id === 'empatia_animal') freeRank = 11;
            else if (isGrifo && p.id === 'volar') freeRank = 11;

            const diff = (selection.rank || 1) - freeRank;
            if (diff === 0) return <CostBadge cost={0} variant="free" />;
            return <CostBadge cost={p.cost} variant="variable" />;
        }
        return <span className='font-bold text-gray-700'>{displayBaseCostStr}</span>;
    };

    const isEven = index % 2 === 0;

    return (
        <tr key={`${selection.id}-${selection.origin}-${index}`} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{p.name}</span>
                    {isPenalty && (
                        <Badge label={penaltyInfo.label} color="yellow" className="text-xs" />
                    )}
                </div>
                {p.options && p.options.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder={p.options[0]}
                            value={selection.selectedOption || ''}
                            onChange={(e) => onUpdateOption(index, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.25rem',
                                fontSize: '0.8rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontWeight: 'normal',
                                color: '#4b5563'
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                                const penalty = isHybridPenalty ? 3 : 0;
                                const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);

                                let baseCost = p.cost;

                                if (isPenalty) {
                                    baseCost += penaltyInfo.cost;
                                }

                                if (isEnanoGuardian) {
                                    baseCost = p.cost + 2;
                                } else if (isSemidemonioBonus) {
                                    baseCost = Math.max(0, baseCost - 1);
                                } else if (isThalsDiscount) {
                                    baseCost = Math.max(0, baseCost - 2);
                                } else if (isThalsFree) {
                                    baseCost = 0;
                                } else if (isAtlante) {
                                    if (p.id === 'control_del_agua') baseCost = -1.1;
                                    else if (p.id === 'superhabilidad' && selection.selectedOption === 'Idioma nativo') baseCost = -4.1;
                                    else if (p.id === 'superhabilidad' && selection.selectedOption === 'Nadar') baseCost = -8.1;
                                    else if (p.id === 'empatia_animal') baseCost = -1.1;
                                } else if (isGrifo && p.id === 'volar') {
                                    baseCost = -1.1;
                                } else if (isElfoFisicoFree) {
                                    baseCost = 0;
                                }

                                const total = (baseCost + penalty + (selection.rank / 10) + extraCost + custCost);

                                if (isFree) return <CostBadge cost={0} variant="free" />;
                                return <CostBadge cost={total.toFixed(1)} />;
                            })()}
                        </div>

                        {/* Customizations List */}
                        {(selection.customizations || []).length > 0 && (
                            <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {selection.customizations?.map((cust, cIdx) => (
                                    <div key={cust.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                                        <input
                                            type="text"
                                            value={cust.description}
                                            placeholder="Detalle personalización"
                                            onChange={(e) => {
                                                const newCusts = [...(selection.customizations || [])];
                                                newCusts[cIdx] = { ...newCusts[cIdx], description: e.target.value };
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            style={{ flexGrow: 1, padding: '2px 4px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                                        />
                                        <input
                                            type="number"
                                            min="-10"
                                            max="10"
                                            value={cust.cost}
                                            onChange={(e) => {
                                                const newCusts = [...(selection.customizations || [])];
                                                const val = parseFloat(e.target.value) || 0;
                                                const clamped = Math.max(-10, Math.min(10, val));
                                                newCusts[cIdx] = { ...newCusts[cIdx], cost: clamped };
                                                onUpdateCustomizations(index, newCusts);
                                            }}
                                            style={{ width: '50px', padding: '2px 4px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'right' }}
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
                            {isFree ? (
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>¡Poder Gratuito por Origen!</span>
                            ) : (
                                <>{(() => {
                                    const powerMod = (selection.powerMod || 0);

                                    // Apply Semidemonio discount logic for display
                                    // "10 points free" in value (1 PC worth)
                                    let effectivePowerMod = powerMod;
                                    let discountText = null;

                                    if (isSemidemonioBonus) {
                                        // The first 10 points are free.
                                        // Cost is based on (powerMod - 10)
                                        effectivePowerMod = Math.max(0, powerMod - 10);
                                        discountText = "(-10 gratis)";
                                    }

                                    const modCost = effectivePowerMod / 10;
                                    const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);
                                    let baseCost = p.cost;

                                    // Cross-type penalty for mutants
                                    if (selection.isCrossType) {
                                        baseCost += 2;
                                    }

                                    // Cross-origin penalty for Guardián
                                    if (selection.isCrossOrigin) {
                                        baseCost += 3;
                                    }

                                    // Cross-origin penalty for Maldito
                                    if (selection.isCrossOriginMaldito) {
                                        baseCost += 1;
                                    }

                                    if (isEnanoGuardian) baseCost = p.cost + 2; // Enano restriction cost

                                    const total = baseCost + modCost + custCost;

                                    let penaltyDisplay = null;
                                    if (isPenalty) penaltyDisplay = <span style={{ color: '#92400e', fontWeight: 'bold' }}> + {penaltyInfo.cost}</span>;
                                    else if (isEnanoGuardian) penaltyDisplay = <span style={{ color: '#92400e', fontWeight: 'bold' }}> + 2</span>;


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
                            )}
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
