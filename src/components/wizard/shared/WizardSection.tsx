import React from 'react';
import './WizardSection.css';

interface WizardSectionProps {
    title: string;
    children: React.ReactNode;
    description?: React.ReactNode;
    icon?: string;
    color?: string;
    rightContent?: React.ReactNode;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    children,
    description,
    icon,
    color,
    rightContent
}) => {
    return (
        <div className="wizard-section">
            <div
                className="wizard-section-header"
                style={color ? { borderBottomColor: color } : undefined}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
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
                    {rightContent && (
                        <div className="wizard-section-right-content">
                            {rightContent}
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
