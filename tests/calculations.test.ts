import { describe, it, expect } from 'vitest';
import { useMagicSectionLogic } from '../src/components/wizard/steps/Step3_Especials/hooks/useMagicSectionLogic';
import { calculateOriginCost } from '../src/data/originCosts';
import { SPECIAL_SKILLS, isSkillAllowed, hasConocimientoEsferas } from '../src/data/specialSkills';
import {
    WEREWOLF_SUBTYPES,
    buildWerewolfTransitionForm,
    syncWerewolfState,
    getCharacterForActiveForm
} from '../src/data/werewolfOptions';
import { getPowerCostConfig } from '../src/components/wizard/steps/Step3_Especials/utils';
import {
    calculateCreationPoints,
    calculateOriginModifiers,
    calculateLimits,
    getChoosableCharacteristics,
    getDistributablePointsInfo,
    calculateDerivedStats,
    calculateGeneralSkillValues,
    calculateSpecialSkillValues,
    calculateSpecialSkillsPCWithInt,
    formatDerivedStats,
    applyStatsOverrides,
    getStatDisplayValue,
    applyLevelModsToSkillItems,
    getEffectiveBackground
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

    it('comprueba que los Liberados tienen base 0 EM pero pueden adquirir hechizos con coste a los EM (1 PC por cada 10 EM)', () => {
        const data = {
            attributes: {
                values: {
                    Inteligencia: 60,
                    Percepción: 60,
                    Voluntad: 60,
                    Constitución: 60
                }
            }
        };

        // 1. Liberado puro (sin otro origen con EM de base)
        const liberadoResult = useMagicSectionLogic({
            data,
            selectedSpells: [
                { id: 'rayo', name: 'Rayo', cost: '10', rank: 2, maxRank: 5, requirements: 'Ninguno' } as any
            ],
            selectedPowers: [],
            emFormula: { divisor: 0, pcCost: 0 },
            isMago: false,
            isDotado: false,
            isHibrido: false,
            isTerrano: false,
            isLiberado: true
        });

        // EM base es 0
        expect(liberadoResult.maxEM).toBe(0);
        // Coste total de hechizos: 10 * 2 = 20 EM
        expect(liberadoResult.totalCost).toBe(20);
        // Excede la EM base
        expect(liberadoResult.emExceeded).toBe(true);
        // Penalización: 20 / 10 = 2 PC
        expect(liberadoResult.pcPenalty).toBe(2);
        // Acceso permitido
        expect(liberadoResult.isSpellAccessAllowed).toBe(true);

        // 2. Liberado multiorigen con Mago (Arcano)
        const liberadoMagoResult = useMagicSectionLogic({
            data,
            selectedSpells: [
                { id: 'rayo', name: 'Rayo', cost: '10', rank: 2, maxRank: 5, requirements: 'Ninguno' } as any
            ],
            selectedPowers: [],
            emFormula: { divisor: 1, pcCost: 0 },
            isMago: true,
            isDotado: false,
            isHibrido: false,
            isTerrano: false,
            isLiberado: true
        });

        // EM base calculada por Mago: (INT+PER+VOL)/1 = 180 EM
        expect(liberadoMagoResult.maxEM).toBe(180);
        expect(liberadoMagoResult.totalCost).toBe(20);
        expect(liberadoMagoResult.emExceeded).toBe(false);
        expect(liberadoMagoResult.pcPenalty).toBe(0);
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

        // Elfo tiene límite máximo inferior a 100 en Fuerza (60-90) y Constitución (50-90)
        expect(calculateLimits([{ Arcano: ['Elfo Físico'] }], 'fuerza')).toEqual({ min: 60, max: 90 });
        expect(calculateLimits([{ Arcano: ['Elfo Físico'] }], 'constitucion')).toEqual({ min: 50, max: 90 });
        expect(calculateLimits([{ Arcano: ['Elfo Psíquico'] }], 'fuerza')).toEqual({ min: 60, max: 90 });
        expect(calculateLimits([{ Arcano: ['Elfo Mágico'] }], 'constitucion')).toEqual({ min: 50, max: 90 });
    });

    it('calcula límites correctamente para Liberado de Entropía según la característica elegida y el don', () => {
        const origins = [{ Sobrenatural: ['Liberado de Entropía'] }];

        // Sin selección previa, el límite base es 100
        expect(calculateLimits(origins, 'fuerza', null).max).toBe(100);
        expect(calculateLimits(origins, 'constitucion', null).max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', null).max).toBe(100);

        // Si elige fuerza, SOLO fuerza sube a 130; las demás permanecen en 100
        expect(calculateLimits(origins, 'fuerza', 'fuerza').max).toBe(130);
        expect(calculateLimits(origins, 'constitucion', 'fuerza').max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', 'fuerza').max).toBe(100);
        expect(calculateLimits(origins, 'agilidad', 'fuerza').max).toBe(100);

        // Con el don Comprensión de la Senda en formato array (segunda característica: constitucion)
        const paramsSecond = {
            gifts: ['comprension_senda', 'conocimiento_esferas'],
            comprensionChoice: 'second_characteristic',
            secondCharacteristic: 'constitucion'
        };
        expect(calculateLimits(origins, 'fuerza', 'fuerza', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'constitucion', 'fuerza', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'voluntad', 'fuerza', paramsSecond).max).toBe(100);

        // Con el don Comprensión de la Senda (sin restricciones en la elegida)
        const paramsNoLimit = {
            gift: 'comprension_senda',
            comprensionChoice: 'no_limit'
        };
        expect(calculateLimits(origins, 'fuerza', 'fuerza', paramsNoLimit).max).toBe(200);
        expect(calculateLimits(origins, 'constitucion', 'fuerza', paramsNoLimit).max).toBe(100);
    });

    it('calcula límites correctamente para Liberado de Unidad según la característica elegida y el don', () => {
        const origins = [{ Sobrenatural: ['Liberado de Unidad'] }];

        // Sin selección previa, el límite base es 100
        expect(calculateLimits(origins, 'agilidad', null).max).toBe(100);
        expect(calculateLimits(origins, 'apariencia', null).max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', null).max).toBe(100);

        // Si elige agilidad, SOLO agilidad sube a 130
        expect(calculateLimits(origins, 'agilidad', 'agilidad').max).toBe(130);
        expect(calculateLimits(origins, 'apariencia', 'agilidad').max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', 'agilidad').max).toBe(100);
        expect(calculateLimits(origins, 'fuerza', 'agilidad').max).toBe(100);

        // Con el don Comprensión de la Senda (segunda característica: apariencia)
        const paramsSecond = {
            gifts: ['comprension_senda'],
            comprensionChoice: 'second_characteristic',
            secondCharacteristic: 'apariencia'
        };
        expect(calculateLimits(origins, 'agilidad', 'agilidad', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'apariencia', 'agilidad', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'voluntad', 'agilidad', paramsSecond).max).toBe(100);

        // Con el don Comprensión de la Senda (sin restricciones en la elegida)
        const paramsNoLimit = {
            gift: 'comprension_senda',
            comprensionChoice: 'no_limit'
        };
        expect(calculateLimits(origins, 'agilidad', 'agilidad', paramsNoLimit).max).toBe(200);
        expect(calculateLimits(origins, 'apariencia', 'agilidad', paramsNoLimit).max).toBe(100);
    });

    it('calcula límites correctamente para Liberado de Equidad según la característica elegida y el don', () => {
        const origins = [{ Sobrenatural: ['Liberado de Equidad'] }];

        // Sin selección previa, el límite base es 100
        expect(calculateLimits(origins, 'inteligencia', null).max).toBe(100);
        expect(calculateLimits(origins, 'percepcion', null).max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', null).max).toBe(100);

        // Si elige inteligencia, SOLO inteligencia sube a 130
        expect(calculateLimits(origins, 'inteligencia', 'inteligencia').max).toBe(130);
        expect(calculateLimits(origins, 'percepcion', 'inteligencia').max).toBe(100);
        expect(calculateLimits(origins, 'voluntad', 'inteligencia').max).toBe(100);

        // Con el don Comprensión de la Senda (segunda característica: percepcion)
        const paramsSecond = {
            gifts: ['comprension_senda'],
            comprensionChoice: 'second_characteristic',
            secondCharacteristic: 'percepcion'
        };
        expect(calculateLimits(origins, 'inteligencia', 'inteligencia', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'percepcion', 'inteligencia', paramsSecond).max).toBe(130);
        expect(calculateLimits(origins, 'voluntad', 'inteligencia', paramsSecond).max).toBe(100);

        // Con el don Comprensión de la Senda (sin restricciones en la elegida)
        const paramsNoLimit = {
            gift: 'comprension_senda',
            comprensionChoice: 'no_limit'
        };
        expect(calculateLimits(origins, 'inteligencia', 'inteligencia', paramsNoLimit).max).toBe(200);
        expect(calculateLimits(origins, 'percepcion', 'inteligencia', paramsNoLimit).max).toBe(100);
    });

    it('soporta multiorigen limpio: Heraldo Cósmico + Liberado de Entropía simultáneamente', () => {
        const origins = [
            { Cósmico: ['Heraldo Cósmico'] },
            { Sobrenatural: ['Liberado de Entropía'] }
        ];

        // 1. Detecta ambos orígenes choosable independientemente
        const entries = getChoosableCharacteristics(origins);
        expect(entries.length).toBe(2);
        expect(entries[0].originKey).toBe('Heraldo Cósmico');
        expect(entries[0].bonus).toBe(100);
        expect(entries[1].originKey).toBe('Liberado de Entropía');
        expect(entries[1].maxLimitBonus).toBe(30);

        // 2. Elección separada e independiente para cada origen
        const chosen = {
            'Heraldo Cósmico': 'inteligencia',
            'Liberado de Entropía': 'fuerza'
        };

        // Modificadores: INT recibe +100 por Heraldo, FUE no recibe flat bonus
        const mods = calculateOriginModifiers(origins, chosen);
        expect(mods.inteligencia).toBe(100);
        expect(mods.fuerza).toBe(0);

        // Puntos distribuibles: 100 (Heraldo) + 120 (Liberado) = 220
        const pointsInfo = getDistributablePointsInfo(origins, {
            fuerza: { originMod: 0 },
            constitucion: { originMod: 0 },
            agilidad: { originMod: 0 },
            inteligencia: { originMod: 100 },
            percepcion: { originMod: 0 },
            apariencia: { originMod: 0 },
            voluntad: { originMod: 0 }
        }, chosen);
        expect(pointsInfo.total).toBe(220);
        expect(pointsInfo.used).toBe(0); // 100 en INT es autoMod del Heraldo

        // 3. Al cambiar la característica del Heraldo (de INT a CON),
        // el bonus de +100 se traslada limpiamente sin dejar residuos
        const chosenChanged = {
            'Heraldo Cósmico': 'constitucion',
            'Liberado de Entropía': 'fuerza'
        };
        const modsChanged = calculateOriginModifiers(origins, chosenChanged);
        expect(modsChanged.constitucion).toBe(100);
        expect(modsChanged.inteligencia).toBe(0);
        expect(modsChanged.fuerza).toBe(0);
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

        // Iniciativa: INT 130 (>= 121) sustituye a PER 85 -> floor((115 + 130) / 4) = 61 + 20 (Artes Marciales) = 81
        expect(stats.combat.iniciativa).toBe('81');
        expect(stats.combat.iniciativaBreakdown).toEqual({
            formula: '(AGI+INT)/4',
            base: 61,
            habilidades: {
                'Artes Marciales': 20
            },
            total: 81
        });

        // INT 130 (121..140): DA Mental = 60
        expect(stats.other.daAbsorbidoMental).toBe('60');

        // VOL 100 (91..100): paradaMental = 50, modPsionico = 25
        expect(stats.other.paradaMental).toBe('50');
        expect(stats.other.modPsionico).toBe('25');
    });

    it('formatea y aplica overrides de estadísticas correctamente, incluyendo el desglose de Parada mental por orígenes', () => {
        const raw = calculateDerivedStats(
            { Fuerza: 60, Constitución: 60, Agilidad: 60, Inteligencia: 60, Percepción: 60, Apariencia: 60, Voluntad: 80 },
            [{ Parahumano: ['Thals'] }, { Arcano: ['Mago'] }],
            {}
        );
        const { combatStats, otherStats } = formatDerivedStats(raw);
        expect(combatStats['Puntos de Vida']).toEqual({
            formula: 'CON/2',
            base: 30,
            total: 30
        });
        expect(otherStats['Inconsciencia']).toEqual({
            formula: 'PV/10',
            base: 3,
            total: 3
        });
        expect(otherStats['Resistencia a gases y venenos']).toEqual({
            formula: 'CON/3',
            base: 20,
            total: '20%'
        });
        expect(otherStats['Salto (alto / largo)']).toEqual({
            formula: 'AGI/12',
            multiplicadorFuerza: 1,
            alto: '1,7m',
            largo: '5,0m',
            total: '1,7m / 5,0m'
        });

        // VOL 80 -> base 10; orígenes acumulativos: Parahumano (Thals) = 10, Arcano = 20; total = base (10) + 10 + 20 = 40
        expect(otherStats['Parada mental']).toEqual({
            base: 10,
            origen: {
                Parahumano: 10,
                Arcano: 20
            },
            total: 40
        });
        expect(getStatDisplayValue(otherStats['Parada mental'])).toBe('40');

        const overridden = applyStatsOverrides(combatStats, { 'Puntos de Vida': '99' });
        expect(overridden['Puntos de Vida']).toEqual({
            formula: 'CON/2',
            base: 30,
            total: 30,
            personalizado: 99
        });
        expect(overridden['Equilibrio Mental']).toEqual({
            formula: 'INT',
            base: 60,
            total: 60
        });

        // Si en el JSON viene un valor personalizado (como objeto o como string antiguo), se añade 'personalizado'
        const otherWithCustomObj = applyStatsOverrides(otherStats, {
            'Parada mental': { base: 10, origen: { Parahumano: 10, Arcano: 20 }, total: 40, personalizado: 90 }
        });
        expect(otherWithCustomObj['Parada mental']).toEqual({
            base: 10,
            origen: {
                Parahumano: 10,
                Arcano: 20
            },
            total: 40,
            personalizado: 90
        });
        expect(getStatDisplayValue(otherWithCustomObj['Parada mental'])).toBe('90');

        // Compatibilidad con string igual al total: no añade 'personalizado'
        const otherWithSameString = applyStatsOverrides(otherStats, {
            'Parada mental': '40'
        });
        expect(otherWithSameString['Parada mental']).toEqual({
            base: 10,
            origen: {
                Parahumano: 10,
                Arcano: 20
            },
            total: 40
        });

        // Prueba de Vigilante con varias especializaciones (Modificador de impacto) y Artes Marciales (Parada Fisica e Iniciativa y Reflejos)
        const vigilanteRaw = calculateDerivedStats(
            { Fuerza: 60, Constitución: 60, Agilidad: 110, Inteligencia: 60, Percepción: 60, Apariencia: 60, Voluntad: 80 },
            [{ Vigilante: ['Artista Marcial', 'Pistolero'] }],
            { specialItems: [{ name: 'Artes Marciales' }] }
        );
        const { combatStats: vigilanteCombat, otherStats: vigilanteOther } = formatDerivedStats(vigilanteRaw);

        expect(vigilanteCombat['Iniciativa y Reflejos']).toEqual({
            formula: '(AGI+PER)/4',
            base: 42,
            habilidades: {
                'Artes Marciales': 20
            },
            total: 62
        });

        // Prueba cuando INT >= 121 sustituye a AGI (AGI < PER) -> (INT+PER)/4
        const intSustituyeAgiRaw = calculateDerivedStats(
            { Fuerza: 60, Constitución: 60, Agilidad: 70, Inteligencia: 140, Percepción: 100, Apariencia: 60, Voluntad: 80 },
            [],
            {}
        );
        const { combatStats: intSustituyeAgiCombat } = formatDerivedStats(intSustituyeAgiRaw);
        expect(intSustituyeAgiCombat['Iniciativa y Reflejos']).toEqual({
            formula: '(INT+PER)/4',
            base: 60,
            habilidades: 0,
            total: 60
        });

        expect(vigilanteOther['Modificador de impacto']).toEqual({
            base: 10,
            origen: {
                'Artista Marcial': 30,
                'Pistolero': 20
            },
            total: 40
        });

        expect(vigilanteOther['Parada Fisica']).toEqual({
            base: 30,
            habilidades: {
                'Artes Marciales': 20
            },
            total: 50
        });

        // Prueba de progresión por nivel (modPerLevel) estructurado por categorías como en La Naga
        const categorizedModPerLevel = {
            '2': {
                combatstats: { 'Puntos de Vida': 10 },
                skills: { 'Artes Marciales': 10, 'Arma Especial: Khopesh': 10 },
                background: { economicStatus: 'clase_baja' }
            },
            '3': {
                combatstats: { 'Puntos de Vida': 10 },
                skills: { 'Arma Especial: Khopesh': 10 },
                background: { items: ['Con cobertura legal por la FDM'] }
            },
            '4': {
                combatstats: { 'Puntos de Vida': 10 },
                background: { friendsAndAssociates: 'conocido' }
            }
        };
        const nagaAttrs = { Fuerza: 100, Constitución: 105, Agilidad: 110, Inteligencia: 102, Percepción: 110, Apariencia: 101, Voluntad: 102 };
        const nagaLevel4 = formatDerivedStats(calculateDerivedStats(nagaAttrs, [], {}, 4, categorizedModPerLevel));
        expect(nagaLevel4.combatStats['Puntos de Vida']).toEqual({
            formula: 'CON-45',
            base: 60,
            nivel: 30,
            total: 90
        });
        expect(nagaLevel4.otherStats['Inconsciencia']).toEqual({
            formula: 'PV/10',
            base: 9,
            total: 9
        });

        // Si se baja el nivel a 2, solo se aplica el bloque "2" (+10 PV -> 70, Inconsciencia -> 7)
        const nagaLevel2 = formatDerivedStats(calculateDerivedStats(nagaAttrs, [], {}, 2, categorizedModPerLevel));
        expect(nagaLevel2.combatStats['Puntos de Vida']).toEqual({
            formula: 'CON-45',
            base: 60,
            nivel: 10,
            total: 70
        });
        expect(nagaLevel2.otherStats['Inconsciencia']).toEqual({
            formula: 'PV/10',
            base: 7,
            total: 7
        });

        // Escalado de habilidades por nivel
        const baseSkills = [
            { name: 'Artes Marciales', value: '73%' },
            { name: 'Arma Especial: Khopesh', value: '73%' }
        ];
        const skillsLv4 = applyLevelModsToSkillItems(baseSkills, 4, categorizedModPerLevel);
        expect(skillsLv4[0].value).toBe('83%');
        expect(skillsLv4[1].value).toBe('93%');

        const skillsLv2 = applyLevelModsToSkillItems(baseSkills, 2, categorizedModPerLevel);
        expect(skillsLv2[0].value).toBe('83%');
        expect(skillsLv2[1].value).toBe('83%');

        // Escalado de trasfondo por nivel (getEffectiveBackground)
        const baseBackground = {
            items: [],
            prejudiceResistance: 30,
            economicStatus: 'mendigo',
            legalStatus: 'con_antecedentes',
            socialStatus: 'anonimo',
            friendsAndAssociates: 'solitario'
        };
        const bgLv4 = getEffectiveBackground(baseBackground, 4, categorizedModPerLevel);
        expect(bgLv4.economicStatus).toBe('clase_baja');
        expect(bgLv4.friendsAndAssociates).toBe('conocido');
        expect(bgLv4.items).toEqual(['Con cobertura legal por la FDM']);

        // A nivel 1 (base pura)
        const bgLv1 = getEffectiveBackground(baseBackground, 1, categorizedModPerLevel);
        expect(bgLv1.economicStatus).toBe('mendigo');
        expect(bgLv1.friendsAndAssociates).toBe('solitario');
        expect(bgLv1.items).toEqual([]);

        // A nivel 2
        const bgLv2 = getEffectiveBackground(baseBackground, 2, categorizedModPerLevel);
        expect(bgLv2.economicStatus).toBe('clase_baja');
        expect(bgLv2.friendsAndAssociates).toBe('solitario');
        expect(bgLv2.items).toEqual([]);
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

    it('calcula el coste en PCs al incrementar manualmente la base de una habilidad general y aplica la mitad de coste para Liberados', () => {
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

        // Con origen Liberado: subir +10 puntos (de 30 a 40) cuesta la mitad (0.5 PC en vez de 1.0 PC)
        const liberadoOrigins = [{ Sobrenatural: ['Liberado de Entropía'] }];
        const liberadoGeneral = calculateGeneralSkillValues(chars, liberadoOrigins, {}, { conocimientos: 40 });
        expect(liberadoGeneral.skills.conocimientos.base).toBe(40);
        expect(liberadoGeneral.skills.conocimientos.pcCost).toBeCloseTo(0.5);
        expect(liberadoGeneral.totalPC).toBeCloseTo(0.5);

        // Habilidades de aprendizaje con Liberado: adquirir cuesta 0.5 PC y subir la base +10 puntos cuesta 0.5 PC
        const liberadoSpecialVals = calculateSpecialSkillValues(
            chars,
            liberadoOrigins,
            { medicina: { manualMods: 0, manualBases: 40 } }, // minBase INT/3 = 30 -> +10 puntos = 0.5 PC
            { 'ciencia_1': { skillId: 'ciencia', specification: 'Física', manualMods: 0, manualBases: 40 } } // minBase INT/3 = 30 -> +10 puntos = 0.5 PC
        );
        expect(liberadoSpecialVals.standard.medicina.pcCost).toBeCloseTo(0.5);
        expect(liberadoSpecialVals.specified['ciencia_1'].pcCost).toBeCloseTo(0.5);
        expect(liberadoSpecialVals.totalPC).toBeCloseTo(1.0);

        const liberadoSpecialPC = calculateSpecialSkillsPCWithInt(
            { medicina: { isFree: false, manualBases: 40 } },
            { 'ciencia_1': { skillId: 'ciencia', isFree: false, manualBases: 40, specification: 'Física' } },
            liberadoOrigins,
            chars
        );
        // 2 habilidades pagadas (2 * 0.5 = 1.0 PC) + 2 subidas de base de +10 puntos (2 * 0.5 = 1.0 PC) = 2.0 PC total
        expect(liberadoSpecialPC.totalPC).toBeCloseTo(2.0);
    });

    it('comprueba el acceso a la habilidad especial Magia según origen y dones de Liberado', () => {
        const magiaDef = SPECIAL_SKILLS.find(s => s.id === 'magia');
        expect(magiaDef).toBeDefined();

        // 1. Origen Arcano siempre tiene acceso
        expect(isSkillAllowed(magiaDef, [{ Arcano: [] }])).toBe(true);

        // 2. Origen Sobrenatural -> Poseído tiene acceso
        expect(isSkillAllowed(magiaDef, [{ Sobrenatural: ['Poseído'] }])).toBe(true);
        expect(isSkillAllowed(magiaDef, [{ Sobrenatural: ['Poseido'] }])).toBe(true);

        // 3. Origen sin magia ni don (ej. Mutante o Liberado sin don)
        expect(isSkillAllowed(magiaDef, [{ Mutante: [] }])).toBe(false);

        const liberadoSinDon = {
            origin: { items: [{ 'Liberado de Entropía': [] }] },
            liberadoParams: { gifts: ['comprension_senda'] }
        };
        expect(isSkillAllowed(magiaDef, liberadoSinDon.origin.items, liberadoSinDon)).toBe(false);

        // 4. Liberado con don 'conocimiento_esferas' (tanto con Sobrenatural como directo)
        const liberadoConDon = {
            origin: { items: [{ Sobrenatural: ['Liberado de Entropía'] }] },
            liberadoParams: { gifts: ['conocimiento_esferas'] }
        };
        expect(hasConocimientoEsferas(liberadoConDon)).toBe(true);
        expect(isSkillAllowed(magiaDef, liberadoConDon.origin.items, liberadoConDon)).toBe(true);

        // 5. Liberado de Unidad con don en gift (formato singular)
        const liberadoUnidad = {
            origin: { items: [{ 'Liberado de Unidad': [] }] },
            liberadoParams: { gift: 'conocimiento_esferas' }
        };
        expect(hasConocimientoEsferas(liberadoUnidad)).toBe(true);
        expect(isSkillAllowed(magiaDef, liberadoUnidad.origin.items, liberadoUnidad)).toBe(true);
    });

    it('calcula correctamente el ejemplo oficial de Nikos (Hombre Lobo Renegado = 70 PCs) y el cambio de forma activa', () => {
        // 1. Origen Hombre Lobo = 16 PCs
        const origins = [{ Sobrenatural: ['Hombre Lobo'] }];
        const originPC = calculateOriginCost(origins);
        expect(originPC).toBe(16);

        // 2. Casta Renegado = +9 PCs
        const castaPC = WEREWOLF_SUBTYPES.renegado.cost;
        expect(castaPC).toBe(9);

        // 3. Características Forma Humana de Nikos: FUE 40, CON 40, AGI 60, INT 70, PER 40, APA 40, VOL 60 = 35 PCs
        const humanBreakdown = {
            fuerza: { base: 40, powerMod: 0 },
            constitucion: { base: 40, powerMod: 0 },
            agilidad: { base: 60, powerMod: 0 },
            inteligencia: { base: 70, powerMod: 0 },
            percepcion: { base: 40, powerMod: 0 },
            apariencia: { base: 40, powerMod: 0 },
            voluntad: { base: 60, powerMod: 0 }
        };
        const { totalPC: humanPC } = calculateCreationPoints(humanBreakdown, origins);
        expect(humanPC).toBe(35);

        // 4. Características Forma de Transición de Nikos (Renegado):
        // FUE 130 (Base 100 + 30 -> 3 PC), CON 130 (Base 100 + 30 -> 3 PC), AGI 120 (Base 100 + 20 -> 2 PC),
        // INT 40 (Base 40 + 0 -> 0 PC), PER 120 (Base 100 + 20 -> 2 PC), APA 20 (Base 20 + 0 -> 0 PC), VOL 60 (fija humana -> 0 PC)
        const transitionForm = buildWerewolfTransitionForm('renegado', 60, {
            id: 'werewolf_transition',
            name: 'Forma de Transición (Renegado)',
            source: 'Hombre Lobo',
            subtype: 'renegado',
            cost: 0,
            attributes: {
                values: {
                    Fuerza: 130,
                    Constitución: 130,
                    Agilidad: 120,
                    Inteligencia: 40,
                    Percepción: 120,
                    Apariencia: 20,
                    Voluntad: 60
                }
            }
        });
        expect(transitionForm.cost).toBe(10);

        // Total exacto del ejemplo del manual: 16 + 9 + 35 + 10 = 70 PCs
        expect(originPC + castaPC + humanPC + transitionForm.cost).toBe(70);

        // 5. Poderes innatos gratuitos para Puro, Híbrido y Renegado
        const puroPowers = syncWerewolfState({
            origin: { items: origins },
            werewolfParams: { subtype: 'puro' },
            attributes: { values: { Voluntad: 60 } },
            powers: { selected: [] },
            forms: []
        });
        expect(puroPowers?.powers.selected.length).toBe(5);
        expect(getPowerCostConfig({ id: 'empatia_animal' }, { id: 'empatia_animal', rank: 21, isWerewolfInnate: true } as any, { isHombreLobo: true, werewolfSubtype: 'puro' } as any).freeRank).toBe(21);
        expect(getPowerCostConfig({ id: 'donacion_de_vida' }, { id: 'donacion_de_vida', rank: 41, isWerewolfInnate: true } as any, { isHombreLobo: true, werewolfSubtype: 'puro' } as any).freeRank).toBe(41);
        expect(getPowerCostConfig({ id: 'regeneracion_de_tejidos' }, { id: 'regeneracion_de_tejidos', rank: 71, isWerewolfInnate: true } as any, { isHombreLobo: true, werewolfSubtype: 'renegado' } as any).freeRank).toBe(71);

        // 6. Cambio de forma activa recalcula características y estadísticas derivadas en tiempo real
        const nikosChar = {
            name: 'Nikos',
            origin: { items: origins },
            attributes: {
                values: {
                    Fuerza: 40,
                    Constitución: 40,
                    Agilidad: 60,
                    Inteligencia: 70,
                    Percepción: 40,
                    Apariencia: 40,
                    Voluntad: 60
                }
            },
            forms: [transitionForm],
            skills: {}
        };
        const activeBase = getCharacterForActiveForm(nikosChar, 'base');
        expect(activeBase.attributes.values.Fuerza).toBe(40);

        const activeTransition = getCharacterForActiveForm(nikosChar, 'werewolf_transition');
        expect(activeTransition.attributes.values.Fuerza).toBe(130);
        // En Forma de Transición (CON 130): PV = 130 - 35 = 95
        expect(activeTransition.combatstats['Puntos de Vida'].total).toBe(95);

        // 7. Multiorigen / Especialización: hereda originMod, specialtyMod y powerMod de la Forma Humana
        const multioriginBreakdown = {
            fuerza: { base: 60, originMod: 20, specialtyMod: 0, powerMod: 10, otherMod: 0 },
            agilidad: { base: 60, originMod: 0, specialtyMod: 15, powerMod: 0, otherMod: 0 }
        };
        const multiForm = buildWerewolfTransitionForm('hibrido', 60, null, multioriginBreakdown);
        // Fuerza Híbrido: Base 100 + originMod 20 + powerMod 10 = 130 (Coste Transición: 0 PC porque Base = 100)
        expect(multiForm.attributes.breakdown?.fuerza.originMod).toBe(20);
        expect(multiForm.attributes.breakdown?.fuerza.powerMod).toBe(10);
        expect(multiForm.attributes.values.Fuerza).toBe(130);
        // Agilidad Híbrido: Base 100 + specialtyMod 15 = 115
        expect(multiForm.attributes.breakdown?.agilidad.specialtyMod).toBe(15);
        expect(multiForm.attributes.values.Agilidad).toBe(115);
        expect(multiForm.cost).toBe(0);
    });
});
