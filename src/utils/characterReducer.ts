import { initialCharacterState } from '../data/wizardConfig';
import { syncCharacterTransformations } from './calculations/formCalculations';
import { syncOriginAttributes } from './calculations/originCalculations';
import { syncOriginAutoPowers, syncPowerModsToAttributes } from './calculations/powerCalculations';
import { syncOriginSkills, syncSkillFormattedItems } from './calculations/skillCalculations';
import { syncMagicalEquilibrium } from './calculations/magicCalculations';
import { syncDerivedStats } from './calculations/derivedStatsCalculations';
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
 * Función pura que sincroniza de forma determinista y atómica:
 * 0. Modificadores de características por origen/especialidad (`originMod`, `specialtyMod` y límites)
 * 1. Poderes innatos otorgados automáticamente por el origen/subtipo (Atlante, Troll, Tes-khar, Hadas, etc.)
 * 2. Modificadores de características otorgados por poderes (powerMod en breakdown y values)
 * 3. Habilidades de aprendizaje gratuitas, obligatorias (Vigilante), limpieza de restringidas y listas formateadas
 * 4. Fórmula de Equilibrio Mágico (emFormula) y EM calculada (calculatedEM)
 * 5. Formas y transformaciones derivadas (Hombre Lobo, Blindaje Natural, etc.)
 * 6. Estadísticas derivadas de combate y generales (combatstats y otherstats)
 */
export function withTransformationsSync(state: CharacterData, prevState?: CharacterData): CharacterData {
    let current = state;

    // 0. Sincronización de modificadores de características por origen/especialidad cuando cambian orígenes o bonos elegidos
    const originsChanged = !prevState ||
        prevState.origin !== current.origin ||
        prevState.chosenCharacteristics !== current.chosenCharacteristics ||
        prevState.chosenBonusCharacteristic !== current.chosenBonusCharacteristic ||
        prevState.liberadoParams !== current.liberadoParams;

    if (originsChanged && prevState) {
        const originAttrPatch = syncOriginAttributes(current, prevState);
        if (originAttrPatch) {
            current = {
                ...current,
                attributes: originAttrPatch.attributes as any,
                chosenCharacteristics: originAttrPatch.chosenCharacteristics
            };
        }
    }

    // 1. Sincronización de poderes innatos de origen
    const updatedPowers = syncOriginAutoPowers(current);
    if (updatedPowers) {
        current = {
            ...current,
            powers: {
                ...(current.powers || {}),
                selected: updatedPowers
            }
        };
    }

    // 2. Sincronización de modificadores de poderes a características
    const updatedAttributes = syncPowerModsToAttributes(current);
    if (updatedAttributes) {
        current = {
            ...current,
            attributes: updatedAttributes as any
        };
    }

    // 3. Sincronización de habilidades gratuitas, obligatorias y restringidas por origen + listas formateadas
    const updatedSkills = syncOriginSkills(current);
    if (updatedSkills) {
        current = {
            ...current,
            skills: {
                ...(current.skills || {}),
                selected: updatedSkills.selected,
                specified: updatedSkills.specified
            }
        };
    }

    const updatedSkillItems = syncSkillFormattedItems(current);
    if (updatedSkillItems) {
        current = {
            ...current,
            skills: {
                ...(current.skills || {}),
                generalItems: updatedSkillItems.generalItems,
                specialItems: updatedSkillItems.specialItems
            }
        };
    }

    // 4. Sincronización de Equilibrio Mágico (emFormula y calculatedEM)
    const updatedSpells = syncMagicalEquilibrium(current);
    if (updatedSpells) {
        current = {
            ...current,
            spells: updatedSpells
        };
    }

    // 5. Sincronización de transformaciones y formas alternativas (Hombre Lobo, etc.)
    const formPatch = syncCharacterTransformations(current);
    if (formPatch) {
        current = {
            ...current,
            ...formPatch
        };
    }

    // 6. Sincronización de estadísticas derivadas (combatstats y otherstats)
    const derivedPatch = syncDerivedStats(current);
    if (derivedPatch) {
        current = {
            ...current,
            ...derivedPatch
        };
    }

    return current;
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

            // Si el patch altera orígenes, parámetros, poderes, atributos, habilidades, hechizos o nivel, sincronizar
            const touchesTransforms = 'origin' in patch ||
                'chosenCharacteristics' in patch ||
                'chosenBonusCharacteristic' in patch ||
                'powers' in patch ||
                'werewolfParams' in patch ||
                'attributes' in patch ||
                'liberadoParams' in patch ||
                'skills' in patch ||
                'spells' in patch ||
                'level' in patch ||
                'modPerLevel' in patch;

            return touchesTransforms ? withTransformationsSync(next, state) : next;
        }

        case 'UPDATE_IDENTITY': {
            return {
                ...state,
                ...action.payload
            };
        }

        case 'UPDATE_LEVEL': {
            const next = {
                ...state,
                level: action.payload.level,
                modPerLevel: action.payload.modPerLevel !== undefined ? action.payload.modPerLevel : state.modPerLevel
            };
            return withTransformationsSync(next, state);
        }

        case 'SET_ORIGINS': {
            const next = {
                ...state,
                origin: {
                    ...(state.origin || {}),
                    items: action.payload || []
                }
            };
            return withTransformationsSync(next, state);
        }

        case 'UPDATE_ORIGIN_PARAMS': {
            const next = {
                ...state,
                ...action.payload
            };
            return withTransformationsSync(next, state);
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
            return withTransformationsSync(next, state);
        }

        case 'UPDATE_SKILLS': {
            const next = {
                ...state,
                skills: {
                    ...state.skills,
                    ...action.payload
                }
            };
            return withTransformationsSync(next, state);
        }

        case 'UPDATE_POWERS': {
            const next = {
                ...state,
                powers: {
                    ...state.powers,
                    selected: action.payload.selected || []
                }
            };
            return withTransformationsSync(next, state);
        }

        case 'UPDATE_SPELLS': {
            const next = {
                ...state,
                spells: {
                    ...state.spells,
                    ...(action.payload.selected !== undefined ? { selected: action.payload.selected } : {}),
                    ...(action.payload.emFormula !== undefined ? { emFormula: action.payload.emFormula } : {})
                },
                ...(action.payload.magicTableRolls !== undefined ? { magicTableRolls: action.payload.magicTableRolls } : {})
            };
            return withTransformationsSync(next, state);
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
