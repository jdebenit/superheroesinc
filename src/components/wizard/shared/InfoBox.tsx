import React from 'react';

type InfoBoxVariant = 'warning' | 'info' | 'success' | 'error';

interface InfoBoxProps {
    children: React.ReactNode;
    variant?: InfoBoxVariant;
    icon?: string;
}

const VARIANT_STYLES: Record<InfoBoxVariant, { bg: string; border: string; text: string }> = {
    warning: {
        bg: '#fef3c7',
        border: '#f59e0b',
        text: '#92400e'
    },
    info: {
        bg: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af'
    },
    success: {
        bg: '#dcfce7',
        border: '#16a34a',
        text: '#166534'
    },
    error: {
        bg: '#fee2e2',
        border: '#ef4444',
        text: '#991b1b'
    }
};

export const InfoBox: React.FC<InfoBoxProps> = ({
    children,
    variant = 'info',
    icon
}) => {
    const styles = VARIANT_STYLES[variant];

    return (
        <div style={{
            padding: '1rem',
            backgroundColor: styles.bg,
            border: `2px solid ${styles.border}`,
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
        }}>
            {icon && (
                <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                    {icon}
                </span>
            )}
            <div style={{ color: styles.text, flex: 1 }}>
                {children}
            </div>
        </div>
    );
};
