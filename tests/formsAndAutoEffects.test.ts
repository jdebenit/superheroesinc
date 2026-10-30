import { describe, it, expect } from 'vitest';
import {
    syncOriginAutoPowers,
    syncPowerModsToAttributes
} from '../src/utils/calculations/powerCalculations';
import {
    syncCharacterTransformations,
    getCharacterForActiveForm
} from '../src/utils/calculations/formCalculations';
import {
    WEREWOLF_TRANSITION_FORM_ID,
    BLINDAJE_NATURAL_FORM_ID
} from '../src/data/werewolfOptions';

describe('Sincronización Determinista de Efectos Automáticos y Motor de Formas', () => {
    it('sincroniza todos los poderes automáticos de origen en una sola pasada sin sobrescrituras (syncOriginAutoPowers)', () => {
        // Tes-khar debe recibir superhabilidad a rango 80 con opción Esconderse
        const tesKharPowers = syncOriginAutoPowers({
            origin: { items: [{ Parahumano: ['Tes-khar'] }] },
            powers: { selected: [] }
        });
        expect(tesKharPowers).toHaveLength(1);
        expect(tesKharPowers?.[0]).toMatchObject({
            id: 'superhabilidad',
            origin: 'Parahumano',
            rank: 80,
            selectedOption: 'Esconderse'
        });

        // Multiorigen simultáneo: Atlante + Troll + Hada Tierra en una sola pasada
        const multiPowers = syncOriginAutoPowers({
            origin: {
                items: [
                    { Parahumano: ['Atlante'] },
                    { Arcano: ['Troll', 'Hada Tierra'] }
                ]
            },
            powers: { selected: [] }
        });
        expect(multiPowers).not.toBeNull();
        const ids = multiPowers!.map(p => `${p.id}${p.selectedOption ? ':' + p.selectedOption : ''}`);
        expect(ids).toContain('control_del_agua');
        expect(ids).toContain('superhabilidad:Idioma nativo');
        expect(ids).toContain('superhabilidad:Nadar');
        expect(ids).toContain('empatia_animal');
        expect(ids).toContain('regeneracion_de_tejidos');
        expect(ids).toContain('volar');
        expect(ids).toContain('control_de_la_vegetacion');
        expect(ids).toContain('control_de_la_geodinamica');

        // Idempotencia: segunda llamada devuelve null porque ya están todos
        const secondPass = syncOriginAutoPowers({
            origin: {
                items: [
                    { Parahumano: ['Atlante'] },
                    { Arcano: ['Troll', 'Hada Tierra'] }
                ]
            },
            powers: { selected: multiPowers }
        });
        expect(secondPass).toBeNull();
    });

    it('sincroniza modificadores de poderes de característica en attributes.breakdown y values (syncPowerModsToAttributes)', () => {
        const char = {
            attributes: {
                values: { Fuerza: 60, Constitución: 50, Agilidad: 50, Inteligencia: 50, Percepción: 50, Apariencia: 50, Voluntad: 50 },
                breakdown: {
                    fuerza: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    constitucion: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    agilidad: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    inteligencia: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    percepcion: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    apariencia: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    voluntad: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 }
                }
            },
            powers: {
                selected: [
                    { id: 'superfuerza', origin: 'Mutante', powerMod: 40 }
                ]
            }
        };

        const updatedAttrs = syncPowerModsToAttributes(char);
        expect(updatedAttrs).not.toBeNull();
        expect(updatedAttrs?.breakdown.fuerza.powerMod).toBe(40);
        expect(updatedAttrs?.values.Fuerza).toBe(100);

        // Idempotencia: si ya está sincronizado devuelve null
        const secondCall = syncPowerModsToAttributes({
            ...char,
            attributes: updatedAttrs
        });
        expect(secondCall).toBeNull();
    });

    it('sincroniza y proyecta simultáneamente Hombre Lobo y Blindaje Natural en formCalculations', () => {
        const char = {
            origin: { items: [{ Sobrenatural: ['Hombre Lobo'] }, { Mutante: ['Físico'] }] },
            werewolfParams: { subtype: 'hibrido' },
            attributes: {
                values: { Fuerza: 60, Constitución: 60, Agilidad: 60, Inteligencia: 60, Percepción: 60, Apariencia: 60, Voluntad: 70 },
                breakdown: {
                    fuerza: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    constitucion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    agilidad: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    inteligencia: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    percepcion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    apariencia: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    voluntad: { base: 70, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 }
                }
            },
            powers: {
                selected: [
                    { id: 'blindaje_natural', origin: 'Mutante', rank: 20 }
                ]
            },
            forms: [],
            skills: {}
        };

        const synced = syncCharacterTransformations(char);
        expect(synced).not.toBeNull();
        expect(synced?.forms).toHaveLength(2);
        expect(synced?.forms.map((f: any) => f.id)).toEqual([
            WEREWOLF_TRANSITION_FORM_ID,
            BLINDAJE_NATURAL_FORM_ID
        ]);

        const fullChar = { ...char, ...synced };
        const blindajeView = getCharacterForActiveForm(fullChar, BLINDAJE_NATURAL_FORM_ID);
        expect(blindajeView.attributes.values.Fuerza).toBe(110); // 60 + 50
        expect(blindajeView.attributes.values.Constitución).toBe(110); // 60 + 50
        expect(blindajeView.attributes.values.Voluntad).toBe(70);

        const werewolfView = getCharacterForActiveForm(fullChar, WEREWOLF_TRANSITION_FORM_ID);
        expect(werewolfView.attributes.values.Fuerza).toBe(100);
        expect(werewolfView.attributes.values.Voluntad).toBe(70);
    });
});
