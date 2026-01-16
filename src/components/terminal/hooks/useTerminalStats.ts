import { useState, useEffect } from 'react';
import { adaptWebCharacter } from '../../../utils/characterAdapter';

export interface CharacterData {
    name: string;
    alias?: string;
    combatstats: string[];
    otherstats?: string[];
    attributes: {
        values: {
            [key: string]: number;
        };
    };
    skills?: {
        generalItems: Array<{
            name: string;
            value: number | string;
            math?: string;
        }>;
        specialItems: Array<{
            name: string;
            value: number | string;
            math?: string;
        }>;
    };
    powers?: {
        selected?: Array<{
            id: string;
            origin: string;
            rank: number;
            customizations?: any[];
            skillValue?: number;
        }>;
    };
    background?: {
        prejudiceResistance?: number;
        [key: string]: any;
    };
}

export interface PlayerStats {
    maxHealth: number;
    currentHealth: number;
    maxMentalBalance: number;
    currentMentalBalance: number;
    willpower: number;
    usedWillpower: number;
    unconsciousnessPoints: number;
}

export interface HistoryEntry {
    timestamp: string;
    type: 'health' | 'mental' | 'willpower';
    change: number;
    newValue: number;
    notes: string;
}

export function useTerminalStats() {
    const [character, setCharacter] = useState<CharacterData | null>(null);
    const [stats, setStats] = useState<PlayerStats>({
        maxHealth: 0,
        currentHealth: 0,
        maxMentalBalance: 0,
        currentMentalBalance: 0,
        willpower: 0,
        usedWillpower: 0,
        unconsciousnessPoints: 0
    });
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Check for character in localStorage on mount
    useEffect(() => {
        const savedCharacter = localStorage.getItem('shi_tpt_character');
        if (savedCharacter) {
            try {
                const data: CharacterData = JSON.parse(savedCharacter);
                loadCharacter(data);
                localStorage.removeItem('shi_tpt_character');
            } catch (error) {
                console.error('Error loading character from localStorage:', error);
            }
        } else {
            const persistentCharacter = localStorage.getItem('shi_tpt_persistent_character');
            const persistentStats = localStorage.getItem('shi_tpt_persistent_stats');

            if (persistentCharacter && persistentStats) {
                try {
                    const charData: CharacterData = JSON.parse(persistentCharacter);
                    const statsData: PlayerStats = JSON.parse(persistentStats);
                    setCharacter(charData);
                    setStats(statsData);
                } catch (error) {
                    console.error('Error loading persistent data:', error);
                }
            }
        }
    }, []);

    // Auto-save character and stats to localStorage whenever they change
    useEffect(() => {
        if (character) {
            localStorage.setItem('shi_tpt_persistent_character', JSON.stringify(character));
        }
    }, [character]);

    useEffect(() => {
        if (character) {
            localStorage.setItem('shi_tpt_persistent_stats', JSON.stringify(stats));
        }
    }, [stats]);

    useEffect(() => {
        if (character) {
            localStorage.setItem('shi_tpt_persistent_history', JSON.stringify(history));
        }
    }, [history]);

    // Load history from localStorage
    useEffect(() => {
        const persistentHistory = localStorage.getItem('shi_tpt_persistent_history');
        if (persistentHistory) {
            try {
                setHistory(JSON.parse(persistentHistory));
            } catch (error) {
                console.error('Error loading history:', error);
            }
        }
    }, []);

    const loadCharacter = (data: CharacterData) => {
        if (!data.name || !data.combatstats || !data.attributes) {
            alert('❌ ERROR: El archivo no es un personaje válido');
            return;
        }

        const healthStat = data.combatstats.find(stat => stat.includes('Puntos de Vida'));
        const mentalBalanceStat = data.combatstats.find(stat => stat.includes('Equilibrio Mental'));

        const maxHealth = healthStat ? parseInt(healthStat.split(':')[1]?.trim() || '0') : 0;
        const maxMentalBalance = mentalBalanceStat ? parseInt(mentalBalanceStat.split(':')[1]?.trim() || '0') : 0;
        const willpower = data.attributes.values.Voluntad || 0;

        setCharacter(data);
        setStats({
            maxHealth,
            currentHealth: maxHealth,
            maxMentalBalance,
            currentMentalBalance: maxMentalBalance,
            willpower,
            usedWillpower: 0,
            unconsciousnessPoints: (data.otherstats?.find(s => s.includes('Inconsciencia'))?.split(':')[1]?.trim().split(' ')[0]) ? parseInt(data.otherstats.find(s => s.includes('Inconsciencia'))!.split(':')[1].trim()) : 0
        });
    };

    const updateHealth = (change: number, notes: string) => {
        if (change === 0) return;
        const newValue = Math.max(0, Math.min(stats.maxHealth, stats.currentHealth + change));

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'health',
            change,
            newValue,
            notes: notes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, currentHealth: newValue }));
    };

    const updateMental = (change: number, notes: string) => {
        if (change === 0) return;
        const newValue = Math.max(0, Math.min(stats.maxMentalBalance, stats.currentMentalBalance + change));

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'mental',
            change,
            newValue,
            notes: notes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, currentMentalBalance: newValue }));
    };

    const updateWillpower = (change: number, notes: string) => {
        if (change === 0) return;
        const currentWillpower = stats.willpower - stats.usedWillpower;
        const newCurrent = Math.max(0, Math.min(stats.willpower, currentWillpower + change));
        const newUsed = stats.willpower - newCurrent;

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'willpower',
            change,
            newValue: newCurrent,
            notes: notes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, usedWillpower: newUsed }));
    };

    const deleteHistoryEntry = (entryToDelete: HistoryEntry) => {
        const newHistory = history.filter(entry => entry !== entryToDelete);
        setHistory(newHistory);

        // If history is completely empty, force reset to max values
        if (newHistory.length === 0) {
            setStats(prev => ({
                ...prev,
                currentHealth: prev.maxHealth,
                currentMentalBalance: prev.maxMentalBalance,
                usedWillpower: 0
            }));
            return;
        }

        // Otherwise revert the specific change
        const reverseChange = -entryToDelete.change;

        if (entryToDelete.type === 'health') {
            setStats(prev => ({
                ...prev,
                currentHealth: Math.max(0, Math.min(prev.maxHealth, prev.currentHealth + reverseChange))
            }));
        } else if (entryToDelete.type === 'mental') {
            setStats(prev => ({
                ...prev,
                currentMentalBalance: Math.max(0, Math.min(prev.maxMentalBalance, prev.currentMentalBalance + reverseChange))
            }));
        } else if (entryToDelete.type === 'willpower') {
            setStats(prev => {
                const currentWillpower = prev.willpower - prev.usedWillpower;
                const newCurrent = Math.max(0, Math.min(prev.willpower, currentWillpower + reverseChange));
                const newUsed = prev.willpower - newCurrent;
                return {
                    ...prev,
                    usedWillpower: newUsed
                };
            });
        }
    };

    const resetData = () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('shi_tpt_persistent_character');
            localStorage.removeItem('shi_tpt_persistent_stats');
            localStorage.removeItem('shi_tpt_persistent_history');
            window.location.reload();
        }
    };

    const importData = async (file: File) => {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);

            if (!importedData.character || !importedData.stats) {
                alert('❌ ERROR: El archivo no tiene el formato correcto');
                return;
            }

            setCharacter(importedData.character);
            setStats(importedData.stats);
            setHistory(importedData.history || []);

            localStorage.setItem('shi_tpt_persistent_character', JSON.stringify(importedData.character));
            localStorage.setItem('shi_tpt_persistent_stats', JSON.stringify(importedData.stats));
            localStorage.setItem('shi_tpt_persistent_history', JSON.stringify(importedData.history || []));

            alert('✅ Datos importados correctamente');
        } catch (error) {
            console.error('Error importing JSON:', error);
            alert('❌ ERROR: No se pudo leer el archivo JSON');
        }
    };

    return {
        character,
        stats,
        history,
        updateHealth,
        updateMental,
        updateWillpower,
        deleteHistoryEntry,
        resetData,
        importData
    };
}
