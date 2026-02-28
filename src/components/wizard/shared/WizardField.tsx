import React from 'react';
import './WizardField.css';

interface WizardFieldProps {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'textarea';
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    min?: string | number;
    noMargin?: boolean;
}

export const WizardField: React.FC<WizardFieldProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    style,
    min,
    noMargin = false
}) => {
    const inputProps = {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
        placeholder,
        disabled,
        className: `wizard-field-input ${error ? 'wizard-field-input-error' : ''}`,
        min
    };

    return (
        <div className={`wizard-field ${noMargin ? 'wizard-field-nomargin' : ''}`} style={style}>
            <label className="wizard-field-label">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    {...inputProps}
                    className={`wizard-field-textarea ${error ? 'wizard-field-input-error' : ''}`}
                />
            ) : (
                <input
                    type={type}
                    {...inputProps}
                />
            )}
            {error && <span className="wizard-field-error">{error}</span>}
        </div>
    );
};
