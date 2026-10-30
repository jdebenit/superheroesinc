import { describe, it, expect } from 'vitest';
import {
    calculateCharacterPCBreakdown,
    calculateTotalCharacterPCs
} from '../src/utils/calculations/pcCalculations';
import { buildWerewolfTransitionForm } from '../src/data/werewolfOptions';
import { EXOSKELETON_CONFIGS } from '../src/data/exoskeletonConfigs';
import { EXOSKELETON_ARMOR_CONFIGS } from '../src/data/exoskeletonArmorConfigs';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../src/data/technoSuitStrengthConfigs';
import { CYBORG_IMPLANT_STATS, CYBORG_IMPLANT_STRENGTHS } from '../src/data/cyborgImplantConfigs';
import { INCOME_SOURCES } from '../src/data/technologicalOptions';
import { SEQUELS } from '../src/data/sequels';
import { GUARDIAN_QUALITIES } from '../src/data/guardianOptions';
import { DIVINE_FOCUS_OPTIONS } from '../src/data/divineOptions';

describe('Motor Puro de Puntos de Creación (pcCalculations)', () => {
    it('devuelve 0 en todos los apartados para un personaje nulo o vacío', () => {
        const empty = calculateCharacterPCBreakdown(null);
        expect(empty.total).toBe(0);
        expect(empty.origin).toBe(0);
    });

    it('calcula el desglose completo de Nikos (Hombre Lobo Renegado = 70 PCs) mediante calculateCharacterPCBreakdown', () => {
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

        const nikos = {
            origin: { items: [{ Sobrenatural: ['Hombre Lobo'] }] },
            werewolfParams: { subtype: 'renegado' },
            attributes: {
                breakdown: {
                    fuerza: { base: 40, powerMod: 0 },
                    constitucion: { base: 40, powerMod: 0 },
                    agilidad: { base: 60, powerMod: 0 },
                    inteligencia: { base: 70, powerMod: 0 },
                    percepcion: { base: 40, powerMod: 0 },
                    apariencia: { base: 40, powerMod: 0 },
                    voluntad: { base: 60, powerMod: 0 }
                }
            },
            background: { prejudiceResistance: 50 },
            forms: [transitionForm]
        };

        const breakdown = calculateCharacterPCBreakdown(nikos);
        expect(breakdown.origin).toBe(16);
        expect(breakdown.originSpecials).toBe(9);
        expect(breakdown.characteristics).toBe(35);
        expect(breakdown.forms).toBe(10);
        expect(breakdown.total).toBe(70);
        expect(calculateTotalCharacterPCs(nikos)).toBe(70);
    });

    it('calcula correctamente penalizaciones y descuentos de Alterado, Mutante e Híbrido mitológico', () => {
        const firstSequel = SEQUELS[0];

        // Alterado sin secuelas -> +2 PC de penalización
        const alteradoSinSecuelas = {
            origin: { items: [{ Alterado: [] }] },
            alteradoParams: { agent: null, sequels: [] },
            background: { prejudiceResistance: 50 }
        };
        expect(calculateCharacterPCBreakdown(alteradoSinSecuelas).originSpecials).toBe(2);

        // Alterado con agente 'treatment' (-2 PC descuento) y una secuela
        const alteradoConSecuela = {
            origin: { items: [{ Alterado: [] }] },
            alteradoParams: { agent: 'treatment', sequels: [{ id: firstSequel.id }] },
            background: { prejudiceResistance: 50 }
        };
        expect(calculateCharacterPCBreakdown(alteradoConSecuela).originSpecials).toBe(-(2 + firstSequel.cost));

        // Híbrido mitológico sin secuelas -> +2 PC de penalización
        const hibridoSinSecuelas = {
            origin: { items: [{ Arcano: ['Híbrido mitológico'] }] },
            hibridoParams: { sequels: [] },
            background: { prejudiceResistance: 50 }
        };
        expect(calculateCharacterPCBreakdown(hibridoSinSecuelas).originSpecials).toBe(2);
    });

    it('calcula correctamente costes tecnológicos, módulos, implantes, armas y equipo', () => {
        const exo = EXOSKELETON_CONFIGS[0];
        const armor = EXOSKELETON_ARMOR_CONFIGS[0];
        const str = TECHNOSUIT_STRENGTH_CONFIGS[0];
        const impStat = CYBORG_IMPLANT_STATS[0];
        const impStr = CYBORG_IMPLANT_STRENGTHS[0];
        const income = INCOME_SOURCES[0];

        const techChar = {
            origin: { items: [{ 'Tecnológico': ['Cyborg', 'Tecnoarmadura', 'Exoesqueleto Energético'] }] },
            techParams: { incomeSource: income.id },
            exoskeletonConfig: exo.id,
            exoskeletonArmorConfig: armor.id,
            technoSuitStrengthConfig: str.id,
            cyborgImplants: [{ id: '1', name: 'Brazo', statConfigId: impStat.id, strengthConfigId: impStr.id }],
            techModules: [{ id: 'm1', definitionId: 'd1', name: 'Módulo', location: 'Brazo', pcCost: 3 }],
            weapons: { items: [{ name: 'Rifle', cost: '2' }] },
            equipment: { items: [{ name: 'Kit', cost: '1' }] },
            artifacts: { items: [{ name: 'Orbe', cost: '4' }] },
            varios: { items: [{ name: 'Extra', cost: '1.5' }] },
            background: { prejudiceResistance: 50 }
        };

        const breakdown = calculateCharacterPCBreakdown(techChar);
        const expectedTech =
            income.pc +
            exo.pcCost +
            armor.pcCost +
            str.pcCost +
            impStat.pcCost +
            impStr.pcCost +
            3 + 2 + 1 + 4 + 1.5;

        expect(breakdown.techAndEquipment).toBeCloseTo(expectedTech);
    });

    it('calcula correctamente parámetros especiales de Ente, Maldito, Poseído, Guardián, Divino, Liberado y Terrano', () => {
        const quality = GUARDIAN_QUALITIES[0];
        const focus = DIVINE_FOCUS_OPTIONS[0];

        const specialChar = {
            origin: { items: [{ Arcano: ['Terrano'] }] },
            enteParams: { formType: 'animal_minor', visualEffect: 'hidden' }, // -1 + 2 = +1
            malditoParams: { magnitude: 'marked' }, // +5
            poseidoParams: { formType: 'humano' }, // +3
            guardianParams: { quality: quality.id },
            divineParams: { focus: focus.id },
            liberadoParams: { gifts: ['conocimiento_esferas', 'comprension_senda'] }, // 1 + 2 = +3
            spells: {
                emFormula: { divisor: 0, pcCost: -5 },
                selected: []
            },
            magicTableRolls: ['guardian_power', '60_EM'], // +2 - 1 = +1
            background: { prejudiceResistance: 50 }
        };

        const breakdown = calculateCharacterPCBreakdown(specialChar);
        expect(breakdown.magic).toBe(-5 + 2 - 1); // -4
        expect(breakdown.originSpecials).toBe(-1 + 2 + 5 + 3 + quality.cost + focus.cost + 3);
    });
});
