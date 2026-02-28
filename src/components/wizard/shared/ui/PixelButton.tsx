import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'custom' |
    'vampirico' | 'alterado' | 'sobrenatural' | 'thals' | 'divino' | 'terrano' | 'guardian' | 'dotado' | 'cosmico' | 'mutante' | 'ente' | 'psiquico';
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
            case 'vampirico':
                colorClasses = 'bg-red-700 text-white hover:bg-red-800';
                break;
            case 'alterado':
                colorClasses = 'bg-purple-600 text-white hover:bg-purple-700';
                break;
            case 'sobrenatural':
                colorClasses = 'bg-orange-600 text-white hover:bg-orange-700';
                break;
            case 'thals':
                colorClasses = 'bg-teal-600 text-white hover:bg-teal-700';
                break;
            case 'divino':
                colorClasses = 'bg-amber-500 text-white hover:bg-amber-600';
                break;
            case 'terrano':
            case 'guardian':
                colorClasses = 'bg-emerald-600 text-white hover:bg-emerald-700';
                break;
            case 'dotado':
                colorClasses = 'bg-amber-600 text-white hover:bg-amber-700';
                break;
            case 'cosmico':
                colorClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';
                break;
            case 'mutante':
                colorClasses = 'bg-pink-600 text-white hover:bg-pink-700';
                break;
            case 'ente':
                colorClasses = 'bg-purple-500 text-white hover:bg-purple-600';
                break;
            case 'psiquico':
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
