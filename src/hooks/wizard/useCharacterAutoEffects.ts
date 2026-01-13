import { useEffect } from 'react';
import { POWERS } from '../../data/powers';
import type { SelectedPower } from '../../components/wizard/steps/Step3_Especials/types';
import { hasSubtype, hasOrigin, calculateEM } from '../../components/wizard/steps/Step3_Especials/utils';
import { getFreeSkillsForOrigins } from '../../data/freeOriginSkills';
import { getRequiredSkillsForOrigins } from '../../data/requiredSpecialtySkills';
import { SPECIAL_SKILLS } from '../../data/specialSkills';
import { GENERAL_SKILLS } from '../../data/generalSkills';

// Helper to check if skill is allowed
const isSkillAllowed = (skill: any, originItems: any[]) => {
    if (!skill.allowedCriteria || skill.allowedCriteria.length === 0) return true;

    return skill.allowedCriteria.some((criteria: any) => {
        if (criteria.origin) {
            const hasOrigin = originItems.some(item => Object.keys(item)[0] === criteria.origin);
            if (!hasOrigin) return false;
        }

        if (criteria.subtype) {
            const hasSubtype = originItems.some(item => {
                const originName = Object.keys(item)[0];
                const subtypes = item[originName];
                return Array.isArray(subtypes) && subtypes.includes(criteria.subtype);
            });
            if (!hasSubtype) return false;
        }

        return true;
    });
};

export function useCharacterAutoEffects(data: any, onChange: (updates: any) => void) {
    // --- STEP 3 EFFECTS ---
    const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar');
    const isAtlante = hasSubtype(data, 'Parahumano', 'Atlante');
    const isTroll = hasSubtype(data, 'Arcano', 'Troll');
    const isGrifo = hasSubtype(data, 'Arcano', 'Grifo');
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isPoseido = hasSubtype(data, 'Sobrenatural', 'Poseidó') || hasSubtype(data, 'Sobrenatural', 'Poseido');

    const selectedPowers = data.powers?.selected || [];
    const emFormula = data.spells?.emFormula || { divisor: 4, pcCost: 0 };
    const hasEM = isMago || isDotado || isHibrido || isTerrano || isPoseido;

    // Auto-add Superhabilidad for Tes-khar
    useEffect(() => {
        if (isTesKhar) {
            const hasSuperhabilidad = selectedPowers.some((p: any) => p.id === 'superhabilidad');
            if (!hasSuperhabilidad) {
                const newPower: SelectedPower = {
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 80,
                    skillValue: 0,
                    selectedOption: 'Esconderse'
                };
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...selectedPowers, newPower]
                    }
                });
            }
        }
    }, [isTesKhar, selectedPowers, onChange, data]);

    // Auto-add Powers for Atlante
    useEffect(() => {
        if (isAtlante) {
            const hasWaterControl = selectedPowers.some((p: any) => p.id === 'control_del_agua');
            const hasNativeLanguage = selectedPowers.some((p: any) => p.id === 'superhabilidad' && p.selectedOption === 'Idioma nativo');
            const hasSwimming = selectedPowers.some((p: any) => p.id === 'superhabilidad' && p.selectedOption === 'Nadar');
            const hasAnimalEmpathy = selectedPowers.some((p: any) => p.id === 'empatia_animal');

            let newPowers: SelectedPower[] = [];

            if (!hasWaterControl) {
                newPowers.push({
                    id: 'control_del_agua',
                    origin: 'Parahumano',
                    rank: 11,
                    skillValue: 0
                });
            }

            if (!hasNativeLanguage) {
                newPowers.push({
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 41,
                    skillValue: 0,
                    selectedOption: 'Idioma nativo'
                });
            }

            if (!hasSwimming) {
                newPowers.push({
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 81,
                    skillValue: 0,
                    selectedOption: 'Nadar'
                });
            }

            if (!hasAnimalEmpathy) {
                newPowers.push({
                    id: 'empatia_animal',
                    origin: 'Parahumano',
                    rank: 11,
                    skillValue: 0,
                    customizations: [{
                        id: 'atlante_cetaceos',
                        description: 'Hablar solo con cetáceos',
                        cost: 0
                    }]
                });
            }

            if (newPowers.length > 0) {
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...selectedPowers, ...newPowers]
                    }
                });
            }
        }
    }, [isAtlante, selectedPowers, onChange, data]);

    // Auto-add Regeneration for Troll
    useEffect(() => {
        if (isTroll) {
            const hasRegeneration = selectedPowers.some((p: any) => p.id === 'regeneracion_de_tejidos');
            if (!hasRegeneration) {
                const newPower: SelectedPower = {
                    id: 'regeneracion_de_tejidos',
                    origin: 'Arcano',
                    rank: 81,
                    skillValue: 0
                };
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...selectedPowers, newPower]
                    }
                });
            }
        }
    }, [isTroll, selectedPowers, onChange, data]);

    // Auto-select Volar for Grifo
    useEffect(() => {
        if (isGrifo) {
            const hasVolar = selectedPowers.some((p: any) => p.id === 'volar');
            if (!hasVolar) {
                const volarPower = POWERS.find(p => p.id === 'volar');
                if (volarPower) {
                    const newPower: SelectedPower = {
                        id: volarPower.id,
                        origin: 'Grifo',
                        rank: 11,
                        customizations: [{
                            id: Date.now().toString(),
                            description: "Tiene alas para volar",
                            cost: 0
                        }]
                    };
                    onChange({
                        ...data,
                        powers: {
                            ...data.powers,
                            selected: [...selectedPowers, newPower]
                        }
                    });
                }
            }
        }
    }, [isGrifo, selectedPowers, onChange, data]);

    // Auto-correct EM formula for Poseido
    useEffect(() => {
        if (isPoseido && emFormula.divisor === 4) {
            onChange({
                ...data,
                spells: {
                    ...data.spells,
                    emFormula: { divisor: 0, pcCost: 0 },
                    selected: [] // Clear spells if defaulting to no access
                }
            });
        }
    }, [isPoseido, emFormula.divisor, data, onChange]);

    // Calculate and store EM in state
    useEffect(() => {
        if (!hasEM) return;

        let divisor = emFormula.divisor;
        if (isMago) divisor = 1;

        if (divisor === 0) return;

        const calculated = calculateEM(data, selectedPowers, divisor);

        if (data.spells?.calculatedEM !== calculated) {
            onChange({
                ...data,
                spells: {
                    ...data.spells,
                    calculatedEM: calculated,
                }
            });
        }
    }, [
        hasEM,
        isMago,
        emFormula.divisor,
        data.attributes,
        selectedPowers,
        data.spells?.calculatedEM,
        data,
        onChange
    ]);

    // Auto-update Attributes when Powers change (Power Mods)
    useEffect(() => {
        if (!data.attributes?.breakdown) return;

        const powerMods: { [key: string]: number } = {};
        const charMap: Record<string, string> = {
            'FUE': 'fuerza',
            'AGI': 'agilidad',
            'CON': 'constitucion',
            'INT': 'inteligencia',
            'PER': 'percepcion',
            'APA': 'apariencia',
            'VOL': 'voluntad'
        };

        const CHARACTERISTICS = [
            { id: 'fuerza', name: 'Fuerza' },
            { id: 'constitucion', name: 'Constitución' },
            { id: 'agilidad', name: 'Agilidad' },
            { id: 'inteligencia', name: 'Inteligencia' },
            { id: 'percepcion', name: 'Percepción' },
            { id: 'apariencia', name: 'Apariencia' },
            { id: 'voluntad', name: 'Voluntad' }
        ];

        // Calculate expected power mods
        selectedPowers.forEach((p: any) => {
            const powerData = POWERS.find(pd => pd.id === p.id);
            if (powerData?.characteristic) {
                const charId = charMap[powerData.characteristic];
                if (charId) {
                    const mod = Number(p.powerMod) || 0;
                    powerMods[charId] = (powerMods[charId] || 0) + mod;
                }
            }
        });

        // Check if update is needed
        let hasChanges = false;
        const newBreakdown = { ...data.attributes.breakdown };
        
        CHARACTERISTICS.forEach(char => {
            const charId = char.id;
            const currentMod = newBreakdown[charId]?.powerMod || 0;
            const newMod = powerMods[charId] || 0;
            
            if (currentMod !== newMod) {
                hasChanges = true;
                if (!newBreakdown[charId]) { // Just in case
                    newBreakdown[charId] = { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 };
                }
                newBreakdown[charId] = {
                    ...newBreakdown[charId],
                    powerMod: newMod
                };
            }
        });

        if (hasChanges) {
            // Recalculate values
            const newValues: { [key: string]: number } = {};

            CHARACTERISTICS.forEach(char => {
                const c = newBreakdown[char.id];
                const base = c.base || 0;
                const origin = c.originMod || 0;
                const specialty = c.specialtyMod || 0;
                const power = c.powerMod || 0;
                const other = c.otherMod || 0;
                
                newValues[char.name] = base + origin + specialty + power + other;
            });

            onChange({
                ...data,
                attributes: {
                    ...data.attributes,
                    values: newValues,
                    breakdown: newBreakdown
                }
            });
        }
    }, [selectedPowers, data.attributes?.breakdown, onChange, data]); // specific dependencies are important
}

export function useSkillAutoEffects(data: any, selectedSkills: any, specifiedSkills: any, setSelectedSkills: any, setSpecifiedSkills: any) {
    const freeSkillIds = getFreeSkillsForOrigins(data.origin?.items || []);
    const requiredSkillIds = getRequiredSkillsForOrigins(data.origin?.items || []);

    // Auto-add free skills from origin
    useEffect(() => {
        if (freeSkillIds.length > 0) {
            const newSelected = { ...selectedSkills };
            let hasChanges = false;

            freeSkillIds.forEach((skillId: string) => {
                if (!newSelected[skillId]) {
                    newSelected[skillId] = { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 };
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                setSelectedSkills(newSelected);
            }
        }
    }, [freeSkillIds.join(','), selectedSkills, setSelectedSkills]);

    // Auto-add required skills from Vigilante specialties AND update isRequired status
    useEffect(() => {
        const newSelected = { ...selectedSkills };
        const newSpecified = { ...specifiedSkills };
        let hasChanges = false;

        // 1. Cleanup: Remove isRequired from skills that are no longer required
        Object.keys(newSelected).forEach(skillId => {
            if (newSelected[skillId].isRequired && !requiredSkillIds.includes(skillId)) {
                newSelected[skillId] = {
                    ...newSelected[skillId],
                    isRequired: false
                };
                hasChanges = true;
            }
        });

        Object.keys(newSpecified).forEach(uniqueId => {
            const skillId = newSpecified[uniqueId].skillId;
            if (newSpecified[uniqueId].isRequired && !requiredSkillIds.includes(skillId)) {
                newSpecified[uniqueId] = {
                    ...newSpecified[uniqueId],
                    isRequired: false
                };
                hasChanges = true;
            }
        });

        // 2. Add: Ensure all currently required skills are marked as such
        if (requiredSkillIds.length > 0) {
            requiredSkillIds.forEach((skillId: string) => {
                const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);

                if (skillDef?.requiresSpecification) {
                    const existingInstances = Object.values(newSpecified).filter((s: any) => s.skillId === skillId);

                    if (existingInstances.length === 0) {
                        const uniqueId = `${skillId}_required_${Date.now()}`;
                        newSpecified[uniqueId] = {
                            skillId,
                            specification: '',
                            isFree: false,
                            isRequired: true,
                            manualMods: 0,
                            manualBases: 0
                        };
                        hasChanges = true;
                    } else {
                        const hasRequiredInstance = existingInstances.some((s: any) => s.isRequired);
                        if (!hasRequiredInstance) {
                            const firstKey = Object.keys(newSpecified).find(key => newSpecified[key].skillId === skillId);
                            if (firstKey) {
                                newSpecified[firstKey] = {
                                    ...newSpecified[firstKey],
                                    isRequired: true
                                };
                                hasChanges = true;
                            }
                        }
                    }
                } else {
                    if (!newSelected[skillId]) {
                        newSelected[skillId] = { isFree: false, isRequired: true, manualMods: 0, manualBases: 0 };
                        hasChanges = true;
                    } else if (!newSelected[skillId].isRequired) {
                        newSelected[skillId] = {
                            ...newSelected[skillId],
                            isRequired: true
                        };
                        hasChanges = true;
                    }
                }
            });
        }

        if (hasChanges) {
            setSelectedSkills(newSelected);
            setSpecifiedSkills(newSpecified);
        }
    }, [requiredSkillIds.join(','), selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills]);

    // Cleanup restricted skills when origin changes
    useEffect(() => {
        const originItems = data.origin?.items || [];
        const newSelected = { ...selectedSkills };
        const newSpecified = { ...specifiedSkills };
        let hasChanges = false;

        Object.keys(newSelected).forEach(skillId => {
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            if (skillDef && !isSkillAllowed(skillDef, originItems)) {
                delete newSelected[skillId];
                hasChanges = true;
            }
        });

        Object.keys(newSpecified).forEach(uniqueId => {
            const skillId = newSpecified[uniqueId].skillId;
            const skillDef = SPECIAL_SKILLS.find(s => s.id === skillId);
            if (skillDef && !isSkillAllowed(skillDef, originItems)) {
                delete newSpecified[uniqueId];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setSelectedSkills(newSelected);
            setSpecifiedSkills(newSpecified);
        }
    }, [JSON.stringify(data.origin?.items), selectedSkills, specifiedSkills, setSelectedSkills, setSpecifiedSkills]);
}
