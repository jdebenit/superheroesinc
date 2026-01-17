import React from 'react';

interface EmptyStateProps {
    message: string;
    icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#9ca3af',
            fontWeight: 'bold',
            fontStyle: 'italic',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {icon && (
                <span style={{ fontSize: '2rem', opacity: 0.5 }}>
                    {icon}
                </span>
            )}
            <span>{message}</span>
        </div>
    );
};
