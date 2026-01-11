import React, { useState, useEffect } from 'react';
import './TacticPlayerTerminal.css';
import CharacterSheet from '../character/CharacterSheet';
import { adaptWebCharacter } from '../../utils/characterAdapter';

interface CharacterData {
    name: string;
    alias?: string;
    combatstats: string[];
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
        usedWillpower: 0 // Changed from usedWillpower
    });
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyType, setHistoryType] = useState<'health' | 'mental' | 'willpower'>('health');

    // Temporary inputs for changes
    const [healthChange, setHealthChange] = useState<string>('');
    const [healthNotes, setHealthNotes] = useState<string>('');
    const [mentalChange, setMentalChange] = useState<string>('');
    const [mentalNotes, setMentalNotes] = useState<string>('');
    const [willpowerChange, setWillpowerChange] = useState<string>('');
    const [willpowerNotes, setWillpowerNotes] = useState<string>('');

    // Check for character in localStorage on mount
    useEffect(() => {
        // First check if there's a character sent from CharacterViewer
        const savedCharacter = localStorage.getItem('shi_tpt_character');
        if (savedCharacter) {
            try {
                const data: CharacterData = JSON.parse(savedCharacter);
                loadCharacter(data);
                // Clear the temporary transfer key
                localStorage.removeItem('shi_tpt_character');
            } catch (error) {
                console.error('Error loading character from localStorage:', error);
            }
        } else {
            // Try to load from persistent storage
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
        if (character) { // Only save stats if there's a character loaded
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


    const loadCharacter = (data: CharacterData) => {
        // Validate that it's a character JSON
        if (!data.name || !data.combatstats || !data.attributes) {
            setUploadStatus('❌ ERROR: El archivo no es un personaje válido');
            return;
        }

        // Extract stats from combatstats array
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
            usedWillpower: 0 // Initialize temporary willpower
        });
        setUploadStatus(`✅ PERSONAJE CARGADO: ${data.name}${data.alias ? ` (${data.alias})` : ''}`);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data: CharacterData = JSON.parse(text);

            // Validate that it's a character JSON
            if (!data.name || !data.combatstats || !data.attributes) {
                setUploadStatus('❌ ERROR: El archivo no es un personaje válido');
                return;
            }

            // Extract stats from combatstats array
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
                usedWillpower: 0
            });
            setUploadStatus(`✅ PERSONAJE CARGADO: ${data.name}${data.alias ? ` (${data.alias})` : ''}`);
        } catch (error) {
            console.error('Error loading character:', error);
            setUploadStatus('❌ ERROR: No se pudo leer el archivo JSON');
        }
    };

    const handleStatChange = (field: keyof PlayerStats, value: string) => {
        const numValue = parseInt(value) || 0;
        setStats(prev => ({
            ...prev,
            [field]: numValue
        }));
    };

    const triggerFileInput = () => {
        document.getElementById('json-upload')?.click();
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

            // Validate imported data
            if (!importedData.character || !importedData.stats) {
                alert('❌ ERROR: El archivo no tiene el formato correcto');
                return;
            }

            // Load the imported data
            setCharacter(importedData.character);
            setStats(importedData.stats);
            setHistory(importedData.history || []);

            // Save to localStorage
            localStorage.setItem('shi_tpt_persistent_character', JSON.stringify(importedData.character));
            localStorage.setItem('shi_tpt_persistent_stats', JSON.stringify(importedData.stats));
            localStorage.setItem('shi_tpt_persistent_history', JSON.stringify(importedData.history || []));

            alert('✅ Datos importados correctamente');
        } catch (error) {
            console.error('Error importing JSON:', error);
            alert('❌ ERROR: No se pudo leer el archivo JSON');
        }

        // Reset file input
        event.target.value = '';
    };

    const triggerImportInput = () => {
        document.getElementById('json-import')?.click();
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
            <div className="terminal-header-internal">
                <h1 className="terminal-title-internal">
                    SHI Tactic Player Terminal (Alpha 0.0.2)
                </h1>
                <div className="terminal-header-actions">
                    <input
                        type="file"
                        id="json-import"
                        accept=".json"
                        onChange={handleImportJSON}
                        style={{ display: 'none' }}
                    />
                    <button onClick={triggerImportInput} className="import-btn">
                        📥 Importar JSON
                    </button>
                    {character && (
                        <>
                            <CharacterSheet
                                character={adaptWebCharacter(character)}
                                totalPCs={0}
                            />
                            <button onClick={handleExportJSON} className="export-btn">
                                💾 Exportar JSON
                            </button>
                            <button onClick={handleReset} className="reset-btn">
                                🔄 Reset
                            </button>
                        </>
                    )}
                </div>
            </div>

            {character && (
                <div className="terminal-stats-container">
                    <div className="terminal-character-header">
                        <h2 className="terminal-character-name">{character.name}</h2>
                        {character.alias && (
                            <div className="terminal-character-alias">"{character.alias}"</div>
                        )}
                    </div>

                    <div className="terminal-stats-grid">
                        {/* Health */}
                        <div className="terminal-stat-card">
                            <div className="terminal-stat-label">PUNTOS DE VIDA</div>
                            <div className="terminal-stat-max">Máximo: {stats.maxHealth}</div>

                            <div className="terminal-stat-current-display" onClick={() => openHistoryModal('health')}>
                                <span className="current-label">Actual:</span>
                                <span className="current-value">{stats.currentHealth}</span>
                                <span className="history-hint">📋 Ver historial</span>
                            </div>

                            <div className="terminal-stat-bar">
                                <div
                                    className="terminal-stat-bar-fill health"
                                    style={{ width: `${(stats.currentHealth / stats.maxHealth) * 100}%` }}
                                />
                            </div>

                            <div className="change-input-section">
                                <input
                                    type="number"
                                    placeholder="+/- Cambio"
                                    value={healthChange}
                                    onChange={(e) => setHealthChange(e.target.value)}
                                    className="change-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Notas (opcional)"
                                    value={healthNotes}
                                    onChange={(e) => setHealthNotes(e.target.value)}
                                    className="notes-input"
                                />
                                <button onClick={applyHealthChange} className="apply-btn">
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        {/* Mental Balance */}
                        <div className="terminal-stat-card">
                            <div className="terminal-stat-label">EQUILIBRIO MENTAL</div>
                            <div className="terminal-stat-max">Máximo: {stats.maxMentalBalance}</div>

                            <div className="terminal-stat-current-display" onClick={() => openHistoryModal('mental')}>
                                <span className="current-label">Actual:</span>
                                <span className="current-value">{stats.currentMentalBalance}</span>
                                <span className="history-hint">📋 Ver historial</span>
                            </div>

                            <div className="terminal-stat-bar">
                                <div
                                    className="terminal-stat-bar-fill mental"
                                    style={{ width: `${(stats.currentMentalBalance / stats.maxMentalBalance) * 100}%` }}
                                />
                            </div>

                            <div className="change-input-section">
                                <input
                                    type="number"
                                    placeholder="+/- Cambio"
                                    value={mentalChange}
                                    onChange={(e) => setMentalChange(e.target.value)}
                                    className="change-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Notas (opcional)"
                                    value={mentalNotes}
                                    onChange={(e) => setMentalNotes(e.target.value)}
                                    className="notes-input"
                                />
                                <button onClick={applyMentalChange} className="apply-btn">
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        {/* Willpower */}
                        <div className="terminal-stat-card">
                            <div className="terminal-stat-label">VOLUNTAD</div>
                            <div className="terminal-stat-max">Máximo: {stats.willpower}</div>

                            <div className="terminal-stat-current-display" onClick={() => openHistoryModal('willpower')}>
                                <span className="current-label">Actual:</span>
                                <span className="current-value">{stats.willpower - stats.usedWillpower}</span>
                                <span className="history-hint">📋 Ver historial</span>
                            </div>

                            <div className="terminal-stat-bar">
                                <div
                                    className="terminal-stat-bar-fill willpower"
                                    style={{ width: `${Math.max(0, Math.min(100, ((stats.willpower - stats.usedWillpower) / stats.willpower) * 100))}%` }}
                                />
                            </div>

                            <div className="change-input-section">
                                <input
                                    type="number"
                                    placeholder="+/- Cambio"
                                    value={willpowerChange}
                                    onChange={(e) => setWillpowerChange(e.target.value)}
                                    className="change-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Notas (opcional)"
                                    value={willpowerNotes}
                                    onChange={(e) => setWillpowerNotes(e.target.value)}
                                    className="notes-input"
                                />
                                <button onClick={applyWillpowerChange} className="apply-btn">
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!character && (
                <div className="terminal-empty-state">
                    <div className="terminal-empty-icon">📋</div>
                    <div className="terminal-empty-text">
                        Carga un archivo JSON de personaje para comenzar
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h2>Historial de {
                                historyType === 'health' ? 'Puntos de Vida' :
                                    historyType === 'mental' ? 'Equilibrio Mental' :
                                        'Voluntad'
                            }</h2>
                            <button onClick={() => setShowHistoryModal(false)} className="close-modal-btn">✕</button>
                        </div>
                        <div className="history-modal-body">
                            {history.filter(entry => entry.type === historyType).length === 0 ? (
                                <div className="history-empty">No hay cambios registrados</div>
                            ) : (
                                <div className="history-list">
                                    {history.filter(entry => entry.type === historyType).map((entry, index) => (
                                        <div key={index} className="history-entry">
                                            <div className="history-entry-header">
                                                <span className={`history-change ${entry.change > 0 ? 'positive' : 'negative'}`}>
                                                    {entry.change > 0 ? '+' : ''}{entry.change}
                                                </span>
                                                <span className="history-new-value">→ {entry.newValue}</span>
                                                <span className="history-timestamp">
                                                    {new Date(entry.timestamp).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {entry.notes && (
                                                <div className="history-notes">{entry.notes}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
