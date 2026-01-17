import React, { type TextareaHTMLAttributes } from 'react';

interface ComicTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: React.ReactNode;
}

export const ComicTextArea: React.FC<ComicTextAreaProps> = ({
    label,
    className = '',
    style,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-3">
            {label && (
                <label className="text-lg font-black text-red-900 uppercase font-comic tracking-wide flex items-center gap-2">
                    {/* Default indicator if label is string, else render passed node */}
                    <span className="w-2 h-8 bg-red-600 rounded-full inline-block"></span>
                    {label}
                </label>
            )}
            <textarea
                className={`w-full h-32 p-4 border-2 border-red-200 rounded-lg focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-100 resize-y font-comic text-gray-700 text-lg leading-relaxed placeholder-red-200 block ${className}`}
                style={{ minWidth: '100%', maxWidth: '100%', ...style }}
                {...props}
            />
        </div>
    );
};
