import React from 'react';
import { POWERS } from '../../../../../data/powers';
import { calculateSkillBase, getCharacteristicValue, getRankLevel } from '../utils';
import type { SelectedPower } from '../types';

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
}

const getCharName = (abbr: string): string => {
    const map: Record<string, string> = {
        'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
        'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
    };
    return map[abbr] || '';
};

const ORIGIN_STYLES: Record<string, any> = {
    'Guardian': { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
    'Alterado': { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' },
    'Vampírico': { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    'Sobrenatural': { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' },
    'Thals': { bg: '#ccfbf1', color: '#115e59', border: '#99f6e4' },
    'Divino': { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    'Cósmico': { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
    'Mutante': { bg: '#fce7f3', color: '#be123c', border: '#fbcfe8' }
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
    isThalsFree
}: PowerRowProps) {
    const p = POWERS.find(power => power.id === selection.id);
    if (!p) return null;

    const isHybridPenalty = isParahumanoHybrid && selection.origin === 'Alterado';
    const isSemidemonioBonus = isSemidemonio && selection.origin === 'Sobrenatural';

    // Check for free powers
    const isTesKharFree = isTesKhar && p.id === 'superhabilidad';
    const isAtlanteFree = isAtlante && (p.id === 'superhabilidad' || p.id === 'control_del_agua');
    const isTrollFree = isTroll && p.id === 'regeneracion_de_tejidos';
    const isFree = isTesKharFree || isAtlanteFree || isTrollFree;

    let displayBaseCostStr = p.cost.toString();
    if (isHybridPenalty) {
        displayBaseCostStr = `${p.cost} + 3`;
    } else if (isSemidemonioBonus && !p.characteristic) {
        // Show discount for normal powers
        displayBaseCostStr = `${p.cost} - 1`;
    } else if (isThalsDiscount) {
        displayBaseCostStr = `${p.cost} - 2`;
    }

    const displayCost = isFree ?
        <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{p.cost}</span>
        : (isThalsFree ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>0 (Gratis)</span> : displayBaseCostStr);

    const isEven = index % 2 === 0;
    const originStyle = ORIGIN_STYLES[selection.origin];

    return (
        <tr key={`${selection.id}-${selection.origin}-${index}`} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                {p.name}
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
                            <span style={{ color: '#6b7280', fontWeight: 'bold' }}>{displayCost}</span>
                            <span style={{ color: '#9ca3af' }}>+</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={selection.rank}
                                    onChange={(e) => onUpdateRank(index, parseInt(e.target.value, 10))}
                                    style={{
                                        width: '50px',
                                        padding: '0.25rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4f46e5'
                                    }}
                                />
                                <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Rango</span>
                            </div>
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
                            <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>
                                {(() => {
                                    const minVal = p.skillCalc ? calculateSkillBase(data, p.skillCalc) : 0;
                                    const currentVal = selection.skillValue || minVal;
                                    const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                                    const penalty = isHybridPenalty ? 3 : 0;
                                    // Sum customization costs
                                    const custCost = (selection.customizations || []).reduce((sum, c) => sum + (c.cost || 0), 0);

                                    // Apply Semidemonio Bonus (Discount 1 PC base)
                                    let baseCost = p.cost;
                                    if (isSemidemonioBonus) {
                                        baseCost = Math.max(0, baseCost - 1);
                                    } else if (isThalsDiscount) {
                                        baseCost = Math.max(0, baseCost - 2);
                                    } else if (isThalsFree) {
                                        baseCost = 0;
                                    }

                                    const total = (baseCost + penalty + (selection.rank / 10) + extraCost + custCost);

                                    if (isFree) return "0.0";
                                    return total.toFixed(1);
                                })()}
                            </span>
                            <span style={{ color: '#6b7280' }}>
                                {isFree ? "(Gratis)" : "PCs"}
                            </span>
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
                                                // Clamp between -10 and 10
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
                                    {getCharacteristicValue(data, getCharName(p.characteristic || ''))}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                    {p.characteristic}
                                </span>
                            </div>

                            <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>+</span>

                            {/* Power Mod Input */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <input
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={selection.powerMod || 0}
                                    onChange={(e) => {
                                        const charValue = getCharacteristicValue(data, getCharName(p.characteristic || ''));
                                        const newMod = parseInt(e.target.value, 10) || 0;
                                        const total = charValue + newMod;
                                        if (total <= 200) {
                                            onUpdateMod(index, newMod);
                                        }
                                    }}
                                    style={{
                                        width: '50px',
                                        padding: '0.25rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    }}
                                />
                                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                    Mod. Poder
                                </span>
                            </div>

                            <span style={{ color: '#9ca3af', paddingTop: '0.25rem' }}>=</span>

                            {/* Total */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                    {getCharacteristicValue(data, getCharName(p.characteristic || '')) + (selection.powerMod || 0)}
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
                                    const baseCost = p.cost; // Typically 0 for char traits

                                    const total = baseCost + modCost + custCost;

                                    return (
                                        <>
                                            {p.cost} + {modCost.toFixed(1)}
                                            {discountText && <span style={{ color: '#16a34a', marginLeft: '2px', fontSize: '10px' }}>{discountText}</span>}
                                            {custCost !== 0 && (
                                                <> {custCost >= 0 ? '+' : '-'} {Math.abs(custCost)} (Pers.)</>
                                            )}
                                            {' = '}{total.toFixed(1)} PCs
                                        </>
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
                                    <input
                                        type="number"
                                        min={minVal}
                                        value={selection.skillValue || minVal}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            onUpdateSkillValue(index, Math.max(minVal, val));
                                        }}
                                        style={{
                                            width: '60px',
                                            textAlign: 'center',
                                            padding: '0.25rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px'
                                        }}
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
                {originStyle && (
                    <span style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: '900',
                        letterSpacing: '0.05em',
                        backgroundColor: originStyle.bg,
                        color: originStyle.color,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: `1px solid ${originStyle.border}`
                    }}>
                        {selection.origin}
                    </span>
                )}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                    }}
                    style={{
                        color: '#ef4444',
                        padding: '8px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Eliminar poder"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}
