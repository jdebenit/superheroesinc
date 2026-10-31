import { adaptWebCharacter } from './characterAdapter';
import type { CharacterData } from '../types/character';
import { initialCharacterState } from '../data/wizardConfig';

export interface CharacterValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    character?: CharacterData;
}

/**
 * Valida y sanea de forma estructural un objeto JSON antes de cargarlo en el Wizard o Visor de Fichas.
 * Detecta si el archivo contiene una ficha válida de Superhéroes INC, normaliza datos corruptos
 * o desactualizados y devuelve mensajes amigables de error o advertencia.
 */
export function validateAndSanitizeCharacter(
    rawInput: unknown,
    fallbackName?: string
): CharacterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Verificación básica de objeto raíz
    if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
        return {
            isValid: false,
            errors: ['El archivo no es un objeto JSON válido.'],
            warnings
        };
    }

    const raw = rawInput as Record<string, any>;

    // 2. Detección de marcadores mínimos de Superhéroes INC
    const hasAttributes = Boolean(
        raw.attributes ||
        raw.caracteristicas ||
        raw.characteristics ||
        raw.Fuerza !== undefined ||
        raw['Fuerza'] !== undefined
    );
    const hasOrigins = Boolean(raw.origin || raw.origins || raw.origen || raw.origenes);
    const hasCombat = Boolean(raw.combatstats || raw.combatStats || raw.combate);
    const hasSkills = Boolean(raw.skills || raw.habilidades || raw.specialskills);
    const hasPowersOrSpells = Boolean(raw.powers || raw.poderes || raw.spells || raw.hechizos);
    const hasMeta = Boolean(raw.meta?.generator || raw.meta?.version);

    const matchCount = [hasAttributes, hasOrigins, hasCombat, hasSkills, hasPowersOrSpells, hasMeta]
        .filter(Boolean).length;

    if (matchCount === 0) {
        return {
            isValid: false,
            errors: ['El archivo JSON no contiene la estructura de un personaje de Superhéroes INC.'],
            warnings
        };
    }

    if (matchCount < 2 && !hasAttributes) {
        return {
            isValid: false,
            errors: ['El archivo carece de las secciones esenciales del personaje (características u orígenes).'],
            warnings
        };
    }

    // 3. Saneamiento de Identidad (Nombre / Alias)
    let name = raw.name || raw.Alias || raw.Sujeto || raw.alias;
    if (!name || typeof name !== 'string' || name.trim() === '') {
        name = fallbackName ? fallbackName.replace(/\.json$/i, '') : 'Personaje Sin Nombre';
        warnings.push(`No se especificó nombre en la ficha; asignado "${name}".`);
    }

    // 4. Saneamiento de Características (Attributes)
    const sanitizedAttributes: Record<string, any> = {
        values: {},
        manualBonuses: {},
        breakdown: {}
    };

    const rawAttrs = raw.attributes?.values || raw.attributes || {};
    const defaultValues = initialCharacterState.attributes.values;
    const defaultBreakdown = initialCharacterState.attributes.breakdown;

    Object.keys(defaultValues).forEach((statName) => {
        const rawVal = rawAttrs[statName] ?? rawAttrs[statName.toLowerCase()];
        const defaultVal = defaultValues[statName as keyof typeof defaultValues] || 40;
        let numVal = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal), 10);
        if (rawVal !== undefined && (isNaN(numVal) || numVal < 1)) {
            warnings.push(`Valor inválido en característica "${statName}" (${rawVal}). Restablecido a ${defaultVal}.`);
            numVal = defaultVal;
        } else if (rawVal === undefined || isNaN(numVal)) {
            numVal = defaultVal;
        }
        sanitizedAttributes.values[statName] = numVal;
    });

    // Asegurar breakdown válido
    const rawBreakdown = raw.attributes?.breakdown || {};
    Object.keys(defaultBreakdown).forEach((statKey) => {
        const b = rawBreakdown[statKey] || {};
        sanitizedAttributes.breakdown[statKey] = {
            base: typeof b.base === 'number' && !isNaN(b.base) ? b.base : sanitizedAttributes.values[statKey] || 40,
            originMod: typeof b.originMod === 'number' && !isNaN(b.originMod) ? b.originMod : 0,
            specialtyMod: typeof b.specialtyMod === 'number' && !isNaN(b.specialtyMod) ? b.specialtyMod : 0,
            powerMod: typeof b.powerMod === 'number' && !isNaN(b.powerMod) ? b.powerMod : 0
        };
    });

    // 5. Saneamiento de Orígenes
    let sanitizedOrigin = raw.origin;
    if (!sanitizedOrigin || typeof sanitizedOrigin !== 'object') {
        if (Array.isArray(raw.origins)) {
            sanitizedOrigin = { items: raw.origins };
        } else {
            sanitizedOrigin = { items: [] };
            warnings.push('Estructura de orígenes ausente; inicializada vacía.');
        }
    } else if (!Array.isArray(sanitizedOrigin.items)) {
        sanitizedOrigin = { items: [] };
        warnings.push('Lista de orígenes corrupta; restablecida a vacía.');
    }

    // 6. Saneamiento de Poderes y Hechizos
    let sanitizedPowers = raw.powers;
    if (!sanitizedPowers || typeof sanitizedPowers !== 'object') {
        sanitizedPowers = { selected: [] };
    }

    let sanitizedSpells = raw.spells;
    if (!sanitizedSpells || typeof sanitizedSpells !== 'object') {
        sanitizedSpells = { selected: [] };
    }

    // 7. Pasar por el adaptador canónico
    const preparedInput = {
        ...raw,
        name,
        attributes: sanitizedAttributes,
        origin: sanitizedOrigin,
        powers: sanitizedPowers,
        spells: sanitizedSpells
    };

    try {
        const adaptedCharacter = adaptWebCharacter(preparedInput) as CharacterData;
        return {
            isValid: true,
            errors,
            warnings,
            character: adaptedCharacter
        };
    } catch (err: any) {
        return {
            isValid: false,
            errors: [`Error adaptando la estructura del personaje: ${err?.message || 'Error desconocido'}`],
            warnings
        };
    }
}
