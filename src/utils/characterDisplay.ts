import type { CharacterData } from '../types/character';

/**
 * Obtiene las iniciales (hasta 2 letras en mayúscula) de un nombre para avatares o insignias.
 */
export function getInitials(name?: string | null): string {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return parts
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

/**
 * Obtiene el nombre visual preferente de un personaje (alias > nombre > '(Sin nombre)').
 */
export function getCharacterDisplayName(data?: Partial<CharacterData> | Record<string, any> | null): string {
    if (!data) return '(Sin datos)';
    return data.alias?.trim() || data.name?.trim() || '(Sin nombre)';
}

/**
 * Obtiene un subtítulo descriptivo para el personaje (ej: "Peter Parker · Nv. 3").
 */
export function getCharacterSubtitle(data?: Partial<CharacterData> | Record<string, any> | null): string {
    if (!data) return '';
    const alias = data.alias?.trim();
    const name = data.name?.trim();
    const level = data.level ?? data.meta?.level;

    const parts: string[] = [];
    if (alias && name) parts.push(name);
    if (level !== undefined && level !== null) parts.push(`Nv. ${level}`);
    return parts.join(' · ');
}

/**
 * Normaliza la URL o ruta de un icono/avatar para asegurar que sea válida en el navegador.
 */
export function normalizeCharacterIconUrl(icon?: string | null): string | null {
    if (!icon || typeof icon !== 'string') return null;
    const trimmed = icon.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    return `/${trimmed}`;
}
