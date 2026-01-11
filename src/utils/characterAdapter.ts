import { initialCharacterState } from '../data/wizardConfig';
import { GENERAL_SKILLS } from '../data/generalSkills';
import { POWERS } from '../data/powers';

/**
 * Adapt a character loaded from the web (JSON) to the structure expected by the Character Wizard/Viewer.
 * Handles differences in Skills structure, Powers, and standardizes missing fields.
 */
export const adaptWebCharacter = (webChar: any): any => {
    // 1. Start with default state to ensure all buckets exist
    // Deep copy initial state to avoid mutation issues
    const baseState = JSON.parse(JSON.stringify(initialCharacterState));

    // 2. Merge basic fields that are compatible or semi-compatible
    // We explicitly extract what we want to valid collisions or bad data types
    const adapted = {
        ...baseState,
        ...webChar,
        // Ensure complex objects are merged, not just replaced if possible, 
        // though typically webChar will have the "truth" for these.
        background: { ...baseState.background, ...webChar.background },
        origin: { ...baseState.origin, ...webChar.origin },
        attributes: {
            ...baseState.attributes,
            values: webChar.attributes?.values || baseState.attributes.values
        }
    };

    // 3. Adapt SKILLS
    // Web characters often have a flat `skills.items` array.
    // Wizard expects `skills.generalItems` and `skills.specialItems`.
    if (webChar.skills?.items && Array.isArray(webChar.skills.items)) {
        const generalItems: any[] = [];
        const specialItems: any[] = [];

        webChar.skills.items.forEach((item: any) => {
            // Check if this is a general skill
            // The check is loose: strictly by name match
            const isGeneral = GENERAL_SKILLS.some(gs => gs.name === item.name);

            // Clean value (remove %)
            let val = item.value;
            // value is usually string "75%". Wizard uses numbers often for calculations, 
            // but for simple display in Preview, string might pass. 
            // However, CharacterSheet often expects numbers for some derivations.
            // Let's keep it as is for "value", but if we were strictly mapping to Wizard State `selected` map, we'd want numbers.
            // For `generalItems` / `specialItems` arrays used in Sheet, they usually just have { name, value, math }.

            // Standardize structure for Preview list
            const skillObj = {
                name: item.name,
                value: item.value, // Keep original string "XX%" for display
                math: item.math
            };

            if (isGeneral) {
                generalItems.push(skillObj);
            } else {
                specialItems.push(skillObj);
            }
        });

        adapted.skills.generalItems = generalItems;
        adapted.skills.specialItems = specialItems;

        // Also pull specialskills if they exist separately in webChar (some files like Lawyer have them)
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
    // Web: `powers.items` (array). Wizard: `powers.selected` (array).
    if (webChar.powers?.items && Array.isArray(webChar.powers.items)) {
        adapted.powers.selected = webChar.powers.items.map((p: any) => {
            // Find valid ID if possible, or generate a fake one to avoid crashes
            // The display component tries to find metadata in POWERS by id.
            // If ID is missing in webChar (likely), try to find by Name.
            const knownPower = POWERS.find(kp => kp.name === p.name);
            const id = p.id || knownPower?.id || `custom_${Math.random().toString(36).substr(2, 9)}`;

            // Parse value
            let skillValue = 0;
            let powerMod = 0;

            if (typeof p.value === 'string') {
                const parsed = parseInt(p.value.replace(/\D/g, ''), 10);
                if (!isNaN(parsed)) {
                    // Heuristic: if known power is characteristic, it's a mod. Else skill value.
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
                rank: p.rank || 1, // Default rank
                skillValue, // For skill-based powers
                powerMod,   // For attrib-based powers
                selectedOption: p.selectedOption || '',
                customizations: p.customizations || [],
                effect: p.notes // Web often uses 'notes'
            };
        });
    }

    // 5. Adapt TECH MODULES
    // Web: `techmodules` (lowercase). Wizard: `techModules`.
    // Handle both cases.
    const rawTech = webChar.techModules?.items || webChar.techmodules?.items;
    if (rawTech && Array.isArray(rawTech)) {
        adapted.techModules = rawTech.map((tm: any) => ({
            id: tm.id || `tm_${Math.random()}`,
            name: tm.name,
            location: tm.location || '',
            notes: tm.notes,
            pcCost: 0 // Web chars don't usually track cost per module in standard field
        }));
    }

    // 6. Adapt WEAPONS & EQUIPMENT (Ensure items array)
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

    return adapted;
};
