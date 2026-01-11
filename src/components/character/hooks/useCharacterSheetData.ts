import { SPELLS } from '../../../data/spells';
import { POWERS } from '../../../data/powers';
import { calculateEM } from '../../wizard/steps/Step3_Especials/utils';
import { calculateDerivedStats, calculateSkillBase } from '../../../utils/characterCalculations';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from '../../../utils/calculations/skillCalculations';

const calculatePowerSkillBase = (char: any, formula: string): number => {
    if (!formula) return 0;
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        const fullKey = map[abbr];
        return char.attributes?.values?.[fullKey] || 0;
    };
    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)()) || 0;
    } catch (e) {
        return 0;
    }
};

export const useCharacterSheetData = (character: any) => {
    // CALCULATE STATS LIVE to ensure they are up to date and match PDF export
    const derivedStats = calculateDerivedStats(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills || {}
    );

    const generalSkillsData = calculateGeneralSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.generalManualMods || {},
        character.skills?.manualBases || {}
    );

    const specialSkillsData = calculateSpecialSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.learning?.selected || {},
        character.skills?.learning?.specified || {}
    );

    // Format stats for display (Live values)
    const combatStats = [
        `Acciones por asalto: ${derivedStats.combat.acciones}`,
        `Iniciativa y Reflejos: ${derivedStats.combat.iniciativa}`,
        `Puntos de Vida: ${derivedStats.combat.pv}`,
        `Equilibrio Mental: ${derivedStats.combat.equilibrio}`
    ];

    // Calculate EM for display
    const emFormula = character.spells?.emFormula || { divisor: 4, pcCost: 0 };
    // Check if character has magic access (Divisor > 0)
    if (emFormula.divisor > 0 || (character.origin?.items?.some((i: any) => i.Mago) /* Mago always has magic */)) {
        const isMago = character.origin?.items?.some((i: any) => i.Mago);
        const divisor = isMago ? 1 : emFormula.divisor;
        if (divisor > 0) {
            // Need selectedPowers for calculateEM
            const selectedPowers = character.powers?.selected || [];
            const em = calculateEM(character, selectedPowers, divisor);
            combatStats.push(`Energía Mágica: ${em}`);
        }
    }

    const otherStats = [
        `Inconsciencia: ${derivedStats.other.inconsciencia}`,
        `Recuperación: ${derivedStats.other.recuperacion}`,
        `Resistencia a gases y venenos: ${derivedStats.other.resistenciaGases}`,
        `Modificador de fuerza: ${derivedStats.other.modFuerza}`,
        `Peso Levantado: ${derivedStats.other.pesoLevantado}`,
        `Daño absorbido físico: ${derivedStats.other.daAbsorbidoFisico}`,
        `Daño absorbido mental: ${derivedStats.other.daAbsorbidoMental}`,
        `Modificador de impacto: ${derivedStats.other.modImpacto}`,
        `Modificador Psionico: ${derivedStats.other.modPsionico}`,
        `Parada Fisica: ${derivedStats.other.paradaFisica}`,
        `Parada mental: ${derivedStats.other.paradaMental}`,
        `Salto (alto / largo): ${derivedStats.other.salto}`
    ];

    // --- PRE-CALCULATE LISTS FOR PDF (Powers, Spells, etc.) ---

    // Powers
    const powersData = (character.powers?.selected || []).map((p: any) => {
        const powerData = POWERS.find(data => data.id === p.id);
        const baseName = powerData ? powerData.name : (p.name || '');
        const displayName = p.selectedOption ? `${baseName} (${p.selectedOption})` : baseName;

        // Cost calculation logic (Moved from pdfExport)
        const isHybridPenalty = character.isParahumanoHybrid && p.origin === 'Alterado';

        const isSemidemonio = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Sobrenatural' && Array.isArray(val) && val.includes('Semidemonio');
            })
        );
        const isSemidemonioBonus = isSemidemonio && p.origin === 'Sobrenatural';

        let costVal = 0;

        if (powerData) {
            let baseCost = powerData.cost || 0;

            // Semidemonio Bonus: -1 PC for Sobrenatural powers (Base cost discount)
            if (isSemidemonioBonus && !powerData.characteristic) {
                baseCost = Math.max(0, baseCost - 1);
            }

            const penalty = isHybridPenalty ? 3 : 0;

            if (!powerData.characteristic) {
                // Skill type
                const rank = p.rank || 1;
                const minVal = powerData.skillCalc ? calculateSkillBase(character.attributes?.values || {}, character.origin?.items || [], powerData.skillCalc) : 0;

                const currentVal = p.skillValue !== undefined ? p.skillValue : minVal;
                // Simplified extra cost logic from pdfExport
                const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal = baseCost + penalty + (rank * 0.1) + extraCost + custCost;
            } else {
                // Attribute type
                const powerMod = p.powerMod || 0;
                let modCost = powerMod / 10;

                if (isSemidemonioBonus) {
                    // Semidemonio Bonus for characteristic powers: 10 points free (1 PC discount equivalent)
                    modCost = Math.max(0, (powerMod - 10) / 10);
                }

                costVal = baseCost + penalty + modCost;
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal += custCost;
            }
        } else {
            costVal = p.cost || 0;
        }

        // Add customization descriptions to name/notes
        let customNotes = "";
        if (p.customizations && p.customizations.length > 0) {
            const custTexts = p.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`);
            customNotes = custTexts.join(', ');
        }

        const finalDisplayName = customNotes ? `${displayName} [${customNotes}]` : displayName;

        return {
            name: finalDisplayName,
            cost: costVal.toFixed(1),
            val: (p.skillValue !== undefined ? p.skillValue : (p.powerMod || '')).toString(),
            rank: (p.rank || '').toString(),
            notes: (p.effect || '')
        };
    });

    // Spells
    const spellsData = (character.spells?.selected || []).map((s: any) => {
        const spellDef = SPELLS.find(def => def.id === s.id);
        const maxRank = spellDef?.maxRank || 5;
        const isMaestria = s.rank === maxRank + 2;
        const baseCost = spellDef ? (parseInt(spellDef.cost, 10) || 0) : 0;
        const effectiveRank = s.rank || 1;

        const baseName = spellDef?.name || s.name || '';
        const displayName = s.selectedOption ? `${baseName} (${s.selectedOption})` : baseName;

        return {
            name: displayName,
            rank: isMaestria ? 'Maestría' : (s.rank || '').toString(),
            cost: (baseCost * effectiveRank).toString(),
            notes: spellDef?.requirements || s.effect || s.description || ''
        };
    });

    // Tech Modules
    const techData = (character.techModules?.installed || []).map((m: any) => ({
        name: m.name || m.definitionId || '',
        location: m.location || '',
        notes: m.notes || ''
    }));

    // Weapons
    const weaponsData = (character.weapons?.items || []).map((w: any) => ({
        name: w.name || '',
        damage: w.damage || '',
        dxa: w.dxa || '',
        car: w.car || '',
        notes: w.notes || w.special || ''
    }));

    // Artifacts
    const artifactsData = (character.artifacts?.items || []).map((a: any) => ({
        name: a.name || '',
        reliability: a.reliability || '',
        value: a.value || '',
        cost: a.cost || '',
        notes: a.notes || ''
    }));

    // Vehicles
    const vehiclesData = (character.vehicles?.items || []).map((v: any) => ({
        name: v.name || '',
        armor: v.armor || '',
        pe: v.pe || '',
        speed: v.speed || '',
        range: v.range || ''
    }));

    // Equipment
    const equipmentData = (character.equipment?.items || []).map((e: any) => ({
        name: e.name || '',
        notes: e.notes || ''
    }));

    return {
        derivedStats,
        generalSkillsData,
        specialSkillsData,
        combatStats,
        otherStats,
        powersData,
        spellsData,
        techData,
        weaponsData,
        artifactsData,
        vehiclesData,
        equipmentData
    };
};
