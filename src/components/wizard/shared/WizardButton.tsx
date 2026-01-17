import React from 'react';
import './WizardButton.css';

interface WizardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    fullWidth?: boolean;
}

export const WizardButton: React.FC<WizardButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const classes = [
        'wizard-btn',
        `wizard-btn-${variant}`,
        fullWidth ? 'wizard-btn-full' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export type { WizardButtonProps };
