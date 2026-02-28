import React from 'react';
import { WizardField } from './WizardField';
import './WizardRange.css';

interface WizardRangeProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    showInput?: boolean;
    suffix?: string;
}

export const WizardRange: React.FC<WizardRangeProps> = ({
    min,
    max,
    value,
    onChange,
    showInput = true,
    suffix
}) => {
    return (
        <div className="wizard-range-container">
            <span className="wizard-range-label">{min}</span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="wizard-range-input"
            />
            <span className="wizard-range-label">{max}</span>

            {showInput && (
                <div className="wizard-range-number-input-wrapper">
                    <WizardField
                        label=""
                        type="number"
                        min={min.toString()}
                        max={max.toString()}
                        value={value}
                        onChange={(val) => onChange(parseInt(val as string) || min)}
                        noMargin
                    />
                    {suffix && <span className="wizard-range-percent-symbol">{suffix}</span>}
                </div>
            )}
        </div>
    );
};
