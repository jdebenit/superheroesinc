import React from 'react';
import { SPECIAL_SKILLS } from '../../../../../data/specialSkills';
import { SkillTable } from './SkillTable';
import { SkillRow } from './SkillRow';
import { CostBadge } from '../../../shared/ui/CostBadge';
import './SelectedSkillsSection.css';

interface SelectedSkillsSectionProps {
    selectedSkills: { [skillId: string]: { isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } };
    specifiedSkills: { [uniqueId: string]: { skillId: string; specification: string; isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } };
    standardSpecialSkills: any;
    specifiedSpecialSkills: any;
    specialSkillsPC: { totalSkills: number; freeSkills: number; intBonusSkills: number; paidSkills: number; totalPC: number };
    skillBaseCost: number;
    unlockManualMod: boolean;
    onSpecialBaseChange: (id: string, value: string, minLimit: number, isSpecified?: boolean) => void;
    onSpecialModChange: (id: string, value: string, isSpecified?: boolean) => void;
    onRemoveSkill: (skillId: string) => void;
    onRemoveSpecifiedSkill: (uniqueId: string) => void;
    onSpecificationChange: (uniqueId: string, specification: string) => void;
}

export const SelectedSkillsSection: React.FC<SelectedSkillsSectionProps> = ({
    selectedSkills,
    specifiedSkills,
    standardSpecialSkills,
    specifiedSpecialSkills,
    specialSkillsPC,
    skillBaseCost,
    unlockManualMod,
    onSpecialBaseChange,
    onSpecialModChange,
    onRemoveSkill,
    onRemoveSpecifiedSkill,
    onSpecificationChange
}) => {
    // Determine if we should show the table
    const hasSkills = Object.keys(selectedSkills).length > 0 || Object.keys(specifiedSkills).length > 0;

    return (
        <>
            {/* PC Counter */}
            <div className="pc-counter-box">
                <div className="pc-counter-row">
                    <span className="pc-counter-label">
                        Habilidades Seleccionadas: {specialSkillsPC.totalSkills}
                    </span>
                    <span className="pc-counter-details">
                        ({specialSkillsPC.freeSkills} gratuitas {specialSkillsPC.intBonusSkills > 0 && <span className="pc-bonus-text">[+{specialSkillsPC.intBonusSkills} INT]</span>}, {specialSkillsPC.paidSkills} pagadas)
                    </span>
                    <span className="pc-total-text">
                        Total: <CostBadge cost={specialSkillsPC.totalPC.toFixed(1).replace('.0', '')} label="PC" variant="default" />
                    </span>
                </div>
            </div>

            {/* Selected Skills Table */}
            {hasSkills && (
                <div className="selected-skills-container">
                    <h3 className="selected-skills-title">
                        ✓ Habilidades Seleccionadas
                    </h3>
                    <SkillTable isSpecial>
                        {/* Standard Selected Skills */}
                        {Object.entries(selectedSkills).map(([skillId, skillData]) => {
                            const skillDef = SPECIAL_SKILLS.find((s: any) => s.id === skillId);
                            if (!skillDef) return null;
                            const val = standardSpecialSkills[skillId];
                            if (!val) return null;

                            const itemBaseCost = skillData.isFree ? 0 : skillBaseCost;
                            const totalCost = itemBaseCost + (val.pcCost || 0);

                            return (
                                <SkillRow
                                    key={skillId}
                                    isSpecial
                                    name={skillDef.name}
                                    formula={skillDef.formulaText}
                                    baseValue={val.base}
                                    minBase={val.minBase}
                                    originMod={val.originMod}
                                    specialtyMod={val.specialtyMod}
                                    manualMod={skillData.manualMods || 0}
                                    total={val.total}
                                    calcPCCost={val.pcCost}
                                    totalPCCost={totalCost}
                                    isFree={skillData.isFree}
                                    isRequired={skillData.isRequired}
                                    unlockManualMod={unlockManualMod}
                                    onBaseChange={(v: string) => onSpecialBaseChange(skillId, v, val.minBase, false)}
                                    onModChange={(v: string) => onSpecialModChange(skillId, v, false)}
                                    onRemove={() => onRemoveSkill(skillId)}
                                />
                            );
                        })}

                        {/* Specified Skills */}
                        {Object.entries(specifiedSkills).map(([uniqueId, spec]) => {
                            const skillDef = SPECIAL_SKILLS.find((s: any) => s.id === spec.skillId);
                            if (!skillDef) return null;
                            const val = specifiedSpecialSkills[uniqueId];
                            if (!val) return null;

                            const itemBaseCost = spec.isFree ? 0 : skillBaseCost;
                            const totalCost = itemBaseCost + (val.pcCost || 0);

                            const renderName = (
                                <div className="specified-skill-input-container">
                                    <span>{skillDef.name}</span>
                                    <input
                                        type="text"
                                        className="specified-skill-input"
                                        value={spec.specification}
                                        onChange={(e) => onSpecificationChange(uniqueId, e.target.value)}
                                        placeholder={skillDef.specificationPlaceholder || "Especificar..."}
                                    />
                                </div>
                            );

                            return (
                                <SkillRow
                                    key={uniqueId}
                                    isSpecial
                                    name={renderName}
                                    formula={skillDef.formulaText}
                                    baseValue={val.base}
                                    minBase={val.minBase}
                                    originMod={val.originMod}
                                    specialtyMod={val.specialtyMod}
                                    manualMod={spec.manualMods || 0}
                                    total={val.total}
                                    calcPCCost={val.pcCost}
                                    totalPCCost={totalCost}
                                    isFree={spec.isFree}
                                    isRequired={spec.isRequired}
                                    unlockManualMod={unlockManualMod}
                                    onBaseChange={(v: string) => onSpecialBaseChange(uniqueId, v, val.minBase, true)}
                                    onModChange={(v: string) => onSpecialModChange(uniqueId, v, true)}
                                    onRemove={() => onRemoveSpecifiedSkill(uniqueId)}
                                />
                            );
                        })}
                    </SkillTable>
                </div>
            )}
        </>
    );
};

