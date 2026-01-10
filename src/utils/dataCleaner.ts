/**
 * Utility to calculate the difference between an object and a default template,
 * effectively removing all "default" values (null, undefined, empty strings, or matching values).
 * 
 * Also provides a merge function to restore the full object from a sparse/clean version.
 */

// Basic primitive check
const isPrimitive = (val: any) => {
    return val === null || (typeof val !== 'object' && typeof val !== 'function');
};

const isEmpty = (val: any) => {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === 'object' && Object.keys(val).length === 0) return true;
    return false;
};

/**
 * Returns a new object containing only properties from `current` that differ from `defaultObj`.
 * Properties missing in `current` compared to `defaultObj` are ignored (treated as default).
 */
export const calculateDiff = (current: any, defaultObj: any): any => {
    // If current is null/undefined/empty string, it's effectively "empty/default" 
    // BUT we need to be careful: if defaultObj has a value and current is explicitly null, 
    // do we want to save that?
    // Requirement is "cleanest possible", so we assume if it's falsy/empty, it shouldn't be saved 
    // IF the default is also falsy/empty.

    // Case 0: Primitives
    if (isPrimitive(current) || isPrimitive(defaultObj)) {
        // If strict equality, return undefined (no diff)
        if (current === defaultObj) return undefined;

        // If current is "empty" (null/undefined/'') and default is also "emptyish" (null/undefined/''), return undefined.
        // Example: current="" default=null -> undefined (don't save)
        if (isEmpty(current) && isEmpty(defaultObj)) return undefined;

        // If explicitly different, return current
        return current;
    }

    // Case 1: Arrays
    if (Array.isArray(current)) {
        // For arrays, if it's completely equal to default, return undefined.
        // If length 0 and default length 0, undefined.
        // Complex array diffing (e.g. only saving changed items) is hard because of indexing.
        // Strategy: If strictly deep equal, ignroe. If any diff, save WHOLE array.
        // This is safer for lists where order matters.
        if (Array.isArray(defaultObj) && JSON.stringify(current) === JSON.stringify(defaultObj)) return undefined;
        if (current.length === 0 && (!defaultObj || defaultObj.length === 0)) return undefined;

        return current;
    }

    // Case 2: Objects
    const diff: any = {};
    let hasDiff = false;

    // Iterate over keys in CURRENT. We only care about what exists in current.
    // If a key exists in default but not in current, we assume it's currently "unset" or "deleted".
    // But for a wizard state, usually keys don't simply vanish unless intended.
    // However, we want to save only what IS there.
    for (const key of Object.keys(current)) {
        const currentVal = current[key];
        const defaultVal = defaultObj ? defaultObj[key] : undefined;

        // Recursively calc diff
        const result = calculateDiff(currentVal, defaultVal);

        // If result is not undefined, it means there is a meaningful difference or value to save.
        if (result !== undefined) {
            diff[key] = result;
            hasDiff = true;
        }
    }

    // Special case: if defaultObj has keys that current doesn't?
    // In our Wizard usage, "current" usually starts as a copy of "default".
    // So current is usually a superset or equal set of keys.

    return hasDiff ? diff : undefined;
};

/**
 * Deep merges a sparse object (saved data) into a full default object.
 * This ensures all missing keys in the saved data are filled with defaults.
 */
export const mergeWithDefaults = (sparse: any, defaultObj: any): any => {
    // If sparse is null/undefined, return default clone
    if (sparse === null || sparse === undefined) return structuredClone(defaultObj);

    // If default is primitive, sparse overwrites it (if sparse exists)
    if (isPrimitive(defaultObj)) {
        return sparse;
    }

    // If arrays, sparse overwrites default completely (as per our diff strategy)
    if (Array.isArray(defaultObj)) {
        return Array.isArray(sparse) ? sparse : defaultObj;
    }

    // If object, merge deeply
    if (typeof defaultObj === 'object') {
        // Clone default to start
        const merged = structuredClone(defaultObj);

        // Iterate sparse keys and merge them in
        for (const key of Object.keys(sparse)) {
            // If default has this key, recurse
            if (key in merged) {
                merged[key] = mergeWithDefaults(sparse[key], merged[key]);
            } else {
                // If default DOESNT have this key (e.g. data from new version, or custom field), keep it!
                merged[key] = sparse[key];
            }
        }
        return merged;
    }

    return sparse;
};

// Polyfill for structuredClone if needed (Node < 17), though browser usually has it.
// React app targeting browser so structuredClone is fine.
// Fallback just in case:
const structuredClone = (obj: any) => {
    if (typeof window !== 'undefined' && window.structuredClone) return window.structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
}
