import React from 'react';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    stepNames: string[];
    completedSteps: Set<number>;
    onStepClick?: (step: number) => void;
}

export default function ProgressBar({
    currentStep,
    totalSteps,
    stepNames,
    completedSteps,
    onStepClick
}: ProgressBarProps) {
    return (
        <div className="progress-bar-container mb-8">
            <div className="flex justify-between items-center">
                {stepNames.map((name, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = completedSteps.has(stepNumber);
                    const isClickable = isCompleted || stepNumber < currentStep;

                    return (
                        <div key={stepNumber} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center flex-1">
                                <button
                                    onClick={() => isClickable && onStepClick?.(stepNumber)}
                                    disabled={!isClickable}
                                    className={`
                                        w-10 h-10 rounded-full font-bold text-sm
                                        transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110'
                                            : isCompleted
                                                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isCompleted ? '✓' : stepNumber}
                                </button>
                                <span className={`
                                    text-xs mt-2 text-center max-w-[80px]
                                    ${isActive ? 'font-bold text-blue-600' : 'text-gray-600'}
                                `}>
                                    {name}
                                </span>
                            </div>
                            {stepNumber < totalSteps && (
                                <div className={`
                                    h-1 flex-1 mx-2
                                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                                `} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
