import React, { type ReactNode } from 'react';

type SectionTheme = 'gray' | 'red' | 'blue' | 'purple' | 'green' | 'yellow' | 'orange' | 'teal' | 'slate' | 'stone' | 'amber' | 'indigo' | 'pink' | 'emerald';

interface SectionContainerProps {
    title?: string;
    description?: string;
    theme?: SectionTheme;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

const themeStyles: Record<SectionTheme, {
    container: string;
    border: string;
    headerBg: string; // The header background (usually white, but border color matters)
    headerBorder: string;
    title: string;
    bodyBg: string; // The content background
}> = {
    gray: {
        container: 'bg-gray-50',
        border: 'border-gray-800',
        headerBg: 'bg-white',
        headerBorder: 'border-gray-800',
        title: 'text-gray-800',
        bodyBg: 'bg-white' // Often the inner content has its own bg, but the container guides it
    },
    red: {
        container: 'bg-red-50',
        border: 'border-red-900',
        headerBg: 'bg-white',
        headerBorder: 'border-red-900',
        title: 'text-red-900',
        bodyBg: 'bg-red-50/50'
    },
    slate: {
        container: 'bg-slate-50',
        border: 'border-slate-700',
        headerBg: 'bg-white',
        headerBorder: 'border-slate-700',
        title: 'text-slate-800',
        bodyBg: 'bg-slate-100'
    },
    // Add others as needed, defaulting to gray-like if unsure, but I'll add common ones found
    blue: {
        container: 'bg-blue-50',
        border: 'border-blue-800',
        headerBg: 'bg-white',
        headerBorder: 'border-blue-800',
        title: 'text-blue-800',
        bodyBg: 'bg-blue-50'
    },
    purple: {
        container: 'bg-purple-50',
        border: 'border-purple-800',
        headerBg: 'bg-white',
        headerBorder: 'border-purple-800',
        title: 'text-purple-800',
        bodyBg: 'bg-purple-50'
    },
    green: {
        container: 'bg-green-50',
        border: 'border-green-800',
        headerBg: 'bg-white',
        headerBorder: 'border-green-800',
        title: 'text-green-800',
        bodyBg: 'bg-green-50'
    },
    yellow: {
        container: 'bg-yellow-50',
        border: 'border-yellow-600',
        headerBg: 'bg-white',
        headerBorder: 'border-yellow-600',
        title: 'text-yellow-700',
        bodyBg: 'bg-yellow-50'
    },
    orange: {
        container: 'bg-orange-50',
        border: 'border-orange-800',
        headerBg: 'bg-white',
        headerBorder: 'border-orange-800',
        title: 'text-orange-800',
        bodyBg: 'bg-orange-50'
    },
    teal: {
        container: 'bg-teal-50',
        border: 'border-teal-800',
        headerBg: 'bg-white',
        headerBorder: 'border-teal-800',
        title: 'text-teal-800',
        bodyBg: 'bg-teal-50'
    },
    stone: {
        container: 'bg-stone-50',
        border: 'border-stone-800',
        headerBg: 'bg-white',
        headerBorder: 'border-stone-800',
        title: 'text-stone-800',
        bodyBg: 'bg-stone-50'
    },
    amber: {
        container: 'bg-amber-50',
        border: 'border-amber-800',
        headerBg: 'bg-white',
        headerBorder: 'border-amber-800',
        title: 'text-amber-800',
        bodyBg: 'bg-amber-50'
    },
    indigo: {
        container: 'bg-indigo-50',
        border: 'border-indigo-800',
        headerBg: 'bg-white',
        headerBorder: 'border-indigo-800',
        title: 'text-indigo-800',
        bodyBg: 'bg-indigo-50'
    },
    pink: {
        container: 'bg-pink-50',
        border: 'border-pink-800',
        headerBg: 'bg-white',
        headerBorder: 'border-pink-800',
        title: 'text-pink-800',
        bodyBg: 'bg-pink-50'
    },
    emerald: {
        container: 'bg-emerald-50',
        border: 'border-emerald-800',
        headerBg: 'bg-white',
        headerBorder: 'border-emerald-800',
        title: 'text-emerald-800',
        bodyBg: 'bg-emerald-50'
    }
};

export const SectionContainer: React.FC<SectionContainerProps> = ({
    title,
    description,
    theme = 'gray',
    children,
    className = '',
    headerAction
}) => {
    const styles = themeStyles[theme] || themeStyles.gray;

    return (
        <div className={`${styles.container} border-4 ${styles.border} rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8 ${className}`}>
            {(title || description || headerAction) && (
                <div className={`p-6 border-b-4 ${styles.headerBorder} ${styles.headerBg} flex flex-col md:flex-row justify-between items-center gap-4`}>
                    <div className="flex flex-col gap-1 w-full">
                        {title && (
                            <h3 className={`text-2xl font-black ${styles.title} uppercase italic font-comic`}>
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-gray-600 font-medium">
                                {description}
                            </p>
                        )}
                    </div>
                    {headerAction && (
                        <div className="flex-shrink-0">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}
            <div className={`p-6 ${styles.bodyBg}`}>
                {children}
            </div>
        </div>
    );
};
