import React from 'react';

export interface FormSelectOption {
    id: string;
    label: string;
    cost?: number;
    description?: string;
}

interface FormSelectProps {
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
    placeholder = '-- Seleccionar --',
    labelColor = '#1f2937',
    showDescription = true,
    showCostInOption = true
}) => {
    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div>
            <label style={{
                display: 'block',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: labelColor,
                marginBottom: '0.75rem',
                textTransform: 'uppercase'
            }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#1f2937',
                    cursor: 'pointer',
                    outline: 'none'
                }}
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
                <p style={{
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    margin: '0.5rem 0 0 0'
                }}>
                    {selectedOption.description}
                </p>
            )}
        </div>
    );
};
