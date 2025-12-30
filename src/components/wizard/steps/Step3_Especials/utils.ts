import { POWERS, type PowerType } from '../../../../data/powers';
import type { SelectedPower } from './types';

/**
 * Check if character has a specific origin
 */
export const hasOrigin = (data: any, originName: string): boolean => {
    return data.origin?.items?.some((item: any) => Object.keys(item)[0] === originName);
};

/**
 * Check if character has a specific subtype within an origin
 */
export const hasSubtype = (data: any, originName: string, subtypeName: string): boolean => {
    return data.origin?.items?.some((item: any) => {
        const key = Object.keys(item)[0];
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
};

/**
 * Get the value of a characteristic from character data
 */
export const getCharacteristicValue = (data: any, charName: string): number => {
    return data.attributes?.values?.[charName] || 0;
};

/**
 * Calculate Magical Energy (EM) based on characteristics and formula
 */
export const calculateEM = (data: any, selectedPowers: any[] = [], divisor: number = 1): number => {
    let int = Number(getCharacteristicValue(data, 'Inteligencia')) || 0;
    let per = Number(getCharacteristicValue(data, 'Percepción')) || 0;
    let vol = Number(getCharacteristicValue(data, 'Voluntad')) || 0;
    let con = Number(getCharacteristicValue(data, 'Constitución')) || 0;

    // Apply power modifiers
    if (selectedPowers) {
        selectedPowers.forEach(p => {
            const powerData = POWERS.find(power => power.id === p.id);
            if (powerData?.characteristic && p.powerMod) {
                switch (powerData.characteristic) {
                    case 'INT': int += p.powerMod; break;
                    case 'PER': per += p.powerMod; break;
                    case 'VOL': vol += p.powerMod; break;
                    case 'CON': con += p.powerMod; break;
                }
            }
        });
    }

    // If Semidemonio, add CON to the formula
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const conVal = isSemidemonio ? con : 0;

    return Math.floor((int + per + vol + conVal) / divisor);
};

/**
 * Calculate skill base value from a formula string
 */
export const calculateSkillBase = (data: any, formula: string): number => {
    if (!formula) return 0;

    // Map abbreviations to full names
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        return getCharacteristicValue(data, map[abbr] || '');
    };

    try {
        // Replace abbreviations with values
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        // Safe evaluation of simple math formula
        return Math.floor(new Function('return ' + evalFormula)());
    } catch (e) {
        return 0;
    }
};

/**
 * Get the rank level name based on rank value
 */
export const getRankLevel = (rank: number): string => {
    if (rank <= 20) return 'Bajo';
    if (rank <= 40) return 'Medio';
    if (rank <= 70) return 'Elevado';
    if (rank <= 95) return 'Alto';
    return 'Cósmico';
};

/**
 * Get allowed power types for Mutant based on their subtype
 * Also handles Ente origin (Sobrenatural subtype) which gets Psychic and Energetic powers
 */
export const getMutantPowerTypes = (data: any): PowerType[] => {
    // Check for Mutant origin
    const mutantOrigin = data.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Mutante'
    );

    if (mutantOrigin) {
        const subtypes = mutantOrigin['Mutante'];
        if (Array.isArray(subtypes) && subtypes.length > 0) {
            const subtype = subtypes[0]; // El primer subtipo seleccionado

            // Mapear subtipo a tipos de poderes
            if (subtype === 'Psíquico') return ['Psíquico'];
            if (subtype === 'Energético') return ['Energético'];
            if (subtype === 'Físico') return ['Físico'];
            if (subtype === 'Psíquico/Energético') return ['Psíquico', 'Energético'];
            if (subtype === 'Energético/Físico') return ['Energético', 'Físico'];
            if (subtype === 'Psíquico/Físico') return ['Psíquico', 'Físico'];
        }
    }

    // Check for Ente origin (Sobrenatural subtype)
    const sobrenaturalOrigin = data.origin?.items?.find((item: any) =>
        Object.keys(item)[0] === 'Sobrenatural'
    );

    if (sobrenaturalOrigin) {
        const subtypes = sobrenaturalOrigin['Sobrenatural'];
        if (Array.isArray(subtypes) && subtypes.includes('Ente')) {
            return ['Psíquico', 'Energético'];
        }
    }

    return [];
};

/**
 * Get vigilante specialties from character data
 */
export const getVigilanteSpecialties = (data: any): string[] => {
    const vigItem = data.origin?.items?.find((item: any) => Object.keys(item)[0] === 'Vigilante');
    if (!vigItem) return [];
    return vigItem['Vigilante'] || [];
};
