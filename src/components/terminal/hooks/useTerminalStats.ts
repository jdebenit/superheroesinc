import { useState, useEffect } from 'react';
import { adaptWebCharacter } from '../../../utils/characterAdapter';
import Logger from '../../../utils/Logger';

export interface CharacterData {
    name: string;
    alias?: string;
    level?: number;
    origin?: { items?: Array<{ [key: string]: any }> };
    combatstats: string[] | Record<string, string>;
    otherstats?: string[] | Record<string, string>;
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
    type: 'health' | 'mental' | 'willpower' | 'chi';
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
    const [notes, setNotes] = useState<string>('');
    const [usedChi, setUsedChi] = useState<number>(0);

    // Check for character in localStorage on mount
    useEffect(() => {
        const savedCharacter = localStorage.getItem('shi_tpt_character');
        if (savedCharacter) {
            try {
                const data: CharacterData = JSON.parse(savedCharacter);
                loadCharacter(data);
                localStorage.removeItem('shi_tpt_character');
            } catch (error) {
                Logger.error('Error loading character from localStorage:', error);
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
                    Logger.error('Error loading persistent data:', error);
                }
            }
        }
    }, []);

    // Load notes from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem('shi_tpt_persistent_notes');
        if (savedNotes !== null) {
            setNotes(savedNotes);
        }
        const savedChi = localStorage.getItem('shi_tpt_persistent_chi');
        if (savedChi !== null) {
            setUsedChi(parseInt(savedChi) || 0);
        }
    }, []);

    // Auto-save notes and chi to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('shi_tpt_persistent_notes', notes);
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('shi_tpt_persistent_chi', String(usedChi));
    }, [usedChi]);

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
                Logger.error('Error loading history:', error);
            }
        }
    }, []);

    const loadCharacter = (data: any) => {
        if (!data.name || !data.combatstats || !data.attributes) {
            alert('❌ ERROR: El archivo no es un personaje válido');
            return;
        }

        const getRawStat = (source: any, term: string): string | undefined => {
            if (!source) return undefined;
            if (Array.isArray(source)) {
                return source.find(s => s.toLowerCase().includes(term.toLowerCase()));
            }
            // If it's an object, find key that matches term
            const matchingKey = Object.keys(source).find(k => k.toLowerCase().includes(term.toLowerCase()));
            if (matchingKey) {
                return `${matchingKey}: ${source[matchingKey]}`;
            }
            return undefined;
        };

        const healthStat = getRawStat(data.combatstats, 'Puntos de Vida');
        const mentalBalanceStat = getRawStat(data.combatstats, 'Equilibrio Mental');

        const maxHealth = healthStat ? parseInt(healthStat.split(':')[1]?.trim() || '0') : 0;
        const maxMentalBalance = mentalBalanceStat ? parseInt(mentalBalanceStat.split(':')[1]?.trim() || '0') : 0;
        const willpower = data.attributes.values.Voluntad || 0;

        const unconsciousnessStat = getRawStat(data.otherstats, 'Inconsciencia');
        const unconsciousnessPoints = unconsciousnessStat ? parseInt(unconsciousnessStat.split(':')[1]?.trim().split(' ')[0] || '0') : 0;

        setCharacter(data);
        setStats({
            maxHealth,
            currentHealth: maxHealth,
            maxMentalBalance,
            currentMentalBalance: maxMentalBalance,
            willpower,
            usedWillpower: 0,
            unconsciousnessPoints
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
        } else if (entryToDelete.type === 'chi') {
            setUsedChi(prev => Math.max(0, prev - entryToDelete.change));
        }
    };

    const resetData = () => {
        localStorage.removeItem('shi_tpt_persistent_character');
        localStorage.removeItem('shi_tpt_persistent_stats');
        localStorage.removeItem('shi_tpt_persistent_history');
        localStorage.removeItem('shi_tpt_persistent_notes');
        localStorage.removeItem('shi_tpt_persistent_chi');
        window.location.reload();
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
            Logger.error('Error importing JSON:', error);
            alert('❌ ERROR: No se pudo leer el archivo JSON');
        }
    };

    const updateNotes = (value: string) => {
        setNotes(value);
    };

    const updateChi = (newUsed: number, max: number) => {
        const clamped = Math.max(0, Math.min(max, newUsed));
        const change = clamped - usedChi; // positive = more used (chi spent), negative = recovered
        if (change === 0) return;
        const remaining = max - clamped;
        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'chi',
            change,
            newValue: remaining,
            notes: change > 0 ? 'Chi gastado' : 'Chi recuperado'
        };
        setHistory(prev => [entry, ...prev]);
        setUsedChi(clamped);
    };

    const resetChi = () => {
        if (usedChi === 0) return;
        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'chi',
            change: -usedChi,
            newValue: 0,
            notes: 'Descanso — Chi recuperado al completo'
        };
        setHistory(prev => [entry, ...prev]);
        setUsedChi(0);
    };

    return {
        character,
        stats,
        history,
        notes,
        usedChi,
        updateHealth,
        updateMental,
        updateWillpower,
        updateNotes,
        updateChi,
        resetChi,
        deleteHistoryEntry,
        resetData,
        importData
    };
}
