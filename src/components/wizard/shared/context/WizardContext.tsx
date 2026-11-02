import { createContext, useContext, type ReactNode } from 'react';
import type { CharacterData } from '../../../../types/character';
import type { ToastType } from '../layout/WizardDialogs';

export interface WizardContextValue {
    character: CharacterData;
    updateCharacter: (updates: any) => void;
    totalPCs: number;
    currentStep: number;
    goToStep: (stepId: number) => void;
    openHelp: () => void;
    showToast: (message: string, type?: ToastType) => void;
    askConfirm: (message: string, onConfirm: () => void) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
    value: WizardContextValue;
    children: ReactNode;
}

export function WizardProvider({ value, children }: WizardProviderProps) {
    return (
        <WizardContext.Provider value={value}>
            {children}
        </WizardContext.Provider>
    );
}

/**
 * Hook estricto para consumir el contexto global del Wizard dentro de sus subcomponentes.
 */
export function useWizardContext(): WizardContextValue {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error('useWizardContext debe usarse dentro de un <WizardProvider>');
    }
    return context;
}

/**
 * Hook opcional para componentes que también puedan renderizarse de forma aislada en tests.
 */
export function useOptionalWizardContext(): WizardContextValue | null {
    return useContext(WizardContext);
}
