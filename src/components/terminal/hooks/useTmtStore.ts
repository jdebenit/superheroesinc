import { useEffect, useCallback, useReducer } from 'react';
import { sanitizeStore, readFromStorage, writeToStorage, broadcastSync, TMT_STORAGE_KEY, buildEmptyStore } from '../utils/tmtStorage';
import { tmtReducer, type TmtAction } from './tmtReducer';

import { 
    type TmtStore, 
    type TmtCharacterEntry, 
    type TmtGroup, 
    type HistoryEntry 
} from './tmtTypes';

export { 
    type TmtStore, 
    type TmtCharacterEntry, 
    type TmtGroup, 
    type HistoryEntry 
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTmtStore() {
    const [store, dispatch] = useReducer(tmtReducer, buildEmptyStore(), readFromStorage);

    // Sync from Storage & Broadcast
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === TMT_STORAGE_KEY) {
                dispatch({ type: 'SET_STORE', store: readFromStorage() });
            }
        };

        const channel = new BroadcastChannel('shi_tmt_channel');
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_CHARACTER') {
                dispatch({ type: 'SET_STORE', store: readFromStorage() });
            }
        };

        window.addEventListener('storage', handleStorage);
        channel.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, []);

    // Persist changes to localStorage automatically
    useEffect(() => {
        writeToStorage(store);
    }, [store]);

    // Helpers / Wrapper Actions
    const wrapAction = useCallback((action: TmtAction) => {
        dispatch(action);
        // broadcastSync() was causing a feedback loop in the same tab.
        // Cross-tab Terminal sync is already handled by the 'storage' event listener below.
    }, []);

    const addCharacter = (data: any, role: any) => wrapAction({ type: 'ADD_CHARACTER', characterData: data, role });
    const removeCharacter = (id: string) => wrapAction({ type: 'REMOVE_CHARACTER', id });
    const updateCharacterRole = (id: string, role: any) => wrapAction({ type: 'UPDATE_CHARACTER_ROLE', id, role });
    const updateCharacterInitiative = (id: string, initiative: number, roll?: number) => wrapAction({ type: 'UPDATE_CHARACTER_INITIATIVE', id, initiative, roll });
    const updateCharacterInitiativeMod = (id: string, initiativeMod: number) => wrapAction({ type: 'UPDATE_CHARACTER_INITIATIVE_MOD', id, initiativeMod });
    const updateCharacterUsedActions = (id: string, usedActions: number) => wrapAction({ type: 'UPDATE_CHARACTER_USED_ACTIONS', id, usedActions });
    const updateCharacterStat = (charId: string, statType: any, change: number, notes: string) => wrapAction({ type: 'UPDATE_CHARACTER_STAT', charId, statType, change, notes });
    const deleteCharacterHistoryEntry = (charId: string, entry: HistoryEntry) => wrapAction({ type: 'DELETE_CHARACTER_HISTORY_ENTRY', charId, entry });
    const toggleCharacterGroup = (characterId: string, groupId: string) => wrapAction({ type: 'TOGGLE_CHARACTER_GROUP', characterId, groupId });
    const toggleCharacterVisibility = (id: string) => wrapAction({ type: 'TOGGLE_CHARACTER_VISIBILITY', id });
    const addGroup = (name: string, color?: string) => wrapAction({ type: 'ADD_GROUP', name, color });
    const updateGroup = (id: string, name: string, color?: string) => wrapAction({ type: 'UPDATE_GROUP', id, name, color });
    const deleteGroup = (id: string) => wrapAction({ type: 'DELETE_GROUP', id });
    const updateActiveCombatGroups = (groupIds: string[]) => wrapAction({ type: 'UPDATE_ACTIVE_COMBAT_GROUPS', groupIds });
    const updateDetails = (details: any) => wrapAction({ type: 'UPDATE_DETAILS', details });
    const updateCombatState = (turn: number, round?: number) => wrapAction({ type: 'UPDATE_COMBAT_STATE', turn, round });
    const resetAllActions = () => wrapAction({ type: 'RESET_ALL_ACTIONS' });
    const resetStore = () => wrapAction({ type: 'RESET_STORE', emptyStore: buildEmptyStore() });
    const reload = () => dispatch({ type: 'SET_STORE', store: readFromStorage() });

    // Import / Export (kept here for convenience)
    const exportStore = useCallback(() => {
        const sessionName = store.details?.name || new Date().toISOString().slice(0, 10);
        const fileName = `SHI-TMT-${sessionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }, [store]);

    const importStore = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target?.result as string);
                const sanitized = sanitizeStore(parsed);
                wrapAction({ type: 'SET_STORE', store: sanitized });
            } catch (err) { alert('Error al importar TMT'); }
        };
        reader.readAsText(file);
    }, [wrapAction]);

    return {
        store, characters: store.characters, groups: store.groups,
        addCharacter, removeCharacter, updateCharacterRole, toggleCharacterGroup, toggleCharacterVisibility,
        addGroup, updateGroup, deleteGroup, updateCharacterInitiative, updateCharacterInitiativeMod,
        updateCharacterUsedActions, updateCharacterStat, updateActiveCombatGroups,
        deleteCharacterHistoryEntry, updateDetails, updateCombatState, resetAllActions, resetStore,
        exportStore, importStore, reload
    };
}
