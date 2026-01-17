import React from 'react';
import './OriginOptionsContainer.css';

type ThemeColor = 'amber' | 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'magenta' | 'cyan';

interface OriginOptionsContainerProps {
    title: string;
    cost: number;
    themeColor: ThemeColor;
    description?: string;
    children: React.ReactNode;
}

export const OriginOptionsContainer: React.FC<OriginOptionsContainerProps> = ({
    title,
    cost,
    themeColor,
    description,
    children
}) => {
    return (
        <div className={`wizard-origin-container wizard-origin-container-${themeColor}`}>
            <div className="wizard-origin-header">
                <h3 className="wizard-origin-title">{title}</h3>
                <div className="wizard-origin-cost-badge">
                    {cost > 0 ? `+${cost}` : cost} PC
                </div>
            </div>

            <div className="wizard-origin-content">
                {description && (
                    <p className="wizard-origin-description">
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    );
};
