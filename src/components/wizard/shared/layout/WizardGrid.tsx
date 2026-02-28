import React from 'react';
import './WizardGrid.css';

interface WizardGridProps {
    children: React.ReactNode;
    columns: string;
    mobileColumns?: string;
    gap?: string;
    headers?: string[];
    className?: string;
}

export const WizardGrid: React.FC<WizardGridProps> = ({
    children,
    columns,
    mobileColumns = '1fr',
    gap = '1rem',
    headers,
    className = ''
}) => {
    const gridStyle = {
        '--grid-columns': columns,
        '--mobile-columns': mobileColumns,
        '--grid-gap': gap
    } as React.CSSProperties;

    return (
        <div className={`wizard-grid-container ${className}`} style={gridStyle}>
            {headers && (
                <div className="wizard-grid-header">
                    {headers.map((header, idx) => (
                        <div key={idx} className="wizard-grid-header-cell">
                            {header}
                        </div>
                    ))}
                </div>
            )}
            <div className="wizard-grid-content">
                {children}
            </div>
        </div>
    );
};
