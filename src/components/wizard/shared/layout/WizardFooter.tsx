import { STEPS } from '../../../../data/wizardConfig';

interface WizardFooterProps {
    currentStep: number;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export function WizardFooter({
    currentStep,
    onPrevious,
    onNext,
    onFinish
}: WizardFooterProps) {
    const isLastStep = currentStep === STEPS.length;

    return (
        <div className="wizard-bottomnav">
            <button
                onClick={onPrevious}
                disabled={currentStep === 1}
                className="btn-base btn-outline"
            >
                ← Anterior
            </button>

            <span className="step-indicator">
                {currentStep} / {STEPS.length}
            </span>

            <button
                onClick={isLastStep ? onFinish : onNext}
                className="btn-base btn-primary"
            >
                {isLastStep ? '💾 Finalizar y exportar' : 'Siguiente →'}
            </button>
        </div>
    );
}
