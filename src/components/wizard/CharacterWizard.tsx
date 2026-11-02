import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react';
import Step1_OriginSelection from './steps/Step1_OriginSelection/index';
import Step2_Characteristics from './steps/Step2_Characteristics/index';
import Step3_Especials from './steps/Step3_Especials/index';
import Step4_Skills from './steps/Step4_Skills/index';
import Step5_Background from './steps/Step5_Background/index';
import Step6_Details from './steps/Step6_Details/index';
import Step7_Evolution from './steps/Step7_Evolution/index';
import { STEPS } from '../../data/wizardConfig';
import { useCharacterCalculations } from '../../hooks/wizard/useCharacterCalculations';
import { useCharacterState } from '../../hooks/wizard/useCharacterState';
import { useCharacterIO } from '../../hooks/wizard/useCharacterIO';
import './CharacterWizard.css';

import { WizardHelpModal } from './shared/ui/WizardHelpModal';
import { WIZARD_HELP } from '../../data/wizardHelp';
import { WizardToast, WizardConfirm, type ToastType } from './shared/layout/WizardDialogs';
import { WizardHeader } from './shared/layout/WizardHeader';
import { WizardFooter } from './shared/layout/WizardFooter';
import { WizardProvider, type WizardContextValue } from './shared/context/WizardContext';
import type { CharacterData } from '../../types/character';

interface StepRendererContext {
    character: CharacterData;
    updateCharacter: (updates: any) => void;
    totalPCs: number;
    showToast: (message: string, type?: ToastType) => void;
    openHelp: () => void;
}

const STEP_RENDERERS: Record<number, (ctx: StepRendererContext) => ReactNode> = {
    1: ({ character, updateCharacter, openHelp }) => (
        <Step1_OriginSelection data={character} onChange={updateCharacter} onShowHelp={openHelp} />
    ),
    2: ({ character, updateCharacter, openHelp }) => (
        <Step2_Characteristics data={character} onChange={updateCharacter} onShowHelp={openHelp} />
    ),
    3: ({ character, updateCharacter, showToast, openHelp }) => (
        <Step3_Especials data={character} onChange={updateCharacter} onShowToast={showToast} onShowHelp={openHelp} />
    ),
    4: ({ character, updateCharacter, openHelp }) => (
        <Step4_Skills data={character} onChange={updateCharacter} onShowHelp={openHelp} />
    ),
    5: ({ character, updateCharacter, openHelp }) => (
        <Step5_Background data={character} onChange={updateCharacter} onShowHelp={openHelp} />
    ),
    6: ({ character, updateCharacter, totalPCs, openHelp }) => (
        <Step6_Details data={character} onChange={updateCharacter} totalPCs={totalPCs} onShowHelp={openHelp} />
    ),
    7: ({ openHelp }) => (
        <Step7_Evolution onShowHelp={openHelp} />
    )
};

export default function CharacterWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [showHelp, setShowHelp] = useState(false);

    // Global Modal/Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);

    // Refs for scroll-position memory per step
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollPositions = useRef<Map<number, number>>(new Map());

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const askConfirm = useCallback((message: string, onConfirm: () => void) => {
        setConfirmDialog({
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmDialog(null);
            }
        });
    }, []);

    // Centralized Character State via Reducer & Auto-sync Hook
    const {
        character,
        updateCharacter,
        loadCharacter,
        resetCharacter
    } = useCharacterState();

    // Calculate total PCs using custom hook
    const { totalPCs } = useCharacterCalculations(character);

    const goToStep = useCallback((nextStep: number) => {
        if (contentRef.current) {
            scrollPositions.current.set(currentStep, contentRef.current.scrollTop);
        }
        setCurrentStep(nextStep);
        requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.scrollTop = scrollPositions.current.get(nextStep) ?? 0;
            }
        });
    }, [currentStep]);

    const { handleImportJSON, handleReset, handleFinish } = useCharacterIO({
        character,
        loadCharacter,
        resetCharacter,
        onNavigateToFirstStep: useCallback(() => setCurrentStep(1), []),
        showToast,
        askConfirm
    });

    const handleNext = useCallback(() => {
        if (currentStep < STEPS.length) goToStep(currentStep + 1);
    }, [currentStep, goToStep]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 1) goToStep(currentStep - 1);
    }, [currentStep, goToStep]);

    const openHelp = useCallback(() => setShowHelp(true), []);

    const wizardContextValue = useMemo<WizardContextValue>(() => ({
        character,
        updateCharacter,
        totalPCs,
        currentStep,
        goToStep,
        openHelp,
        showToast,
        askConfirm
    }), [character, updateCharacter, totalPCs, currentStep, goToStep, openHelp, showToast, askConfirm]);

    const renderStepContent = () => {
        const renderer = STEP_RENDERERS[currentStep];
        if (renderer) {
            return renderer({
                character,
                updateCharacter,
                totalPCs,
                showToast,
                openHelp
            });
        }

        return (
            <div className="step-fallback-container">
                <h2 className="step-fallback-title">
                    Paso {currentStep}: {STEPS[currentStep - 1]?.name}
                </h2>
                <p className="step-fallback-text">
                    Contenido del paso {currentStep} aquí...
                </p>
            </div>
        );
    };

    return (
        <WizardProvider value={wizardContextValue}>
            <div className="wizard-app">
                <WizardHeader
                    currentStep={currentStep}
                    character={character}
                    totalPCs={totalPCs}
                    onStepClick={goToStep}
                    onImportJSON={handleImportJSON}
                    onReset={handleReset}
                    onShowToast={showToast}
                />

                <div className="wizard-content" role="tabpanel" ref={contentRef}>
                    {renderStepContent()}
                </div>

                <WizardFooter
                    currentStep={currentStep}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onFinish={handleFinish}
                />

                <WizardHelpModal
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    content={WIZARD_HELP[currentStep]}
                />

                {toast && (
                    <WizardToast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {confirmDialog && (
                    <WizardConfirm
                        message={confirmDialog.message}
                        onConfirm={confirmDialog.onConfirm}
                        onCancel={() => setConfirmDialog(null)}
                    />
                )}
            </div>
        </WizardProvider>
    );
}
