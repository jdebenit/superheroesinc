import React from 'react';
import { PixelButton, type PixelButtonProps } from './PixelButton';
import './WizardButton.css';

interface WizardButtonProps extends Omit<PixelButtonProps, 'variant' | 'customClass'> {
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
    const wizardClasses = [
        'wizard-btn',
        `wizard-btn-${variant}`,
        fullWidth ? 'wizard-btn-full' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <PixelButton
            variant="custom"
            customClass={wizardClasses}
            {...props}
        >
            {children}
        </PixelButton>
    );
};

export type { WizardButtonProps };
