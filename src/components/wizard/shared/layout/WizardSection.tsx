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
    onHelp?: () => void;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    children,
    description,
    icon,
    color,
    rightContent,
    collapsible = false,
    defaultCollapsed = false,
    onHelp
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {rightContent && (
                            <div className="wizard-section-right-content">
                                {rightContent}
                            </div>
                        )}
                        {onHelp && (
                            <button
                                className="wizard-section-help-btn"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent collapse tracking
                                    onHelp();
                                }}
                                title="Ayuda sobre esta sección"
                                aria-label="Ayuda"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            </button>
                        )}
                    </div>
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
