import React from 'react';

interface SkillRowProps {
    // Content
    name: React.ReactNode;
    formula: React.ReactNode;

    // Values
    baseValue: number;
    minBase: number;
    originMod: number;
    specialtyMod: number;
    manualMod: number;
    total: number;

    // Config
    isSpecial?: boolean;
    pcCost?: number; // Base PC cost of the skill itself (base points)
    calcPCCost?: number; // Cost from raising base
    totalPCCost?: number;
    isFree?: boolean;
    isRequired?: boolean;

    // Handlers
    onBaseChange: (val: string) => void;
    onModChange: (val: string) => void;
    onRemove?: () => void;
}

export const SkillRow: React.FC<SkillRowProps> = ({
    name,
    formula,
    baseValue,
    minBase,
    originMod,
    specialtyMod,
    manualMod,
    total,
    isSpecial = false,
    pcCost = 0,
    calcPCCost = 0,
    totalPCCost = 0,
    isFree = false,
    isRequired = false,
    onBaseChange,
    onModChange,
    onRemove
}) => {
    // Styles
    const cellStyle = { padding: '0.75rem', textAlign: 'center' as const };
    const modCellStyle = (val: number) => ({
        ...cellStyle,
        color: val ? (isSpecial ? '#7c3aed' : '#2563eb') : '#9ca3af',
        fontWeight: val ? 'bold' : 'normal'
    });

    const inputStyle = {
        width: '50px',
        padding: '0.25rem',
        border: calcPCCost > 0 ? '2px solid #f59e0b' : '1px solid #d1d5db',
        borderRadius: '4px',
        textAlign: 'center' as const,
        fontWeight: 'bold'
    };

    return (
        <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
            {/* Name */}
            <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#1f2937' }}>
                {name}
            </td>

            {/* Formula */}
            <td style={{ ...cellStyle, color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                {formula}
            </td>

            {/* Base */}
            <td style={cellStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <input
                        type="number"
                        value={baseValue}
                        min={minBase}
                        onChange={(e) => onBaseChange(e.target.value)}
                        style={inputStyle}
                    />
                    {calcPCCost > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                            {calcPCCost.toFixed(1)} PC
                        </span>
                    )}
                </div>
            </td>

            {/* Origin Mod */}
            <td style={modCellStyle(originMod)}>
                {originMod > 0 ? `+${originMod}` : originMod || '-'}
            </td>

            {/* Specialty Mod */}
            <td style={modCellStyle(specialtyMod)}>
                {specialtyMod > 0 ? `+${specialtyMod}` : specialtyMod || '-'}
            </td>

            {/* Manual Mod */}
            <td style={cellStyle}>
                <input
                    type="number"
                    value={manualMod || ''}
                    onChange={(e) => onModChange(e.target.value)}
                    placeholder="0"
                    style={{
                        width: '50px',
                        padding: '0.25rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}
                />
            </td>

            {/* TOTAL */}
            <td style={{ ...cellStyle, fontWeight: 'bold', fontSize: '1.125rem', color: '#059669' }}>
                {total}%
            </td>

            {/* Special Columns */}
            {isSpecial && (
                <>
                    <td style={cellStyle}>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: totalPCCost > 0 ? '#b45309' : '#10b981'
                        }}>
                            {totalPCCost > 0 ? `${totalPCCost.toFixed(1).replace('.0', '')} PC` : 'GRATIS'}
                        </span>
                        {calcPCCost > 0 && (
                            <div style={{ fontSize: '0.7em', color: '#666' }}>
                                (Base: +{calcPCCost.toFixed(1)})
                            </div>
                        )}
                        {isRequired && (
                            <div style={{ fontSize: '0.7em', color: '#b45309', fontStyle: 'italic' }}>
                                Obligatoria
                            </div>
                        )}
                    </td>
                    <td style={cellStyle}>
                        {!isFree && !isRequired && onRemove && (
                            <button
                                onClick={onRemove}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#fee2e2',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem'
                                }}
                                title="Eliminar"
                            >
                                ✕
                            </button>
                        )}
                        {isFree && <span style={{ fontSize: '1.25rem', color: '#10b981' }}>✓</span>}
                        {isRequired && <span style={{ fontSize: '1.25rem', color: '#f59e0b' }}>✓</span>}
                    </td>
                </>
            )}
        </tr>
    );
};
