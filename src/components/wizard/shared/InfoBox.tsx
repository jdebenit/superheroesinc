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
        <div className={`info-box info-box-${variant}`}>
            {icon && (
                <span className="info-box-icon">
                    {icon}
                </span>
            )}
            <div className="info-box-content">
                {children}
            </div>
        </div>
    );
};
