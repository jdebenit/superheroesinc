import { describe, it, expect } from 'vitest';
import {
    calculateOriginModifiers,
    calculateLimits,
    getChoosableCharacteristics,
    hasChoosableCharacteristic,
    hasDistributablePoints,
    getDistributablePointsInfo,
    calculateSpecialtyModifiers,
    hasSpecialtyDistributablePoints,
    getSpecialtyDistributablePointsInfo,
    calculateSpecialtyAllowedCharacteristics,
    calculateOriginCost,
    forEachOriginAndSubtype
} from '../src/utils/calculations/originCalculations';

describe('Punto 1: originCalculations Cobertura Completa', () => {
    describe('forEachOriginAndSubtype', () => {
        it('maneja listas vacías o nulas sin lanzar errores', () => {
            let called = false;
            forEachOriginAndSubtype([], () => { called = true; });
            forEachOriginAndSubtype(null as any, () => { called = true; });
            expect(called).toBe(false);
        });

        it('itera correctamente tanto orígenes principales como subtipos que están en ORIGIN_CHARACTERISTIC_MODIFIERS', () => {
            const origins = [
                { 'Mutante': [] },
                { 'Arcano': ['Terrano'] }
            ];
            const visited: string[] = [];
            forEachOriginAndSubtype(origins, (name, _data, isSubtype) => {
                visited.push(`${name}:${isSubtype}`);
            });

            expect(visited).toContain('Mutante:false');
            expect(visited).toContain('Terrano:true');
        });
    });

    describe('calculateOriginModifiers', () => {
        it('devuelve ceros cuando no hay orígenes', () => {
            const mods = calculateOriginModifiers([], null);
            expect(mods.fuerza).toBe(0);
            expect(mods.agilidad).toBe(0);
        });

        it('aplica modificadores directos y soporta chosenBonusCharacteristic como string o Record', () => {
            // Heraldo Cósmico tiene choosableCharacteristic con bonus de 100
            const origins = [{ 'Cósmico': ['Heraldo Cósmico'] }];

            // Con string legacy
            const modsStr = calculateOriginModifiers(origins, 'fuerza');
            expect(modsStr.fuerza).toBe(100);

            // Con Record moderno
            const modsRecord = calculateOriginModifiers(origins, { 'Heraldo Cósmico': 'agilidad' });
            expect(modsRecord.agilidad).toBe(100);

            // Con null
            const modsNull = calculateOriginModifiers(origins, null);
            expect(modsNull.fuerza).toBe(0);
        });
    });

    describe('calculateLimits', () => {
        it('devuelve min=40 y max=100 por defecto para humano estándar', () => {
            const limits = calculateLimits([], 'fuerza');
            expect(limits).toEqual({ min: 40, max: 100 });
        });

        it('aplica límites específicos de orígenes (min/max)', () => {
            // Elfo Físico tiene agilidad min 100, max 200
            const origins = [{ 'Arcano': ['Elfo Físico'] }];
            const limits = calculateLimits(origins, 'agilidad');
            expect(limits.min).toBe(100);
            expect(limits.max).toBe(200);
        });

        it('aplica bonus de comprension_senda con no_limit (hasta 200) para Liberado', () => {
            const origins = [{ 'Liberado': ['Liberado de Entropía'] }];
            const liberadoParams = {
                gifts: ['comprension_senda'],
                comprensionChoice: 'no_limit'
            };

            const limits = calculateLimits(
                origins,
                'fuerza',
                { 'Liberado de Entropía': 'fuerza' },
                liberadoParams
            );

            expect(limits.max).toBe(200);
        });

        it('aplica bonus de comprension_senda con second_characteristic para Liberado', () => {
            const origins = [{ 'Liberado': ['Liberado de Entropía'] }];
            const liberadoParams = {
                gift: 'comprension_senda',
                comprensionChoice: 'second_characteristic',
                secondCharacteristic: 'constitucion'
            };

            const limitsConstitucion = calculateLimits(
                origins,
                'constitucion',
                { 'Liberado de Entropía': 'fuerza' },
                liberadoParams
            );

            // Liberado de Entropía maxLimitBonus es 30, por lo que boostedLimit es 130
            expect(limitsConstitucion.max).toBe(130);
        });
    });

    describe('getChoosableCharacteristics y hasChoosableCharacteristic', () => {
        it('retorna array vacío y null si no hay orígenes con características a elegir', () => {
            expect(getChoosableCharacteristics([])).toEqual([]);
            expect(hasChoosableCharacteristic([])).toBeNull();
        });

        it('detecta correctamente orígenes con choosableCharacteristic', () => {
            const origins = [{ 'Liberado': ['Liberado de Entropía'] }];
            const entries = getChoosableCharacteristics(origins);
            expect(entries.length).toBeGreaterThan(0);
            expect(entries[0].originKey).toBe('Liberado de Entropía');
            expect(hasChoosableCharacteristic(origins)).toBeDefined();
        });
    });

    describe('hasDistributablePoints y getDistributablePointsInfo', () => {
        it('retorna false y ceros para listas vacías', () => {
            expect(hasDistributablePoints([])).toBe(false);
            expect(hasDistributablePoints(null as any)).toBe(false);

            const info = getDistributablePointsInfo([], {}, null);
            expect(info).toEqual({ total: 0, used: 0, remaining: 0 });
        });

        it('calcula puntos distribuidos y restantes', () => {
            const origins = [{ 'Cósmico': ['Avatar Cósmico'] }]; // Avatar Cósmico tiene 200 puntos distribuibles
            expect(hasDistributablePoints(origins)).toBe(true);

            const characteristics = {
                fuerza: { originMod: 50 },
                agilidad: { originMod: 30 },
                constitucion: { originMod: 0 },
                inteligencia: { originMod: 0 },
                percepcion: { originMod: 0 },
                apariencia: { originMod: 0 },
                voluntad: { originMod: 0 }
            };

            const info = getDistributablePointsInfo(origins, characteristics, null);
            expect(info.total).toBe(200);
            expect(info.used).toBe(80);
            expect(info.remaining).toBe(120);
        });
    });

    describe('Especialidades de Vigilante (Modifiers, Distributable Points, Allowed Characteristics)', () => {
        it('calculateSpecialtyModifiers calcula modificadores numéricos y de objeto', () => {
            expect(calculateSpecialtyModifiers([])).toEqual({
                fuerza: 0, constitucion: 0, agilidad: 0,
                inteligencia: 0, percepcion: 0, apariencia: 0, voluntad: 0
            });

            const origins = [{ 'Vigilante': ['Artista Marcial', 'Francotirador'] }];
            const mods = calculateSpecialtyModifiers(origins);
            expect(mods.agilidad).toBe(50);
            expect(mods.percepcion).toBe(50);
        });

        it('hasSpecialtyDistributablePoints detecta si alguna especialidad otorga puntos', () => {
            expect(hasSpecialtyDistributablePoints([])).toBe(false);
            expect(hasSpecialtyDistributablePoints(null as any)).toBe(false);
            expect(hasSpecialtyDistributablePoints([{ 'Vigilante': ['Artista Marcial'] }])).toBe(false);

            // Fanático/Vengador tiene distributablePoints: 20
            const origins = [{ 'Vigilante': ['Fanático/Vengador'] }];
            expect(hasSpecialtyDistributablePoints(origins)).toBe(true);
        });

        it('getSpecialtyDistributablePointsInfo calcula total, usado y restante', () => {
            expect(getSpecialtyDistributablePointsInfo([], {})).toEqual({ total: 0, used: 0, remaining: 0 });

            const origins = [{ 'Vigilante': ['Fanático/Vengador'] }];
            const characteristics = {
                fuerza: { specialtyMod: 10 },
                constitucion: { specialtyMod: 0 },
                agilidad: { specialtyMod: 35 }, // 30 fijos + 5 distribuidos
                inteligencia: { specialtyMod: 0 },
                percepcion: { specialtyMod: 30 }, // 30 fijos
                apariencia: { specialtyMod: 0 },
                voluntad: { specialtyMod: 10 } // 10 fijos
            };

            const info = getSpecialtyDistributablePointsInfo(origins, characteristics);
            expect(info.total).toBe(20);
            // 10 en fuerza + 5 en agilidad = 15 usados
            expect(info.used).toBe(15);
            expect(info.remaining).toBe(5);
        });

        it('calculateSpecialtyAllowedCharacteristics retorna null si no hay puntos o lista vacía', () => {
            expect(calculateSpecialtyAllowedCharacteristics([])).toBeNull();
            expect(calculateSpecialtyAllowedCharacteristics([{ 'Vigilante': ['Artista Marcial'] }])).toBeNull();
        });

        it('calculateSpecialtyAllowedCharacteristics extrae las características permitidas', () => {
            const origins = [{ 'Vigilante': ['Fanático/Vengador'] }];
            const allowed = calculateSpecialtyAllowedCharacteristics(origins);
            expect(Array.isArray(allowed)).toBe(true);
            expect(allowed).toContain('fuerza');
            expect(allowed).toContain('constitucion');
            expect(allowed).toContain('agilidad');
            expect(allowed).toContain('percepcion');
        });
    });

    describe('calculateOriginCost', () => {
        it('retorna 0 si originItems es null o vacío', () => {
            expect(calculateOriginCost([])).toBe(0);
            expect(calculateOriginCost(null as any)).toBe(0);
        });

        it('calcula correctamente costes con subtipos anidados y subtipos directos como clave (Caso 2)', () => {
            // Caso 2: El nombre del origen es en realidad un subtipo de una categoría principal (ej. Semidios de Divino)
            const origins = [
                { 'Semidios': [] },
                { 'OrigenTotalmenteDesconocido': [] }
            ];
            const cost = calculateOriginCost(origins);
            expect(cost).toBe(20); // Semidiós cuesta 20
        });
    });
});
