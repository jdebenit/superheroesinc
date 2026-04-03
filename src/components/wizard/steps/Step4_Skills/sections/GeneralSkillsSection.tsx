import React from 'react';
import { GENERAL_SKILLS } from '../../../../../data/generalSkills';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SkillTable } from './SkillTable';
import { SkillRow } from './SkillRow';
import './GeneralSkillsSection.css';

interface GeneralSkillsSectionProps {
    skillValues: any;
    manualMods: { [key: string]: number };
    nativeLanguage: string;
    isHeraldoCosmico: boolean;
    unlockManualMod: boolean;
    onNativeLanguageChange: (value: string) => void;
    onBaseChange: (skillId: string, value: string, minLimit: number) => void;
    onModChange: (skillId: string, value: string) => void;
}

export const GeneralSkillsSection: React.FC<GeneralSkillsSectionProps> = ({
    skillValues,
    manualMods,
    nativeLanguage,
    isHeraldoCosmico,
    unlockManualMod,
    onNativeLanguageChange,
    onBaseChange,
    onModChange
}) => {
    return (
        <WizardSection
            title="Habilidades Generales"
            description="Estas habilidades las poseen todos los personajes. Se calculan en base a tus características y orígenes."
        >
            <SkillTable>
                {GENERAL_SKILLS.map((skill) => {
                    const val = skillValues[skill.id];

                    // Custom formula logic for Heraldo Cosmico
                    let formula = skill.formulaText;
                    if (skill.id === 'conocimientos' && isHeraldoCosmico) {
                        formula = 'INT/5';
                    }

                    // Render Name (with input for language)
                    const renderName = (
                        <>
                            {skill.name}
                            {skill.id === 'idioma' && (
                                <div className="native-language-container">
                                    <input
                                        type="text"
                                        className="native-language-input"
                                        value={nativeLanguage}
                                        onChange={(e) => onNativeLanguageChange(e.target.value)}
                                        placeholder="Especifique idioma..."
                                    />
                                </div>
                            )}
                        </>
                    );

                    return (
                        <SkillRow
                            key={skill.id}
                            name={renderName}
                            formula={formula}
                            baseValue={val.base}
                            minBase={val.minBase}
                            originMod={val.originMod}
                            specialtyMod={val.specialtyMod}
                            manualMod={manualMods[skill.id] || 0}
                            total={val.total}
                            calcPCCost={val.pcCost}
                            unlockManualMod={unlockManualMod}
                            onBaseChange={(v) => onBaseChange(skill.id, v, val.minBase)}
                            onModChange={(v) => onModChange(skill.id, v)}
                        />
                    );
                })}
            </SkillTable>
        </WizardSection>
    );
};

