import { useState, useEffect } from 'react';
import { type TmtStore, type TmtCharacterEntry } from './tmtTypes';
import { TMT_STORAGE_KEY } from '../utils/tmtStorage';

export function useTmtSync() {
    const [tmtStore, setTmtStore] = useState<TmtStore | null>(null);

    const loadTmtStore = () => {
        const saved = localStorage.getItem(TMT_STORAGE_KEY);
        if (saved) {
            try {
                setTmtStore(JSON.parse(saved));
            } catch (err) {
                console.error('Error parsing TMT store in Player Terminal:', err);
            }
        } else {
            setTmtStore(null);
        }
    };

    useEffect(() => {
        // Initial load
        loadTmtStore();

        // Listen to storage events (cross-tab sync)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === TMT_STORAGE_KEY) {
                loadTmtStore();
            }
        };

        // Listen to BroadcastChannel (same-domain sync if storage event is not enough)
        const channel = new BroadcastChannel('shi_tmt_channel');
        channel.onmessage = (event) => {
            // TMT sends SYNC_CHARACTER or generic updates
            loadTmtStore();
        };

        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            channel.close();
        };
    }, []);

    // Helper to get public characters
    const getPublicCharacters = (): TmtCharacterEntry[] => {
        if (!tmtStore) return [];
        return tmtStore.characters.filter(c => !c.isHidden);
    };

    // Update Master's store from Player Terminal
    const updateCharacterStatInTmt = (charName: string, type: 'health' | 'mental' | 'willpower', newValue: number) => {
        const saved = localStorage.getItem(TMT_STORAGE_KEY);
        if (!saved) return;

        try {
            const currentStore: TmtStore = JSON.parse(saved);
            let changed = false;

            currentStore.characters = currentStore.characters.map(c => {
                const name = (c.characterData.alias || c.characterData.name || '').toLowerCase();
                if (name === charName.toLowerCase()) {
                    if (type === 'health' && c.currentHealth !== newValue) {
                        c.currentHealth = newValue;
                        changed = true;
                    } else if (type === 'mental' && c.currentMental !== newValue) {
                        c.currentMental = newValue;
                        changed = true;
                    } else if (type === 'willpower' && c.currentWillpower !== newValue) {
                        c.currentWillpower = newValue;
                        changed = true;
                    }

                }
                return c;
            });


            if (changed) {
                localStorage.setItem(TMT_STORAGE_KEY, JSON.stringify(currentStore));
                // Broadcast change so other tabs (like the Master Terminal) see it immediately
                const channel = new BroadcastChannel('shi_tmt_channel');
                channel.postMessage({ type: 'SYNC_CHARACTER' });
                channel.close();
                setTmtStore(currentStore);
            }
        } catch (err) {
            console.error('Error updating Master store from Player:', err);
        }
    };

    return {
        tmtStore,
        publicCharacters: getPublicCharacters(),
        isCombatActive: (tmtStore?.characters?.length || 0) > 0,
        updateCharacterStatInTmt
    };
}

