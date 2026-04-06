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

    return {
        tmtStore,
        publicCharacters: getPublicCharacters(),
        isCombatActive: (tmtStore?.characters?.length || 0) > 0
    };
}
