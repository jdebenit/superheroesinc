import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
    message: string;
    icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
    return (
        <div className="wizard-empty-state">
            {icon && (
                <span className="wizard-empty-state-icon">
                    {icon}
                </span>
            )}
            <span>{message}</span>
        </div>
    );
};
