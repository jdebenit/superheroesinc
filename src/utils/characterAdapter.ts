import { initialCharacterState } from '../data/wizardConfig';
import { GENERAL_SKILLS } from '../data/generalSkills';
import { hasHombreLobo, syncWerewolfState } from '../data/werewolfOptions';
import { normalizeCharacterPowers } from './calculations/powerCalculations';
import { normalizeCharacterSpells } from './calculations/magicCalculations';
export { validateAndSanitizeCharacter, type CharacterValidationResult } from './characterValidation';

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
        },
        werewolfParams: webChar.werewolfParams || baseState.werewolfParams,
        forms: Array.isArray(webChar.forms)
            ? webChar.forms.map((form: any) => ({
                ...form,
                combatstats: form.combatstats ? normalizeStats(form.combatstats, baseState.combatstats) : undefined,
                otherstats: form.otherstats ? normalizeStats(form.otherstats, baseState.otherstats) : undefined
            }))
            : baseState.forms
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
    adapted.powers = {
        ...baseState.powers,
        ...(webChar.powers || {}),
        selected: normalizeCharacterPowers(webChar.powers)
    };

    // 4b. Adapt SPELLS
    adapted.spells = {
        ...baseState.spells,
        ...(webChar.spells || {}),
        selected: normalizeCharacterSpells(webChar.spells)
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
            id: tm.id || `tm_${Math.random().toString(36).slice(2, 11)}`,
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

    // 10. Sync Hombre Lobo state if the character has Hombre Lobo origin
    if (hasHombreLobo(adapted)) {
        const synced = syncWerewolfState(adapted);
        if (synced) {
            Object.assign(adapted, synced);
        }
    }

    return adapted;
};
