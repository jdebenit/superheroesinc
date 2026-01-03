/**
 * JSON Diagnostic and Repair Utility for Character Data
 * 
 * This utility helps diagnose and fix common issues with character JSON files,
 * specifically focusing on skills data structure problems.
 */

export function diagnoseCharacterJSON(character: any): {
    issues: string[];
    warnings: string[];
    suggestions: string[];
} {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check skills structure
    if (!character.skills) {
        issues.push("Missing 'skills' object");
        return { issues, warnings, suggestions };
    }

    const skills = character.skills;

    // Check for empty arrays
    if (skills.generalItems && Array.isArray(skills.generalItems) && skills.generalItems.length === 0) {
        warnings.push("generalItems is an empty array");
    }

    if (skills.specialItems && Array.isArray(skills.specialItems) && skills.specialItems.length === 0) {
        warnings.push("specialItems is an empty array");
    }

    if (skills.items && Array.isArray(skills.items) && skills.items.length === 0) {
        warnings.push("items (combined) is an empty array");
    }

    // Check for mixing of general and special skills
    if (skills.generalItems && Array.isArray(skills.generalItems)) {
        skills.generalItems.forEach((item: any, index: number) => {
            if (!item.name || !item.value) {
                issues.push(`generalItems[${index}] is missing 'name' or 'value' property`);
            }
            // Check if it looks like a special skill (shouldn't be in generalItems)
            if (item.name && (
                item.name.includes(':') ||
                item.name.includes('Arcos') ||
                item.name.includes('Armas')
            )) {
                warnings.push(`generalItems[${index}] "${item.name}" might be a special skill`);
            }
        });
    }

    // Check selected and specified objects
    if (!skills.selected || typeof skills.selected !== 'object') {
        warnings.push("'selected' should be an object, not an array");
        suggestions.push("Convert 'selected' from array to object format");
    }

    if (!skills.specified || typeof skills.specified !== 'object') {
        warnings.push("'specified' should be an object, not an array");
        suggestions.push("Convert 'specified' from array to object format");
    }

    // Check for required properties
    if (!skills.generalManualMods) {
        suggestions.push("Add 'generalManualMods' object (can be empty {})");
    }

    if (!skills.manualBases) {
        suggestions.push("Add 'manualBases' object (can be empty {})");
    }

    return { issues, warnings, suggestions };
}

export function repairCharacterJSON(character: any): any {
    const repaired = JSON.parse(JSON.stringify(character)); // Deep clone

    if (!repaired.skills) {
        repaired.skills = {
            generalManualMods: {},
            manualBases: {},
            nativeLanguage: '',
            selected: {},
            specified: {},
            generalItems: [],
            specialItems: [],
            items: []
        };
        return repaired;
    }

    const skills = repaired.skills;

    // Ensure all required properties exist
    if (!skills.generalManualMods) skills.generalManualMods = {};
    if (!skills.manualBases) skills.manualBases = {};
    if (!skills.nativeLanguage) skills.nativeLanguage = '';
    if (!skills.selected) skills.selected = {};
    if (!skills.specified) skills.specified = {};

    // Convert arrays to objects if needed
    if (Array.isArray(skills.selected)) {
        console.warn('Converting selected from array to object');
        skills.selected = {};
    }

    if (Array.isArray(skills.specified)) {
        console.warn('Converting specified from array to object');
        skills.specified = {};
    }

    // Ensure items arrays exist
    if (!Array.isArray(skills.generalItems)) skills.generalItems = [];
    if (!Array.isArray(skills.specialItems)) skills.specialItems = [];
    if (!Array.isArray(skills.items)) skills.items = [];

    // Remove duplicates from items arrays
    skills.generalItems = Array.from(new Set(skills.generalItems.map((item: any) => JSON.stringify(item))))
        .map((str: string) => JSON.parse(str));

    skills.specialItems = Array.from(new Set(skills.specialItems.map((item: any) => JSON.stringify(item))))
        .map((str: string) => JSON.parse(str));

    // Rebuild combined items array
    skills.items = [...skills.generalItems, ...skills.specialItems];

    return repaired;
}

/**
 * Console helper to diagnose and repair a character JSON
 * Usage in browser console:
 * 
 * 1. Copy your character JSON
 * 2. Run: const char = <paste JSON here>
 * 3. Run: diagnoseCharacterJSON(char)
 * 4. Run: const fixed = repairCharacterJSON(char)
 * 5. Run: console.log(JSON.stringify(fixed, null, 2))
 */
if (typeof window !== 'undefined') {
    (window as any).diagnoseCharacterJSON = diagnoseCharacterJSON;
    (window as any).repairCharacterJSON = repairCharacterJSON;
    console.log('✅ JSON diagnostic tools loaded. Use diagnoseCharacterJSON(char) and repairCharacterJSON(char)');
}
