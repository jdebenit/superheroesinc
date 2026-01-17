import React from 'react';
import './WizardSection.css';

interface WizardSectionProps {
    title: string;
    children: React.ReactNode;
    description?: React.ReactNode;
    icon?: string;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    children,
    description,
    icon
}) => {
    return (
        <div className="wizard-section">
            <div className="wizard-section-header">
                <div>
                    <h3 className="wizard-section-title">
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
