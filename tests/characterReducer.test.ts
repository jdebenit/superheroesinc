import { describe, it, expect } from 'vitest';
import { characterReducer } from '../src/utils/characterReducer';
import { initialCharacterState } from '../src/data/wizardConfig';
import { WEREWOLF_TRANSITION_FORM_ID, BLINDAJE_NATURAL_FORM_ID } from '../src/data/werewolfOptions';
import { buildManualStatUpdate } from '../src/utils/characterCalculations';

describe('characterReducer', () => {
    it('returns initial state if none provided', () => {
        const state = characterReducer(undefined as any, { type: 'RESET_CHARACTER' });
        expect(state).toBeDefined();
        expect(state.name).toBe(initialCharacterState.name);
    });

    it('handles RESET_CHARACTER cleanly', () => {
        const modified = { ...initialCharacterState, name: 'Modificado' };
        const state = characterReducer(modified as any, { type: 'RESET_CHARACTER' });
        expect(state.name).toBe(initialCharacterState.name);
    });

    it('handles APPLY_PATCH for basic fields', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'APPLY_PATCH',
            payload: { name: 'Logan', alias: 'Wolverine' }
        });
        expect(state.name).toBe('Logan');
        expect(state.alias).toBe('Wolverine');
    });

    it('handles APPLY_PATCH with function payload (functional updater)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'APPLY_PATCH',
            payload: ((prev: any) => ({ name: `${prev.name || ''} Updated` })) as any
        });
        expect(state.name).toContain('Updated');
    });

    it('handles UPDATE_IDENTITY', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_IDENTITY',
            payload: { name: 'Peter Parker', alias: 'Spider-Man', profession: 'Fotógrafo' }
        });
        expect(state.name).toBe('Peter Parker');
        expect(state.alias).toBe('Spider-Man');
        expect(state.profession).toBe('Fotógrafo');
    });

    it('handles UPDATE_LEVEL', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_LEVEL',
            payload: { level: 3, modPerLevel: 2 }
        });
        expect(state.level).toBe(3);
        expect(state.modPerLevel).toBe(2);
    });

    it('handles SET_ORIGINS and automatically synchronizes Werewolf transformation', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_ORIGINS',
            payload: [
                { 'Sobrenatural': ['Hombre Lobo'] }
            ]
        });

        expect(state.origin.items).toHaveLength(1);
        expect(state.forms).toBeDefined();
        const wolfForm = state.forms?.find((f: any) => f.id === WEREWOLF_TRANSITION_FORM_ID);
        expect(wolfForm).toBeDefined();
        expect(wolfForm?.cost).toBe(0); // Coste de la forma de transición licántropa es 0
        expect(state.werewolfParams?.subtype).toBe('hibrido');
    });

    it('handles UPDATE_POWERS and auto-syncs power transformations', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_POWERS',
            payload: {
                selected: [
                    {
                        id: 'blindaje_natural',
                        name: 'Blindaje Natural',
                        rank: 21,
                        cost: 15
                    }
                ]
            }
        });

        expect(state.powers.selected).toHaveLength(1);
        const combatForm = state.forms?.find((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID);
        expect(combatForm).toBeDefined();
        expect(combatForm?.name).toContain('Blindaje Natural');
    });

    it('removes transformation form if power is removed', () => {
        // First add power
        const withPower = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_POWERS',
            payload: {
                selected: [
                    {
                        id: 'blindaje_natural',
                        name: 'Blindaje Natural',
                        rank: 21,
                        cost: 15
                    }
                ]
            }
        });
        expect(withPower.forms?.some((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID)).toBe(true);

        // Then remove power
        const withoutPower = characterReducer(withPower, {
            type: 'UPDATE_POWERS',
            payload: { selected: [] }
        });
        expect(withoutPower.forms?.some((f: any) => f.id === BLINDAJE_NATURAL_FORM_ID)).toBe(false);
    });

    it('handles SET_CHARACTER with merge and migration of manualBonuses', () => {
        const oldSave = {
            name: 'Viejo Personaje',
            attributes: {
                values: { Fuerza: 14 }
                // no manualBonuses
            }
        };

        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_CHARACTER',
            payload: oldSave
        });

        expect(state.name).toBe('Viejo Personaje');
        expect(state.attributes?.values?.Fuerza).toBe(14);
        expect(state.attributes?.manualBonuses).toBeDefined();
        expect(state.attributes?.manualBonuses?.Fuerza).toBe(0);
    });

    it('handles SET_ORIGINS and automatically synchronizes innate origin powers synchronously', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_ORIGINS',
            payload: [
                { 'Parahumano': ['Atlante'] }
            ]
        });

        expect(state.origin.items).toHaveLength(1);
        expect(state.powers?.selected).toBeDefined();

        const powerIds = state.powers.selected.map((p: any) => `${p.id}${p.selectedOption ? ':' + p.selectedOption : ''}`);
        expect(powerIds).toContain('control_del_agua');
        expect(powerIds).toContain('superhabilidad:Idioma nativo');
        expect(powerIds).toContain('superhabilidad:Nadar');
        expect(powerIds).toContain('empatia_animal');
    });

    it('handles UPDATE_POWERS and automatically updates attributes with power characteristic mods (powerMod)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_POWERS',
            payload: {
                selected: [
                    {
                        id: 'superfuerza',
                        origin: 'Mutante',
                        powerMod: 40
                    }
                ]
            }
        });

        expect(state.powers.selected).toHaveLength(1);
        expect(state.attributes?.breakdown?.fuerza.powerMod).toBe(40);
        // Base de fuerza es 40 + 40 = 80
        expect(state.attributes?.values?.Fuerza).toBe(80);
    });

    it('handles UPDATE_ORIGIN_PARAMS and preserves changes', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_ORIGIN_PARAMS',
            payload: {
                liberadoParams: { gift: 'comprension_senda' }
            }
        });
        expect(state.liberadoParams?.gift).toBe('comprension_senda');
    });

    it('handles UPDATE_ATTRIBUTES with values, breakdown, manualBonuses and cost', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_ATTRIBUTES',
            payload: {
                values: { Fuerza: 55 },
                manualBonuses: { Fuerza: 10 },
                cost: 15
            }
        });
        expect(state.attributes.values.Fuerza).toBe(55);
        expect(state.attributes.manualBonuses?.Fuerza).toBe(10);
        expect(state.attributes.cost).toBe(15);
    });

    it('handles UPDATE_SKILLS', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_SKILLS',
            payload: {
                selected: { armas_cortas: { isFree: true } }
            }
        });
        expect(state.skills.selected.armas_cortas.isFree).toBe(true);
    });

    it('handles UPDATE_SPELLS', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_SPELLS',
            payload: {
                selected: [{ id: 'bola_de_fuego', rank: 2 }],
                emFormula: { divisor: 2, pcCost: 10 },
                magicTableRolls: ['Grimorio Ancestral']
            }
        });
        expect(state.spells.selected).toHaveLength(1);
        expect(state.spells.emFormula?.divisor).toBe(2);
        expect(state.magicTableRolls).toHaveLength(1);
    });

    it('handles UPDATE_TECH', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_TECH',
            payload: {
                techModules: [{ id: 'radar', name: 'Radar Integrado', definitionId: 'radar', location: 'cabeza', pcCost: 2 }],
                techParams: { energySource: 'Reactor de Fusión' },
                exoskeletonConfig: 'Ligero',
                cyborgImplants: [{ name: 'Ojo Biónico' }] as any
            }
        });
        expect(state.techModules).toHaveLength(1);
        expect(state.techParams?.energySource).toBe('Reactor de Fusión');
        expect(state.exoskeletonConfig).toBe('Ligero');
        expect(state.cyborgImplants).toHaveLength(1);
    });

    it('handles UPDATE_BACKGROUND', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_BACKGROUND',
            payload: {
                socialStatus: 'Clase Alta',
                economicStatus: 'Acomodado'
            }
        });
        expect(state.background.socialStatus).toBe('Clase Alta');
        expect(state.background.economicStatus).toBe('Acomodado');
    });

    it('handles UPDATE_EQUIPMENT', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_EQUIPMENT',
            payload: {
                equipment: { items: [{ name: 'Ganzúa' }] },
                weapons: { items: [{ name: 'Katana' }] },
                artifacts: { items: [{ name: 'Amuleto' }] },
                vehicles: { items: [{ name: 'Moto' }] },
                varios: { items: ['Notas de equipo'] }
            }
        });
        expect(state.equipment.items).toHaveLength(1);
        expect(state.weapons.items).toHaveLength(1);
        expect(state.artifacts.items).toHaveLength(1);
        expect(state.vehicles.items).toHaveLength(1);
        expect(state.varios.items).toHaveLength(1);
    });

    it('handles UPDATE_UI_STATE and SYNC_TRANSFORMATIONS', () => {
        const stateWithUi = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_UI_STATE',
            payload: { activeTab: 'stats' }
        });
        expect(stateWithUi.uiState?.activeTab).toBe('stats');

        const stateSynced = characterReducer(stateWithUi, {
            type: 'SYNC_TRANSFORMATIONS'
        });
        expect(stateSynced).toBeDefined();
    });

    it('handles edge cases (null payloads, unknown actions, default fallback)', () => {
        // SET_CHARACTER con payload null
        const stateSetNull = characterReducer(initialCharacterState as any, {
            type: 'SET_CHARACTER',
            payload: null
        });
        expect(stateSetNull).toBe(initialCharacterState);

        // APPLY_PATCH con payload null o inválido
        const statePatchNull = characterReducer(initialCharacterState as any, {
            type: 'APPLY_PATCH',
            payload: null as any
        });
        expect(statePatchNull).toBe(initialCharacterState);

        // Acción desconocida (default)
        const stateDefault = characterReducer(initialCharacterState as any, {
            type: 'UNKNOWN_ACTION' as any
        });
        expect(stateDefault).toBe(initialCharacterState);
    });

    it('sincroniza automáticamente habilidades gratuitas y obligatorias al cambiar de origen (Punto 1)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_ORIGINS',
            payload: [
                { 'Parahumano': ['Tes-khar'] },
                { 'Vigilante': ['Artista Marcial', 'Arquero', 'Manipulador'] }
            ]
        });

        // Tes-khar otorga trampas y farmacologia gratis
        expect(state.skills.selected.trampas?.isFree).toBe(true);
        expect(state.skills.selected.farmacologia?.isFree).toBe(true);

        // Artista Marcial obliga a artes_marciales y Arquero a arcos
        expect(state.skills.selected.artes_marciales?.isRequired).toBe(true);
        expect(state.skills.selected.arcos?.isRequired).toBe(true);

        // Manipulador obliga a otro_idioma (habilidad especificada)
        const requiredLang = Object.values(state.skills.specified).find((s: any) => s.skillId === 'otro_idioma');
        expect(requiredLang).toBeDefined();
        expect(requiredLang?.isRequired).toBe(true);

        // Si se quita el origen Vigilante:
        // - artes_marciales se limpia por completo (es exclusiva de Artista Marcial)
        // - arcos permanece pero con isRequired: false
        const stateWithoutVigilante = characterReducer(state, {
            type: 'SET_ORIGINS',
            payload: [{ 'Parahumano': ['Tes-khar'] }]
        });
        expect(stateWithoutVigilante.skills.selected.artes_marciales).toBeUndefined();
        expect(stateWithoutVigilante.skills.selected.arcos?.isRequired).toBe(false);
    });

    it('sincroniza automáticamente la fórmula de Equilibrio Mágico (emFormula) y calculatedEM al cambiar origen o atributos (Punto 1)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'SET_ORIGINS',
            payload: [{ 'Arcano': ['Mago'] }]
        });

        // Mago tiene divisor 1 y coste 0
        expect(state.spells.emFormula).toEqual({ divisor: 1, pcCost: 0 });
        // Base INT(50) + PER(50) + VOL(50) en initialCharacterState = 150 (o 40*3 = 120)
        const initialEM = state.spells.calculatedEM;
        expect(initialEM).toBeGreaterThan(0);

        // Si sube Inteligencia en +40, calculatedEM sube en +40 automáticamente
        const updatedAttrs = characterReducer(state, {
            type: 'UPDATE_ATTRIBUTES',
            payload: {
                values: { ...state.attributes.values, Inteligencia: 90 },
                breakdown: {
                    ...state.attributes.breakdown!,
                    inteligencia: { ...state.attributes.breakdown!.inteligencia, base: 90 }
                }
            }
        });
        expect(updatedAttrs.spells.calculatedEM).toBeGreaterThan(initialEM!);
    });

    it('sincroniza automáticamente combatstats y otherstats al cambiar atributos o nivel (Punto 1)', () => {
        const state = characterReducer(initialCharacterState as any, {
            type: 'UPDATE_ATTRIBUTES',
            payload: {
                values: {
                    ...initialCharacterState.attributes.values,
                    Fuerza: 100,
                    Constitución: 100
                },
                breakdown: {
                    ...initialCharacterState.attributes.breakdown,
                    fuerza: { base: 100, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
                    constitucion: { base: 100, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 }
                }
            }
        });

        expect(state.combatstats).toBeDefined();
        expect(state.otherstats).toBeDefined();
        // Para Constitución 100, la tabla de CON asigna CON - 50 = 50 Puntos de Vida
        expect(state.combatstats['Puntos de Vida']?.total).toBe(50);
    });

    it('buildManualStatUpdate unifica correctamente los overrides manuales de estadísticas (Punto 5)', () => {
        const currentStat = { formula: 'CON', base: 60, total: 60 };

        // Si el usuario introduce un valor distinto al total, añade personalizado
        const custom = buildManualStatUpdate(currentStat, null, '85');
        expect(custom).toEqual({ formula: 'CON', base: 60, total: 60, personalizado: 85 });

        // Si el usuario introduce el mismo valor que el total calculado, elimina personalizado
        const matching = buildManualStatUpdate(custom, null, '60');
        expect(matching).toEqual({ formula: 'CON', base: 60, total: 60 });
        expect(matching.personalizado).toBeUndefined();

        // Si el usuario deja el campo vacío, guarda personalizado como cadena vacía
        const empty = buildManualStatUpdate(currentStat, null, '   ');
        expect(empty).toEqual({ formula: 'CON', base: 60, total: 60, personalizado: '' });
    });
});
