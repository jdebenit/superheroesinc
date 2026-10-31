import { describe, it, expect } from 'vitest';
import { characterReducer } from '../src/utils/characterReducer';
import { initialCharacterState } from '../src/data/wizardConfig';
import { WEREWOLF_TRANSITION_FORM_ID, BLINDAJE_NATURAL_FORM_ID } from '../src/data/werewolfOptions';

describe('characterReducer', () => {
    it('returns initial state if none provided', () => {
        const state = characterReducer(undefined as any, { type: 'RESET_CHARACTER' });
        expect(state).toBeDefined();
        expect(state.name).toBe(initialCharacterState.name);
    });

    it('handles RESET_CHARACTER cleanly', () => {
        const modified = { ...initialCharacterState, name: 'Modificado' };
        const state = characterReducer(modified as any, { type: 'RESET_CHARACTER' });
        expect(state.name).toBe(initialCharacterState.name);
    });

    it('handles APPLY_PATCH for basic fields', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'APPLY_PATCH',
            payload: { name: 'Logan', alias: 'Wolverine' }
        });
        expect(state.name).toBe('Logan');
        expect(state.alias).toBe('Wolverine');
    });

    it('handles APPLY_PATCH with function payload (functional updater)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'APPLY_PATCH',
            payload: ((prev: any) => ({ name: `${prev.name || ''} Updated` })) as any
        });
        expect(state.name).toContain('Updated');
    });

    it('handles UPDATE_IDENTITY', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_IDENTITY',
            payload: { name: 'Peter Parker', alias: 'Spider-Man', profession: 'Fotógrafo' }
        });
        expect(state.name).toBe('Peter Parker');
        expect(state.alias).toBe('Spider-Man');
        expect(state.profession).toBe('Fotógrafo');
    });

    it('handles UPDATE_LEVEL', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_LEVEL',
            payload: { level: 3, modPerLevel: 2 }
        });
        expect(state.level).toBe(3);
        expect(state.modPerLevel).toBe(2);
    });

    it('handles SET_ORIGINS and automatically synchronizes Werewolf transformation', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_ORIGINS',
            payload: [
                { 'Sobrenatural': ['Hombre Lobo'] }
            ]
        });

        expect(state.origin.items).toHaveLength(1);
        expect(state.forms).toBeDefined();
        const wolfForm = state.forms?.find((f: any) => f.id === WEREWOLF_TRANSITION_FORM_ID);
        expect(wolfForm).toBeDefined();
        expect(wolfForm?.cost).toBe(0); // Coste de la forma de transición licántropa es 0
        expect(state.werewolfParams?.subtype).toBe('hibrido');
    });

    it('handles UPDATE_POWERS and auto-syncs power transformations', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_POWERS',
            payload: {
                selected: [
                    {
                        id: 'blindaje_natural',
                        name: 'Blindaje Natural',
                        rank: 21,
                        cost: 15
                    }
                ]
            }
        });

        expect(state.powers.selected).toHaveLength(1);
        const combatForm = state.forms?.find((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID);
        expect(combatForm).toBeDefined();
        expect(combatForm?.name).toContain('Blindaje Natural');
    });

    it('removes transformation form if power is removed', () => {
        // First add power
        const withPower = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_POWERS',
            payload: {
                selected: [
                    {
                        id: 'blindaje_natural',
                        name: 'Blindaje Natural',
                        rank: 21,
                        cost: 15
                    }
                ]
            }
        });
        expect(withPower.forms?.some((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID)).toBe(true);

        // Then remove power
        const withoutPower = characterReducer(withPower, {
            type: 'UPDATE_POWERS',
            payload: { selected: [] }
        });
        expect(withoutPower.forms?.some((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID)).toBe(false);
    });

    it('handles SET_CHARACTER with merge and migration of manualBonuses', () => {
        const oldSave = {
            name: 'Viejo Personaje',
            attributes: {
                values: { Fuerza: 14 }
                // no manualBonuses
            }
        };

        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_CHARACTER',
            payload: oldSave
        });

        expect(state.name).toBe('Viejo Personaje');
        expect(state.attributes?.values?.Fuerza).toBe(14);
        expect(state.attributes?.manualBonuses).toBeDefined();
        expect(state.attributes?.manualBonuses?.Fuerza).toBe(0);
    });
});
