import { describe, it, expect } from 'vitest';
import { calculateOriginCost } from '../src/data/originCosts';
import {
    calculateCreationPoints,
    calculateOriginModifiers,
    calculateLimits,
    calculateDerivedStats,
    calculateGeneralSkillValues,
    formatDerivedStats,
    applyStatsOverrides
} from '../src/utils/characterCalculations';

describe('Cálculos de Origen y Puntos de Creación (PC)', () => {
    it('calcula correctamente el coste de orígenes simples y con subtipos', () => {
        expect(calculateOriginCost([])).toBe(0);
        expect(calculateOriginCost([{ Mutante: [] }])).toBe(5);
        // Vigilante (1 base) + Artista Marcial (4 subtipo) = 5 PC
        expect(calculateOriginCost([{ Vigilante: ['Artista Marcial'] }])).toBe(5);
        // Arcano (0 base) + Mago (30 subtipo) = 30 PC
        expect(calculateOriginCost([{ Arcano: ['Mago'] }])).toBe(30);
        // Combinación de orígenes: Mutante (5) + Tecnológico -> Cyborg (5) = 10 PC
        expect(calculateOriginCost([{ Mutante: [] }, { 'Tecnológico': ['Cyborg'] }])).toBe(10);
    });

    it('calcula los PCs de características base (1 PC por cada 10 puntos)', () => {
        const breakdown = {
            fuerza: { base: 60, powerMod: 0 },
            constitucion: { base: 50, powerMod: 0 },
            agilidad: { base: 70, powerMod: 20 }, // powerMod no se cobra aquí
            inteligencia: { base: 60, powerMod: 0 },
            percepcion: { base: 50, powerMod: 0 },
            apariencia: { base: 50, powerMod: 0 },
            voluntad: { base: 60, powerMod: 0 },
        };

        const { pcValues, totalPC } = calculateCreationPoints(breakdown, [{ Mutante: [] }]);
        expect(pcValues.fuerza).toBe(6);
        expect(pcValues.agilidad).toBe(7);
        expect(totalPC).toBe(40); // (60+50+70+60+50+50+60) / 10 = 40
    });

    it('aplica descuento del 50% en Voluntad para Dotado y en todas las características para Ente', () => {
        const breakdown = {
            fuerza: { base: 60, powerMod: 0 },
            voluntad: { base: 80, powerMod: 0 },
        };

        const dotadoResult = calculateCreationPoints(breakdown, [{ Arcano: ['Dotado'] }]);
        expect(dotadoResult.pcValues.fuerza).toBe(6);
        expect(dotadoResult.pcValues.voluntad).toBe(4); // 80 / 10 * 0.5
        expect(dotadoResult.totalPC).toBe(10);

        const enteResult = calculateCreationPoints(breakdown, [{ Sobrenatural: ['Ente'] }]);
        expect(enteResult.pcValues.fuerza).toBe(3); // 60 / 10 * 0.5
        expect(enteResult.pcValues.voluntad).toBe(4); // 80 / 10 * 0.5
        expect(enteResult.totalPC).toBe(7);
    });

    it('calcula límites y modificadores de características tomando el máximo entre orígenes', () => {
        const defaultLimits = calculateLimits([], 'fuerza');
        expect(defaultLimits).toEqual({ min: 40, max: 100 });

        const modifiers = calculateOriginModifiers([{ Sobrenatural: ['Vampiro'] }], null);
        expect(modifiers.fuerza).toBeGreaterThanOrEqual(0);
    });
});

describe('Cálculos de Estadísticas Derivadas (d100)', () => {
    it('calcula estadísticas derivadas para un personaje con atributos humanos estándar', () => {
        const attributes = {
            Fuerza: 60,
            Constitución: 60,
            Agilidad: 80,
            Inteligencia: 70,
            Percepción: 60,
            Apariencia: 50,
            Voluntad: 75,
        };

        const stats = calculateDerivedStats(attributes, [], {});

        // CON 60 (<= 100): PV = floor(60/2) = 30, rec = 1 PV/h, DA físico = 0
        expect(stats.combat.pv).toBe('30');
        expect(stats.other.inconsciencia).toBe('3');
        expect(stats.other.recuperacion).toBe('1 PV/h');
        expect(stats.other.daAbsorbidoFisico).toBe('0');
        expect(stats.other.resistenciaGases).toBe('20%'); // floor(60/3)

        // FUE 60 (40..75): 1d4, 60kg
        expect(stats.other.modFuerza).toBe('1d4');
        expect(stats.other.pesoLevantado).toBe('60kg');

        // AGI 80 (76..90): acciones = 2, paradaFisica = floor(80/4) = 20
        expect(stats.combat.acciones).toBe('2');
        expect(stats.other.paradaFisica).toBe('20');
        expect(stats.other.modImpacto).toBe('0');

        // Iniciativa: floor((AGI 80 + PER 60) / 4) = 35
        expect(stats.combat.iniciativa).toBe('35');

        // Equilibrio Mental = INT = 70
        expect(stats.combat.equilibrio).toBe('70');

        // VOL 75 (71..80): paradaMental = 10, modPsionico = 0
        expect(stats.other.paradaMental).toBe('10');
        expect(stats.other.modPsionico).toBe('0');
    });

    it('calcula escalado sobrehumano (>100) y bonificador de Artes Marciales', () => {
        const attributes = {
            Fuerza: 110,
            Constitución: 120,
            Agilidad: 115,
            Inteligencia: 130,
            Percepción: 85,
            Apariencia: 60,
            Voluntad: 100,
        };

        const skillsWithMartialArts = {
            specialItems: [{ name: 'Artes Marciales' }],
        };

        const stats = calculateDerivedStats(attributes, [], skillsWithMartialArts);

        // CON 120 (111..120): PV = 120 - 40 = 80, DA físico = 30, rec = 4 PV/h
        expect(stats.combat.pv).toBe('80');
        expect(stats.other.daAbsorbidoFisico).toBe('30');
        expect(stats.other.recuperacion).toBe('4 PV/h');

        // FUE 110: 3d10+6, 8 t
        expect(stats.other.modFuerza).toBe('3d10+6');
        expect(stats.other.pesoLevantado).toBe('8 t');

        // AGI 115: base paradaFisica = 30 (+20 Artes Marciales = 50), acciones = 3, modImpacto = 15
        expect(stats.other.paradaFisica).toBe('50');
        expect(stats.combat.acciones).toBe('3');
        expect(stats.other.modImpacto).toBe('15');

        // Iniciativa: floor((115 + 85) / 4) = 50 + 20 (Artes Marciales) = 70
        expect(stats.combat.iniciativa).toBe('70');

        // INT 130 (121..140): DA Mental = 60
        expect(stats.other.daAbsorbidoMental).toBe('60');

        // VOL 100 (91..100): paradaMental = 50, modPsionico = 25
        expect(stats.other.paradaMental).toBe('50');
        expect(stats.other.modPsionico).toBe('25');
    });

    it('formatea y aplica overrides de estadísticas correctamente', () => {
        const raw = calculateDerivedStats(
            { Fuerza: 60, Constitución: 60, Agilidad: 60, Inteligencia: 60, Percepción: 60, Apariencia: 60, Voluntad: 60 },
            [],
            {}
        );
        const { combatStats } = formatDerivedStats(raw);
        expect(combatStats['Puntos de Vida']).toBe('30');

        const overridden = applyStatsOverrides(combatStats, { 'Puntos de Vida': '99' });
        expect(overridden['Puntos de Vida']).toBe('99');
        expect(overridden['Equilibrio Mental']).toBe('60');
    });
});

describe('Cálculos de Habilidades Generales', () => {
    it('aplica la regla especial de Heraldo Cósmico en Conocimientos Generales (INT/5 vs INT/3)', () => {
        const chars = {
            Fuerza: 60,
            Constitución: 60,
            Agilidad: 60,
            Inteligencia: 90,
            Percepción: 60,
            Apariencia: 60,
            Voluntad: 60,
        };

        const normal = calculateGeneralSkillValues(chars, [{ Mutante: [] }]);
        expect(normal.skills.conocimientos.minBase).toBe(30); // 90 / 3

        const heraldo = calculateGeneralSkillValues(chars, [{ 'Cósmico': ['Heraldo Cósmico'] }]);
        expect(heraldo.skills.conocimientos.minBase).toBe(18); // 90 / 5
    });

    it('calcula el coste en PCs al incrementar manualmente la base de una habilidad general', () => {
        const chars = {
            Fuerza: 60,
            Constitución: 60,
            Agilidad: 60,
            Inteligencia: 90,
            Percepción: 60,
            Apariencia: 60,
            Voluntad: 60,
        };

        // Conocimientos base = 30. Subimos manualBase a 45 (+15 puntos = 1.5 PC)
        const result = calculateGeneralSkillValues(chars, [], {}, { conocimientos: 45 });
        expect(result.skills.conocimientos.base).toBe(45);
        expect(result.skills.conocimientos.pcCost).toBeCloseTo(1.5);
        expect(result.totalPC).toBeCloseTo(1.5);
    });
});
