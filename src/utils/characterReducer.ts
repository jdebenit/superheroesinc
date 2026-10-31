import { initialCharacterState } from '../data/wizardConfig';
import { syncCharacterTransformations } from './calculations/formCalculations';
import { mergeWithDefaults } from './dataCleaner';
import type { CharacterData } from '../types/character';

export type CharacterAction =
    | { type: 'SET_CHARACTER'; payload: any }
    | { type: 'RESET_CHARACTER' }
    | { type: 'APPLY_PATCH'; payload: Record<string, any> }
    | { type: 'UPDATE_IDENTITY'; payload: { name?: string; alias?: string; profession?: string; sexualIdentity?: string; notes?: string } }
    | { type: 'UPDATE_LEVEL'; payload: { level: number; modPerLevel?: any } }
    | { type: 'SET_ORIGINS'; payload: any[] }
    | { type: 'UPDATE_ORIGIN_PARAMS'; payload: Record<string, any> }
    | { type: 'UPDATE_ATTRIBUTES'; payload: { values?: Record<string, number>; breakdown?: any; manualBonuses?: Record<string, number>; cost?: number } }
    | { type: 'UPDATE_SKILLS'; payload: Record<string, any> }
    | { type: 'UPDATE_POWERS'; payload: { selected: any[] } }
    | { type: 'UPDATE_SPELLS'; payload: { selected?: any[]; emFormula?: any; magicTableRolls?: any[] } }
    | { type: 'UPDATE_TECH'; payload: { techModules?: any[]; techParams?: any; exoskeletonConfig?: any; cyborgImplants?: any[] } }
    | { type: 'UPDATE_BACKGROUND'; payload: Record<string, any> }
    | { type: 'UPDATE_EQUIPMENT'; payload: { equipment?: any; weapons?: any; artifacts?: any; vehicles?: any; varios?: any } }
    | { type: 'UPDATE_UI_STATE'; payload: Record<string, any> }
    | { type: 'SYNC_TRANSFORMATIONS' };

/**
 * Función pura que sincroniza las transformaciones sobre un nuevo estado si hubo cambios relevantes.
 */
function withTransformationsSync(state: any): any {
    const patch = syncCharacterTransformations(state);
    return patch ? { ...state, ...patch } : state;
}

/**
 * Reducer puro y atómico para gestionar las transiciones de estado del personaje.
 */
export function characterReducer(state: CharacterData, action: CharacterAction): CharacterData {
    if (!state) {
        state = JSON.parse(JSON.stringify(initialCharacterState));
    }

    switch (action.type) {
        case 'SET_CHARACTER': {
            if (!action.payload) return state;
            const merged = mergeWithDefaults(action.payload, initialCharacterState);
            if (merged.attributes && !merged.attributes.manualBonuses) {
                merged.attributes.manualBonuses = {
                    Fuerza: 0, Agilidad: 0, Constitución: 0,
                    Inteligencia: 0, Percepción: 0, Voluntad: 0, Apariencia: 0
                };
            }
            return withTransformationsSync(merged);
        }

        case 'RESET_CHARACTER': {
            return JSON.parse(JSON.stringify(initialCharacterState));
        }

        case 'APPLY_PATCH': {
            if (!action.payload) return state;
            const patch = typeof action.payload === 'function' ? action.payload(state) : action.payload;
            if (!patch || typeof patch !== 'object') return state;
            const next = { ...state, ...patch };

            // Si el patch altera orígenes, parámetros licántropos o poderes, sincronizar transformaciones
            const touchesTransforms = 'origin' in patch ||
                'powers' in patch ||
                'werewolfParams' in patch ||
                'attributes' in patch;

            return touchesTransforms ? withTransformationsSync(next) : next;
        }

        case 'UPDATE_IDENTITY': {
            return {
                ...state,
                ...action.payload
            };
        }

        case 'UPDATE_LEVEL': {
            return {
                ...state,
                level: action.payload.level,
                modPerLevel: action.payload.modPerLevel !== undefined ? action.payload.modPerLevel : state.modPerLevel
            };
        }

        case 'SET_ORIGINS': {
            const next = {
                ...state,
                origin: {
                    ...(state.origin || {}),
                    items: action.payload || []
                }
            };
            return withTransformationsSync(next);
        }

        case 'UPDATE_ORIGIN_PARAMS': {
            const next = {
                ...state,
                ...action.payload
            };
            return withTransformationsSync(next);
        }

        case 'UPDATE_ATTRIBUTES': {
            const next = {
                ...state,
                attributes: {
                    ...state.attributes,
                    values: action.payload.values ? { ...state.attributes.values, ...action.payload.values } : state.attributes.values,
                    breakdown: action.payload.breakdown ? { ...state.attributes.breakdown, ...action.payload.breakdown } : state.attributes.breakdown,
                    manualBonuses: action.payload.manualBonuses ? { ...state.attributes.manualBonuses, ...action.payload.manualBonuses } : state.attributes.manualBonuses,
                    cost: action.payload.cost !== undefined ? action.payload.cost : state.attributes.cost
                }
            };
            return withTransformationsSync(next);
        }

        case 'UPDATE_SKILLS': {
            return {
                ...state,
                skills: {
                    ...state.skills,
                    ...action.payload
                }
            };
        }

        case 'UPDATE_POWERS': {
            const next = {
                ...state,
                powers: {
                    ...state.powers,
                    selected: action.payload.selected || []
                }
            };
            return withTransformationsSync(next);
        }

        case 'UPDATE_SPELLS': {
            return {
                ...state,
                spells: {
                    ...state.spells,
                    ...(action.payload.selected !== undefined ? { selected: action.payload.selected } : {}),
                    ...(action.payload.emFormula !== undefined ? { emFormula: action.payload.emFormula } : {})
                },
                ...(action.payload.magicTableRolls !== undefined ? { magicTableRolls: action.payload.magicTableRolls } : {})
            };
        }

        case 'UPDATE_TECH': {
            return {
                ...state,
                ...(action.payload.techModules !== undefined ? { techModules: action.payload.techModules } : {}),
                ...(action.payload.techParams !== undefined ? { techParams: action.payload.techParams } : {}),
                ...(action.payload.exoskeletonConfig !== undefined ? { exoskeletonConfig: action.payload.exoskeletonConfig } : {}),
                ...(action.payload.cyborgImplants !== undefined ? { cyborgImplants: action.payload.cyborgImplants } : {})
            };
        }

        case 'UPDATE_BACKGROUND': {
            return {
                ...state,
                background: {
                    ...state.background,
                    ...action.payload
                }
            };
        }

        case 'UPDATE_EQUIPMENT': {
            return {
                ...state,
                ...(action.payload.equipment ? { equipment: action.payload.equipment } : {}),
                ...(action.payload.weapons ? { weapons: action.payload.weapons } : {}),
                ...(action.payload.artifacts ? { artifacts: action.payload.artifacts } : {}),
                ...(action.payload.vehicles ? { vehicles: action.payload.vehicles } : {}),
                ...(action.payload.varios ? { varios: action.payload.varios } : {})
            };
        }

        case 'UPDATE_UI_STATE': {
            return {
                ...state,
                uiState: {
                    ...state.uiState,
                    ...action.payload
                }
            };
        }

        case 'SYNC_TRANSFORMATIONS': {
            return withTransformationsSync(state);
        }

        default:
            return state;
    }
}
