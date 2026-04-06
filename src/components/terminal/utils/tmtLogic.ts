import { type TmtCharacterEntry } from '../hooks/tmtTypes';

/**
 * Extracts maxHealth and maxMental from character data.
 * Handles both the legacy array format and the new object format.
 */
export function extractVitals(characterData: any) {
    const combatStats = characterData?.combatstats;
    let maxH = 0;
    let maxM = 0;

    if (Array.isArray(combatStats)) {
        // Old format: ["Label: Value", ...]
        const healthLine = combatStats.find((s: any) => typeof s === 'string' && (s.includes('Puntos de Vida') || s.includes('PV')));
        const mentalLine = combatStats.find((s: any) => typeof s === 'string' && (s.includes('Equilibrio Mental') || s.includes('EQM')));

        maxH = healthLine ? parseInt(healthLine.split(':')[1]?.trim()) : 0;
        maxM = mentalLine ? parseInt(mentalLine.split(':')[1]?.trim()) : 0;
    } else if (typeof combatStats === 'object' && combatStats !== null) {
        // New format: { "Label": "Value", ... }
        maxH = parseInt(combatStats['Puntos de Vida'] || combatStats['PV']) || 0;
        maxM = parseInt(combatStats['Equilibrio Mental'] || combatStats['EQM']) || 0;
    }

    // Fallbacks if not found (basic calculation)
    if (maxH === 0) {
        const con = characterData?.attributes?.values?.Constitución || 0;
        maxH = con > 0 ? (con <= 100 ? Math.floor(con / 2) : con - 45) : 0;
    }
    if (maxM === 0) {
        const int = characterData?.attributes?.values?.Inteligencia || 0;
        maxM = int || 0;
    }

    // Willpower (Voluntad) extraction - Very robust
    let maxV = characterData?.attributes?.values?.Voluntad || characterData?.attributes?.Voluntad || 0;
    
    if (maxV === 0) {
        // Search in combatstats / otherstats if not in attributes or if it was 0 there
        const findInAny = (src: any) => {
            if (!src) return 0;
            if (Array.isArray(src)) {
                const line = src.find((s: any) => typeof s === 'string' && s.toLowerCase().includes('voluntad'));
                return line ? parseInt(line.split(':')[1]?.trim()) : 0;
            }
            if (typeof src === 'object') {
                const key = Object.keys(src).find(k => k.toLowerCase().includes('voluntad'));
                return key ? parseInt(src[key]) : 0;
            }
            return 0;
        };
        maxV = findInAny(characterData?.combatstats) || findInAny(characterData?.otherstats) || 0;
    }

    return { maxH, maxM, maxV };
}



/**
 * Calculates current health/mental after a change, considering max values.
 */
export function calculateStatChange(current: number, max: number, change: number): number {
    return Math.max(0, Math.min(max, current + change));
}
