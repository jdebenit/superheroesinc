import { APP_VERSIONS } from '../../../data/appVersions';
import { type TmtStore, type TmtCharacterEntry } from '../hooks/tmtTypes';
import { extractVitals } from './tmtLogic';

export const TMT_STORAGE_KEY = 'shi_tmt_store';
export const TMT_BROADCAST_CHANNEL = 'shi_tmt_channel';

const tmtChannel = typeof window !== 'undefined' ? new BroadcastChannel(TMT_BROADCAST_CHANNEL) : null;

export function buildEmptyStore(): TmtStore {
    return {
        meta: {
            version: APP_VERSIONS.TACTIC_MASTER_TERMINAL,
            savedAt: new Date().toISOString(),
            generator: 'SHI-TMT'
        },
        characters: [],
        groups: [],
        activeCombatGroupIds: [],
        details: {
            name: '',
            description: '',
            notes: ''
        },
        currentTurn: 0,
        currentRound: 1
    };
}


export function sanitizeStore(parsed: any): TmtStore {
    const empty = buildEmptyStore();
    if (!parsed || typeof parsed !== 'object') return empty;

    const sanitized: TmtStore = {
        meta: {
            ...empty.meta,
            ...(parsed.meta || {})
        },
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        groups: Array.isArray(parsed.groups) ? parsed.groups : [],
        activeCombatGroupIds: Array.isArray(parsed.activeCombatGroupIds) ? parsed.activeCombatGroupIds : [],
        details: {
            ...empty.details,
            ...(parsed.details || {})
        },
        currentTurn: typeof parsed.currentTurn === 'number' ? parsed.currentTurn : empty.currentTurn,
        currentRound: typeof parsed.currentRound === 'number' ? parsed.currentRound : empty.currentRound
    };


    sanitized.characters = sanitized.characters.map(c => {
        const entry = {
            ...c,
            groupIds: Array.isArray(c.groupIds) ? c.groupIds : [],
            usedActions: typeof c.usedActions === 'number' ? c.usedActions : 0,
            history: Array.isArray(c.history) ? c.history : []
        };

        // Initialize PV/EQM if missing or failed to detect (0/0)
        // This is important for imported characters from old Wizard versions or clean JSONs
        if (typeof entry.currentHealth === 'undefined' || (entry.maxHealth === 0 && entry.maxMental === 0)) {
            const { maxH, maxM } = extractVitals(entry.characterData);
            if (maxH !== 0 || maxM !== 0) {
                entry.maxHealth = maxH;
                entry.currentHealth = maxH;
                entry.maxMental = maxM;
                entry.currentMental = maxM;
            }
        }
        return entry;
    });

    return sanitized;
}

export function readFromStorage(): TmtStore {
    try {
        const raw = localStorage.getItem(TMT_STORAGE_KEY);
        if (!raw) return buildEmptyStore();
        return sanitizeStore(JSON.parse(raw));
    } catch {
        return buildEmptyStore();
    }
}

export function writeToStorage(store: TmtStore): void {
    try {
        const updated: TmtStore = {
            ...store,
            meta: {
                ...store.meta,
                version: APP_VERSIONS.TACTIC_MASTER_TERMINAL,
                savedAt: new Date().toISOString()
            }
        };
        localStorage.setItem(TMT_STORAGE_KEY, JSON.stringify(updated, null, 2));
    } catch (e) {
        console.error('[TMT] Error writing to localStorage:', e);
    }
}

/**
 * Pushes a character JSON into the TMT localStorage store.
 * Safe to call from outside React (e.g. event handlers in CharacterViewer).
 * Returns the ID of the newly created entry.
 */
export function pushCharacterToTmt(
    characterData: Record<string, any>,
    role: 'pj' | 'pnj' = 'pj'
): string {
    const store = readFromStorage();

    // De-duplicate: if same character (same name or alias) already exists as same role, update it
    const existingIdx = store.characters.findIndex(
        (c) =>
            c.role === role &&
            ((c.characterData?.name && c.characterData.name === characterData?.name) ||
             (c.characterData?.alias && c.characterData.alias === characterData?.alias))
    );

    const id =
        existingIdx >= 0
            ? store.characters[existingIdx].id
            : 'tmt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    const entry: TmtCharacterEntry = {
        id,
        role,
        addedAt: new Date().toISOString(),
        characterData,
        groupIds: existingIdx >= 0 ? store.characters[existingIdx].groupIds : [],
        history: [] // New characters always start with clean history
    };

    // Auto-detect max stats for the new entry
    const { maxH, maxM } = extractVitals(characterData);
    entry.maxHealth = maxH;
    entry.currentHealth = maxH;
    entry.maxMental = maxM;
    entry.currentMental = maxM;

    if (existingIdx >= 0) {
        store.characters[existingIdx] = entry;
    } else {
        store.characters.push(entry);
    }

    writeToStorage(store);
    broadcastSync(id);
    return id;
}

export function broadcastSync(id?: string) {
    tmtChannel?.postMessage({ type: 'SYNC_CHARACTER', id });
}
