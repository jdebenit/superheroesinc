import { describe, it, expect } from 'vitest';
import { adaptWebCharacter } from '../src/utils/characterAdapter';
import { initialCharacterState } from '../src/data/wizardConfig';
import {
    calculateTotalCharacterPCs,
    calculateCharacterPCBreakdown,
    getCharacterForActiveForm,
    syncCharacterTransformations
} from '../src/utils/characterCalculations';
import { useCharacterSheetData } from '../src/components/character/hooks/useCharacterSheetData';

const createFullMockCharacter = (overrides: Record<string, any> = {}) => {
    return {
        ...JSON.parse(JSON.stringify(initialCharacterState)),
        ...overrides,
        attributes: {
            ...initialCharacterState.attributes,
            ...(overrides.attributes || {}),
            values: {
                ...initialCharacterState.attributes.values,
                ...(overrides.attributes?.values || {})
            },
            breakdown: {
                ...initialCharacterState.attributes.breakdown,
                ...(overrides.attributes?.breakdown || {})
            }
        },
        skills: {
            ...initialCharacterState.skills,
            ...(overrides.skills || {})
        },
        powers: {
            selected: [],
            ...(overrides.powers || {})
        },
        spells: {
            selected: [],
            ...(overrides.spells || {})
        }
    };
};

describe('Integración Round-Trip (Wizard -> JSON -> adaptWebCharacter -> Sheet)', () => {

    it('preserva exactamente PCs, desglose, formas y estadísticas de Nikos (Hombre Lobo Renegado = 70 PCs)', () => {
        const nikosOriginal = createFullMockCharacter({
            name: 'Nikos',
            alias: 'Nikos el Renegado',
            level: 1,
            origin: {
                items: [{ Sobrenatural: ['Hombre Lobo'] }]
            },
            werewolfParams: {
                subtype: 'renegado'
            },
            attributes: {
                values: {
                    Fuerza: 40,
                    Constitución: 40,
                    Agilidad: 60,
                    Inteligencia: 70,
                    Percepción: 40,
                    Apariencia: 40,
                    Voluntad: 60
                },
                breakdown: {
                    fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    agilidad: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    inteligencia: { base: 70, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    voluntad: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 }
                }
            },
            skills: {
                generalItems: [
                    { name: 'Comb. cuerpo a cuerpo', value: '50%', math: '(AGI+PER)/2' },
                    { name: 'Idioma nativo (Griego)', value: '70%', math: 'INT' }
                ],
                specialItems: [
                    { name: 'Supervivencia', value: '45%', math: 'INT' }
                ],
                nativeLanguage: 'Griego',
                selected: {
                    supervivencia: { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 }
                },
                specified: {}
            },
            powers: {
                selected: [
                    { id: 'multiformidad', rank: 1, origin: 'Hombre Lobo', isWerewolfInnate: true },
                    { id: 'regeneracion_de_tejidos', rank: 1, origin: 'Hombre Lobo', isWerewolfInnate: true },
                    { id: 'ataque_especial', rank: 1, origin: 'Hombre Lobo', isWerewolfInnate: true }
                ]
            },
            forms: [
                {
                    id: 'werewolf_transition',
                    name: 'Forma de Transición (Renegado)',
                    source: 'Hombre Lobo',
                    subtype: 'renegado',
                    cost: 10,
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
                    },
                    combatstats: {
                        'Puntos de Vida': { formula: 'CON-40', base: 90, total: 90 }
                    }
                }
            ]
        });

        // 1. Cálculo original
        const originalBreakdown = calculateCharacterPCBreakdown(nikosOriginal);
        const originalTotalPCs = calculateTotalCharacterPCs(nikosOriginal);
        expect(originalTotalPCs).toBe(70);

        // 2. Simulación de exportación a JSON (serialización pura)
        const jsonExported = JSON.parse(JSON.stringify(nikosOriginal));

        // 3. Simulación de re-importación mediante adaptWebCharacter
        const reimported = adaptWebCharacter(jsonExported);

        // 4. Verificación de invariancia en Puntos de Creación
        const reimportedBreakdown = calculateCharacterPCBreakdown(reimported);
        const reimportedTotalPCs = calculateTotalCharacterPCs(reimported);

        expect(reimportedTotalPCs).toBe(originalTotalPCs);
        expect(reimportedBreakdown.originCost).toBe(originalBreakdown.originCost);
        expect(reimportedBreakdown.attributesCost).toBe(originalBreakdown.attributesCost);
        expect(reimportedBreakdown.powersCost).toBe(originalBreakdown.powersCost);
        expect(reimportedBreakdown.formsCost).toBe(originalBreakdown.formsCost);

        // 5. Verificación de cálculo en Sheet en ambas formas (Humana y Transición)
        const syncedPatch = syncCharacterTransformations(reimported);
        const syncedReimported = syncedPatch ? { ...reimported, ...syncedPatch } : reimported;

        const humanSheetData = useCharacterSheetData(syncedReimported);
        expect(humanSheetData.combatStats.length).toBeGreaterThan(0);

        const transitionView = getCharacterForActiveForm(syncedReimported, 'werewolf_transition');
        const transitionSheetData = useCharacterSheetData(transitionView);
        expect(transitionView.attributes.values.Fuerza).toBe(130);
        expect(transitionSheetData.combatStats.length).toBeGreaterThan(0);
    });

    it('preserva configuración mágica, hechizos y tiradas de tabla de un Terrano/Poseído', () => {
        const terranoChar = createFullMockCharacter({
            name: 'Mago Terrano',
            origin: {
                items: [
                    { Arcano: ['Terrano'] },
                    { Sobrenatural: ['Poseído'] }
                ]
            },
            attributes: {
                values: {
                    Fuerza: 50,
                    Constitución: 50,
                    Agilidad: 50,
                    Inteligencia: 80,
                    Percepción: 60,
                    Apariencia: 50,
                    Voluntad: 70
                },
                breakdown: {
                    fuerza: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    constitucion: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    agilidad: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    inteligencia: { base: 80, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    percepcion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    apariencia: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    voluntad: { base: 70, originMod: 0, specialtyMod: 0, powerMod: 0 }
                }
            },
            spells: {
                emFormula: { divisor: 4, pcCost: 0 },
                selected: [
                    { id: 'abrir_portales', rank: 2 },
                    { id: 'animar_objetos', rank: 1 }
                ]
            },
            magicTableRolls: ['fuerza_astral', 'resistencia_elemental'],
            powers: {
                selected: [
                    { id: 'sentido_magico', rank: 1, origin: 'Guardian' }
                ]
            },
            poseidoParams: { formType: 'Forma Demoníaca' }
        });

        const originalTotalPCs = calculateTotalCharacterPCs(terranoChar);
        const originalBreakdown = calculateCharacterPCBreakdown(terranoChar);

        // Exportar a JSON e importar de vuelta
        const jsonExport = JSON.parse(JSON.stringify(terranoChar));
        const reimported = adaptWebCharacter(jsonExport);

        const reimportedTotalPCs = calculateTotalCharacterPCs(reimported);
        const reimportedBreakdown = calculateCharacterPCBreakdown(reimported);

        expect(reimportedTotalPCs).toBe(originalTotalPCs);
        expect(reimportedBreakdown.spellsCost).toBe(originalBreakdown.spellsCost);
        expect(reimportedBreakdown.originCost).toBe(originalBreakdown.originCost);
        expect(reimportedBreakdown.attributesCost).toBe(originalBreakdown.attributesCost);
        expect(reimported.spells.selected).toHaveLength(2);
        expect(reimported.spells.emFormula.divisor).toBe(4);

        const sheetData = useCharacterSheetData(reimported);
        expect(sheetData.spellsData.length).toBe(2);
    });

    it('preserva módulos tecnológicos, implantes cibernéticos y armadura de un Cyborg/Tecnológico', () => {
        const techChar = createFullMockCharacter({
            name: 'Cyber Enforcer',
            origin: {
                items: [
                    { 'Tecnológico': ['Cyborg', 'Tecnoarmadura'] }
                ]
            },
            attributes: {
                values: {
                    Fuerza: 60,
                    Constitución: 60,
                    Agilidad: 60,
                    Inteligencia: 70,
                    Percepción: 60,
                    Apariencia: 40,
                    Voluntad: 50
                },
                breakdown: {
                    fuerza: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    constitucion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    agilidad: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    inteligencia: { base: 70, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    percepcion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    voluntad: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 }
                }
            },
            techParams: { incomeSource: 'agencia_priv' },
            techModules: [
                { id: 'tm_1', definitionId: 'sistema_radar', name: 'Sistema Radar', location: 'Casco', pcCost: 3 },
                { id: 'tm_2', definitionId: 'propulsores', name: 'Propulsores', location: 'Botas', pcCost: 4 }
            ],
            cyborgImplants: [
                { id: 'cib_1', name: 'Brazo Biónico Reforzado', cost: 2, location: 'Brazo Derecho' }
            ],
            weapons: {
                items: [
                    { name: 'Rifle Láser', damage: '3d10', dxa: '5', car: '20' }
                ]
            }
        });

        const originalTotal = calculateTotalCharacterPCs(techChar);
        const originalBreakdown = calculateCharacterPCBreakdown(techChar);

        const jsonExport = JSON.parse(JSON.stringify(techChar));
        const reimported = adaptWebCharacter(jsonExport);

        const reimportedTotal = calculateTotalCharacterPCs(reimported);
        const reimportedBreakdown = calculateCharacterPCBreakdown(reimported);

        expect(reimportedTotal).toBe(originalTotal);
        expect(reimportedBreakdown.techCost).toBe(originalBreakdown.techCost);
        expect(reimportedBreakdown.attributesCost).toBe(originalBreakdown.attributesCost);
        expect(reimported.techModules).toHaveLength(2);
        expect(reimported.cyborgImplants).toHaveLength(1);

        const sheetData = useCharacterSheetData(reimported);
        expect(sheetData.techData.length).toBe(2);
        expect(sheetData.weaponsData.length).toBe(1);
    });

    it('garantiza idempotencia estricta tras múltiples ciclos sucesivos de exportación/importación (N-Trip Invariance)', () => {
        const initialChar = createFullMockCharacter({
            name: 'Heroe Multiciclo',
            origin: {
                items: [
                    { Mutante: [] },
                    { Vigilante: ['Artista Marcial'] }
                ]
            },
            attributes: {
                values: {
                    Fuerza: 55,
                    Constitución: 50,
                    Agilidad: 70,
                    Inteligencia: 50,
                    Percepción: 60,
                    Apariencia: 45,
                    Voluntad: 50
                },
                breakdown: {
                    fuerza: { base: 55, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    constitucion: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    agilidad: { base: 70, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    inteligencia: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    percepcion: { base: 60, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    apariencia: { base: 45, originMod: 0, specialtyMod: 0, powerMod: 0 },
                    voluntad: { base: 50, originMod: 0, specialtyMod: 0, powerMod: 0 }
                }
            },
            skills: {
                generalItems: [
                    { name: 'Comb. cuerpo a cuerpo', value: '65%', math: '(AGI+PER)/2' }
                ],
                specialItems: [
                    { name: 'Artes Marciales', value: '75%', math: 'AGI+5' }
                ],
                selected: {
                    artes_marciales: { isFree: true, isRequired: false, manualMods: 0, manualBases: 0 }
                },
                specified: {}
            },
            powers: {
                selected: [
                    { id: 'rayo_optico', rank: 30, origin: 'Mutante' }
                ]
            }
        });

        let current = initialChar;
        const baselineTotalPCs = calculateTotalCharacterPCs(initialChar);

        // Ejecutar 3 ciclos completos sucesivos: Objeto -> JSON -> adaptWebCharacter
        for (let cycle = 1; cycle <= 3; cycle++) {
            const exported = JSON.parse(JSON.stringify(current));
            current = adaptWebCharacter(exported);

            expect(calculateTotalCharacterPCs(current)).toBe(baselineTotalPCs);
            expect(current.powers.selected).toHaveLength(1);
            expect(current.skills.generalItems).toHaveLength(1);
            expect(current.skills.specialItems).toHaveLength(1);
        }
    });
});
