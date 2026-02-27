import React, { useState, useEffect } from 'react';
import CharacterSheet from '../character/CharacterSheet';
import Step1_OriginSelection from './steps/Step1_OriginSelection';
import Step2_Characteristics from './steps/Step2_Characteristics';
import Step3_Especials from './steps/Step3_Especials';
import Step4_Skills from './steps/Step4_Skills/index';
import Step5_Background from './steps/Step5_Background';
import Step6_Details from './steps/Step6_Details';
import Step7_Evolution from './steps/Step7_Evolution';
import {
    STEPS,
    initialCharacterState
} from '../../data/wizardConfig';
import { mergeWithDefaults } from '../../utils/dataCleaner';
import { useCharacterCalculations } from '../../hooks/wizard/useCharacterCalculations';
import './CharacterWizard.css';

import { WizardHelpModal } from './shared/WizardHelpModal';
import { WIZARD_HELP } from '../../data/wizardHelp';

import { APP_VERSIONS } from '../../data/appVersions';
import Logger from '../../utils/Logger';

export default function CharacterWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [showHelp, setShowHelp] = useState(false);

    // Initialize with default state to prevent hydration mismatch
    const [character, setCharacter] = useState(initialCharacterState);

    // Load character from localStorage on mount (Client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('characterWizardState');
                if (saved) {
                    const parsed = JSON.parse(saved);

                    // Merge with defaults to ensure full structure and handle new fields
                    const validated = mergeWithDefaults(parsed, initialCharacterState);

                    // MIGRATION: Ensure attributes have manual bonuses if missing (old saves)
                    if (validated.attributes && !validated.attributes.manualBonuses) {
                        validated.attributes.manualBonuses = {
                            Fuerza: 0, Agilidad: 0, Constitución: 0,
                            Inteligencia: 0, Percepción: 0, Voluntad: 0, Apariencia: 0
                        };
                    }

                    Logger.log('✅ Loaded character from localStorage:', validated);
                    setCharacter(validated);
                }
            } catch (e) {
                Logger.error('❌ Error loading character from localStorage:', e);
            }
        }
    }, []);

    // Save character to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('characterWizardState', JSON.stringify(character));
                Logger.log('💾 Saved character to localStorage');
            } catch (e) {
                Logger.error('❌ Error saving to localStorage:', e);
            }
        }
    }, [character]);

    // Ensure metadata is always up to date with current version
    useEffect(() => {
        setCharacter((prev: any) => {
            const currentMeta = prev.meta || {};
            const newMeta = {
                ...currentMeta,
                version: APP_VERSIONS.WIZARD,
                generator: `SHI Wizard`
            };

            // Avoid infinite loops if already matches
            if (currentMeta.version === newMeta.version && currentMeta.generator === newMeta.generator) {
                return prev;
            }

            Logger.log('🔄 Updating Character Metadata:', newMeta);
            return {
                ...prev,
                meta: newMeta
            };
        });
    }, []);


    // Calculate total PCs using custom hook
    const { totalPCs } = useCharacterCalculations(character);

    const handleNext = () => {
        if (currentStep < 7) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        const charName = (character as any).name || 'personaje';
        const filename = `${charName.replace(/\s+/g, '_').toLowerCase()}.json`;
        const json = JSON.stringify(character, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleStepClick = (stepId: number) => {
        setCurrentStep(stepId);
    };

    const handleStepChange = (field: string, value: any) => {
        Logger.log('🔄 handleStepChange:', field, value);
        setCharacter((prev: any) => {
            const newState = {
                ...prev,
                [field]: value
            };
            Logger.log('📝 New State:', newState);
            return newState;
        });
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres reiniciar toda la creación del personaje? Esta acción no se puede deshacer.')) {
            setCharacter(initialCharacterState);
            setCurrentStep(1);
            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('characterWizardState');
                Logger.log('🗑️ Cleared localStorage');
            }
        }
    };

    const handleImportJSON = () => {
        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const rawImport = JSON.parse(text);

                // Use mergeWithDefaults to ensure we have a full state even if importing a "clean" JSON
                const importedCharacter = mergeWithDefaults(rawImport, initialCharacterState);

                // Validate that it's a character JSON (check for key structure after merge)
                if (!importedCharacter.name || !importedCharacter.attributes) {
                    alert('❌ El archivo JSON no parece ser un personaje válido.');
                    return;
                }

                // Load the character
                setCharacter(importedCharacter);
                setCurrentStep(1);

                // Save to localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('characterWizardState', JSON.stringify(importedCharacter));
                }

                alert(`✅ Personaje "${importedCharacter.name}" cargado correctamente!`);
                Logger.log('📥 Imported character:', importedCharacter);
            } catch (error) {
                Logger.error('Error importing JSON:', error);
                alert('❌ Error al leer el archivo JSON. Asegúrate de que es un archivo válido.');
            }
        };

        input.click();
    };

    const updateCharacter = (updates: any) => {
        setCharacter(prev => ({ ...prev, ...updates }));
    };

    const renderStepContent = () => {
        if (currentStep === 1) {
            return <Step1_OriginSelection data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 2) {
            return <Step2_Characteristics data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 3) {
            return <Step3_Especials data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 4) {
            return <Step4_Skills data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 5) {
            return <Step5_Background data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 6) {
            return <Step6_Details data={character} onChange={updateCharacter} totalPCs={totalPCs} />;
        }

        if (currentStep === 7) {
            return <Step7_Evolution data={character} onChange={updateCharacter} />;
        }

        return (
            <div className="step-fallback-container">
                <h2 className="step-fallback-title">
                    Paso {currentStep}: {STEPS[currentStep - 1].name}
                </h2>
                <p className="step-fallback-text">
                    Contenido del paso {currentStep} aquí...
                </p>
            </div>
        );
    };

    return (
        <div className="wizard-app">

            {/* ── TOP BAR ─────────────────────────────── */}
            <div className="wizard-topbar">
                <div className="wizard-topbar-brand">
                    <span className="wizard-topbar-title">Generador de Fichas</span>
                    <span className="wizard-topbar-version">{APP_VERSIONS.WIZARD}</span>
                </div>

                <div className="pc-counter">
                    PC: <span className="pc-val">{totalPCs}</span>
                </div>

                <div className="wizard-topbar-actions">
                    {/* Preview / CharacterSheet */}
                    <CharacterSheet character={character} totalPCs={totalPCs} />

                    {/* Import JSON */}
                    <button onClick={handleImportJSON} className="btn-base btn-import" title="Importar JSON">
                        📥 <span>Importar</span>
                    </button>

                    {/* Reset */}
                    <button onClick={handleReset} className="btn-base btn-reset" title="Reiniciar personaje">
                        🔄 <span>Reiniciar</span>
                    </button>

                    {/* Help */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="btn-icon"
                        title="Ayuda de este paso"
                    >
                        ❓
                    </button>
                </div>
            </div>

            {/* ── TABS NAV ────────────────────────────── */}
            <div className="wizard-tabs" role="tablist">
                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    let cls = 'wizard-tab';
                    if (isActive) cls += ' active';
                    if (isCompleted) cls += ' completed';

                    return (
                        <button
                            key={step.id}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => handleStepClick(step.id)}
                            className={cls}
                            title={step.name}
                        >
                            <span className="tab-icon">
                                {isCompleted ? '✓' : step.icon}
                            </span>
                            <span className="tab-label">{step.name}</span>
                            {isCompleted && <span className="tab-check" />}
                        </button>
                    );
                })}
            </div>

            {/* ── CONTENT AREA ────────────────────────── */}
            <div className="wizard-content" role="tabpanel">
                {renderStepContent()}
            </div>

            {/* ── BOTTOM NAV ──────────────────────────── */}
            <div className="wizard-bottomnav">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn-base btn-outline"
                >
                    ← Anterior
                </button>

                <span className="step-indicator">
                    {currentStep} / {STEPS.length}
                </span>

                <button
                    onClick={currentStep === 7 ? handleFinish : handleNext}
                    className="btn-base btn-primary"
                >
                    {currentStep === 7 ? '💾 Finalizar y exportar' : 'Siguiente →'}
                </button>
            </div>

            {/* ── HELP MODAL ───────────────────────────── */}
            <WizardHelpModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                content={WIZARD_HELP[currentStep]}
            />
        </div>
    );
}
