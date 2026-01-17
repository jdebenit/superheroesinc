import React from 'react';
import { GENERAL_SKILLS } from '../../../../../data/generalSkills';
import { WizardSection } from '../../../shared/WizardSection';
import { SkillTable } from './SkillTable';
import { SkillRow } from './SkillRow';

interface GeneralSkillsSectionProps {
    skillValues: any;
    manualMods: { [key: string]: number };
    nativeLanguage: string;
    isHeraldoCosmico: boolean;
    onNativeLanguageChange: (value: string) => void;
    onBaseChange: (skillId: string, value: string, minLimit: number) => void;
    onModChange: (skillId: string, value: string) => void;
}

export const GeneralSkillsSection: React.FC<GeneralSkillsSectionProps> = ({
    skillValues,
    manualMods,
    nativeLanguage,
    isHeraldoCosmico,
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
                                <div style={{ marginTop: '0.25rem' }}>
                                    <input
                                        type="text"
                                        value={nativeLanguage}
                                        onChange={(e) => onNativeLanguageChange(e.target.value)}
                                        placeholder="Especifique idioma..."
                                        style={{
                                            width: '100%',
                                            padding: '0.25rem 0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem',
                                            fontWeight: 'normal'
                                        }}
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
                            onBaseChange={(v) => onBaseChange(skill.id, v, val.minBase)}
                            onModChange={(v) => onModChange(skill.id, v)}
                        />
                    );
                })}
            </SkillTable>
        </WizardSection>
    );
};
