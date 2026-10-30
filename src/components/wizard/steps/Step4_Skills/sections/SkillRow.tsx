import React from 'react';
import { DeleteRowButton } from '../../../shared/ui/DeleteRowButton';
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
    unlockManualMod?: boolean;

    // Handlers
    onBaseChange: (val: string) => void;
    onModChange: (val: string) => void;
    onRemove?: () => void;
}

const formatPCValue = (val: number, keepOneDecimal = false) => {
    const rounded = Math.round(val * 100) / 100;
    if (keepOneDecimal && Math.abs(rounded * 10 - Math.round(rounded * 10)) < 1e-6) {
        return rounded.toFixed(1);
    }
    return Number(rounded.toFixed(2)).toString();
};

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
    unlockManualMod = false,
    onBaseChange,
    onModChange,
    onRemove
}) => {
    // Helpers for classes
    const getModClass = (val: number) => {
        if (!val) return 'wizard-td-cell wizard-mod-text-empty';
        return `wizard-td-cell ${isSpecial ? 'wizard-mod-text-special' : 'wizard-mod-text-general'}`;
    };

    return (
        <tr className="wizard-skill-row">
            {/* Name */}
            <td className="wizard-td-name">
                {name}
            </td>

            {/* Formula */}
            <td className="wizard-td-cell wizard-td-formula">
                {formula}
            </td>

            {/* Base */}
            <td className="wizard-td-cell">
                <div className="wizard-base-input-container">
                    <input
                        type="number"
                        value={baseValue}
                        min={minBase}
                        onChange={(e) => onBaseChange(e.target.value)}
                        className={`wizard-base-input ${calcPCCost > 0 ? 'wizard-base-input-cost' : 'wizard-base-input-normal'}`}
                    />
                    {calcPCCost > 0 && (
                        <span className="wizard-cost-text">
                            {formatPCValue(calcPCCost, true)} PC
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
            <td className="wizard-td-cell">
                <input
                    type="number"
                    value={manualMod || ''}
                    onChange={(e) => onModChange(e.target.value)}
                    placeholder="0"
                    className={`wizard-manual-mod-input ${unlockManualMod ? 'unlocked-field' : ''}`}
                    disabled={!unlockManualMod}
                />
            </td>

            {/* TOTAL */}
            <td className="wizard-td-cell wizard-total-cell">
                <span>{total}%</span>
            </td>

            {/* Special Columns */}
            {isSpecial && (
                <>
                    <td className="wizard-td-cell">
                        <span className={`wizard-special-col-cost ${totalPCCost > 0 ? 'wizard-cost-paid' : 'wizard-cost-free'}`}>
                            {totalPCCost > 0 ? `${formatPCValue(totalPCCost)} PC` : 'GRATIS'}
                        </span>
                        {calcPCCost > 0 && (
                            <div className="wizard-cost-basis-detail">
                                (Base: +{formatPCValue(calcPCCost, true)})
                            </div>
                        )}
                        {isRequired && (
                            <div className="wizard-required-text">
                                Obligatoria
                            </div>
                        )}
                    </td>
                    <td className="wizard-td-cell">
                        {!isFree && !isRequired && onRemove && (
                            <DeleteRowButton onDelete={onRemove} title="Eliminar" />
                        )}
                        {isFree && <span className="wizard-check-green">✓</span>}
                        {isRequired && <span className="wizard-check-orange">✓</span>}
                    </td>
                </>
            )}
        </tr>
    );
};
