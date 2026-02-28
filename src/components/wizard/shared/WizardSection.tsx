import React, { useState } from 'react';
import './WizardSection.css';

interface WizardSectionProps {
    title: string;
    children?: React.ReactNode;
    description?: React.ReactNode;
    icon?: string;
    color?: string;
    rightContent?: React.ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    children,
    description,
    icon,
    color,
    rightContent,
    collapsible = false,
    defaultCollapsed = false
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    return (
        <div className="wizard-section">
            <div
                className={`wizard-section-header ${collapsible ? 'wizard-section-header-collapsible' : ''}`}
                style={color ? { borderBottomColor: color } : undefined}
                onClick={collapsible ? () => setCollapsed(c => !c) : undefined}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        {collapsible && (
                            <span className={`wizard-section-chevron ${collapsed ? 'wizard-section-chevron-collapsed' : ''}`}>
                                ▾
                            </span>
                        )}
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
                    {rightContent && (
                        <div className="wizard-section-right-content">
                            {rightContent}
                        </div>
                    )}
                </div>
            </div>
            {children && !collapsed && (
                <div className="wizard-section-content">
                    {children}
                </div>
            )}
        </div>
    );
};
