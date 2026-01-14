import React, { useState, useEffect } from 'react';
import CharacterSheet from '../character/CharacterSheet';
import Step1_OriginSelection from './steps/Step1_OriginSelection';
import Step2_Characteristics from './steps/Step2_Characteristics';
import Step3_Especials from './steps/Step3_Especials';
import Step4_Skills from './steps/Step4_Skills';
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

export default function CharacterWizard() {
    const [currentStep, setCurrentStep] = useState(1);

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

                    console.log('✅ Loaded character from localStorage:', validated);
                    setCharacter(validated);
                }
            } catch (e) {
                console.error('❌ Error loading character from localStorage:', e);
            }
        }
    }, []);

    // Save character to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('characterWizardState', JSON.stringify(character));
                console.log('💾 Saved character to localStorage');
            } catch (e) {
                console.error('❌ Error saving to localStorage:', e);
            }
        }
    }, [character]);


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

    const handleStepClick = (stepId: number) => {
        setCurrentStep(stepId);
    };

    const handleStepChange = (field: string, value: any) => {
        console.log('🔄 handleStepChange:', field, value);
        setCharacter((prev: any) => {
            const newState = {
                ...prev,
                [field]: value
            };
            console.log('📝 New State:', newState);
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
                console.log('🗑️ Cleared localStorage');
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
                console.log('📥 Imported character:', importedCharacter);
            } catch (error) {
                console.error('Error importing JSON:', error);
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
        <div className="wizard-container">
            {/* Header */}
            <div className="wizard-header">
                <h1 className="wizard-title">
                    Generador de Fichas (Beta 0.6.7)
                </h1>
                <p className="wizard-subtitle">
                    Crea tu personaje paso a paso
                </p>

                {/* Header Controls: PC Counter + Preview + Config + Reset */}
                <div className="wizard-controls">
                    {/* PC Counter */}
                    <div className="pc-counter">
                        Puntos de Creación: <span className="pc-val">{totalPCs}</span>
                    </div>

                    {/* Preview Button */}
                    <CharacterSheet character={character} totalPCs={totalPCs} />

                    {/* Import JSON Button */}
                    <button
                        onClick={handleImportJSON}
                        className="btn-base btn-import"
                    >
                        📥 Importar JSON
                    </button>

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="btn-base btn-reset"
                    >
                        🔄 Reiniciar
                    </button>
                </div>
            </div>

            {/* Step Navigation */}
            <div className="step-nav-container">
                {/* Progress Line */}
                <div className="progress-line-bg">
                    <div
                        className="progress-line-fill"
                        style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                    />
                </div>

                {/* Step Buttons Container */}
                <div className="steps-wrapper">
                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        let iconClass = 'step-icon pending';
                        if (isActive) iconClass = 'step-icon active';
                        else if (isCompleted) iconClass = 'step-icon completed';

                        let nameClass = 'step-name pending';
                        if (isActive) nameClass = 'step-name active';
                        else if (isCompleted) nameClass = 'step-name completed';

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className={`step-btn ${isActive ? 'active' : ''}`}
                            >
                                <div className={iconClass}>
                                    {isCompleted ? '✓' : step.icon}
                                </div>
                                <span className={nameClass}>
                                    {step.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="step-content-box">
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="nav-buttons-container">
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="btn-base btn-outline"
                    style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
                >
                    ← Anterior
                </button>

                <div className="step-indicator">
                    Paso {currentStep} de {STEPS.length}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentStep === 7}
                    className="btn-base btn-primary"
                    style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
                >
                    {currentStep === 7 ? 'Finalizar ✓' : 'Siguiente →'}
                </button>
            </div>
        </div>
    );
}
