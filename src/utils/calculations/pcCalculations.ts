import { forEachOriginAndSubtype, calculateOriginCost } from './originCalculations';

import { calculateGeneralSkillValues, calculateSpecialSkillsPCWithInt } from './skillCalculations';
import {
    ECONOMIC_STATUS,
    LEGAL_STATUS,
    SOCIAL_STATUS,
    FRIENDS_AND_ASSOCIATES,
    BASE_COVERAGE
} from '../../data/backgroundTables';
import {
    INCOME_SOURCES,
    EXOSKELETON_CONFIGS,
    EXOSKELETON_ARMOR_CONFIGS,
    TECHNOSUIT_STRENGTH_CONFIGS,
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../data/technologicalData';
import { SEQUELS } from '../../data/sequels';
import { GUARDIAN_QUALITIES } from '../../data/guardianOptions';
import { DIVINE_FOCUS_OPTIONS } from '../../data/divineOptions';
import { hasHombreLobo, getWerewolfSubtypeConfig, WEREWOLF_TRANSITION_FORM_ID } from '../../data/werewolfOptions';
import {
    ENTE_FORMS,
    ENTE_EFFECTS,
    POSEIDO_FORMS,
    MALDITO_MAGNITUDE,
    ALTERADO_AGENTS,
    LIBERADO_DONES_COST
} from '../../data/originOptions';
import { hasOrigin, hasSubtype } from './originFlags';
import { getCharacterMaxEM, calculateSelectedSpellsEMCost } from './magicCalculations';
import { calculateTotalPowersPC } from './powerCalculations';

/**
 * Calcula los Puntos de Creación (PC) generados por las características
 * Fórmula: (Base + Mod. Otros) / 10
 */
export function calculateCreationPoints(
    characteristics: { [key: string]: { base: number; powerMod: number } },
    origins: any[] = []
): { pcValues: { [key: string]: number }; totalPC: number } {
    const pcValues: { [key: string]: number } = {};
    let totalPC = 0;

    let isEnte = false;
    let isDotado = false;

    // Detectar subtipos especiales para reducción de costes
    if (origins && origins.length > 0) {
        forEachOriginAndSubtype(origins, (name) => {
            if (name === 'Ente') isEnte = true;
            if (name === 'Dotado') isDotado = true;
        });
    }

    Object.keys(characteristics).forEach(charId => {
        const char = characteristics[charId];
        if (char) {
            let costMultiplier = 1.0;

            // Lógica de reducción de costes
            if (isEnte) {
                costMultiplier = 0.5;
            } else if (isDotado && charId === 'voluntad') {
                costMultiplier = 0.5;
            }

            // Calcular puntos individuales con decimales y aplicador multiplicador
            // NOTE: powerMod is NOT included here because it's already charged in the power cost
            const pc = (char.base / 10) * costMultiplier;
            pcValues[charId] = pc;
            totalPC += pc;
        }
    });

    return { pcValues, totalPC };
}

export interface CharacterPCBreakdown {
    origin: number;
    characteristics: number;
    generalSkills: number;
    specialSkills: number;
    background: number;
    magic: number;
    powers: number;
    techAndEquipment: number;
    originSpecials: number;
    forms: number;
    total: number;
}

/**
 * Función pura que calcula el desglose completo y el total de Puntos de Creación (PC) de un personaje.
 */
export function calculateCharacterPCBreakdown(character: any): CharacterPCBreakdown {
    if (!character) {
        return {
            origin: 0,
            characteristics: 0,
            generalSkills: 0,
            specialSkills: 0,
            background: 0,
            magic: 0,
            powers: 0,
            techAndEquipment: 0,
            originSpecials: 0,
            forms: 0,
            total: 0
        };
    }

    const originItems = character.origin?.items || [];

    // 1. Coste de Origen
    const origin = calculateOriginCost(originItems);

    // 2. PCs generados por características (Base + Mods)
    let characteristics = 0;
    if (character.attributes?.breakdown) {
        const { totalPC } = calculateCreationPoints(character.attributes.breakdown, originItems);
        characteristics = totalPC;
    }

    // 3. Coste de incremento de Bases en Habilidades Generales
    let generalSkills = 0;
    if (character.attributes?.values) {
        const { totalPC: skillsPC } = calculateGeneralSkillValues(
            character.attributes.values,
            originItems,
            character.skills?.generalManualMods || {},
            character.skills?.manualBases || {}
        );
        generalSkills = skillsPC;
    }

    // 4. Coste de Habilidades de aprendizaje Seleccionadas
    const specialSkillsResult = calculateSpecialSkillsPCWithInt(
        character.skills?.selected || {},
        character.skills?.specified || {},
        originItems,
        character.attributes?.values || {}
    );
    const specialSkills = specialSkillsResult.totalPC;

    // 5 & 6. Coste de Trasfondo (Resistencia a Prejuicios + Estatus)
    const prejudiceCost = ((character.background?.prejudiceResistance ?? 50) - 50) * 0.1;
    const economicCost = ECONOMIC_STATUS.find(e => e.id === character.background?.economicStatus)?.cost || 0;
    const legalCost = LEGAL_STATUS.find(l => l.id === character.background?.legalStatus)?.cost || 0;
    const socialCost = SOCIAL_STATUS.find(s => s.id === character.background?.socialStatus)?.cost || 0;
    const friendsCost = FRIENDS_AND_ASSOCIATES.find(f => f.id === character.background?.friendsAndAssociates)?.cost || 0;
    const baseCoverageCost = BASE_COVERAGE.find(b => b.id === character.background?.baseCoverage)?.cost || 0;
    const background = prejudiceCost + economicCost + legalCost + socialCost + friendsCost + baseCoverageCost;

    // 7 & 8. Magia (Exceso de EM + Coste de Fórmula EM + Tiradas Tabla Mágica Terrano)
    let magic = 0;
    const selectedPowers = character.powers?.selected || [];
    const maxEM = getCharacterMaxEM(character, selectedPowers);
    const selectedSpells = character.spells?.selected || [];
    const spellCost = calculateSelectedSpellsEMCost(selectedSpells);

    if (spellCost > maxEM) {
        magic += (spellCost - maxEM) / 10;
    }

    magic += character.spells?.emFormula?.pcCost || 0;

    if (Array.isArray(character.magicTableRolls) && character.magicTableRolls.length > 0) {
        character.magicTableRolls.forEach((rollType: string) => {
            if (rollType === '180_EM') magic += 1;
            else if (rollType === '120_EM') magic += 0;
            else if (rollType === '60_EM') magic -= 1;
            else if (rollType === 'none') magic -= 2;
            else if (rollType === 'guardian_power') magic += 2;
        });
    }

    // 9. Coste de Poderes
    const powers = calculateTotalPowersPC(character);

    // 10 - 14. Tecnología y Equipo
    let techAndEquipment = 0;

    if (hasOrigin(character, 'Tecnológico') && character.techParams?.incomeSource) {
        const source = INCOME_SOURCES.find(s => s.id === character.techParams.incomeSource);
        if (source) {
            techAndEquipment += source.pc;
        }
    }

    techAndEquipment += (character.equipment?.items || []).reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0);
    techAndEquipment += (character.weapons?.items || []).reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0);
    techAndEquipment += (character.varios?.items || []).reduce((acc: number, item: any) => acc + (parseFloat(item.cost) || 0), 0);
    techAndEquipment += (character.artifacts?.items || []).reduce((acc: number, item: any) => acc + (parseInt(item.cost) || 0), 0);
    techAndEquipment += (character.techModules || []).reduce((acc: number, module: any) => acc + (module.pcCost || 0), 0);

    if (character.exoskeletonConfig) {
        const config = EXOSKELETON_CONFIGS.find(c => c.id === character.exoskeletonConfig);
        if (config) techAndEquipment += config.pcCost;
    }

    if (character.exoskeletonArmorConfig) {
        const config = EXOSKELETON_ARMOR_CONFIGS.find(c => c.id === character.exoskeletonArmorConfig);
        if (config) techAndEquipment += config.pcCost;
    }

    if (character.technoSuitStrengthConfig) {
        const config = TECHNOSUIT_STRENGTH_CONFIGS.find(c => c.id === character.technoSuitStrengthConfig);
        if (config) techAndEquipment += config.pcCost;
    }

    if (Array.isArray(character.cyborgImplants) && character.cyborgImplants.length > 0) {
        character.cyborgImplants.forEach((implant: CyborgImplant) => {
            const stat = CYBORG_IMPLANT_STATS.find(s => s.id === implant.statConfigId);
            const str = CYBORG_IMPLANT_STRENGTHS.find(s => s.id === implant.strengthConfigId);
            if (stat) techAndEquipment += stat.pcCost;
            if (str) techAndEquipment += str.pcCost;
        });
    }

    // 14 - 21. Parámetros Especiales de Origen
    let originSpecials = 0;

    // Ente
    if (character.enteParams) {
        if (character.enteParams.formType) {
            const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
            if (form) originSpecials += form.cost;
        }
        if (character.enteParams.visualEffect) {
            const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
            if (effect) originSpecials += effect.cost;
        }
    }

    // Maldito
    if (character.malditoParams?.magnitude) {
        const mag = MALDITO_MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
        if (mag) originSpecials += mag.cost;
    }

    // Poseído
    if (character.poseidoParams?.formType) {
        const form = POSEIDO_FORMS.find(f => f.id === character.poseidoParams.formType);
        if (form) originSpecials += form.cost;
    }

    // Alterado
    const isAlteradoChar = hasOrigin(character, 'Alterado') || (character.isParahumanoHybrid && character.parahumanoParams?.isHybridWithHuman);
    if (isAlteradoChar) {
        if (character.alteradoParams?.agent) {
            const agent = ALTERADO_AGENTS.find(a => a.id === character.alteradoParams.agent);
            if (agent && agent.cost > 0) {
                originSpecials -= agent.cost;
            }
        }

        const alteradoSequels = character.alteradoParams?.sequels || [];
        if (alteradoSequels.length > 0) {
            alteradoSequels.forEach((s: any) => {
                const seq = SEQUELS.find(d => d.id === s.id);
                if (seq) originSpecials -= seq.cost;
            });
        } else {
            originSpecials += 2;
        }
    }

    // Mutante
    if (hasOrigin(character, 'Mutante')) {
        const mutanteSequels = character.mutanteParams?.sequels || [];
        if (mutanteSequels.length > 0) {
            mutanteSequels.forEach((s: any) => {
                const seq = SEQUELS.find(d => d.id === s.id);
                if (seq) originSpecials -= seq.cost;
            });
        }
    }

    // Híbrido mitológico
    if (hasSubtype(character, 'Arcano', 'Híbrido mitológico')) {
        const hibridoSequels = character.hibridoParams?.sequels || [];
        if (hibridoSequels.length > 0) {
            hibridoSequels.forEach((s: any) => {
                const seq = SEQUELS.find(d => d.id === s.id);
                if (seq) originSpecials -= seq.cost;
            });
        } else {
            originSpecials += 2;
        }
    }

    // Guardián
    if (character.guardianParams?.quality) {
        const quality = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
        if (quality) originSpecials += quality.cost;
    }

    // Divino
    if (character.divineParams?.focus) {
        const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
        if (focus) originSpecials += focus.cost;
    }

    // Liberado
    if (character.liberadoParams) {
        if (Array.isArray(character.liberadoParams.gifts)) {
            character.liberadoParams.gifts.forEach((g: string) => {
                originSpecials += LIBERADO_DONES_COST[g] || 0;
            });
        } else if (character.liberadoParams.gift) {
            originSpecials += LIBERADO_DONES_COST[character.liberadoParams.gift] || 0;
        }
    }

    // Hombre Lobo (Casta)
    const isWerewolf = hasHombreLobo(character);
    if (isWerewolf) {
        const wwConfig = getWerewolfSubtypeConfig(character.werewolfParams?.subtype);
        originSpecials += wwConfig.cost;
    }

    // 22. Formas Alternativas
    let forms = 0;
    if (Array.isArray(character.forms)) {
        character.forms.forEach((form: any) => {
            if (form.id === WEREWOLF_TRANSITION_FORM_ID && !isWerewolf) return;
            forms += Number(form.cost) || 0;
        });
    }

    const rawTotal =
        origin +
        characteristics +
        generalSkills +
        specialSkills +
        background +
        magic +
        powers +
        techAndEquipment +
        originSpecials +
        forms;

    return {
        origin,
        characteristics,
        generalSkills,
        specialSkills,
        background,
        magic,
        powers,
        techAndEquipment,
        originSpecials,
        forms,
        total: Math.round(rawTotal * 10) / 10
    };
}

/**
 * Función pura que devuelve el total de Puntos de Creación (PC) de un personaje.
 */
export function calculateTotalCharacterPCs(character: any): number {
    return calculateCharacterPCBreakdown(character).total;
}
