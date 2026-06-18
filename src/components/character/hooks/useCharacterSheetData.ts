import { SPELLS } from '../../../data/spells';
import { POWERS } from '../../../data/powers';
import { calculateEM } from '../../wizard/steps/Step3_Especials/utils';
import { calculateDerivedStats, calculateSkillBase, formatDerivedStats, applyStatsOverrides } from '../../../utils/characterCalculations';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from '../../../utils/calculations/skillCalculations';

const normalizeId = (id: string): string => {
    if (!id) return '';
    return id
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

const SPELL_ERRATA_MAP: { [key: string]: string } = {
    "pesudopsi": "pseudo_psi",
    "proyecciconastral": "proyeccion_del_cuerpo_astral",
    "proyeccionastral": "proyeccion_del_cuerpo_astral",
    "percercionmagica": "percepcion_magica",
    "proyeccionenergiamagica": "proyeccion_de_energia_magica",
    "proyecciondeenergiamagicadefensa": "proyeccion_de_energia_magica",
    "cadenasdeltartaro": "cadenas_del_tartaro",
    "escantarobjetos": "encantar_objetos"
};

const parseSpellRank = (rankVal: any, maxRank: number = 5): number => {
    if (rankVal === undefined || rankVal === null) return 1;
    if (typeof rankVal === 'number') return rankVal;
    const str = String(rankVal).toLowerCase().trim();
    if (str === 'maestria') return maxRank;
    const digits = str.replace(/\D/g, '');
    if (digits) {
        const parsed = parseInt(digits, 10);
        if (!isNaN(parsed)) return parsed;
    }
    return 1;
};

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

    // Format stats for display
    // Always use live calculated stats to prevent stale data
    const { 
        combatStats: calculatedCombatStats, 
        otherStats: calculatedOtherStats 
    } = formatDerivedStats(derivedStats);

    // Apply overrides using the centralized utility
    const finalCombatStats = applyStatsOverrides(calculatedCombatStats, character.combatstats);
    const finalOtherStats = applyStatsOverrides(calculatedOtherStats, character.otherstats);

    // Normalize to array of objects for display components
    const combatStats = Object.entries(finalCombatStats).map(([label, value]) => ({ label, value }));
    const otherStats = Object.entries(finalOtherStats).map(([label, value]) => ({ label, value }));

    // --- PRE-CALCULATE LISTS FOR PDF (Powers, Spells, etc.) ---

    // Powers
    const powersData = (character.powers?.selected || []).map((p: any) => {
        const powerData = POWERS.find(data => normalizeId(data.id) === normalizeId(p.id) || normalizeId(data.name) === normalizeId(p.name || p.id));
        const baseName = powerData ? powerData.name : (p.name || '');
        const displayName = p.selectedOption ? `${baseName} (${p.selectedOption})` : baseName;

        // Customization text
        let customNotes = "";
        if (p.customizations && p.customizations.length > 0) {
            const custTexts = p.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`);
            customNotes = custTexts.join(', ');
        }
        const finalDisplayName = customNotes ? `${displayName} [${customNotes}]` : displayName;

        // If JSON has explicit displayed value/cost, use those directly/trivially
        // Note: The 'value' in JSON for powers is often the calculated % or static value
        if (p.val || p.value) {
            return {
                name: finalDisplayName,
                cost: (p.cost !== undefined ? p.cost : (powerData?.cost || 0)).toString(),
                val: (p.value || p.val).toString(),
                rank: (p.rank || '').toString(),
                notes: (p.effect || '')
            };
        }

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

        return {
            name: finalDisplayName,
            cost: costVal.toFixed(1),
            val: (p.skillValue !== undefined ? p.skillValue : (p.powerMod || '')).toString(),
            rank: (p.rank || '').toString(),
            notes: (p.effect || '')
        };
    });

    // Spells fallback/mapping logic
    let rawSpells = character.spells?.selected;
    if ((!rawSpells || rawSpells.length === 0) && character.spells?.items && Array.isArray(character.spells.items)) {
        rawSpells = [];
        character.spells.items.forEach((s: any) => {
            const nameOrId = s.id || s.name;
            if (!nameOrId) return;
            const cleanNameOrId = nameOrId.replace(/\([^)]+\)/g, '').trim();
            const norm = normalizeId(cleanNameOrId);
            let correctId = norm;
            if (SPELL_ERRATA_MAP[norm]) {
                correctId = normalizeId(SPELL_ERRATA_MAP[norm]);
            }
            const spellDef = SPELLS.find(def => normalizeId(def.id) === correctId || normalizeId(def.name) === norm);
            if (spellDef) {
                const rank = parseSpellRank(s.rank, spellDef.maxRank);
                
                let selectedOption = s.selectedOption || '';
                if (!selectedOption) {
                    const optionMatch = nameOrId.match(/\(([^)]+)\)/);
                    if (optionMatch) {
                        const rawOpt = optionMatch[1].trim().toLowerCase();
                        const matchedOpt = spellDef.options?.find(o => o.toLowerCase() === rawOpt);
                        if (matchedOpt) {
                            selectedOption = matchedOpt;
                        } else {
                            selectedOption = optionMatch[1].trim();
                        }
                    }
                }

                rawSpells.push({
                    id: spellDef.id,
                    rank: rank,
                    selectedOption: selectedOption
                });
            }
        });
    }

    // Spells
    const spellsData = (rawSpells || []).map((s: any) => {
        const spellDef = SPELLS.find(def => normalizeId(def.id) === normalizeId(s.id) || normalizeId(def.name) === normalizeId(s.name || s.id));
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
    const techData = (character.techModules || []).map((m: any) => ({
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
