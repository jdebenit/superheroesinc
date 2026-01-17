import React from 'react';
import './FormSelect.css';

export interface FormSelectOption {
    id: string;
    label: string;
    cost?: number;
    description?: string;
}

export interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FormSelectOption[];
    placeholder?: string;
    labelColor?: string;
    showDescription?: boolean;
    showCostInOption?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = '-- Select --',
    labelColor = '#1f2937',
    showDescription = true,
    showCostInOption = true
}) => {
    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="form-select-container">
            <label
                className="form-select-label"
                style={{ color: labelColor }}
            >
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="form-select"
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                        {showCostInOption && option.cost !== undefined && (
                            ` (${option.cost > 0 ? '+' : ''}${option.cost} PC)`
                        )}
                    </option>
                ))}
            </select>
            {showDescription && selectedOption?.description && (
                <p className="form-select-description">
                    {selectedOption.description}
                </p>
            )}
        </div>
    );
};
