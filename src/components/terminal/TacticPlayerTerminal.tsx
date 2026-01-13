import React, { useState, useEffect } from 'react';
import './TacticPlayerTerminal.css';
import { adaptWebCharacter } from '../../utils/characterAdapter';
import TerminalHeader from './components/TerminalHeader';
import StatCard from './components/StatCard';
import HistoryModal from './components/HistoryModal';
import EditStatModal from './components/EditStatModal';
import EmptyState from './components/EmptyState';


interface CharacterData {
    name: string;
    alias?: string;
    combatstats: string[];
    otherstats?: string[];
    attributes: {
        values: {
            Voluntad: number;
        };
    };
}

interface PlayerStats {
    maxHealth: number;
    currentHealth: number;
    maxMentalBalance: number;
    currentMentalBalance: number;
    willpower: number;
    usedWillpower: number;
    unconsciousnessPoints: number;
}

interface HistoryEntry {
    timestamp: string;
    type: 'health' | 'mental' | 'willpower';
    change: number;
    newValue: number;
    notes: string;
}

export default function TacticPlayerTerminal() {
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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyType, setHistoryType] = useState<'health' | 'mental' | 'willpower'>('health');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalType, setEditModalType] = useState<'health' | 'mental' | 'willpower'>('health');

    // Temporary inputs for changes
    const [healthChange, setHealthChange] = useState<string>('');
    const [healthNotes, setHealthNotes] = useState<string>('');
    const [mentalChange, setMentalChange] = useState<string>('');
    const [mentalNotes, setMentalNotes] = useState<string>('');
    const [willpowerChange, setWillpowerChange] = useState<string>('');
    const [willpowerNotes, setWillpowerNotes] = useState<string>('');

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

    const applyHealthChange = () => {
        const change = parseInt(healthChange) || 0;
        if (change === 0) return;

        const newValue = Math.max(0, Math.min(stats.maxHealth, stats.currentHealth + change));

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'health',
            change,
            newValue,
            notes: healthNotes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, currentHealth: newValue }));
        setHealthChange('');
        setHealthNotes('');
        setShowEditModal(false);
    };

    const applyMentalChange = () => {
        const change = parseInt(mentalChange) || 0;
        if (change === 0) return;

        const newValue = Math.max(0, Math.min(stats.maxMentalBalance, stats.currentMentalBalance + change));

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'mental',
            change,
            newValue,
            notes: mentalNotes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, currentMentalBalance: newValue }));
        setMentalChange('');
        setMentalNotes('');
    };

    const applyWillpowerChange = () => {
        const change = parseInt(willpowerChange) || 0;
        if (change === 0) return;

        const currentWillpower = stats.willpower - stats.usedWillpower;
        const newCurrent = Math.max(0, Math.min(stats.willpower, currentWillpower + change));
        const newUsed = stats.willpower - newCurrent;

        const entry: HistoryEntry = {
            timestamp: new Date().toISOString(),
            type: 'willpower',
            change,
            newValue: newCurrent,
            notes: willpowerNotes.trim()
        };

        setHistory(prev => [entry, ...prev]);
        setStats(prev => ({ ...prev, usedWillpower: newUsed }));
        setWillpowerChange('');
        setWillpowerNotes('');
    };

    const openHistoryModal = (type: 'health' | 'mental' | 'willpower') => {
        setHistoryType(type);
        setShowHistoryModal(true);
    };

    const openEditModal = (type: 'health' | 'mental' | 'willpower') => {
        setEditModalType(type);
        setShowEditModal(true);
        // Reset inputs when opening
        if (type === 'health') {
            setHealthChange('');
            setHealthNotes('');
        }
    };

    const handleDeleteHistoryEntry = (entryToDelete: HistoryEntry) => {
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

    const handleExportJSON = () => {
        if (!character) return;

        const exportData = {
            character,
            stats,
            history,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SHI-TPT-${character.name.replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

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

        event.target.value = '';
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('shi_tpt_persistent_character');
            localStorage.removeItem('shi_tpt_persistent_stats');
            localStorage.removeItem('shi_tpt_persistent_history');
            window.location.reload();
        }
    };

    return (
        <div className="tactic-player-terminal">
            <TerminalHeader
                character={character}
                onImport={handleImportJSON}
                onExport={handleExportJSON}
                onReset={handleReset}
                adaptedCharacter={character ? adaptWebCharacter(character) : null}
            />

            {character ? (
                <div className="terminal-stats-container">
                    <div className="terminal-character-header">
                        <h2 className="terminal-character-name">{character.name}</h2>
                        {character.alias && (
                            <div className="terminal-character-alias">"{character.alias}"</div>
                        )}
                    </div>

                    <div className="terminal-stats-grid">
                        <StatCard
                            label="PVs"
                            max={stats.maxHealth}
                            current={stats.currentHealth}
                            type="health"
                            onViewHistory={() => openHistoryModal('health')}
                            unconsciousness={stats.unconsciousnessPoints}
                            onEdit={() => openEditModal('health')}
                        />

                        <StatCard
                            label="EQM"
                            max={stats.maxMentalBalance}
                            current={stats.currentMentalBalance}
                            type="mental"
                            onViewHistory={() => openHistoryModal('mental')}
                            onEdit={() => openEditModal('mental')}
                        />

                        <StatCard
                            label="VOLUNTAD"
                            max={stats.willpower}
                            current={stats.willpower - stats.usedWillpower}
                            type="willpower"
                            onViewHistory={() => openHistoryModal('willpower')}
                            onEdit={() => openEditModal('willpower')}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState />
            )}

            <HistoryModal
                show={showHistoryModal}
                type={historyType}
                history={history}
                onClose={() => setShowHistoryModal(false)}
                onDeleteEntry={handleDeleteHistoryEntry}
            />

            <EditStatModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={
                    editModalType === 'health' ? "Modificar PVs" :
                        editModalType === 'mental' ? "Modificar EQM" :
                            "Modificar VOLUNTAD"
                }
                currentValue={
                    editModalType === 'health' ? stats.currentHealth :
                        editModalType === 'mental' ? stats.currentMentalBalance :
                            (stats.willpower - stats.usedWillpower)
                }
                changeValue={
                    editModalType === 'health' ? healthChange :
                        editModalType === 'mental' ? mentalChange :
                            willpowerChange
                }
                notes={
                    editModalType === 'health' ? healthNotes :
                        editModalType === 'mental' ? mentalNotes :
                            willpowerNotes
                }
                onChangeValueChange={
                    editModalType === 'health' ? setHealthChange :
                        editModalType === 'mental' ? setMentalChange :
                            setWillpowerChange
                }
                onNotesChange={
                    editModalType === 'health' ? setHealthNotes :
                        editModalType === 'mental' ? setMentalNotes :
                            setWillpowerNotes
                }
                onApply={
                    editModalType === 'health' ? applyHealthChange :
                        editModalType === 'mental' ? applyMentalChange :
                            applyWillpowerChange
                }
            />
        </div>
    );
}
