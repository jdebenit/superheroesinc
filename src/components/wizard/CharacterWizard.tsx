import React, { useState, useMemo } from 'react';
import CharacterPreview from './CharacterPreview';
import Step1_OriginSelection from './steps/Step1_OriginSelection';
import Step2_Characteristics from './steps/Step2_Characteristics';
import { calculateOriginCost } from '../../data/originCosts.ts';

const STEPS = [
    { id: 1, name: 'Origen', icon: '🎭' },
    { id: 2, name: 'Características', icon: '💪' },
    { id: 3, name: 'Poderes', icon: '⚡' },
    { id: 4, name: 'Habilidades', icon: '🎯' },
    { id: 5, name: 'Trasfondo', icon: '📖' },
    { id: 6, name: 'Especiales', icon: '⭐' }
];

const initialCharacterState = {
    name: "Nuevo Personaje",
    totalCost: "50+0",
    level: 1,
    origin: { items: [] },
    combatstats: [
        "Acciones por asalto: 2",
        "Iniciativa y Reflejos: 30",
        "Puntos de Vida: 40",
        "Equilibrio Mental: 40"
    ],
    otherstats: [
        "Inconsciencia: 4",
        "Recuperación: 2 PV/h"
    ],
    attributes: {
        values: {
            "Fuerza": 50,
            "Constitución": 50,
            "Agilidad": 50,
            "Inteligencia": 50,
            "Percepción": 50,
            "Apariencia": 50,
            "Voluntad": 50
        }
    },
    skills: { items: [] },
    specialskills: { items: [] },
    background: { items: [] },
    equipment: { items: [] }
};

export default function CharacterWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [character, setCharacter] = useState(initialCharacterState);

    // Calcular coste total en PCs
    const totalPCs = useMemo(() => {
        const originCost = calculateOriginCost(character.origin?.items || []);
        // TODO: Añadir costes de otros pasos cuando estén implementados
        return originCost;
    }, [character]);

    const handleNext = () => {
        if (currentStep < 6) {
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

    const updateCharacter = (updates: any) => {
        setCharacter(updates);
    };

    const renderStepContent = () => {
        if (currentStep === 1) {
            return <Step1_OriginSelection data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 2) {
            return <Step2_Characteristics data={character} onChange={updateCharacter} />;
        }

        return (
            <div style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Paso {currentStep}: {STEPS[currentStep - 1].name}
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#666' }}>
                    Contenido del paso {currentStep} aquí...
                </p>
            </div>
        );
    };

    return (
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Generador de Fichas
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
                    Crea tu personaje paso a paso
                </p>

                {/* PC Counter */}
                <div style={{
                    display: 'inline-block',
                    padding: '0.75rem 2rem',
                    backgroundColor: '#fef3c7',
                    border: '3px solid #f59e0b',
                    borderRadius: '12px',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#92400e',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    💰 Puntos de Creación: <span style={{ color: '#dc2626', fontSize: '1.5rem' }}>{totalPCs}</span>
                </div>
            </div>

            {/* Step Navigation */}
            <div style={{ marginBottom: '4rem', position: 'relative', padding: '0 2rem' }}>
                {/* Progress Line */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '10%',
                    right: '10%',
                    height: '4px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    zIndex: 0
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: '#2563eb',
                        borderRadius: '9999px',
                        width: `${((currentStep - 1) / 5) * 100}%`,
                        transition: 'width 0.5s ease'
                    }} />
                </div>

                {/* Step Buttons Container */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'flex-start',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {STEPS.map((step) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'transform 0.3s ease',
                                    padding: '0.5rem'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                    border: '4px solid',
                                    borderColor: isActive ? '#1e40af' : isCompleted ? '#15803d' : '#d1d5db',
                                    backgroundColor: isActive ? '#2563eb' : isCompleted ? '#22c55e' : 'white',
                                    color: isActive || isCompleted ? 'white' : '#000',
                                    boxShadow: isActive ? '0 10px 25px rgba(37, 99, 235, 0.5)' :
                                        isCompleted ? '0 4px 6px rgba(34, 197, 94, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {isCompleted ? '✓' : step.icon}
                                </div>
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: isActive ? '#2563eb' : isCompleted ? '#22c55e' : '#9ca3af',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {step.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div style={{
                backgroundColor: 'white',
                border: '4px solid black',
                padding: '3rem',
                marginBottom: '2rem',
                minHeight: '500px',
                boxShadow: '8px 8px 0px #000',
                borderRadius: '8px'
            }}>
                {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 1rem'
            }}>
                <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: '4px solid',
                        borderColor: currentStep === 1 ? '#d1d5db' : '#000',
                        backgroundColor: currentStep === 1 ? '#e5e7eb' : 'white',
                        color: currentStep === 1 ? '#9ca3af' : '#000',
                        cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: currentStep === 1 ? 'none' : '4px 4px 0px #000'
                    }}
                >
                    ← Anterior
                </button>

                <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    color: '#4b5563',
                    backgroundColor: `#f3f4f6`,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px'
                }}>
                    Paso {currentStep} de {STEPS.length}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentStep === 6}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: '4px solid',
                        borderColor: currentStep === 6 ? '#d1d5db' : '#1e40af',
                        backgroundColor: currentStep === 6 ? '#e5e7eb' : '#2563eb',
                        color: currentStep === 6 ? '#9ca3af' : 'white',
                        cursor: currentStep === 6 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: currentStep === 6 ? 'none' : '4px 4px 0px #1e40af'
                    }}
                >
                    {currentStep === 6 ? 'Finalizar ✓' : 'Siguiente →'}
                </button>
            </div>

            {/* Preview Button - Centered below navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2rem',
                paddingBottom: '2rem'
            }}>
                <CharacterPreview character={character} />
            </div>
        </div>
    );
}
