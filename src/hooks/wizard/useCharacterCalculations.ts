import { useMemo } from 'react';
import { calculateOriginCost } from '../../data/originCosts.ts';
import { calculateCreationPoints, calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt } from '../../utils/characterCalculations';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../data/backgroundTables';
import { SPELLS } from '../../data/spells';
import { POWERS } from '../../data/powers';
import { EXOSKELETON_CONFIGS } from '../../data/exoskeletonConfigs';
import { EXOSKELETON_ARMOR_CONFIGS } from '../../data/exoskeletonArmorConfigs';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../../data/technoSuitStrengthConfigs';
import { ENTE_FORMS, ENTE_EFFECTS } from '../../components/wizard/steps/Step3_Especials/sections/EnteSection';
import { POSEIDO_FORMS } from '../../components/wizard/steps/Step3_Especials/sections/PoseidoSection';
import { calculateEM, hasSubtype } from '../../components/wizard/steps/Step3_Especials/utils';
import { INCOME_SOURCES } from '../../data/technologicalOptions';
import { SEQUELS } from '../../data/sequels';
import { GUARDIAN_QUALITIES } from '../../data/guardianOptions';
import { DIVINE_FOCUS_OPTIONS } from '../../data/divineOptions';
import { CYBORG_IMPLANT_STATS, CYBORG_IMPLANT_STRENGTHS } from '../../data/cyborgImplantConfigs';
import type { CyborgImplant } from '../../data/cyborgImplantConfigs';

export function useCharacterCalculations(character: any) {
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
        const specialSkillsPC = calculateSpecialSkillsPCWithInt(
            character.skills?.selected || {},
            character.skills?.specified || {},
            character.origin?.items || [],
            character.attributes?.values || {}
        );
        total += specialSkillsPC.totalPC;

        // 5. Coste de Resistencia a Prejuicios
        // (Valor - 50) * 0.1
        const prejudiceCost = ((character.background?.prejudiceResistance || 50) - 50) * 0.1;
        total += prejudiceCost;

        // 6. Coste de Estatus (Económico, Legal, Social)
        const economicCost = ECONOMIC_STATUS.find(e => e.id === character.background?.economicStatus)?.cost || 0;
        const legalCost = LEGAL_STATUS.find(l => l.id === character.background?.legalStatus)?.cost || 0;
        const socialCost = SOCIAL_STATUS.find(s => s.id === character.background?.socialStatus)?.cost || 0;
        const friendsCost = FRIENDS_AND_ASSOCIATES.find(f => f.id === character.background?.friendsAndAssociates)?.cost || 0;

        total += economicCost + legalCost + socialCost + friendsCost;

        const selectedPowers = character.powers?.selected || [];

        // 7. Coste de Exceso de Magia (EM)
        // Por cada 1 punto de EM que se pase del total disponible: +0.1 PC
        // If Mago, divisor is always 1
        const isMago = hasSubtype(character, 'Arcano', 'Mago');

        let emDivisor = character.spells?.emFormula?.divisor || 1;
        if (isMago) emDivisor = 1;

        // Use shared calculateEM to ensure power modifiers are included
        const maxEM = calculateEM(character, selectedPowers, emDivisor);

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

        // Magic Table Rolls Cost (Terrano)
        if (character.magicTableRolls && character.magicTableRolls.length > 0) {
            character.magicTableRolls.forEach((rollType: string) => {
                if (rollType === '180_EM') total += 1;
                else if (rollType === '120_EM') total += 0;
                else if (rollType === '60_EM') total -= 1;
                else if (rollType === 'none') total -= 2;
                else if (rollType === 'guardian_power') total += 2;
            });
        }

        // 9. Power Costs (Base + Rank/PowerMod)
        // Tracking used free powers
        let tesKharFreeUsed = false;
        let atlanteAnimalUsed = false;
        let atlanteSuperUsed = false; // For Idioma Nativo
        let atlanteSwimmingUsed = false; // For Nadar
        let atlanteEmpathyUsed = false; // For Empatía Animal
        let trollRegenUsed = false;
        let thalsPowerCount = 0;

        const powerCost = selectedPowers.reduce((acc: number, power: any) => {
            const powerData = POWERS.find((p: any) => p.id === power.id);
            if (!powerData) return acc;

            // Tes-khar: Superhabilidad free at any rank (effectively) or just base?
            const isTesKhar = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return Array.isArray(val) && val.includes('Tes-khar');
                })
            );

            const isAtlante = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return Array.isArray(val) && val.includes('Atlante');
                })
            );

            const isTroll = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return Array.isArray(val) && val.includes('Troll');
                })
            );

            const isSemidemonio = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return key === 'Sobrenatural' && Array.isArray(val) && val.includes('Semidemonio');
                })
            );

            const isThals = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return key === 'Parahumano' && Array.isArray(val) && val.includes('Thals');
                })
            );

            if (isTesKhar && power.id === 'superhabilidad' && !tesKharFreeUsed) {
                tesKharFreeUsed = true;
                return acc;
            }

            // Atlante: Control del agua (R11), Superhabilidad (R41 Idioma, R81 Nadar), Empatía (R11)
            if (isAtlante) {
                if (power.id === 'control_del_agua' && !atlanteAnimalUsed) {
                    atlanteAnimalUsed = true;
                    // Rank 11 Free
                    const rankDiff = (power.rank || 1) - 11;
                    return acc + (rankDiff * 0.1);
                }

                if (power.id === 'superhabilidad') {
                    if (power.selectedOption === 'Idioma nativo' && !atlanteSuperUsed) {
                        atlanteSuperUsed = true;
                        const rankDiff = (power.rank || 1) - 41;
                        return acc + (rankDiff * 0.1);
                    }
                    if (power.selectedOption === 'Nadar' && !atlanteSwimmingUsed) {
                        atlanteSwimmingUsed = true;
                        const rankDiff = (power.rank || 1) - 81;
                        return acc + (rankDiff * 0.1);
                    }
                }

                if (power.id === 'empatia_animal' && !atlanteEmpathyUsed) {
                    atlanteEmpathyUsed = true;
                    const rankDiff = (power.rank || 1) - 11;
                    return acc + (rankDiff * 0.1);
                }
            }

            if (isTroll && power.id === 'regeneracion_de_tejidos' && !trollRegenUsed) {
                trollRegenUsed = true;
                return acc;
            }

            const isGrifo = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return key === 'Arcano' && Array.isArray(val) && val.includes('Grifo');
                })
            );

            if (isGrifo && power.id === 'volar') {
                const rankDiff = (power.rank || 1) - 11;
                return acc + (rankDiff * 0.1);
            }

            // Base cost
            let cost = powerData.cost;

            // CROSS-TYPE PENALTY FOR MUTANTS (+2 PC to base cost)
            // Applied before other modifiers
            if (power.isCrossType) {
                cost += 2;
            }

            // CROSS-ORIGIN PENALTY FOR GUARDIÁN (+3 PC to base cost)
            // Applied before other modifiers
            if (power.isCrossOrigin) {
                cost += 3;
            }

            // CROSS-ORIGIN PENALTY FOR MALDITO (+1 PC to base cost)
            // Applied before other modifiers
            if (power.isCrossOriginMaldito) {
                cost += 1;
            }

            // Semidemonio Bonus: -1 PC for Sobrenatural powers (Base cost discount)
            const isSemidemonioBonus = isSemidemonio && power.origin === 'Sobrenatural';
            if (isSemidemonioBonus && !powerData.characteristic) {
                cost = Math.max(0, cost - 1);
            }

            // Thals Bonus: 1st Thals power Free (Base 0), others Base-2
            if (isThals && power.origin === 'Thals') {
                thalsPowerCount++;
                if (thalsPowerCount === 1) {
                    cost = 0; // First one is free (Base cost 0)
                } else {
                    cost = Math.max(0, cost - 2);
                }
            }

            // Enano Guardian Cost: Base + 2
            const isEnano = character.origin?.items?.some((item: any) =>
                Object.keys(item).some(key => {
                    const val = item[key];
                    return key === 'Arcano' && Array.isArray(val) && val.includes('Enano');
                })
            );
            if (isEnano && power.origin === 'Guardian') {
                cost += 2;
            }

            // Parahumano Hybrid Penalty: +3 PC for Alterado powers
            if (character.isParahumanoHybrid && power.origin === 'Alterado') {
                cost += 3;
            }

            // Additional cost based on power type
            if (!powerData.characteristic) {
                // Powers without characteristics: rank cost
                const rank = power.rank || 1;
                cost += rank * 0.1;

                // SKILL VALUE COST
                if (powerData.skillCalc && power.skillValue) {
                    const getVal = (abbr: string) => {
                        const map: Record<string, number> = {
                            'FUE': character.attributes?.values?.['Fuerza'] || 0,
                            'AGI': character.attributes?.values?.['Agilidad'] || 0,
                            'CON': character.attributes?.values?.['Constitución'] || 0,
                            'INT': character.attributes?.values?.['Inteligencia'] || 0,
                            'PER': character.attributes?.values?.['Percepción'] || 0,
                            'VOL': character.attributes?.values?.['Voluntad'] || 0,
                            'APA': character.attributes?.values?.['Apariencia'] || 0
                        };
                        return map[abbr] || 0;
                    };

                    try {
                        const evalFormula = powerData.skillCalc.replace(/[A-Z]{3}/g, (match: string) => getVal(match).toString());
                        const minVal = Math.floor(new Function('return ' + evalFormula)());

                        if (power.skillValue > minVal) {
                            cost += (power.skillValue - minVal) * 0.1;
                        }
                    } catch (e) {
                        // Ignore calculation errors
                    }
                }
            } else {
                // Powers with characteristics: powerMod / 10
                const powerMod = power.powerMod || 0;
                let modCost = powerMod;

                if (isSemidemonioBonus) {
                    // Semidemonio Bonus for characteristic powers: 10 points free (1 PC discount equivalent)
                    modCost = Math.max(0, modCost - 10);
                }

                cost += modCost / 10;
            }

            // Customizations cost
            const custCost = (power.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
            cost += custCost;

            return acc + cost;
        }, 0);
        total += powerCost;

        // Technological Income Source Cost
        if (character.origin?.items?.some((i: any) => Object.keys(i)[0] === 'Tecnológico') && character.techParams?.incomeSource) {
            const source = INCOME_SOURCES.find(s => s.id === character.techParams.incomeSource);
            if (source) {
                total += source.pc;
            }
        }

        // 10. Equipment Costs
        const equipmentCost = (character.equipment?.items || []).reduce((acc: number, item: any) => {
            return acc + (parseInt(item.cost) || 0);
        }, 0);
        total += equipmentCost;

        // 11. Weapons Costs
        const weaponsCost = (character.weapons?.items || []).reduce((acc: number, item: any) => {
            return acc + (parseInt(item.cost) || 0);
        }, 0);
        total += weaponsCost;

        // 12. Artifacts Costs
        const artifactsCost = (character.artifacts?.items || []).reduce((acc: number, item: any) => {
            return acc + (parseInt(item.cost) || 0);
        }, 0);
        total += artifactsCost;

        // 13. Vehicles Costs
        // No cost

        // 14. Tech Modules Costs
        const techModulesCost = (character.techModules || []).reduce((acc: number, module: any) => {
            return acc + (module.pcCost || 0);
        }, 0);
        total += techModulesCost;

        // 13. Exoskeleton Configuration Cost
        if (character.exoskeletonConfig) {
            const config = EXOSKELETON_CONFIGS.find((c) => c.id === character.exoskeletonConfig);
            if (config) {
                total += config.pcCost;
            }
        }

        // 13b. Exoskeleton Armor Cost
        if (character.exoskeletonArmorConfig) {
            const config = EXOSKELETON_ARMOR_CONFIGS.find((c) => c.id === character.exoskeletonArmorConfig);
            if (config) {
                total += config.pcCost;
            }
        }

        // 13c. Techno-Suit Strength Cost
        if (character.technoSuitStrengthConfig) {
            const config = TECHNOSUIT_STRENGTH_CONFIGS.find((c) => c.id === character.technoSuitStrengthConfig);
            if (config) {
                total += config.pcCost;
            }
        }

        // 13d. Cyborg Implants Cost
        if (character.cyborgImplants && character.cyborgImplants.length > 0) {
            character.cyborgImplants.forEach((implant: CyborgImplant) => {
                const stat = CYBORG_IMPLANT_STATS.find(s => s.id === implant.statConfigId);
                const str = CYBORG_IMPLANT_STRENGTHS.find(s => s.id === implant.strengthConfigId);
                if (stat) total += stat.pcCost;
                if (str) total += str.pcCost;
            });
        }

        // 14. Ente Params Cost
        if (character.enteParams) {
            if (character.enteParams.formType) {
                const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                if (form) total += form.cost;
            }
            if (character.enteParams.visualEffect) {
                const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                if (effect) total += effect.cost;
            }
        }

        // 15. Maldito Params Cost
        if (character.malditoParams && character.malditoParams.magnitude) {
            const MALDITO_MAGNITUDE = [
                { id: 'use_power', cost: 0 },
                { id: 'own_consequences', cost: 0 },
                { id: 'hard_to_hide', cost: 2 },
                { id: 'uncontrolable', cost: 2 },
                { id: 'daily_condition', cost: 3 },
                { id: 'weekly_need', cost: 3 },
                { id: 'noticeable', cost: 4 },
                { id: 'monthly_condition', cost: 4 },
                { id: 'marked', cost: 5 },
            ];
            const mag = MALDITO_MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
            if (mag) total += mag.cost;
        }

        // 16. Poseido Params Cost
        if (character.poseidoParams && character.poseidoParams.formType) {
            const form = POSEIDO_FORMS.find(f => f.id === character.poseidoParams.formType);
            if (form) total += form.pc;
        }

        // 17. Alterado Params Cost
        if (character.alteradoParams) {
            const ALTERADO_AGENTS = [
                { id: 'nuclear', label: 'Energía nuclear', cost: 0 },
                { id: 'electromagnetic', label: 'Accidente con energía electromagnética', cost: 0 },
                { id: 'space_energy', label: 'Energía espacial desconocida', cost: 0 },
                { id: 'other_energy', label: 'Otras energías', cost: 0 },
                { id: 'radiation', label: 'Radiación diversa', cost: 0 },
                { id: 'biological', label: 'Agente biológico', cost: 0 },
                { id: 'mutagen', label: 'Agente mutágeno', cost: 0 },
                { id: 'chemical', label: 'Sustancia química', cost: 0 },
                { id: 'treatment', label: 'Tratamiento', cost: 2 },
                { id: 'other', label: 'Otro', cost: 0 },
            ];

            // Agent Discount
            if (character.alteradoParams.agent) {
                const agent = ALTERADO_AGENTS.find(a => a.id === character.alteradoParams.agent);
                if (agent && agent.cost > 0) {
                    total -= agent.cost;
                }
            }

            // Sequels Discount or Penalty
            if (character.alteradoParams.sequels && Array.isArray(character.alteradoParams.sequels) && character.alteradoParams.sequels.length > 0) {
                // Has sequels: subtract their costs (discount)
                character.alteradoParams.sequels.forEach((s: any) => {
                    const seq = SEQUELS.find(d => d.id === s.id);
                    if (seq) {
                        total -= seq.cost;
                    }
                });
            } else {
                // No sequels selected: +2 PC penalty
                total += 2;
            }
        }

        // 17. Mutante Params Cost (DISCOUNT)
        if (character.mutanteParams) {
            if (character.mutanteParams.sequels && Array.isArray(character.mutanteParams.sequels)) {
                character.mutanteParams.sequels.forEach((s: any) => {
                    const seq = SEQUELS.find(d => d.id === s.id);
                    if (seq) {
                        total -= seq.cost;
                    }
                });
            }
        }

        // 18. Guardian Params Cost
        if (character.guardianParams && character.guardianParams.quality) {
            const quality = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
            if (quality) {
                total += quality.cost;
            }
        }

        // 19. Divine Params Cost
        if (character.divineParams && character.divineParams.focus) {
            const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
            if (focus) {
                total += focus.cost;
            }
        }

        return Math.round(total * 10) / 10;
    }, [character]);

    return { totalPCs };
}
