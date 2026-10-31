import { describe, it, expect } from 'vitest';
import type { StoredCharacter } from '../src/components/viewer/types';
import { getCharacterDisplayName } from '../src/utils/characterDisplay';
import { adaptWebCharacter } from '../src/utils/characterAdapter';

describe('CharacterViewer Architecture & Data Flow', () => {
    it('ordena fichas de la web alfabéticamente por Display Name (alias con fallback a nombre)', () => {
        const webChars: StoredCharacter[] = [
            {
                id: '1',
                data: { name: 'Zack Taylor', alias: 'Black Ranger' },
                addedAt: 1000,
                source: 'web'
            },
            {
                id: '2',
                data: { name: 'Adam Park', alias: 'Zeo Green' },
                addedAt: 2000,
                source: 'web'
            },
            {
                id: '3',
                data: { name: 'Clark Kent', alias: 'Superman' },
                addedAt: 3000,
                source: 'web'
            },
            {
                id: '4',
                data: { name: 'Albus Dumbledore' }, // Sin alias
                addedAt: 4000,
                source: 'web'
            }
        ];

        const sorted = [...webChars].sort((a, b) =>
            getCharacterDisplayName(a.data).localeCompare(getCharacterDisplayName(b.data))
        );

        const displayNames = sorted.map(c => getCharacterDisplayName(c.data));
        expect(displayNames).toEqual([
            'Albus Dumbledore',
            'Black Ranger',
            'Superman',
            'Zeo Green'
        ]);
    });

    it('adapta correctamente personajes antes de enviarlos a TMT, TPT o descarga JSON', () => {
        const rawWebCharacter = {
            id: 'char_test',
            data: {
                name: 'Peter Parker',
                alias: 'Spider-Man',
                attributes: {
                    values: { Fuerza: 120, Agilidad: 140 }
                },
                combatstats: {
                    'Puntos de Vida': 150,
                    'Equilibrio Mental': 100
                }
            },
            addedAt: Date.now(),
            source: 'local' as const
        };

        const adapted = adaptWebCharacter(rawWebCharacter.data);
        expect(adapted).toBeDefined();
        expect(adapted.alias).toBe('Spider-Man');
        expect(adapted.name).toBe('Peter Parker');
        // Debe tener esquema completo garantizado
        expect(adapted.powers).toBeDefined();
        expect(adapted.spells).toBeDefined();
    });
});
