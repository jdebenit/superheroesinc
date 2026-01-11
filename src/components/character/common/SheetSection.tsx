import React from 'react';

interface SheetSectionProps {
    title: string;
    className?: string; // e.g. "combat-section", "weapons"
    // 'cost' or 'headerExtra' will be rendered in the header right side. 
    // We keep the name 'cost' for backward compat with my recent changes but make it generic.
    cost?: React.ReactNode;
    children: React.ReactNode;
}

export const SheetSection: React.FC<SheetSectionProps> = ({ title, className = '', cost, children }) => {
    return (
        <div className={`sheet-section ${className}`}>
            <div className="section-header">
                <h4>{title}</h4>
                {cost && <span className="cost">{cost}</span>}
            </div>
            {children}
        </div>
    );
};
