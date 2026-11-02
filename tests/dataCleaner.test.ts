import { describe, it, expect } from 'vitest';
import { calculateDiff, mergeWithDefaults } from '../src/utils/dataCleaner';

describe('Punto 3: dataCleaner (calculateDiff & mergeWithDefaults)', () => {
    describe('calculateDiff', () => {
        it('retorna undefined para primitivos idénticos', () => {
            expect(calculateDiff('hola', 'hola')).toBeUndefined();
            expect(calculateDiff(42, 42)).toBeUndefined();
            expect(calculateDiff(true, true)).toBeUndefined();
            expect(calculateDiff(null, null)).toBeUndefined();
            expect(calculateDiff(undefined, undefined)).toBeUndefined();
        });

        it('retorna undefined cuando ambos son valores vacíos equivalentes', () => {
            expect(calculateDiff('', null)).toBeUndefined();
            expect(calculateDiff('   ', undefined)).toBeUndefined();
            expect(calculateDiff(null, '')).toBeUndefined();
            expect(calculateDiff([], null)).toBeUndefined();
            expect(calculateDiff({}, {})).toBeUndefined();
        });

        it('retorna current cuando los primitivos difieren', () => {
            expect(calculateDiff('Batman', 'Superman')).toBe('Batman');
            expect(calculateDiff(100, 50)).toBe(100);
            expect(calculateDiff(true, false)).toBe(true);
            expect(calculateDiff('nuevo', undefined)).toBe('nuevo');
        });

        it('maneja arrays: retorna undefined si son idénticos, o el array completo si difieren', () => {
            expect(calculateDiff(['a', 'b'], ['a', 'b'])).toBeUndefined();
            expect(calculateDiff([], [])).toBeUndefined();
            expect(calculateDiff([], undefined)).toBeUndefined();

            const changedArray = ['a', 'c'];
            expect(calculateDiff(changedArray, ['a', 'b'])).toEqual(['a', 'c']);
            expect(calculateDiff(['x'], [])).toEqual(['x']);
        });

        it('maneja objetos anidados: extrae solo los campos que cambiaron', () => {
            const defaultObj = {
                name: 'Default Hero',
                age: 30,
                profile: {
                    city: 'Metropolis',
                    active: true
                },
                tags: ['hero']
            };

            const currentObj = {
                name: 'Default Hero', // idéntico
                age: 35,              // modificado
                profile: {
                    city: 'Gotham',   // modificado
                    active: true      // idéntico
                },
                tags: ['hero']        // idéntico
            };

            const diff = calculateDiff(currentObj, defaultObj);

            expect(diff).toEqual({
                age: 35,
                profile: {
                    city: 'Gotham'
                }
            });
        });

        it('retorna undefined si un objeto completo coincide con el default', () => {
            const template = { a: 1, b: { c: 'text' } };
            const current = { a: 1, b: { c: 'text' } };
            expect(calculateDiff(current, template)).toBeUndefined();
        });

        it('maneja claves añadidas en current que no existen en default', () => {
            const defaultObj = { a: 1 };
            const currentObj = { a: 1, customField: 'extra' };
            const diff = calculateDiff(currentObj, defaultObj);
            expect(diff).toEqual({ customField: 'extra' });
        });
    });

    describe('mergeWithDefaults', () => {
        it('retorna un clon del default si sparse es null o undefined', () => {
            const defaultObj = { name: 'Peter', powers: ['spider'] };
            
            const resultNull = mergeWithDefaults(null, defaultObj);
            expect(resultNull).toEqual(defaultObj);
            expect(resultNull).not.toBe(defaultObj); // deep clone check

            const resultUndefined = mergeWithDefaults(undefined, defaultObj);
            expect(resultUndefined).toEqual(defaultObj);
            expect(resultUndefined).not.toBe(defaultObj);
        });

        it('si default es primitivo, sparse lo sobreescribe', () => {
            expect(mergeWithDefaults('actualizado', 'defecto')).toBe('actualizado');
            expect(mergeWithDefaults(99, 10)).toBe(99);
            expect(mergeWithDefaults(false, true)).toBe(false);
        });

        it('si default es un array, sparse lo reemplaza solo si es array, o mantiene default si no lo es', () => {
            const defaultArr = ['fuerza', 'agilidad'];
            
            // Si sparse es array, reemplaza
            expect(mergeWithDefaults(['vuelo'], defaultArr)).toEqual(['vuelo']);

            // Si sparse no es array, conserva default
            expect(mergeWithDefaults('invalido', defaultArr)).toEqual(defaultArr);
            expect(mergeWithDefaults(123, defaultArr)).toEqual(defaultArr);
        });

        it('combina objetos profundamente rellenando claves faltantes del default', () => {
            const defaultData = {
                character: {
                    name: '',
                    concept: 'Sin concepto',
                    level: 1
                },
                attributes: {
                    FUE: 10,
                    AGI: 10,
                    INT: 10
                },
                equipment: ['Cuchillo']
            };

            const sparseData = {
                character: {
                    name: 'Logan'
                },
                attributes: {
                    FUE: 18
                }
            };

            const merged = mergeWithDefaults(sparseData, defaultData);

            expect(merged).toEqual({
                character: {
                    name: 'Logan',
                    concept: 'Sin concepto',
                    level: 1
                },
                attributes: {
                    FUE: 18,
                    AGI: 10,
                    INT: 10
                },
                equipment: ['Cuchillo']
            });
        });

        it('preserva claves en sparse que no existían en defaultObj', () => {
            const defaultData = { a: 1 };
            const sparseData = { a: 2, customVersion: 'v2.1', legacyNote: 'test' };

            const merged = mergeWithDefaults(sparseData, defaultData);
            expect(merged).toEqual({
                a: 2,
                customVersion: 'v2.1',
                legacyNote: 'test'
            });
        });

        it('si defaultObj no es un objeto ni array ni primitivo estándar (ej. función), retorna sparse', () => {
            const fnDefault = () => 'default';
            const sparseVal = 'override';
            expect(mergeWithDefaults(sparseVal, fnDefault)).toBe(sparseVal);
        });

        it('round-trip: calculateDiff seguido de mergeWithDefaults restituye el objeto completo', () => {
            const template = {
                title: 'Héroe',
                stats: { hp: 100, mp: 50 },
                inventory: ['pocion'],
                flags: { active: true, hidden: false }
            };

            const fullModified = {
                title: 'Héroe Legendario',
                stats: { hp: 150, mp: 50 },
                inventory: ['pocion', 'espada'],
                flags: { active: true, hidden: false }
            };

            const diff = calculateDiff(fullModified, template);
            expect(diff).toEqual({
                title: 'Héroe Legendario',
                stats: { hp: 150 },
                inventory: ['pocion', 'espada']
            });

            const reconstructed = mergeWithDefaults(diff, template);
            expect(reconstructed).toEqual(fullModified);
        });
    });
});
