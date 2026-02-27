import React from 'react';
import { WizardSection } from '../../shared/WizardSection';
import { GeneralSkillsSection } from './sections/GeneralSkillsSection';
import { SelectedSkillsSection } from './sections/SelectedSkillsSection';
import { AvailableSkillsSection } from './sections/AvailableSkillsSection';
import { useStep4Logic } from './useStep4Logic';
import './Step4_Skills.css';

interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step4_GeneralSkills({ data, onChange }: Step4Props) {
    const {
        // Calculated values
        skillValues,
        manualMods,
        nativeLanguage,
        isHeraldoCosmico,
        selectedSkills,
        specifiedSkills,
        standardSpecialSkills,
        specifiedSpecialSkills,
        specialSkillsPC,
        skillBaseCost,
        skillsByCategory,

        // Handlers
        handleNativeLanguageChange,
        handleBaseChange,
        handleModChange,
        handleSpecialBaseChange,
        handleSpecialModChange,
        handleRemoveSkill,
        handleRemoveSpecifiedSkill,
        handleSpecificationChange,
        handleAddSkill,
        handleAddSpecifiedSkill
    } = useStep4Logic(data, onChange);

    return (
        <div className="step4-container">
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Habilidades
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                Define las habilidades de tu personaje.
            </p>
            {/* GENERAL SKILLS SECTION */}
            <GeneralSkillsSection
                skillValues={skillValues}
                manualMods={manualMods}
                nativeLanguage={nativeLanguage}
                isHeraldoCosmico={isHeraldoCosmico || false}
                onNativeLanguageChange={handleNativeLanguageChange}
                onBaseChange={handleBaseChange}
                onModChange={handleModChange}
            />

            {/* SPECIAL SKILLS SECTION */}
            <WizardSection
                title="Habilidades de Aprendizaje"
                description={<>Selecciona las habilidades que tu personaje ha aprendido. Cada habilidad cuesta <strong>{skillBaseCost} PC</strong> + coste de mejora.</>}
            >
                <SelectedSkillsSection
                    selectedSkills={selectedSkills}
                    specifiedSkills={specifiedSkills}
                    standardSpecialSkills={standardSpecialSkills}
                    specifiedSpecialSkills={specifiedSpecialSkills}
                    specialSkillsPC={specialSkillsPC}
                    skillBaseCost={skillBaseCost}
                    onSpecialBaseChange={handleSpecialBaseChange}
                    onSpecialModChange={handleSpecialModChange}
                    onRemoveSkill={handleRemoveSkill}
                    onRemoveSpecifiedSkill={handleRemoveSpecifiedSkill}
                    onSpecificationChange={handleSpecificationChange}
                />

                <AvailableSkillsSection
                    skillsByCategory={skillsByCategory}
                    originItems={data.origin?.items || []}
                    selectedSkills={selectedSkills}
                    skillBaseCost={skillBaseCost}
                    onAddSkill={handleAddSkill}
                    onAddSpecifiedSkill={handleAddSpecifiedSkill}
                />
            </WizardSection>
        </div>
    );
}
