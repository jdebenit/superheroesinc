import { describe, it, expect } from 'vitest';
import { calculateProbability } from '../src/utils/combatLogic';
import { parseAndRollDice } from '../src/utils/diceLogic';
import { adaptWebCharacter } from '../src/utils/characterAdapter';

describe('Lógica de Combate y Probabilidad (combatLogic)', () => {
    const baseParams = {
        targetValue: 70,
        difficultyModifier: 0,
        customModifier: 0,
        situation: 'normal',
        distSituation: 'normal',
        range: 'short',
        coverage: 'none',
        targetParry: '20',
    };

    it('calcula probabilidad básica sumando dificultad y modificador personalizado', () => {
        const res = calculateProbability({
            ...baseParams,
            mode: 'basic',
            difficultyModifier: 10,
            customModifier: -5,
        });
        expect(res.finalProbability).toBe(75); // 70 + 10 - 5
    });

    it('calcula tirada enfrentada con la fórmula 50 + (Atacante - Defensor)', () => {
        const res = calculateProbability({
            ...baseParams,
            mode: 'opposed',
            targetValue: 80,
            opposedValue: 65,
        });
        expect(res.finalProbability).toBe(65); // 50 + (80 - 65)
    });

    it('calcula combate cuerpo a cuerpo descontando la parada del defensor', () => {
        const res = calculateProbability({
            ...baseParams,
            mode: 'combat',
            subMode: 'melee',
            targetValue: 80,
            targetParry: '25',
        });
        expect(res.effectiveParry).toBe(25);
        expect(res.finalProbability).toBe(55); // 80 - 25
    });
});

describe('Motor de Dados (diceLogic)', () => {
    it('parsea y ejecuta tiradas simples y con modificadores dentro de rango', () => {
        for (let i = 0; i < 20; i++) {
            const roll = parseAndRollDice('2d10+5');
            expect(roll).not.toBeNull();
            expect(roll!.total).toBeGreaterThanOrEqual(7);  // min 2 + 5
            expect(roll!.total).toBeLessThanOrEqual(25);    // max 20 + 5
            expect(roll!.detail).toContain('+5');
        }
    });

    it('devuelve null ante expresiones de dados inválidas', () => {
        expect(parseAndRollDice('invalido')).toBeNull();
        expect(parseAndRollDice('d100')).toBeNull();
    });
});

describe('Adaptador de Fichas Web (characterAdapter)', () => {
    it('normaliza estadísticas en formato array antiguo a objeto y corrige erratas de poderes/hechizos', () => {
        const legacyWebChar = {
            Sujeto: 'Hombre de Acero',
            combatstats: [
                'Acciones por asalto: 3',
                'Puntos de Vida: 85',
            ],
            skills: {
                items: [
                    { name: 'Comb. cuerpo a cuerpo', value: '75%', math: '60+15' },
                    { name: 'Artes Marciales', value: '80%', math: '50+30' },
                ],
            },
            powers: {
                items: [
                    { id: 'controldeenergiacinetica', rank: 50 },
                ],
            },
            spells: {
                items: [
                    { id: 'pesudopsi', rank: 'Maestria' },
                ],
            },
        };

        const adapted = adaptWebCharacter(legacyWebChar);

        expect(adapted.name).toBe('Hombre de Acero');
        expect(adapted.alias).toBe('Hombre de Acero');
        expect(adapted.combatstats['Acciones por asalto']).toBe('3');
        expect(adapted.combatstats['Puntos de Vida']).toBe('85');

        // Separa habilidades generales y especiales
        expect(adapted.skills.generalItems.length).toBe(1);
        expect(adapted.skills.generalItems[0].name).toBe('Comb. cuerpo a cuerpo');
        expect(adapted.skills.specialItems.length).toBe(1);
        expect(adapted.skills.specialItems[0].name).toBe('Artes Marciales');

        // Corrige errata de poder ("controldeenergiacinetica" -> "control_de_energia" con opción "Cinética")
        expect(adapted.powers.selected[0].id).toBe('control_de_energia');
        expect(adapted.powers.selected[0].selectedOption).toBe('Cinética');

        // Corrige errata de hechizo ("pesudopsi" -> "pseudo_psi")
        expect(adapted.spells.selected[0].id).toBe('pseudo_psi');
    });
});
