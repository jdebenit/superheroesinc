import React from 'react';
import { SPELLS, type Spell } from '../../../../../data/spells';
import { calculateEM, hasSubtype } from '../utils';
import type { SelectedPower, SelectedSpell } from '../types';

interface MagicSectionProps {
    data: any;
    selectedSpells: Array<Spell & { rank: number }>;
    selectedPowers: SelectedPower[];
    emFormula: { divisor: number; pcCost: number };
    hasEMFormula: boolean;
    isMago: boolean;
    isDotado: boolean;
    isHibrido: boolean;
    isTerrano: boolean;
    onOpenSpellModal: () => void;
    onUpdateEMFormula: (divisor: number, pcCost: number) => void;
    onUpdateSpellRank: (id: string, rank: number) => void;
    onRemoveSpell: (id: string) => void;
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
    onOpenSpellModal,
    onUpdateEMFormula,
    onUpdateSpellRank,
    onRemoveSpell
}: MagicSectionProps) {
    const canSelectSpells = emFormula.divisor !== 0;

    return (
        <div className="bg-indigo-50 border-4 border-indigo-600 rounded-xl overflow-hidden shadow-[8px_8px_0px_#4f46e5]">
            <div className="p-6 border-b-4 border-indigo-600 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-indigo-900 uppercase italic font-comic">Magia</h3>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-indigo-50/50">
                {/* EM Formula Selector (for Dotado/Híbrido, not Mago) */}
                {hasEMFormula && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#4f46e5',
                            marginBottom: '0.5rem'
                        }}>
                            Fórmula de Energía Mágica
                        </label>
                        <select
                            value={`${emFormula.divisor}-${emFormula.pcCost}`}
                            onChange={(e) => {
                                const [divisor, pcCost] = e.target.value.split('-').map(Number);
                                onUpdateEMFormula(divisor, pcCost);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #6366f1',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#4f46e5',
                                cursor: 'pointer'
                            }}
                        >
                            {isDotado && (
                                <>
                                    <option value="2-8">Dotado: (PER+INT+VOL)/2 → +8 PCs</option>
                                    <option value="3-3">Dotado: (PER+INT+VOL)/3 → +3 PCs</option>
                                    <option value="4-0">Dotado: (PER+INT+VOL)/4 → +0 PCs</option>
                                </>
                            )}
                            {isHibrido && (
                                <>
                                    <option value="2-15">Híbrido: (PER+INT+VOL)/2 → +15 PCs</option>
                                    <option value="3-10">Híbrido: (PER+INT+VOL)/3 → +10 PCs</option>
                                    <option value="4-7">Híbrido: (PER+INT+VOL)/4 → +7 PCs</option>
                                    <option value="0-0">Híbrido: No EM</option>
                                </>
                            )}
                            {isTerrano && (
                                <>
                                    <option value="4-0">Terrano: (PER+INT+VOL)/4 → +0 PCs</option>
                                    <option value="0--5">Terrano: No EM → -5 PCs</option>
                                </>
                            )}
                        </select>
                    </div>
                )}

                <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}>
                    <button
                        onClick={onOpenSpellModal}
                        disabled={emFormula.divisor === 0}
                        className="pixel-button bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap px-4 py-2"
                        style={{ opacity: emFormula.divisor === 0 ? 0.5 : 1, cursor: emFormula.divisor === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        + Abrir Lista de Hechizos
                    </button>

                    {/* Counter Box - Only show if EM is available */}
                    {emFormula.divisor !== 0 && (
                        <div style={{
                            backgroundColor: '#eef2ff',
                            border: '2px solid #6366f1',
                            borderRadius: '8px',
                            padding: '1rem',
                            flex: 1
                        }}>
                            {(() => {
                                const totalCost = selectedSpells.reduce((acc, s) => {
                                    const baseCost = parseInt(s.cost, 10) || 0;
                                    const effectiveRank = s.rank;
                                    return acc + (baseCost * effectiveRank);
                                }, 0);
                                const maxEM = calculateEM(data, selectedPowers, isMago ? 1 : emFormula.divisor);
                                const isOver = totalCost > maxEM;
                                const extraPC = isOver ? ((totalCost - maxEM) * 0.1).toFixed(1) : '0.0';

                                // Build formula display
                                const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
                                const divisor = isMago ? 1 : emFormula.divisor;
                                let formulaText = isSemidemonio ? '(PER+INT+VOL+CON)' : '(PER+INT+VOL)';
                                if (divisor > 1) {
                                    formulaText += `/${divisor}`;
                                }

                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontSize: '1rem' }}>
                                                Energía Mágica: {formulaText}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.125rem' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isOver ? '#ef4444' : '#6366f1' }}>
                                                    {totalCost}
                                                </span>
                                                <span style={{ color: '#9ca3af', margin: '0 0.25rem' }}>/</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4b5563' }}>
                                                    {maxEM}
                                                </span>
                                                <span style={{ fontSize: '0.875rem', color: '#6366f1', marginLeft: '0.25rem', fontWeight: 'bold' }}>
                                                    EM
                                                </span>
                                            </span>
                                            {isOver && (
                                                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>
                                                    Coste Extra: +{extraPC} PC
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {selectedSpells.length > 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        marginTop: '1.5rem'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Hechizo</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Rango</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Coste</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Requisitos</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSpells.map((s, idx) => {
                                    const isEven = idx % 2 === 0;
                                    const baseCost = parseInt(s.cost, 10) || 0;
                                    const maestriaValue = s.maxRank + 2;
                                    const isMaestria = s.rank === maestriaValue;
                                    const effectiveRank = isMaestria ? maestriaValue : s.rank;
                                    const totalCost = baseCost * effectiveRank;

                                    return (
                                        <tr key={s.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                {s.name}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <select
                                                    value={s.rank}
                                                    onChange={(e) => onUpdateSpellRank(s.id, parseInt(e.target.value, 10))}
                                                    style={{
                                                        padding: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'white',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 'bold',
                                                        color: '#4f46e5',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {Array.from({ length: s.maxRank }, (_, i) => i + 1).map(rank => (
                                                        <option key={rank} value={rank}>{rank}</option>
                                                    ))}
                                                    <option key="maestria" value={s.maxRank + 2}>Maestría</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: isMaestria ? '#f3e8ff' : '#eef2ff',
                                                    color: isMaestria ? '#7c3aed' : '#4f46e5',
                                                    padding: '4px 12px',
                                                    borderRadius: '9999px',
                                                    border: isMaestria ? '1px solid #ddd6fe' : '1px solid #e0e7ff',
                                                    display: 'inline-block'
                                                }}>
                                                    {baseCost} × {isMaestria ? `${maestriaValue} (M)` : effectiveRank} = {totalCost} EM
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                                {s.requirements !== "No especificado" ? s.requirements : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveSpell(s.id);
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
                                                    title="Olvidar hechizo"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                        No hay hechizos memorizados
                    </div>
                )}
            </div>
        </div>
    );
}
