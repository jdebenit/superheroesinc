import React from 'react';

interface WizardSectionProps {
    title: string | React.ReactNode;
    color?: string;
    children: React.ReactNode;
    className?: string;
    description?: React.ReactNode;
}

export const WizardSection: React.FC<WizardSectionProps> = ({
    title,
    color = '#4b5563',
    children,
    className = '',
    description
}) => {
    // Determine border color based on text color (lighter version)
    // This is a simple approximation

    return (
        <div
            className={`wizard-section ${className}`}
            style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
        >
            <div style={{
                marginBottom: '1rem',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '0.5rem',
                borderColor: `${color}33` // 20% opacity of the color
            }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: 0
                }}>
                    {title}
                </h3>
                {description && (
                    <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>
                        {description}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
};
