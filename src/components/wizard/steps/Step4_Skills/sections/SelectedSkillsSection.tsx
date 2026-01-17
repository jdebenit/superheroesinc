import React from 'react';
import { SPECIAL_SKILLS } from '../../../../../data/specialSkills';
import { SkillTable } from './SkillTable';
import { SkillRow } from './SkillRow';

interface SelectedSkillsSectionProps {
    selectedSkills: { [skillId: string]: { isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } };
    specifiedSkills: { [uniqueId: string]: { skillId: string; specification: string; isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number } };
    standardSpecialSkills: any;
    specifiedSpecialSkills: any;
    specialSkillsPC: { totalSkills: number; freeSkills: number; intBonusSkills: number; paidSkills: number; totalPC: number };
    skillBaseCost: number;
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
            <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                        Habilidades Seleccionadas: {specialSkillsPC.totalSkills}
                    </span>
                    <span style={{ fontSize: '1.125rem' }}>
                        ({specialSkillsPC.freeSkills} gratuitas {specialSkillsPC.intBonusSkills > 0 && <span style={{ color: '#059669', fontSize: '0.9em' }}>[+{specialSkillsPC.intBonusSkills} INT]</span>}, {specialSkillsPC.paidSkills} pagadas)
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        Total: {specialSkillsPC.totalPC.toFixed(1).replace('.0', '')} PC
                    </span>
                </div>
            </div>

            {/* Selected Skills Table */}
            {hasSkills && (
                <div style={{
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '2px solid #10b981',
                    overflow: 'hidden'
                }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' }}>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span>{skillDef.name}</span>
                                    <input
                                        type="text"
                                        value={spec.specification}
                                        onChange={(e) => onSpecificationChange(uniqueId, e.target.value)}
                                        placeholder={skillDef.specificationPlaceholder || "Especificar..."}
                                        style={{
                                            padding: '0.25rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem'
                                        }}
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
