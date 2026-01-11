import React from 'react';

interface WizardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    fullWidth?: boolean;
}

export const WizardButton: React.FC<WizardButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    style,
    ...props
}) => {
    let baseStyle: React.CSSProperties = {
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style
    };

    if (fullWidth) {
        baseStyle.width = '100%';
    }

    switch (variant) {
        case 'primary':
            baseStyle = {
                ...baseStyle,
                backgroundColor: '#3b82f6',
                color: 'white',
            };
            break;
        case 'secondary':
            baseStyle = {
                ...baseStyle,
                backgroundColor: '#f3f4f6', // gray-100
                color: '#374151', // gray-700
                border: '1px solid #d1d5db' // gray-300
            };
            break;
        case 'danger':
            baseStyle = {
                ...baseStyle,
                backgroundColor: '#fee2e2', // red-100
                color: '#ef4444', // red-500
            };
            break;
        case 'ghost':
            baseStyle = {
                ...baseStyle,
                backgroundColor: 'transparent',
                color: '#6b7280', // gray-500
            };
            break;
    }

    return (
        <button style={baseStyle} {...props}>
            {children}
        </button>
    );
};
