import { describe, it, expect } from 'vitest';
import {
    formatGeneralSkillItems,
    formatSpecialSkillItems,
    getCharacterOriginFlags
} from '../src/utils/characterCalculations';

describe('Habilidades - Formateo y Flags de Paso 3/4', () => {
    it('formatea correctamente las habilidades generales incluyendo el idioma nativo', () => {
        const skillValues = {
            esconderse: { total: 45 },
            idioma: { total: 80 }
        };

        const formatted = formatGeneralSkillItems(skillValues, 'Español');
        expect(formatted).toHaveLength(2);

        const esconderse = formatted.find(i => i.name === 'Esconderse');
        expect(esconderse).toBeDefined();
        expect(esconderse?.value).toBe('45%');

        const idioma = formatted.find(i => i.name.includes('Español'));
        expect(idioma).toBeDefined();
        expect(idioma?.name).toBe('Idioma nativo (Español)');
        expect(idioma?.value).toBe('80%');
    });

    it('formatea correctamente las habilidades especiales estándar y especificadas', () => {
        const selected = {
            arcos: { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 }
        };
        const standardSpecial = {
            arcos: { total: 35 }
        };
        const specified = {
            ciencia_1: {
                skillId: 'ciencia',
                specification: 'Física Cuántica',
                isFree: false,
                isRequired: false,
                manualMods: 0,
                manualBases: 0
            }
        };
        const specifiedSpecial = {
            ciencia_1: { total: 60 }
        };

        const result = formatSpecialSkillItems(selected, standardSpecial, specified, specifiedSpecial);
        expect(result).toHaveLength(2);

        const arcos = result.find(i => i.name === 'Arcos / Ballestas');
        expect(arcos).toBeDefined();
        expect(arcos?.value).toBe('35%');

        const ciencia = result.find(i => i.name.includes('Física Cuántica'));
        expect(ciencia).toBeDefined();
        expect(ciencia?.name).toBe('Ciencia: Física Cuántica');
        expect(ciencia?.value).toBe('60%');
    });

    it('getCharacterOriginFlags genera correctamente los flags para alimentar PowersSection y MagicSection', () => {
        const charData = {
            origin: {
                items: [
                    { 'Sobrenatural': ['Hombre Lobo', 'Poseído'] },
                    { 'Arcano': ['Terrano'] }
                ]
            },
            spells: {
                emFormula: { divisor: 4, pcCost: 0 }
            }
        };

        const flags = getCharacterOriginFlags(charData);
        expect(flags.isHombreLobo).toBe(true);
        expect(flags.isPoseido).toBe(true);
        expect(flags.isTerrano).toBe(true);
        expect(flags.isMago).toBe(false);
        expect(flags.hasBaseEMOrigin).toBe(true);
        expect(flags.hasEMFormula).toBe(true);
        expect(flags.hasEM).toBe(true);
        expect(flags.hasAnyOrigin).toBe(true);
    });
});
