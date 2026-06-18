import { initialCharacterState } from '../data/wizardConfig';
import { GENERAL_SKILLS } from '../data/generalSkills';
import { POWERS } from '../data/powers';
import { SPELLS } from '../data/spells';

const normalizePowerId = (id: string): string => {
    if (!id) return '';
    return id
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

const POWER_ERRATA_MAP: { [key: string]: { id: string, option?: string } } = {
    "control_de_la_energia_cinetica": { id: "control_de_energia", option: "Cinética" },
    "control_de_la_energia_cinética": { id: "control_de_energia", option: "Cinética" },
    "controldeenergiacinetica": { id: "control_de_energia", option: "Cinética" },
    "emision_de_energia_magica": { id: "emision_de_energia", option: "Mágica" },
    "emisión_de_energía_mágica": { id: "emision_de_energia", option: "Mágica" },
    "emisiondeenergiamagica": { id: "emision_de_energia", option: "Mágica" }
};

const findPowerByNameOrId = (nameOrId: string) => {
    if (!nameOrId) return undefined;
    const norm = normalizePowerId(nameOrId);
    if (POWER_ERRATA_MAP[norm]) {
        const correct = POWER_ERRATA_MAP[norm];
        return POWERS.find(kp => kp.id === correct.id);
    }
    return POWERS.find(kp => normalizePowerId(kp.id) === norm || normalizePowerId(kp.name) === norm);
};

const normalizeSpellId = (id: string): string => {
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

const findSpellByNameOrId = (nameOrId: string) => {
    if (!nameOrId) return undefined;
    // Strip options in parentheses, e.g. "Invocar Elemento (clima)" -> "Invocar Elemento"
    const cleanNameOrId = nameOrId.replace(/\([^)]+\)/g, '').trim();
    const norm = normalizeSpellId(cleanNameOrId);
    if (SPELL_ERRATA_MAP[norm]) {
        const correctId = SPELL_ERRATA_MAP[norm];
        return SPELLS.find(s => s.id === correctId);
    }
    const found = SPELLS.find(s => normalizeSpellId(s.id) === norm || normalizeSpellId(s.name) === norm);
    if (found) return found;
    return SPELLS.find(s => {
        const normSpellId = normalizeSpellId(s.id);
        const normSpellName = normalizeSpellId(s.name);
        return normSpellId.includes(norm) || norm.includes(normSpellId) ||
               normSpellName.includes(norm) || norm.includes(normSpellName);
    });
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

/**
 * Adapt a character loaded from the web (JSON) to the structure expected by the Character Wizard/Viewer.
 * Handles differences in Skills structure, Powers, and standardizes missing fields.
 */
export const adaptWebCharacter = (webChar: any): any => {
    // 1. Start with default state to ensure all buckets exist
    // Deep copy initial state to avoid mutation issues
    const baseState = JSON.parse(JSON.stringify(initialCharacterState));

    // 2. Normalize basic identity fields
    // Ensure we have a valid name and alias
    const name = webChar.name || webChar.Alias || webChar.Sujeto || baseState.name;
    const alias = webChar.alias || webChar.Alias || webChar.Sujeto || baseState.alias;

    // 3. Stats Normalization (Object vs Array)
    const normalizeStats = (stats: any, defaultStats: any) => {
        if (!stats) return { ...defaultStats };
        if (Array.isArray(stats)) {
            const normalized: any = { ...defaultStats };
            stats.forEach((item: any) => {
                if (typeof item !== 'string') return;
                const parts = item.split(':');
                if (parts.length > 1) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    if (label && value && value !== '-') {
                        normalized[label] = value;
                    }
                }
            });
            return normalized;
        }
        // If it's already an object, merge with defaults to ensure all keys exist
        return { ...defaultStats, ...stats };
    };

    const combatstats = normalizeStats(webChar.combatstats || webChar.combatStats, baseState.combatstats);
    const otherstats = normalizeStats(webChar.otherstats || webChar.otherStats, baseState.otherstats);

    const adapted = {
        ...baseState,
        ...webChar,
        name,
        alias,
        combatstats,
        otherstats,
        // Ensure complex objects are merged, not just replaced
        meta: { 
            ...baseState.meta, 
            ...webChar.meta,
            version: webChar.meta?.version || webChar.version || baseState.meta.version,
            generator: webChar.meta?.generator || 'SHI Wizard'
        },
        background: { 
            ...baseState.background, 
            ...webChar.background,
            items: Array.isArray(webChar.background?.items) ? webChar.background.items : 
                  (Array.isArray(webChar.background) ? webChar.background : baseState.background.items)
        },
        origin: { ...baseState.origin, ...webChar.origin },
        attributes: {
            ...baseState.attributes,
            ...webChar.attributes,
            values: webChar.attributes?.values || baseState.attributes.values,
            manualBonuses: webChar.attributes?.manualBonuses || baseState.attributes.manualBonuses,
            breakdown: webChar.attributes?.breakdown || baseState.attributes.breakdown
        },
        uiState: {
            ...baseState.uiState,
            ...webChar.uiState
        }
    };

    // 3. Adapt SKILLS
    if (webChar.skills?.items && Array.isArray(webChar.skills.items)) {
        const generalItems: any[] = [];
        const specialItems: any[] = [];

        webChar.skills.items.forEach((item: any) => {
            const isGeneral = GENERAL_SKILLS.some(gs => gs.name === item.name);
            const skillObj = {
                name: item.name,
                value: item.value,
                math: item.math
            };

            if (isGeneral) {
                generalItems.push(skillObj);
            } else {
                specialItems.push(skillObj);
            }
        });

        adapted.skills = {
            ...baseState.skills,
            ...webChar.skills,
            generalItems,
            specialItems
        };

        if (webChar.specialskills?.items) {
            webChar.specialskills.items.forEach((item: any) => {
                adapted.skills.specialItems.push({
                    name: item.name,
                    value: item.value,
                    math: item.math
                });
            });
        }
    } else {
        // IDEMPOTENCY: keep existing generalItems / specialItems / selected / specified
        adapted.skills = {
            ...baseState.skills,
            ...webChar.skills
        };
    }

    // 4. Adapt POWERS
    let adaptedPowers: any[] = [];
    if (webChar.powers?.selected && Array.isArray(webChar.powers.selected)) {
        adaptedPowers = webChar.powers.selected.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.id || p.name);
            const norm = normalizePowerId(p.id || p.name);
            const errata = POWER_ERRATA_MAP[norm];
            return {
                ...p,
                id: knownPower?.id || p.id,
                selectedOption: p.selectedOption || errata?.option || '',
                rank: typeof p.rank === 'number' ? p.rank : parseInt(p.rank, 10) || 1
            };
        });
    } else if (webChar.powers?.items && Array.isArray(webChar.powers.items)) {
        adaptedPowers = webChar.powers.items.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.name || p.id);
            const norm = normalizePowerId(p.name || p.id);
            const errata = POWER_ERRATA_MAP[norm];
            const id = knownPower?.id || p.id || `custom_${Math.random().toString(36).substr(2, 9)}`;

            let skillValue = 0;
            let powerMod = 0;

            if (typeof p.value === 'string') {
                const parsed = parseInt(p.value.replace(/\D/g, ''), 10);
                if (!isNaN(parsed)) {
                    if (knownPower?.characteristic) {
                        powerMod = parsed;
                    } else {
                        skillValue = parsed;
                    }
                }
            } else if (typeof p.value === 'number') {
                if (knownPower?.characteristic) {
                    powerMod = p.value;
                } else {
                    skillValue = p.value;
                }
            }

            return {
                id,
                name: p.name,
                rank: p.rank || 1,
                skillValue,
                powerMod,
                selectedOption: p.selectedOption || errata?.option || '',
                customizations: p.customizations || [],
                effect: p.notes
            };
        });
    }

    adapted.powers = {
        ...baseState.powers,
        ...(webChar.powers || {}),
        selected: adaptedPowers
    };

    // 4b. Adapt SPELLS
    let adaptedSpells: any[] = [];
    if (webChar.spells) {
        const rawSpells = webChar.spells.selected || webChar.spells.items;
        if (Array.isArray(rawSpells)) {
            rawSpells.forEach((s: any) => {
                const nameOrId = s.id || s.name;
                const spellDef = findSpellByNameOrId(nameOrId);
                if (spellDef) {
                    const rank = parseSpellRank(s.rank, spellDef.maxRank);
                    
                    let selectedOption = s.selectedOption || '';
                    if (!selectedOption && nameOrId) {
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

                    adaptedSpells.push({
                        id: spellDef.id,
                        rank: rank,
                        selectedOption: selectedOption
                    });
                }
            });
        }
    }

    adapted.spells = {
        ...baseState.spells,
        ...(webChar.spells || {}),
        selected: adaptedSpells
    };

    // 5. Adapt TECH MODULES
    let rawTech: any[] = [];
    if (Array.isArray(webChar.techModules)) {
        rawTech = webChar.techModules;
    } else if (webChar.techModules?.installed && Array.isArray(webChar.techModules.installed)) {
        rawTech = webChar.techModules.installed;
    } else if (webChar.techModules?.items && Array.isArray(webChar.techModules.items)) {
        rawTech = webChar.techModules.items;
    } else if (webChar.techmodules?.items && Array.isArray(webChar.techmodules.items)) {
        rawTech = webChar.techmodules.items;
    }

    if (rawTech && rawTech.length > 0) {
        adapted.techModules = rawTech.map((tm: any) => ({
            id: tm.id || `tm_${Math.random().toString(36).substr(2, 9)}`,
            definitionId: tm.definitionId || tm.id || '',
            name: tm.name,
            location: tm.location || '',
            notes: tm.notes || '',
            pcCost: typeof tm.pcCost === 'number' ? tm.pcCost : (typeof tm.cost === 'number' ? tm.cost : 0)
        }));
    } else {
        adapted.techModules = [];
    }

    // 6. Adapt WEAPONS & EQUIPMENT
    if (webChar.weapons && Array.isArray(webChar.weapons.items)) {
        adapted.weapons.items = webChar.weapons.items;
    }
    if (webChar.equipment && Array.isArray(webChar.equipment.items)) {
        adapted.equipment.items = webChar.equipment.items;
    }

    // 7. Adapt ARTIFACTS
    if (webChar.artifacts && Array.isArray(webChar.artifacts.items)) {
        adapted.artifacts.items = webChar.artifacts.items;
    }

    // 8. Adapt VEHICLES
    if (webChar.vehicles && Array.isArray(webChar.vehicles.items)) {
        adapted.vehicles.items = webChar.vehicles.items;
    }

    // 9. Adapt VARIOS & MISC
    if (webChar.varios && Array.isArray(webChar.varios.items)) {
        adapted.varios.items = webChar.varios.items;
    }
    
    if (webChar.profession) adapted.profession = webChar.profession;
    if (webChar.sexualIdentity) adapted.sexualIdentity = webChar.sexualIdentity;
    if (typeof webChar.notes === 'string') adapted.notes = webChar.notes;
    if (Array.isArray(webChar.notes)) adapted.notes = webChar.notes.join('\n');

    return adapted;
};
