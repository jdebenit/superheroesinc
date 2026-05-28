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

const findPowerByNameOrId = (nameOrId: string) => {
    if (!nameOrId) return undefined;
    const norm = normalizePowerId(nameOrId);
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
    "cadenasdeltartaro": "cadenas_del_tartaro"
};

const findSpellByNameOrId = (nameOrId: string) => {
    if (!nameOrId) return undefined;
    const norm = normalizeSpellId(nameOrId);
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
    }

    // 4. Adapt POWERS
    let adaptedPowers: any[] = [];
    if (webChar.powers?.selected && Array.isArray(webChar.powers.selected)) {
        adaptedPowers = webChar.powers.selected.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.id || p.name);
            return {
                ...p,
                id: knownPower?.id || p.id,
                rank: typeof p.rank === 'number' ? p.rank : parseInt(p.rank, 10) || 1
            };
        });
    } else if (webChar.powers?.items && Array.isArray(webChar.powers.items)) {
        adaptedPowers = webChar.powers.items.map((p: any) => {
            const knownPower = findPowerByNameOrId(p.name || p.id);
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
                selectedOption: p.selectedOption || '',
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
                    adaptedSpells.push({
                        id: spellDef.id,
                        rank: rank,
                        selectedOption: s.selectedOption || ''
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
    const rawTech = webChar.techModules?.items || webChar.techmodules?.items;
    if (rawTech && Array.isArray(rawTech)) {
        adapted.techModules = rawTech.map((tm: any) => ({
            id: tm.id || `tm_${Math.random()}`,
            name: tm.name,
            location: tm.location || '',
            notes: tm.notes,
            pcCost: 0
        }));
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
