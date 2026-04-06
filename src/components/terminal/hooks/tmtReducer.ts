import { type TmtStore, type TmtCharacterEntry, type TmtGroup, type HistoryEntry } from './tmtTypes';
import { calculateStatChange, extractVitals } from '../utils/tmtLogic';

export type TmtAction =
    | { type: 'ADD_CHARACTER'; characterData: Record<string, any>; role: 'pj' | 'pnj'; id?: string }
    | { type: 'REMOVE_CHARACTER'; id: string }
    | { type: 'UPDATE_CHARACTER_ROLE'; id: string; role: 'pj' | 'pnj' }
    | { type: 'UPDATE_CHARACTER_INITIATIVE'; id: string; initiative: number; roll?: number }
    | { type: 'UPDATE_CHARACTER_INITIATIVE_MOD'; id: string; initiativeMod: number }
    | { type: 'UPDATE_CHARACTER_USED_ACTIONS'; id: string; usedActions: number }
    | { type: 'UPDATE_CHARACTER_STAT'; charId: string; statType: 'health' | 'mental' | 'willpower'; change: number; notes: string }
    | { type: 'DELETE_CHARACTER_HISTORY_ENTRY'; charId: string; entry: HistoryEntry }

    | { type: 'TOGGLE_CHARACTER_GROUP'; characterId: string; groupId: string }
    | { type: 'TOGGLE_CHARACTER_VISIBILITY'; id: string }
    | { type: 'ADD_GROUP'; name: string; color?: string }
    | { type: 'UPDATE_GROUP'; id: string; name: string; color?: string }
    | { type: 'DELETE_GROUP'; id: string }
    | { type: 'UPDATE_ACTIVE_COMBAT_GROUPS'; groupIds: string[] }
    | { type: 'UPDATE_DETAILS'; details: { name: string; description: string; notes: string } }
    | { type: 'UPDATE_COMBAT_STATE'; turn: number; round?: number }
    | { type: 'RESET_ALL_ACTIONS' }
    | { type: 'RESET_STORE'; emptyStore: TmtStore }
    | { type: 'SET_STORE'; store: TmtStore };

export function tmtReducer(state: TmtStore, action: TmtAction): TmtStore {
    switch (action.type) {
        case 'ADD_CHARACTER': {
            const { characterData, role, id } = action;
            const newId = id || 'tmt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

            // De-duplicate: if same character (same name or alias) already exists as same role, update it
            const existingIdx = state.characters.findIndex(
                (c) =>
                    c.role === role &&
                    ((c.characterData?.name && c.characterData.name === characterData?.name) ||
                        (c.characterData?.alias && c.characterData.alias === characterData?.alias))
            );

            const { maxH, maxM, maxV } = extractVitals(characterData);
            const entry: TmtCharacterEntry = {
                id: newId,
                role,
                addedAt: new Date().toISOString(),
                characterData,
                groupIds: existingIdx >= 0 ? state.characters[existingIdx].groupIds : [],
                history: [],
                maxHealth: maxH,
                currentHealth: maxH,
                maxMental: maxM,
                currentMental: maxM,
                maxWillpower: maxV,
                currentWillpower: maxV
            };


            const newCharacters = [...state.characters];
            if (existingIdx >= 0) {
                newCharacters[existingIdx] = entry;
            } else {
                newCharacters.push(entry);
            }

            return { ...state, characters: newCharacters };
        }

        case 'REMOVE_CHARACTER':
            return { ...state, characters: state.characters.filter(c => c.id !== action.id) };

        case 'UPDATE_CHARACTER_ROLE':
            return {
                ...state,
                characters: state.characters.map(c => 
                    c.id === action.id ? { ...c, role: action.role } : c
                )
            };

        case 'UPDATE_CHARACTER_INITIATIVE':
            return {
                ...state,
                characters: state.characters.map(c => 
                    c.id === action.id ? { ...c, initiative: action.initiative, roll: action.roll } : c
                )
            };

        case 'UPDATE_CHARACTER_INITIATIVE_MOD':
            return {
                ...state,
                characters: state.characters.map(c => 
                    c.id === action.id ? { ...c, initiativeMod: action.initiativeMod } : c
                )
            };

        case 'UPDATE_CHARACTER_USED_ACTIONS':
            return {
                ...state,
                characters: state.characters.map(c => 
                    c.id === action.id ? { ...c, usedActions: action.usedActions } : c
                )
            };

        case 'UPDATE_CHARACTER_STAT':
            return {
                ...state,
                characters: state.characters.map((c) => {
                    if (c.id !== action.charId) return c;

                    let current = 0;
                    let max = 0;
                    let field = '';

                    if (action.statType === 'health') {
                        current = c.currentHealth || 0;
                        max = c.maxHealth || 0;
                        field = 'currentHealth';
                    } else if (action.statType === 'mental') {
                        current = c.currentMental || 0;
                        max = c.maxMental || 0;
                        field = 'currentMental';
                    } else if (action.statType === 'willpower') {
                        current = c.currentWillpower || 0;
                        max = c.maxWillpower || 0;
                        field = 'currentWillpower';
                    }

                    const newValue = calculateStatChange(current, max, action.change);

                    const entry: HistoryEntry = {
                        timestamp: new Date().toISOString(),
                        type: action.statType,
                        change: action.change,
                        newValue,
                        notes: action.notes.trim()
                    };

                    return {
                        ...c,
                        [field]: newValue,
                        history: [entry, ...(c.history || [])]
                    };
                })

            };

        case 'DELETE_CHARACTER_HISTORY_ENTRY':
            return {
                ...state,
                characters: state.characters.map((c) => {
                    if (c.id !== action.charId) return c;
                    const newHistory = (c.history || []).filter(h => h !== action.entry);
                    const reverseChange = -action.entry.change;
                    
                    if (action.entry.type === 'health') {
                        return {
                            ...c,
                            currentHealth: calculateStatChange(c.currentHealth || 0, c.maxHealth || 0, reverseChange),
                            history: newHistory
                        };
                    } else if (action.entry.type === 'mental') {
                        return {
                            ...c,
                            currentMental: calculateStatChange(c.currentMental || 0, c.maxMental || 0, reverseChange),
                            history: newHistory
                        };
                    } else if (action.entry.type === 'willpower') {
                        return {
                            ...c,
                            currentWillpower: calculateStatChange(c.currentWillpower || 0, c.maxWillpower || 0, reverseChange),
                            history: newHistory
                        };
                    }

                    return { ...c, history: newHistory };
                })
            };

        case 'TOGGLE_CHARACTER_GROUP':
            return {
                ...state,
                characters: state.characters.map((c) => {
                    if (c.id !== action.characterId) return c;
                    const exists = c.groupIds.includes(action.groupId);
                    return {
                        ...c,
                        groupIds: exists
                            ? c.groupIds.filter(id => id !== action.groupId)
                            : [...c.groupIds, action.groupId]
                    };
                })
            };

        case 'TOGGLE_CHARACTER_VISIBILITY':
            return {
                ...state,
                characters: state.characters.map(c => 
                    c.id === action.id ? { ...c, isHidden: !c.isHidden } : c
                )
            };

        case 'ADD_GROUP': {
            const newGroup: TmtGroup = {
                id: 'grp_' + Date.now().toString(36),
                name: action.name,
                color: action.color
            };
            return { ...state, groups: [...state.groups, newGroup] };
        }

        case 'UPDATE_GROUP':
            return {
                ...state,
                groups: state.groups.map(g => g.id === action.id ? { ...g, name: action.name, color: action.color } : g)
            };

        case 'DELETE_GROUP':
            return {
                ...state,
                groups: state.groups.filter(g => g.id !== action.id),
                characters: state.characters.map(c => ({
                    ...c,
                    groupIds: c.groupIds.filter(gid => gid !== action.id)
                }))
            };

        case 'UPDATE_ACTIVE_COMBAT_GROUPS':
            return { ...state, activeCombatGroupIds: action.groupIds };

        case 'UPDATE_DETAILS':
            return { ...state, details: action.details };

        case 'UPDATE_COMBAT_STATE':
            return { 
                ...state, 
                currentTurn: action.turn, 
                currentRound: action.round !== undefined ? action.round : (state.currentRound || 1) 
            };

        case 'RESET_ALL_ACTIONS':
            return {
                ...state,
                characters: state.characters.map((c) => ({ ...c, usedActions: 0 }))
            };

        case 'RESET_STORE':
            return action.emptyStore;

        case 'SET_STORE':
            return action.store;

        default:
            return state;
    }
}
