import React, { type InputHTMLAttributes } from 'react';

interface NumberControlProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    width?: string;
    min?: number;
    max?: number;
    description?: string; // e.g. "Rango" below the input
}

export const NumberControl: React.FC<NumberControlProps> = ({
    value,
    onChange,
    label,
    width = '50px',
    min,
    max,
    description,
    className = '',
    style,
    ...props
}) => {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
                {label && <span className="text-gray-500 font-bold text-xs">{label}</span>}
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    className={`p-1 border border-gray-300 rounded text-center font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-200 focus:outline-none ${className}`}
                    style={{ width, ...style }}
                    {...props}
                />
            </div>
            {description && (
                <span className="text-[0.65rem] text-gray-500">{description}</span>
            )}
        </div>
    );
};
