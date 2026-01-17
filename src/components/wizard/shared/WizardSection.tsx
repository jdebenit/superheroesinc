import React from 'react';
import './WizardSection.css';

interface WizardSectionProps {
    title: string;
    children: React.ReactNode;
    description?: React.ReactNode;
    icon?: string;
    color?: string;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    children,
    description,
    icon,
    color
}) => {
    return (
        <div className="wizard-section">
            <div
                className="wizard-section-header"
                style={color ? { borderBottomColor: color } : undefined}
            >
                <div>
                    <h3 className="wizard-section-title" style={color ? { color } : undefined}>
                        {icon && <span className="wizard-section-icon">{icon}</span>}
                        {title}
                    </h3>
                    {description && (
                        <div className="wizard-section-description">
                            {description}
                        </div>
                    )}
                </div>
            </div>
            <div className="wizard-section-content">
                {children}
            </div>
        </div>
    );
};
