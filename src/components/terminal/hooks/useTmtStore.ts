import { useState, useEffect, useCallback } from 'react';
import { APP_VERSIONS } from '../../../data/appVersions';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const TMT_STORAGE_KEY = 'shi_tmt_store';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
}

/** Root structure written to localStorage */
export interface TmtStore {
    meta: {
        version: string;
        savedAt: string;
        generator: 'SHI-TMT';
    };
    characters: TmtCharacterEntry[];
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
        characters: []
    };
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

    // De-duplicate: if same character (same name) already exists as same role, update it
    const existingIdx = store.characters.findIndex(
        (c) =>
            c.role === role &&
            c.characterData?.name &&
            c.characterData.name === characterData?.name
    );

    const id =
        existingIdx >= 0
            ? store.characters[existingIdx].id
            : 'tmt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    const entry: TmtCharacterEntry = {
        id,
        role,
        addedAt: new Date().toISOString(),
        characterData
    };

    if (existingIdx >= 0) {
        store.characters[existingIdx] = entry;
    } else {
        store.characters.push(entry);
    }

    writeToStorage(store);
    return id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTmtStore() {
    const [store, setStore] = useState<TmtStore>(buildEmptyStore);

    // Load on mount
    useEffect(() => {
        setStore(readFromStorage());
    }, []);

    // Persist whenever store changes
    useEffect(() => {
        writeToStorage(store);
    }, [store]);

    // ── Mutations ──────────────────────────────────────────────────────────

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

    const resetStore = useCallback(() => {
        const fresh = buildEmptyStore();
        writeToStorage(fresh);
        setStore(fresh);
    }, []);

    // ── Import / Export ────────────────────────────────────────────────────

    const exportStore = useCallback(() => {
        const current = readFromStorage();
        const blob = new Blob([JSON.stringify(current, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SHI-TMT-export-${new Date().toISOString().slice(0, 10)}.json`;
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
        addCharacter,
        removeCharacter,
        updateCharacterRole,
        resetStore,
        exportStore,
        importStore,
        reload
    };
}
