import React from 'react';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';
import './SkillRow.css';

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
    // Helpers for classes
    const getModClass = (val: number) => {
        if (!val) return 'td-cell mod-text-empty';
        return `td-cell ${isSpecial ? 'mod-text-special' : 'mod-text-general'}`;
    };

    return (
        <tr className="skill-row">
            {/* Name */}
            <td className="td-name">
                {name}
            </td>

            {/* Formula */}
            <td className="td-cell td-formula">
                {formula}
            </td>

            {/* Base */}
            <td className="td-cell">
                <div className="base-input-container">
                    <input
                        type="number"
                        value={baseValue}
                        min={minBase}
                        onChange={(e) => onBaseChange(e.target.value)}
                        className={`base-input ${calcPCCost > 0 ? 'base-input-cost' : 'base-input-normal'}`}
                    />
                    {calcPCCost > 0 && (
                        <span className="cost-text">
                            {calcPCCost.toFixed(1)} PC
                        </span>
                    )}
                </div>
            </td>

            {/* Origin Mod */}
            <td className={getModClass(originMod)}>
                {originMod > 0 ? `+${originMod}` : originMod || '-'}
            </td>

            {/* Specialty Mod */}
            <td className={getModClass(specialtyMod)}>
                {specialtyMod > 0 ? `+${specialtyMod}` : specialtyMod || '-'}
            </td>

            {/* Manual Mod */}
            <td className="td-cell">
                <input
                    type="number"
                    value={manualMod || ''}
                    onChange={(e) => onModChange(e.target.value)}
                    placeholder="0"
                    className="manual-mod-input"
                />
            </td>

            {/* TOTAL */}
            <td className="td-cell total-cell">
                {total}%
            </td>

            {/* Special Columns */}
            {isSpecial && (
                <>
                    <td className="td-cell">
                        <span className={`special-col-cost ${totalPCCost > 0 ? 'cost-paid' : 'cost-free'}`}>
                            {totalPCCost > 0 ? `${totalPCCost.toFixed(1).replace('.0', '')} PC` : 'GRATIS'}
                        </span>
                        {calcPCCost > 0 && (
                            <div className="cost-basis-detail">
                                (Base: +{calcPCCost.toFixed(1)})
                            </div>
                        )}
                        {isRequired && (
                            <div className="required-text">
                                Obligatoria
                            </div>
                        )}
                    </td>
                    <td className="td-cell">
                        {!isFree && !isRequired && onRemove && (
                            <DeleteRowButton onDelete={onRemove} title="Eliminar" />
                        )}
                        {isFree && <span className="check-green">✓</span>}
                        {isRequired && <span className="check-orange">✓</span>}
                    </td>
                </>
            )}
        </tr>
    );
};
