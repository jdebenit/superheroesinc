import React from 'react';

type ThemeColor = 'amber' | 'blue' | 'purple' | 'green' | 'red';

interface OriginOptionsContainerProps {
    title: string;
    cost: number;
    themeColor: ThemeColor;
    description?: string;
    children: React.ReactNode;
}

const THEME_COLORS = {
    amber: {
        bg: '#fffbeb',
        border: '#f59e0b',
        headerBorder: '#fcd34d',
        titleColor: '#b45309',
        badgeBg: '#f59e0b'
    },
    blue: {
        bg: '#eff6ff',
        border: '#2563eb',
        headerBorder: '#bfdbfe',
        titleColor: '#1e40af',
        badgeBg: '#2563eb'
    },
    purple: {
        bg: '#faf5ff',
        border: '#9333ea',
        headerBorder: '#e9d5ff',
        titleColor: '#6b21a8',
        badgeBg: '#9333ea'
    },
    green: {
        bg: '#f0fdf4',
        border: '#16a34a',
        headerBorder: '#bbf7d0',
        titleColor: '#15803d',
        badgeBg: '#16a34a'
    },
    red: {
        bg: '#fef2f2',
        border: '#dc2626',
        headerBorder: '#fecaca',
        titleColor: '#991b1b',
        badgeBg: '#dc2626'
    }
};

export const OriginOptionsContainer: React.FC<OriginOptionsContainerProps> = ({
    title,
    cost,
    themeColor,
    description,
    children
}) => {
    const theme = THEME_COLORS[themeColor];

    return (
        <div style={{
            backgroundColor: theme.bg,
            border: `2px solid ${theme.border}`,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${theme.headerBorder}`
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: theme.titleColor
                }}>{title}</h3>

                <div style={{
                    backgroundColor: theme.badgeBg,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {cost > 0 ? `+${cost}` : cost} PC
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                {description && (
                    <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                        {description}
                    </p>
                )}
                {children}
            </div>
        </div>
    );
};
