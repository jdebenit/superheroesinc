import React, { useState, useEffect } from 'react';
import './TacticPlayerTerminal.css';

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

    return (
        <div className="tactic-player-terminal">
            <div className="terminal-header-internal">
                <h1 className="terminal-title-internal">
                    SHI Tactic Player Terminal (Alpha 0.0.1)
                </h1>
                <div className="terminal-header-actions">
                    {character && (
                        <button onClick={handleExportJSON} className="export-btn">
                            💾 Exportar JSON
                        </button>
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
                            <div className="terminal-stat-input-group">
                                <label htmlFor="current-health">Actual:</label>
                                <input
                                    id="current-health"
                                    type="number"
                                    min="0"
                                    max={stats.maxHealth}
                                    value={stats.currentHealth}
                                    onChange={(e) => handleStatChange('currentHealth', e.target.value)}
                                    className="terminal-stat-input"
                                />
                            </div>
                            <div className="terminal-stat-bar">
                                <div
                                    className="terminal-stat-bar-fill health"
                                    style={{ width: `${(stats.currentHealth / stats.maxHealth) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Mental Balance */}
                        <div className="terminal-stat-card">
                            <div className="terminal-stat-label">EQUILIBRIO MENTAL</div>
                            <div className="terminal-stat-max">Máximo: {stats.maxMentalBalance}</div>
                            <div className="terminal-stat-input-group">
                                <label htmlFor="current-mental">Actual:</label>
                                <input
                                    id="current-mental"
                                    type="number"
                                    min="0"
                                    max={stats.maxMentalBalance}
                                    value={stats.currentMentalBalance}
                                    onChange={(e) => handleStatChange('currentMentalBalance', e.target.value)}
                                    className="terminal-stat-input"
                                />
                            </div>
                            <div className="terminal-stat-bar">
                                <div
                                    className="terminal-stat-bar-fill mental"
                                    style={{ width: `${(stats.currentMentalBalance / stats.maxMentalBalance) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Willpower */}
                        <div className="terminal-stat-card">
                            <div className="terminal-stat-label">VOLUNTAD</div>
                            <div className="terminal-stat-max">Base: {stats.willpower}</div>
                            <div className="terminal-stat-input-group">
                                <label htmlFor="temp-willpower">Usada:</label>
                                <input
                                    id="temp-willpower"
                                    type="number"
                                    value={stats.usedWillpower}
                                    onChange={(e) => handleStatChange('usedWillpower', e.target.value)}
                                    className="terminal-stat-input"
                                />
                            </div>
                            <div className="terminal-stat-total">
                                Total: {stats.willpower - stats.usedWillpower}
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
        </div>
    );
}
