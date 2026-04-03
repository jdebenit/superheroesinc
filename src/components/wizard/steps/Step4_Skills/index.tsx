import React from 'react';
import { WizardSection } from '../../shared/layout/WizardSection';
import { GeneralSkillsSection } from './sections/GeneralSkillsSection';
import { SelectedSkillsSection } from './sections/SelectedSkillsSection';
import { AvailableSkillsSection } from './sections/AvailableSkillsSection';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../../shared/layout/stepStyles';
import { useStep4Logic } from './useStep4Logic';
import '../../shared/layout/WizardStep.css';
import './Step4_Skills.css';


interface Step4Props {
    data: any;
    onChange: (updates: any) => void;
    onShowHelp?: () => void;
}

export default function Step4_GeneralSkills({ data, onChange, onShowHelp }: Step4Props) {
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
        handleAddSpecifiedSkill,
        unlockManualMod,
        setUnlockManualMod
    } = useStep4Logic(data, onChange);

    return (
        <div className="wizard-step-container">

            <WizardSection
                title="Habilidades"
                description="Estas habilidades dependen de tus características y origen. Algunas son automáticas y otras requieren aprendizaje."
                onHelp={onShowHelp}
            >
                <div className="wizard-unlock-container">
                    <div className="wizard-unlock-header">
                        <label className="wizard-unlock-label">
                            <input
                                type="checkbox"
                                checked={unlockManualMod}
                                onChange={(e) => setUnlockManualMod(e.target.checked)}
                                className="wizard-unlock-checkbox"
                            />
                            🔓 Desbloquear Modificadores Manuales
                        </label>
                        <span className="wizard-unlock-badge">Avanzado</span>
                    </div>
                    {unlockManualMod && (
                        <p className="wizard-unlock-description">
                            Usa esta opción para aplicar bonos o penalizadores manuales (objetos, ajustes del DJ o dotes no automáticas) en la casilla <strong>Otros</strong> de cada habilidad. Estos puntos no consumen PC.
                        </p>
                    )}
                </div>
            </WizardSection>

            {/* GENERAL SKILLS SECTION */}
            <GeneralSkillsSection
                skillValues={skillValues}
                manualMods={manualMods}
                nativeLanguage={nativeLanguage}
                isHeraldoCosmico={isHeraldoCosmico || false}
                unlockManualMod={unlockManualMod}
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
                    unlockManualMod={unlockManualMod}
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
