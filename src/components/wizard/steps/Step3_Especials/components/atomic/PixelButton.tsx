import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'custom';
    customClass?: string; // allow overriding exact colors if needed
}

export const PixelButton: React.FC<PixelButtonProps> = ({
    children,
    variant = 'primary',
    customClass = '',
    className = '',
    ...props
}) => {
    // Base class from styles.ts (.pixel-button) should be globally available or imported.
    // Since styles.ts injects it into a <style> tag, we assume the class "pixel-button" exists in the context.
    // However, to be safe and atomic, we can replicate the base styles or ensure the class is used.

    // We'll rely on the class being present or strict tailwind equivalence if we want to de-couple from styles.ts.
    // For now, let's keep using the "pixel-button" class as it's defined in Step3 parent.

    // We can map variants to specific tailwind color classes commonly used in the app.
    // If 'custom' is used, we expect customClass to provide the bg/text/hover colors.

    let colorClasses = '';

    if (variant !== 'custom') {
        switch (variant) {
            case 'primary': // Blue usually
                colorClasses = 'bg-blue-600 text-white hover:bg-blue-700';
                break;
            case 'secondary': // Gray/Slate
                colorClasses = 'bg-slate-700 text-white hover:bg-slate-800';
                break;
            case 'danger': // Red
                colorClasses = 'bg-red-600 text-white hover:bg-red-700';
                break;
            case 'success': // Green
                colorClasses = 'bg-green-600 text-white hover:bg-green-700';
                break;
            case 'warning': // Yellow/Orange
                colorClasses = 'bg-yellow-500 text-white hover:bg-yellow-600';
                break;
            case 'info': // Cyan/Teal
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
