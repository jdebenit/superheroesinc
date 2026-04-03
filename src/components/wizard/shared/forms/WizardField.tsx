import React from 'react';
import './WizardField.css';

interface WizardFieldProps {
    label: React.ReactNode;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'textarea';
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    readOnly?: boolean;
    style?: React.CSSProperties;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    noMargin?: boolean;
    inputWidth?: string;
    textAlign?: 'left' | 'center' | 'right';
    hideLabelDesktop?: boolean;
    className?: string;
}

export const WizardField: React.FC<WizardFieldProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    readOnly = false,
    style,
    min,
    max,
    step,
    noMargin = false,
    inputWidth,
    textAlign = 'left',
    hideLabelDesktop = false,
    className = ''
}) => {
    const inputProps = {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
        placeholder,
        disabled,
        readOnly,
        className: `wizard-field-input ${error ? 'wizard-field-input-error' : ''}`,
        min,
        max,
        step,
        style: {
            width: inputWidth,
            textAlign
        }
    };

    const fieldClass = `wizard-field ${noMargin ? 'wizard-field-nomargin' : ''} ${hideLabelDesktop ? 'wizard-field-hide-label-desktop' : ''} ${className}`.trim();

    return (
        <div className={fieldClass} style={style}>
            {label && <label className="wizard-field-label">{label}</label>}
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
