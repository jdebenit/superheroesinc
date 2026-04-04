import { type TmtCharacterEntry } from '../hooks/useTmtStore';

export const INITIATIVE_MODS = [
    { label: 'Ninguno', value: 0 },
    { label: 'Sorprendido', value: -50 },
    { label: 'Aturdido', value: -30 },
    { label: 'Caído', value: -15 },
    { label: 'Concentrado', value: -20 },
];

/**
 * Get the first two characters of a name as initials.
 */
export function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

/**
 * Get the best display name for a character (alias > name > fallback).
 */
export function charName(entry: TmtCharacterEntry): string {
    return entry.characterData?.alias || entry.characterData?.name || '(Sin nombre)';
}

/**
 * Get a formatted subtitle for a character (Name · Level).
 */
export function charSubtitle(entry: TmtCharacterEntry): string {
    const alias = entry.characterData?.alias;
    const name = entry.characterData?.name;
    const level = entry.characterData?.level ?? entry.characterData?.meta?.level;
    const parts: string[] = [];
    if (alias && name) parts.push(name);
    if (level) parts.push(`Nv. ${level}`);
    return parts.join(' · ');
}

/**
 * Get the current initiative value (stored initiative or base calculation).
 */
export function getIniciativa(entry: TmtCharacterEntry): number {
    const base = typeof entry.initiative === 'number' ? entry.initiative : getBaseIniciativa(entry);
    return base + (entry.initiativeMod || 0);
}

/**
 * Calculate the base initiative from character statistics.
 */
export function getBaseIniciativa(entry: TmtCharacterEntry): number {
    const cd = entry.characterData;
    
    // Support for different combat stats formats
    if (Array.isArray(cd?.combatstats)) {
        const statStr = cd.combatstats.find((s: any) => typeof s === 'string' && s.includes('Iniciativa y Reflejos'));
        if (statStr) {
            const val = parseInt(statStr.split(':')[1]?.trim());
            if (!isNaN(val)) return val;
        }
    } else if (cd?.combatstats && typeof cd.combatstats === 'object') {
        const val = parseInt(cd.combatstats['Iniciativa y Reflejos']);
        if (!isNaN(val)) return val;
    }

    // Calculation fallback: (Agility + Perception) / 4
    const agi = cd?.attributes?.values?.Agilidad || 0;
    const per = cd?.attributes?.values?.Percepción || 0;
    return Math.floor((agi + per) / 4);
}

/**
 * Determine max actions per round based on Agility.
 */
export function getAcciones(entry: TmtCharacterEntry): number {
    const cd = entry.characterData;

    // Support for different combat stats formats
    if (Array.isArray(cd?.combatstats)) {
        const statStr = cd.combatstats.find((s: any) => typeof s === 'string' && s.includes('Acciones por asalto'));
        if (statStr) {
            const val = parseInt(statStr.split(':')[1]?.trim());
            if (!isNaN(val)) return val;
        }
    } else if (cd?.combatstats && typeof cd.combatstats === 'object') {
        const val = parseInt(cd.combatstats['Acciones por asalto']);
        if (!isNaN(val)) return val;
    }

    // Default table fallback
    const agi = cd?.attributes?.values?.Agilidad || 0;
    if (agi <= 75) return 1;
    if (agi <= 90) return 2;
    if (agi <= 130) return 3;
    if (agi <= 175) return 4;
    if (agi <= 199) return 5;
    return 6;
}
