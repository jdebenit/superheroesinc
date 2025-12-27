import React, { useState, useMemo } from 'react';
import CharacterPreview from './CharacterPreview';
import Step1_OriginSelection from './steps/Step1_OriginSelection';
import Step2_Characteristics from './steps/Step2_Characteristics';
import Step3_Especials from './steps/Step3_Especials';
import Step4_GeneralSkills from './steps/Step4_GeneralSkills';
import Step5_Background from './steps/Step5_Background';
import Step6_Details from './steps/Step6_Details';
import { calculateOriginCost } from '../../data/originCosts.ts';
import { calculateCreationPoints, calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt } from '../../utils/characterCalculations';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS } from '../../data/backgroundTables';
import { SPELLS } from '../../data/spells';
import { POWERS } from '../../data/powers';

const STEPS = [
    { id: 1, name: 'Origen', icon: '🎭' },
    { id: 2, name: 'Características', icon: '💪' },
    { id: 3, name: 'Especial', icon: '⚡' },
    { id: 4, name: 'Habilidades', icon: '🎯' },
    { id: 5, name: 'Trasfondo', icon: '📖' },
    { id: 6, name: 'Detalles', icon: '⭐' }
];

const initialCharacterState = {
    name: "Nuevo Personaje",
    alias: "",
    notes: "",
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
            "Fuerza": 40,
            "Constitución": 40,
            "Agilidad": 40,
            "Inteligencia": 40,
            "Percepción": 40,
            "Apariencia": 40,
            "Voluntad": 40
        },
        breakdown: {
            fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 }
        }
    },
    skills: {
        items: [],
        generalItems: [],
        specialItems: [],
        generalManualMods: {},
        manualBases: {},
        selected: {},
        specified: {}
    },
    specialskills: { items: [] },
    background: { items: [] },
    prejudiceResistance: 50,
    economicStatus: 'clase_media',
    legalStatus: 'sin_antecedentes',
    socialStatus: 'anonimo',
    equipment: { items: [] },
    weapons: { items: [] },
    spells: {
        selected: [],
        emFormula: { divisor: 4, pcCost: 0 } // Default for Dotado/Híbrido
    }
};

export default function CharacterWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [character, setCharacter] = useState(initialCharacterState);

    // Calcular coste total en PCs
    const totalPCs = useMemo(() => {
        let total = 0;

        // 1. Coste de Origen
        const originCost = calculateOriginCost(character.origin?.items || []);
        total += originCost;

        // 2. PCs generados por características (Base + Mods)
        if (character.attributes?.breakdown) {
            const { totalPC } = calculateCreationPoints(character.attributes.breakdown, character.origin?.items || []);
            total += totalPC;
        }

        // 3. Coste de incremento de Bases en Habilidades Generales
        if (character.attributes?.values) {
            const { totalPC: skillsPC } = calculateGeneralSkillValues(
                character.attributes.values,
                character.origin?.items || [],
                character.skills?.generalManualMods || {},
                character.skills?.manualBases || {}
            );
            total += skillsPC;
        }

        // 4. Coste de Habilidades de aprendizaje Seleccionadas
        // 4. Coste de Habilidades de aprendizaje Seleccionadas
        const specialSkillsPC = calculateSpecialSkillsPCWithInt(
            character.skills?.selected || {},
            character.skills?.specified || {},
            character.origin?.items || [],
            character.attributes?.values || {}
        );
        total += specialSkillsPC.totalPC;

        // 5. Coste de Resistencia a Prejuicios
        // (Valor - 50) * 0.1
        const prejudiceCost = ((character.prejudiceResistance || 50) - 50) * 0.1;
        total += prejudiceCost;

        // 6. Coste de Estatus (Económico, Legal, Social)
        const economicCost = ECONOMIC_STATUS.find(e => e.id === character.economicStatus)?.cost || 0;
        const legalCost = LEGAL_STATUS.find(l => l.id === character.legalStatus)?.cost || 0;
        const socialCost = SOCIAL_STATUS.find(s => s.id === character.socialStatus)?.cost || 0;

        total += economicCost + legalCost + socialCost;

        // 7. Coste de Exceso de Magia (EM)
        // Por cada 1 punto de EM que se pase del total disponible: +0.1 PC
        const int = character.attributes?.values?.['Inteligencia'] || 0;
        const per = character.attributes?.values?.['Percepción'] || 0;
        const vol = character.attributes?.values?.['Voluntad'] || 0;

        // If Semidemonio, add CON to the formula
        const isSemidemonio = character.origin?.items?.some((o: any) =>
            o.category === 'Sobrenatural' && o.subtype === 'Semidemonio'
        );
        const con = isSemidemonio ? (character.attributes?.values?.['Constitución'] || 0) : 0;

        const emDivisor = character.spells?.emFormula?.divisor || 1;
        const maxEM = Math.floor((int + per + vol + con) / emDivisor);

        const selectedSpells = character.spells?.selected || [];
        // Spells are now objects with { id, rank }
        const spellCost = selectedSpells.reduce((acc: number, spell: any) => {
            const s = SPELLS.find((sp: any) => sp.id === spell.id);
            const baseCost = s ? (parseInt(s.cost, 10) || 0) : 0;
            const rank = spell.rank || 1;
            return acc + (baseCost * rank);
        }, 0);

        if (spellCost > maxEM) {
            total += (spellCost - maxEM) * 0.1;
        }

        // 8. EM Formula Cost (for Dotado/Híbrido/Terrano)
        const emFormulaCost = character.spells?.emFormula?.pcCost || 0;
        total += emFormulaCost;

        // 9. Power Costs (Base + Rank)
        const selectedPowers = character.powers?.selected || [];
        const powerCost = selectedPowers.reduce((acc: number, power: any) => {
            const powerData = POWERS.find((p: any) => p.id === power.id);
            if (!powerData) return acc;

            // Base cost
            let cost = powerData.cost;

            // Rank cost (only for powers without characteristics)
            if (!powerData.characteristic) {
                const rank = power.rank || 1;
                cost += rank * 0.1;
            }

            return acc + cost;
        }, 0);
        total += powerCost;

        return total.toFixed(1); // Devolver con decimales
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
            return <Step4_GeneralSkills data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 5) {
            return <Step5_Background data={character} onChange={updateCharacter} />;
        }

        if (currentStep === 6) {
            return <Step6_Details data={character} onChange={updateCharacter} />;
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
                    Generador de Fichas (Alpha 0.0.9)
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>
                    Crea tu personaje paso a paso
                </p>

                {/* Header Controls: PC Counter + Preview */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                }}>
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

                    {/* Preview Button */}
                    <CharacterPreview character={character} totalPCs={totalPCs} />
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


        </div>
    );
}
