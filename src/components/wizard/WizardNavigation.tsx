import React from 'react';

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    canProceed: boolean;
}

export default function WizardNavigation({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onFinish,
    isFirstStep,
    isLastStep,
    canProceed
}: WizardNavigationProps) {
    return (
        <div className="wizard-navigation flex justify-between items-center mt-8 pt-6 border-t-4 border-black">
            <button
                onClick={onPrevious}
                disabled={isFirstStep}
                className={`
                    px-6 py-3 font-bold border-2 border-black
                    transition-all duration-200
                    ${isFirstStep
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-100 hover:-translate-x-1'
                    }
                `}
            >
                ← Anterior
            </button>

            <div className="text-center">
                <span className="text-sm text-gray-600">
                    Paso <span className="font-bold text-blue-600">{currentStep}</span> de {totalSteps}
                </span>
            </div>

            <button
                onClick={isLastStep ? onFinish : onNext}
                disabled={!canProceed}
                className={`
                    px-6 py-3 font-bold border-2 border-black
                    transition-all duration-200
                    ${!canProceed
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isLastStep
                            ? 'bg-green-600 text-white hover:bg-green-700 hover:translate-x-1'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:translate-x-1'
                    }
                `}
            >
                {isLastStep ? 'Finalizar ✓' : 'Siguiente →'}
            </button>
        </div>
    );
}
