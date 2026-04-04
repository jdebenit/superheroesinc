import { useState, useEffect, useCallback } from 'react';
import { APP_VERSIONS } from '../../../data/appVersions';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const TMT_STORAGE_KEY = 'shi_tmt_store';
export const TMT_BROADCAST_CHANNEL = 'shi_tmt_channel';

const tmtChannel = typeof window !== 'undefined' ? new BroadcastChannel(TMT_BROADCAST_CHANNEL) : null;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A group to categorize characters */
export interface TmtGroup {
    id: string;
    name: string;
    color?: string;
}

export interface HistoryEntry {
    timestamp: string;
    type: 'health' | 'mental' | 'willpower' | 'chi';
    change: number;
    newValue: number;
    notes: string;
}

/** A character entry stored inside the TMT session */
export interface TmtCharacterEntry {
    /** Unique ID for this slot */
    id: string;
    /** 'pj' = player character, 'pnj' = non-player character */
    role: 'pj' | 'pnj';
    /** ISO timestamp of when it was added/last updated */
    addedAt: string;
    /** The raw character JSON as exported from the Wizard / CharacterViewer */
    characterData: Record<string, any>;
    /** IDs of groups this character belongs to */
    groupIds: string[];
    /** Current initiative roll/value for the combat tracker */
    initiative?: number;
    /** The actual roll component (1-100) for transparency */
    roll?: number;
    /** Number of actions already spent/used in the current round */
    usedActions?: number;
    /** Modifier for initiative rolls (Surprised, Stunned, etc.) */
    initiativeMod?: number;
    /** Health & Vitals Tracking */
    currentHealth?: number;
    maxHealth?: number;
    currentMental?: number;
    maxMental?: number;
    history?: HistoryEntry[];
}

/** Root structure written to localStorage */
export interface TmtStore {
    meta: {
        version: string;
        savedAt: string;
        generator: 'SHI-TMT';
    };
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    activeCombatGroupIds?: string[];
    details?: {
        name: string;
        description: string;
        notes: string;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildEmptyStore(): TmtStore {
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
        }
    };
}

function extractVitals(characterData: any) {
    const combatStats = characterData?.combatstats;
    let maxH = 0;
    let maxM = 0;

    if (Array.isArray(combatStats)) {
        // Old format: ["Label: Value", ...]
        const healthLine = combatStats.find((s: any) => typeof s === 'string' && (s.includes('Puntos de Vida') || s.includes('PV')));
        const mentalLine = combatStats.find((s: any) => typeof s === 'string' && (s.includes('Equilibrio Mental') || s.includes('EQM')));

        maxH = healthLine ? parseInt(healthLine.split(':')[1]?.trim()) : 0;
        maxM = mentalLine ? parseInt(mentalLine.split(':')[1]?.trim()) : 0;
    } else if (typeof combatStats === 'object' && combatStats !== null) {
        // New format: { "Label": "Value", ... }
        maxH = parseInt(combatStats['Puntos de Vida'] || combatStats['PV']) || 0;
        maxM = parseInt(combatStats['Equilibrio Mental'] || combatStats['EQM']) || 0;
    }

    // Fallbacks if not found (basic calculation)
    if (maxH === 0) {
        const con = characterData?.attributes?.values?.Constitución || 0;
        maxH = con > 0 ? (con <= 100 ? Math.floor(con / 2) : con - 45) : 0;
    }
    if (maxM === 0) {
        maxM = characterData?.attributes?.values?.Inteligencia || 0;
    }

    return { maxH, maxM };
}

function readFromStorage(): TmtStore {
    try {
        const raw = localStorage.getItem(TMT_STORAGE_KEY);
        if (!raw) return buildEmptyStore();
        const parsed: TmtStore = JSON.parse(raw);
        // Basic schema guard
        if (!parsed?.meta || !Array.isArray(parsed?.characters)) {
            return buildEmptyStore();
        }
        // Migration/defaults
        if (!Array.isArray(parsed.groups)) {
            parsed.groups = [];
        }
        if (!Array.isArray(parsed.activeCombatGroupIds)) {
            parsed.activeCombatGroupIds = [];
        }
        if (!parsed.details) {
            parsed.details = { name: '', description: '', notes: '' };
        }
        parsed.characters = parsed.characters.map(c => {
            const entry = {
                ...c,
                groupIds: Array.isArray(c.groupIds) ? c.groupIds : [],
                usedActions: typeof c.usedActions === 'number' ? c.usedActions : 0,
                history: Array.isArray(c.history) ? c.history : []
            };

            // Initialize PV/EQM if missing or failed to detect (0/0)
            if (typeof entry.currentHealth === 'undefined' || (entry.maxHealth === 0 && entry.maxMental === 0)) {
                const { maxH, maxM } = extractVitals(entry.characterData);

                // Only overwrite if we actually found something better than 0/0
                if (maxH !== 0 || maxM !== 0) {
                    entry.maxHealth = maxH;
                    entry.currentHealth = maxH;
                    entry.maxMental = maxM;
                    entry.currentMental = maxM;
                }
            }

            return entry;
        });
        return parsed;
    } catch {
        return buildEmptyStore();
    }
}

function writeToStorage(store: TmtStore): void {
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

// ─────────────────────────────────────────────────────────────────────────────
// Public helper — used by CharacterViewer (outside the hook context)
// ─────────────────────────────────────────────────────────────────────────────

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
    tmtChannel?.postMessage({ type: 'SYNC_CHARACTER', id });
    return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTmtStore() {
    const [store, setStore] = useState<TmtStore>(readFromStorage);

    // Listen for broadcast messages AND storage events (standard sync)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'SYNC_CHARACTER') {
                setStore(readFromStorage());
            }
        };

        const handleStorage = (e: StorageEvent) => {
            if (e.key === TMT_STORAGE_KEY) {
                setStore(readFromStorage());
            }
        };

        if (tmtChannel) {
            tmtChannel.addEventListener('message', handleMessage);
        }
        window.addEventListener('storage', handleStorage);

        return () => {
            if (tmtChannel) tmtChannel.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);


    const addCharacter = useCallback(
        (characterData: Record<string, any>, role: 'pj' | 'pnj') => {
            const id = pushCharacterToTmt(characterData, role);
            // Re-read so React state is always in sync
            setStore(readFromStorage());
            return id;
        },
        []
    );

    const removeCharacter = useCallback((id: string) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.filter((c) => c.id !== id)
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateCharacterRole = useCallback((id: string, role: 'pj' | 'pnj') => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) =>
                    c.id === id ? { ...c, role } : c
                )
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateCharacterInitiative = useCallback((id: string, initiative: number, roll?: number) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) =>
                    c.id === id ? { ...c, initiative, roll } : c
                )
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateCharacterInitiativeMod = useCallback((id: string, initiativeMod: number) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) =>
                    c.id === id ? { ...c, initiativeMod } : c
                )
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateCharacterUsedActions = useCallback((id: string, usedActions: number) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) =>
                    c.id === id ? { ...c, usedActions } : c
                )
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateCharacterStat = useCallback((
        charId: string,
        type: 'health' | 'mental',
        change: number,
        notes: string
    ) => {
        if (change === 0) return;

        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) => {
                    if (c.id !== charId) return c;

                    const current = type === 'health' ? (c.currentHealth || 0) : (c.currentMental || 0);
                    const max = type === 'health' ? (c.maxHealth || 0) : (c.maxMental || 0);
                    const newValue = Math.max(0, Math.min(max, current + change));

                    const entry: HistoryEntry = {
                        timestamp: new Date().toISOString(),
                        type: type === 'health' ? 'health' : 'mental',
                        change,
                        newValue,
                        notes: notes.trim()
                    };

                    return {
                        ...c,
                        [type === 'health' ? 'currentHealth' : 'currentMental']: newValue,
                        history: [entry, ...(c.history || [])]
                    };
                })
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateActiveCombatGroups = useCallback((groupIds: string[]) => {
        setStore((prev) => {
            const updated = { ...prev, activeCombatGroupIds: groupIds };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const deleteCharacterHistoryEntry = useCallback((charId: string, entryToDelete: HistoryEntry) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) => {
                    if (c.id !== charId) return c;

                    const newHistory = (c.history || []).filter(h => h !== entryToDelete);
                    const reverseChange = -entryToDelete.change;

                    // Recalculate current value
                    if (entryToDelete.type === 'health') {
                        const max = c.maxHealth || 0;
                        const current = c.currentHealth || 0;
                        return {
                            ...c,
                            currentHealth: Math.max(0, Math.min(max, current + reverseChange)),
                            history: newHistory
                        };
                    } else if (entryToDelete.type === 'mental') {
                        const max = c.maxMental || 0;
                        const current = c.currentMental || 0;
                        return {
                            ...c,
                            currentMental: Math.max(0, Math.min(max, current + reverseChange)),
                            history: newHistory
                        };
                    }
                    return { ...c, history: newHistory };
                })
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const resetAllActions = useCallback(() => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) => ({ ...c, usedActions: 0 }))
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const toggleCharacterGroup = useCallback((characterId: string, groupId: string) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                characters: prev.characters.map((c) => {
                    if (c.id !== characterId) return c;
                    const exists = c.groupIds.includes(groupId);
                    return {
                        ...c,
                        groupIds: exists
                            ? c.groupIds.filter(id => id !== groupId)
                            : [...c.groupIds, groupId]
                    };
                })
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const addGroup = useCallback((name: string, color?: string) => {
        setStore((prev) => {
            const newGroup: TmtGroup = {
                id: 'grp_' + Date.now().toString(36),
                name,
                color
            };
            const updated = {
                ...prev,
                groups: [...prev.groups, newGroup]
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateGroup = useCallback((id: string, name: string, color?: string) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                groups: prev.groups.map(g => g.id === id ? { ...g, name, color } : g)
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const deleteGroup = useCallback((id: string) => {
        setStore((prev) => {
            const updated = {
                ...prev,
                groups: prev.groups.filter(g => g.id !== id),
                characters: prev.characters.map(c => ({
                    ...c,
                    groupIds: c.groupIds.filter(gid => gid !== id)
                }))
            };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const updateDetails = useCallback((details: { name: string, description: string, notes: string }) => {
        setStore((prev) => {
            const updated = { ...prev, details };
            writeToStorage(updated);
            return updated;
        });
    }, []);

    const resetStore = useCallback(() => {
        const fresh = buildEmptyStore();
        writeToStorage(fresh);
        setStore(fresh);
    }, []);

    // ── Import / Export ────────────────────────────────────────────────────

    const exportStore = useCallback(() => {
        const current = readFromStorage();
        const sessionName = current.details?.name || new Date().toISOString().slice(0, 10);
        const fileName = `SHI-TMT-${sessionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

        const blob = new Blob([JSON.stringify(current, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const importStore = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed: TmtStore = JSON.parse(e.target?.result as string);
                if (!parsed?.meta || !Array.isArray(parsed?.characters)) {
                    alert('El archivo no tiene un formato de exportación TMT válido.');
                    return;
                }
                writeToStorage(parsed);
                setStore(readFromStorage());
            } catch {
                alert('Error al leer el archivo de importación.');
            }
        };
        reader.readAsText(file);
    }, []);

    // Reload from storage (useful after pushCharacterToTmt is called externally)
    const reload = useCallback(() => {
        setStore(readFromStorage());
    }, []);

    return {
        store,
        characters: store.characters,
        groups: store.groups,
        addCharacter,
        removeCharacter,
        updateCharacterRole,
        toggleCharacterGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        updateCharacterInitiative,
        updateCharacterInitiativeMod,
        updateCharacterUsedActions,
        updateCharacterStat,
        updateActiveCombatGroups,
        deleteCharacterHistoryEntry,
        updateDetails,
        resetAllActions,
        resetStore,
        exportStore,
        importStore,
        reload
    };
}
