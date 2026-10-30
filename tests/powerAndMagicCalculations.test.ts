import { describe, it, expect } from 'vitest';
import {
    normalizePowerId,
    findPowerByNameOrId,
    normalizeCharacterPowers,
    getRankLevel,
    getPowerCostConfig,
    getBaseCostAdjustment,
    calculatePowerBaseCost,
    getMutantPowerTypes,
    getMutantType,
    isPowerCrossType,
    getPowerPenalty,
    calculateTotalPowersPC,
    formatPowersForDisplay
} from '../src/utils/calculations/powerCalculations';
import {
    normalizeSpellId,
    findSpellByNameOrId,
    parseSpellRank,
    extractSpellOption,
    normalizeCharacterSpells,
    calculateEM,
    getCharacterMaxEM,
    calculateSelectedSpellsEMCost,
    formatSpellsForDisplay,
    getEMFormulaOptions
} from '../src/utils/calculations/magicCalculations';
import { useMagicSectionLogic } from '../src/components/wizard/steps/Step3_Especials/hooks/useMagicSectionLogic';

describe('Power Calculations & Normalization', () => {
    it('normaliza IDs y resuelve erratas de poderes', () => {
        expect(normalizePowerId('Emisión de Energía Mágica')).toBe('emisiondeenergiamagica');

        const errataPower = findPowerByNameOrId('Control de la Energía Cinética');
        expect(errataPower).toBeDefined();
        expect(errataPower?.id).toBe('control_de_energia');

        const adapted = normalizeCharacterPowers({
            items: [
                { name: 'Control de la Energía Cinética', rank: 30, value: '65%' },
                { name: 'Superfuerza', value: '+40' }
            ]
        });
        expect(adapted).toHaveLength(2);
        expect(adapted[0].id).toBe('control_de_energia');
        expect(adapted[0].selectedOption).toBe('Cinética');
        expect(adapted[0].skillValue).toBe(65);
        expect(adapted[1].id).toBe('superfuerza');
        expect(adapted[1].powerMod).toBe(40);
    });

    it('calcula niveles de rango de poder', () => {
        expect(getRankLevel(10)).toBe('Bajo');
        expect(getRankLevel(35)).toBe('Medio');
        expect(getRankLevel(60)).toBe('Elevado');
        expect(getRankLevel(85)).toBe('Alto');
        expect(getRankLevel(99)).toBe('Cósmico');
    });

    it('detecta tipos de poder mutante y penalizaciones por otro tipo u otro origen', () => {
        const mutantePsiquico = { origin: { items: [{ Mutante: ['Psíquico'] }] } };
        expect(getMutantType(mutantePsiquico)).toBe('Psíquico');
        expect(getMutantPowerTypes(mutantePsiquico)).toEqual(['Psíquico']);
        expect(isPowerCrossType(mutantePsiquico, 'superfuerza')).toBe(true);

        const superfuerza = findPowerByNameOrId('superfuerza')!;
        expect(getPowerPenalty(mutantePsiquico, superfuerza)).toEqual({
            cost: 2,
            label: '+2 PC (Otro tipo)',
            type: 'cross-type'
        });

        // Divino sin alteración física vs con alteración física descrita
        const divinoSinAlt = {
            origin: { items: [{ Divino: ['Semidios'] }] },
            divineParams: { hasPhysicalAlteration: false }
        };
        const divinoConAlt = {
            origin: { items: [{ Divino: ['Semidios'] }] },
            divineParams: { hasPhysicalAlteration: true, physicalAlterationDescription: 'Piel de bronce' }
        };
        const nonDivinoPower = { id: 'custom', origins: ['Mutante'] };
        expect(getPowerPenalty(divinoSinAlt, nonDivinoPower).cost).toBe(3);
        expect(getPowerPenalty(divinoConAlt, nonDivinoPower).cost).toBe(0);
    });

    it('calcula rangos gratuitos, descuentos Thals/Semidemonio y coste total de poderes en PC', () => {
        const volar = findPowerByNameOrId('volar')!;
        const grifoConfig = getPowerCostConfig(volar, { id: 'volar', origin: 'Arcano', rank: 11 }, { isGrifo: true });
        expect(grifoConfig.freeRank).toBe(11);
        expect(calculatePowerBaseCost(volar, { id: 'volar', origin: 'Arcano', rank: 11 }, { isGrifo: true }, { type: 'none', cost: 0 })).toBe(-1.1);

        // Thals: 1er poder base gratis, 2º poder -2 PC en base
        const thalsChar = {
            origin: { items: [{ Parahumano: ['Thals'] }] },
            attributes: { values: { Fuerza: 60, Agilidad: 60, Constitución: 60, Inteligencia: 60, Percepción: 60, Voluntad: 60, Apariencia: 60 } },
            powers: {
                selected: [
                    { id: 'volar', origin: 'Thals', rank: 10 }, // Base 0 + 1.0 rango = 1.0 PC
                    { id: 'telepatia', origin: 'Thals', rank: 10 } // Base max(0, cost-2) + 1.0 rango
                ]
            }
        };
        const telepatia = findPowerByNameOrId('telepatia')!;
        const expectedSecondBase = Math.max(0, telepatia.cost - 2);
        expect(calculateTotalPowersPC(thalsChar)).toBeCloseTo(1.0 + expectedSecondBase + 1.0);
    });

    it('formatea poderes para visualización en ficha y PDF', () => {
        const char = {
            attributes: { values: { Fuerza: 60, Agilidad: 60, Constitución: 60, Inteligencia: 60, Percepción: 60, Voluntad: 60, Apariencia: 60 } },
            powers: {
                selected: [
                    {
                        id: 'control_de_energia',
                        selectedOption: 'Cinética',
                        rank: 25,
                        skillValue: 50,
                        customizations: [{ id: '1', description: 'Alcance extra', cost: 1 }]
                    }
                ]
            }
        };
        const formatted = formatPowersForDisplay(char);
        expect(formatted).toHaveLength(1);
        expect(formatted[0].name).toContain('Control de energía (Cinética)');
        expect(formatted[0].name).toContain('[Alcance extra (+1)]');
        expect(formatted[0].rank).toBe('Medio (25)');
    });
});

describe('Magic Calculations & Normalization', () => {
    it('normaliza IDs, resuelve erratas de hechizos y extrae opciones entre paréntesis', () => {
        expect(normalizeSpellId('Proyección Astral')).toBe('proyeccionastral');

        const errataSpell = findSpellByNameOrId('pesudopsi');
        expect(errataSpell).toBeDefined();
        expect(errataSpell?.id).toBe('pseudo_psi');

        const withOption = findSpellByNameOrId('Invocar Elemento (Clima)');
        expect(withOption).toBeDefined();
        expect(extractSpellOption('Invocar Elemento (Clima)', withOption)).toBeTruthy();

        expect(parseSpellRank('Maestría', 5)).toBe(5);
        expect(parseSpellRank('Rango 3', 5)).toBe(3);

        const normalized = normalizeCharacterSpells({
            items: [
                { name: 'pesudopsi', rank: 'Maestría' },
                { name: 'Cadenas del Tártaro', rank: '2' }
            ]
        });
        expect(normalized).toHaveLength(2);
        expect(normalized[0].id).toBe('pseudo_psi');
        expect(normalized[1].id).toBe('cadenas_del_tartaro');
        expect(normalized[1].rank).toBe(2);
    });

    it('calcula Energía Mágica (EM) incluyendo Semidemonio, modificadores de poder y nivel', () => {
        const baseChar = {
            level: 2,
            origin: { items: [{ Arcano: ['Mago'] }] },
            attributes: {
                values: { Inteligencia: 80, Percepción: 60, Voluntad: 60, Constitución: 100 }
            }
        };
        // (80 + 60 + 60) / 1 * 2 = 400
        expect(calculateEM(baseChar, [], 1)).toBe(400);

        // Semidemonio suma Constitución: (80 + 60 + 60 + 100) / 2 * 1 = 150
        const semidemonioChar = {
            level: 1,
            origin: { items: [{ Sobrenatural: ['Semidemonio'] }] },
            attributes: {
                values: { Inteligencia: 80, Percepción: 60, Voluntad: 60, Constitución: 100 }
            }
        };
        expect(calculateEM(semidemonioChar, [], 2)).toBe(150);
    });

    it('calcula coste de hechizos y los formatea para la ficha', () => {
        const char = {
            spells: {
                selected: [
                    { id: 'cadenas_del_tartaro', rank: 2, selectedOption: '' }
                ]
            }
        };
        const spellDef = findSpellByNameOrId('cadenas_del_tartaro')!;
        const expectedCost = (parseInt(spellDef.cost, 10) || 0) * 2;
        expect(calculateSelectedSpellsEMCost(char.spells.selected)).toBe(expectedCost);

        const formatted = formatSpellsForDisplay(char);
        expect(formatted).toHaveLength(1);
        expect(formatted[0].name).toBe(spellDef.name);
        expect(formatted[0].cost).toBe(String(expectedCost));
    });

    it('combina todas las opciones de fórmula de EM al mezclar Poseído, Híbrido mitológico y Terrano', () => {
        const options = getEMFormulaOptions({
            isPoseido: true,
            isHibrido: true,
            isTerrano: true,
            isDotado: false
        });
        const ids = options.map(o => o.id);
        // Debe incluir las opciones de Híbrido (2|15, 3|10, 4|7, 0|0), Terrano (4|0, 0|-5) y Poseído (2|3, 0|0)
        expect(ids).toContain('2|15');
        expect(ids).toContain('3|10');
        expect(ids).toContain('4|7');
        expect(ids).toContain('4|0');
        expect(ids).toContain('0|-5');
        expect(ids).toContain('2|3');
        expect(ids).toContain('0|0');

        const logic = useMagicSectionLogic({
            data: { attributes: { values: { Inteligencia: 60, Percepción: 60, Voluntad: 60 } } },
            selectedSpells: [],
            selectedPowers: [],
            emFormula: { divisor: 2, pcCost: 3 },
            isMago: false,
            isDotado: false,
            isHibrido: true,
            isTerrano: true,
            isPoseido: true
        });
        expect(logic.emFormulaOptions.length).toBe(7);
        expect(logic.maxEM).toBe(90); // (60+60+60)/2

        // Si el divisor es 0 (ej. Terrano Ajeno o No EM), getCharacterMaxEM debe devolver 0 y no usar fallback a 1 ni 4
        const charZeroDiv = {
            origin: { items: [{ Arcano: ['Terrano'] }, { Sobrenatural: ['Poseído'] }] },
            attributes: { values: { Inteligencia: 60, Percepción: 60, Voluntad: 60 } },
            spells: { emFormula: { divisor: 0, pcCost: -5 } }
        };
        expect(getCharacterMaxEM(charZeroDiv)).toBe(0);
    });
});
