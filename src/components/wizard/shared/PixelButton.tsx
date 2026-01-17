import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'custom';
    customClass?: string;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
    children,
    variant = 'primary',
    customClass = '',
    className = '',
    ...props
}) => {
    let colorClasses = '';

    if (variant !== 'custom') {
        switch (variant) {
            case 'primary':
                colorClasses = 'bg-blue-600 text-white hover:bg-blue-700';
                break;
            case 'secondary':
                colorClasses = 'bg-slate-700 text-white hover:bg-slate-800';
                break;
            case 'danger':
                colorClasses = 'bg-red-600 text-white hover:bg-red-700';
                break;
            case 'success':
                colorClasses = 'bg-green-600 text-white hover:bg-green-700';
                break;
            case 'warning':
                colorClasses = 'bg-yellow-500 text-white hover:bg-yellow-600';
                break;
            case 'info':
                colorClasses = 'bg-cyan-600 text-white hover:bg-cyan-700';
                break;
        }
    }

    return (
        <button
            className={`pixel-button ${colorClasses} ${customClass} ${className} flex items-center justify-center gap-2`}
            {...props}
        >
            {children}
        </button>
    );
};
