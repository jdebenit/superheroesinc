import { describe, it, expect } from 'vitest';
import { validateAndSanitizeCharacter } from '../src/utils/characterValidation';
import { initialCharacterState } from '../src/data/wizardConfig';

describe('Validación y Saneamiento Estructural de Fichas (characterValidation)', () => {

    it('rechaza entradas que no son objetos JSON válidos', () => {
        expect(validateAndSanitizeCharacter(null).isValid).toBe(false);
        expect(validateAndSanitizeCharacter(undefined).isValid).toBe(false);
        expect(validateAndSanitizeCharacter('cadena de texto').isValid).toBe(false);
        expect(validateAndSanitizeCharacter([1, 2, 3]).isValid).toBe(false);
        expect(validateAndSanitizeCharacter(42).isValid).toBe(false);

        const res = validateAndSanitizeCharacter(null);
        expect(res.errors[0]).toContain('no es un objeto JSON válido');
    });

    it('rechaza objetos JSON sin relación con Superhéroes INC', () => {
        const unrelatedJson = {
            title: 'Informe Anual',
            author: 'Empresa S.A.',
            pages: 15,
            status: 'draft'
        };
        const res = validateAndSanitizeCharacter(unrelatedJson);
        expect(res.isValid).toBe(false);
        expect(res.errors[0]).toContain('no contiene la estructura de un personaje');
    });

    it('rechaza objetos con solo nombre pero sin características ni orígenes', () => {
        const onlyName = {
            name: 'Paco el Héroe'
        };
        const res = validateAndSanitizeCharacter(onlyName);
        expect(res.isValid).toBe(false);
        expect(res.errors[0]).toContain('no contiene la estructura');
    });

    it('valida y procesa correctamente una ficha canónica del Wizard', () => {
        const validWizardChar = {
            name: 'Avispa Roja',
            alias: 'Avispa',
            origin: {
                items: [{ Mutante: [] }]
            },
            attributes: {
                values: {
                    Fuerza: 50,
                    Constitución: 45,
                    Agilidad: 65,
                    Inteligencia: 50,
                    Percepción: 60,
                    Apariencia: 40,
                    Voluntad: 50
                }
            },
            powers: {
                selected: [{ id: 'vuelo', rank: 20, origin: 'Mutante' }]
            }
        };

        const res = validateAndSanitizeCharacter(validWizardChar);
        expect(res.isValid).toBe(true);
        expect(res.errors).toHaveLength(0);
        expect(res.character).toBeDefined();
        expect(res.character?.name).toBe('Avispa Roja');
        expect(res.character?.attributes.values.Agilidad).toBe(65);
    });

    it('valida fichas legacy con formato antiguo (Sujeto, combatstats como array, etc.)', () => {
        const legacyChar = {
            Sujeto: 'Titanio',
            combatstats: [
                'Acciones por asalto: 2',
                'Puntos de Vida: 90'
            ],
            attributes: {
                Fuerza: 80,
                Constitución: 75,
                Agilidad: 40,
                Inteligencia: 50,
                Percepción: 40,
                Apariencia: 30,
                Voluntad: 60
            },
            skills: {
                items: [
                    { name: 'Comb. cuerpo a cuerpo', value: '70%', math: '(AGI+PER)/2' }
                ]
            }
        };

        const res = validateAndSanitizeCharacter(legacyChar);
        expect(res.isValid).toBe(true);
        expect(res.character?.name).toBe('Titanio');
        expect(res.character?.attributes.values.Fuerza).toBe(80);
        expect(res.character?.combatstats['Puntos de Vida']).toBe('90');
        expect(res.character?.skills.generalItems).toHaveLength(1);
    });

    it('sanea características con valores corruptos o NaN restableciéndolos de forma segura', () => {
        const corruptedChar = {
            name: 'Glitch Hero',
            origin: { items: [{ Alterado: [] }] },
            attributes: {
                values: {
                    Fuerza: 'mil' as any,
                    Constitución: NaN as any,
                    Agilidad: -5 as any,
                    Inteligencia: 60,
                    Percepción: 40,
                    Apariencia: 40,
                    Voluntad: 40
                }
            }
        };

        const res = validateAndSanitizeCharacter(corruptedChar);
        expect(res.isValid).toBe(true);
        expect(res.warnings.length).toBeGreaterThan(0);
        // Fuerza y Constitución se restablecen a valores por defecto válidos (40)
        expect(res.character?.attributes.values.Fuerza).toBe(40);
        expect(res.character?.attributes.values.Constitución).toBe(40);
        expect(res.character?.attributes.values.Agilidad).toBe(40);
        expect(res.character?.attributes.values.Inteligencia).toBe(60);
    });

    it('asigna nombre por defecto del archivo cuando falta el nombre en la ficha', () => {
        const unnamedChar = {
            origin: { items: [{ Arcano: ['Mago'] }] },
            attributes: {
                values: { ...initialCharacterState.attributes.values }
            }
        };

        const res = validateAndSanitizeCharacter(unnamedChar, 'mi_personaje_secreto.json');
        expect(res.isValid).toBe(true);
        expect(res.character?.name).toBe('mi_personaje_secreto');
        expect(res.warnings.some(w => w.includes('No se especificó nombre'))).toBe(true);
    });

    it('sanea listas de orígenes corruptas o en formato no-array', () => {
        const brokenOriginChar = {
            name: 'Heroe Roto',
            origin: 'Mutante' as any,
            attributes: {
                values: { ...initialCharacterState.attributes.values }
            }
        };

        const res = validateAndSanitizeCharacter(brokenOriginChar);
        expect(res.isValid).toBe(true);
        expect(Array.isArray(res.character?.origin.items)).toBe(true);
        expect(res.warnings.some(w => w.includes('orígenes'))).toBe(true);
    });
});
