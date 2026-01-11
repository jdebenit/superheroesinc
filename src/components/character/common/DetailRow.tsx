import React from 'react';

interface DetailRowProps {
    label: React.ReactNode;
    value: React.ReactNode;
    className?: string; // Container class, e.g. "flex-row-baseline", "skill-row"
    valueClassName?: string; // e.g. "value-highlight-brown", "attr-value"
}

export const DetailRow: React.FC<DetailRowProps> = ({
    label,
    value,
    className = 'flex-row-baseline',
    valueClassName = ''
}) => {
    return (
        <div className={className} style={className === 'flex-row-baseline' ? {} : { display: 'flex', alignItems: 'baseline', width: '100%' }}>
            <span style={{ paddingRight: '0.5rem' }}>
                {label}
            </span>
            <span className="flex-spacer-dotted"></span>
            <span className={valueClassName}>
                {value}
            </span>
        </div>
    );
};
