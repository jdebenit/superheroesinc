import React from 'react';
import './InfoBox.css';

type InfoBoxVariant = 'warning' | 'info' | 'success' | 'error';

interface InfoBoxProps {
    children: React.ReactNode;
    variant?: InfoBoxVariant;
    icon?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
    children,
    variant = 'info',
    icon
}) => {
    return (
        <div className={`wizard-info-box wizard-info-box-${variant}`}>
            {icon && (
                <span className="wizard-info-box-icon">
                    {icon}
                </span>
            )}
            <div className="wizard-info-box-content">
                {children}
            </div>
        </div>
    );
};
