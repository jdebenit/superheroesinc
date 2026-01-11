import React from 'react';

interface WizardFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
    label: string | React.ReactNode;
    error?: string;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'password' | 'email';
    options?: { label: string; value: string | number }[]; // For select type
}

export const WizardField: React.FC<WizardFieldProps> = ({
    label,
    error,
    type = 'text',
    options,
    style,
    ...props
}) => {
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
        outline: 'none',
        ...style
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: '0.5rem'
    };

    const renderInput = () => {
        if (type === 'textarea') {
            return (
                <textarea
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            );
        }

        if (type === 'select') {
            return (
                <select
                    style={inputStyle}
                    {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
                >
                    {options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                    {!options && props.children}
                </select>
            );
        }

        return (
            <input
                type={type}
                style={inputStyle}
                {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        );
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>{label}</label>
            {renderInput()}
            {error && <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{error}</span>}
        </div>
    );
};
