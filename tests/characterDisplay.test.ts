import { describe, it, expect } from 'vitest';
import {
    getInitials,
    getCharacterDisplayName,
    getCharacterSubtitle,
    normalizeCharacterIconUrl
} from '../src/utils/characterDisplay';

describe('characterDisplay utilities', () => {
    describe('getInitials', () => {
        it('returns ? for empty, null or undefined names', () => {
            expect(getInitials('')).toBe('?');
            expect(getInitials(null)).toBe('?');
            expect(getInitials(undefined)).toBe('?');
            expect(getInitials('   ')).toBe('?');
        });

        it('returns first letters for single and multi-word names', () => {
            expect(getInitials('Logan')).toBe('L');
            expect(getInitials('Peter Parker')).toBe('PP');
            expect(getInitials('Clark Joseph Kent')).toBe('CJ');
            expect(getInitials('jean grey')).toBe('JG');
        });
    });

    describe('getCharacterDisplayName', () => {
        it('prefers alias over name', () => {
            expect(getCharacterDisplayName({ alias: 'Wolverine', name: 'James Howlett' })).toBe('Wolverine');
        });

        it('falls back to name if alias is empty', () => {
            expect(getCharacterDisplayName({ alias: '', name: 'Peter Parker' })).toBe('Peter Parker');
            expect(getCharacterDisplayName({ name: 'Clark Kent' })).toBe('Clark Kent');
        });

        it('returns fallback for empty data', () => {
            expect(getCharacterDisplayName(null)).toBe('(Sin datos)');
            expect(getCharacterDisplayName({})).toBe('(Sin nombre)');
        });
    });

    describe('getCharacterSubtitle', () => {
        it('formats name and level correctly', () => {
            expect(getCharacterSubtitle({ alias: 'Spider-Man', name: 'Peter Parker', level: 3 })).toBe('Peter Parker · Nv. 3');
        });

        it('shows only level if no real name separate from alias', () => {
            expect(getCharacterSubtitle({ name: 'Peter Parker', level: 2 })).toBe('Nv. 2');
        });

        it('returns empty string if no data', () => {
            expect(getCharacterSubtitle(null)).toBe('');
        });
    });

    describe('normalizeCharacterIconUrl', () => {
        it('handles null, undefined or empty strings', () => {
            expect(normalizeCharacterIconUrl(null)).toBeNull();
            expect(normalizeCharacterIconUrl('')).toBeNull();
            expect(normalizeCharacterIconUrl('  ')).toBeNull();
        });

        it('preserves absolute URLs and data URIs', () => {
            expect(normalizeCharacterIconUrl('https://example.com/avatar.png')).toBe('https://example.com/avatar.png');
            expect(normalizeCharacterIconUrl('http://example.com/avatar.png')).toBe('http://example.com/avatar.png');
            expect(normalizeCharacterIconUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
            expect(normalizeCharacterIconUrl('/images/avatar.png')).toBe('/images/avatar.png');
        });

        it('prepends leading slash for relative paths', () => {
            expect(normalizeCharacterIconUrl('images/avatar.png')).toBe('/images/avatar.png');
        });
    });
});
