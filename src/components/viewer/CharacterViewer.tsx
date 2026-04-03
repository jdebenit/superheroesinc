import React, { useState, useRef, useEffect } from 'react';
import CharacterSheet from '../character/CharacterSheet';
import { adaptWebCharacter } from '../../utils/characterAdapter';
import './CharacterViewer.css';
import Logger from '../../utils/Logger';

interface StoredCharacter {
    id: string;
    data: any;
    addedAt: number;
    source?: 'local' | 'web';
    totalCost?: string | number;
}

interface CharacterViewerProps {
    webCharacters?: StoredCharacter[];
}

export default function CharacterViewer({ webCharacters = [] }: CharacterViewerProps) {
    const [localCharacters, setLocalCharacters] = useState<StoredCharacter[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showWebCharacters, setShowWebCharacters] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('shi_viewer_characters');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // MIGRATION: Ensure old stored chars have 'local' source if missing
                    const migrated = parsed.map((c: any) => ({ ...c, source: 'local' }));
                    setLocalCharacters(migrated);

                    if (parsed.length > 0 && !selectedId) {
                        // Only select if nothing selected yet
                        setSelectedId(parsed[0].id);
                    }
                }
            }
        } catch (e) {
            Logger.error("Error loading characters from localStorage:", e);
        }
    }, []);

    // Save to localStorage whenever localCharacters change
    useEffect(() => {
        try {
            localStorage.setItem('shi_viewer_characters', JSON.stringify(localCharacters));
        } catch (e) {
            Logger.error("Error saving characters to localStorage:", e);
        }
    }, [localCharacters]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                throw new Error("El archivo no es un JSON válido.");
            }

            // Basic validation
            if (!parsed || typeof parsed !== 'object' || !parsed.attributes) {
                throw new Error("El archivo JSON no tiene la estructura de un personaje válido.");
            }

            // Fallback for missing name
            if (!parsed.name) {
                parsed.name = file.name.replace(/\.json$/i, '') || "Sin Nombre";
            }

            setError(null);

            // Create new stored character
            // Use timestamp + random for ID to avoid collisions
            const newChar: StoredCharacter = {
                id: 'local_' + Date.now().toString() + Math.random().toString(36).substr(2, 9),
                data: parsed,
                addedAt: Date.now(),
                source: 'local'
            };

            setLocalCharacters(prev => [newChar, ...prev]);
            setSelectedId(newChar.id);

        } catch (err: any) {
            Logger.error(err);
            setError(err.message || "Error al leer el archivo.");
        }

        // Reset input so same file can be selected again if needed
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selection when clicking delete
        if (!confirm('¿Seguro que quieres eliminar este personaje de la lista?')) return;

        setLocalCharacters(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // Combine lists for selection finding
    const allCharacters = [...localCharacters, ...webCharacters];
    const selectedCharacter = allCharacters.find(c => c.id === selectedId);

    // Sort web characters alphabetically
    const sortedWebChars = [...webCharacters].sort((a, b) => a.data.name.localeCompare(b.data.name));

    return (
        <div className="viewer-layout">
            {/* Sidebar */}
            <div className="viewer-sidebar">
                {/* Local Characters Section */}
                <div className="sidebar-section-header">
                    <h3 className="section-title">Mis Fichas</h3>
                    <div className="section-subtitle">
                        {localCharacters.length} locales
                    </div>
                </div>

                <div className="local-list">
                    {localCharacters.length === 0 ? (
                        <div className="empty-list-msg">
                            No hay fichas subidas.
                        </div>
                    ) : (
                        <ul className="char-list">
                            {localCharacters.map(char => (
                                <li
                                    key={char.id}
                                    onClick={() => setSelectedId(char.id)}
                                    className={`list-item ${selectedId === char.id ? 'active' : ''}`}
                                >
                                    <div className="list-item-info">
                                        <div className="char-name">
                                            {char.data.alias ? (
                                                <>
                                                    {char.data.alias}
                                                    {char.data.name && <div className="secondary-name">{char.data.name}</div>}
                                                </>
                                            ) : (
                                                char.data.name
                                            )}
                                        </div>
                                        <div className="char-details">
                                            Nivel {char.data.level || 1}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(char.id, e)}
                                        title="Eliminar"
                                        className="delete-btn"
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="upload-section">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={triggerFileInput}
                        className="upload-btn"
                    >
                        ➕ Subir JSON
                    </button>
                    {error && (
                        <div className="error-msg">
                            {error}
                        </div>
                    )}
                </div>

                {/* Web Characters Section */}
                <div
                    onClick={() => setShowWebCharacters(!showWebCharacters)}
                    className={`web-section-toggle ${showWebCharacters ? 'open' : ''}`}
                >
                    <div>
                        <h3 className="web-section-title">Fichas de la Web</h3>
                        <div className="web-section-subtitle">
                            {sortedWebChars.length} oficiales
                        </div>
                    </div>
                    <span className={`toggle-icon ${showWebCharacters ? 'open' : ''}`}>
                        ▼
                    </span>
                </div>

                {showWebCharacters && (
                    <div className="web-list">
                        {sortedWebChars.length === 0 ? (
                            <div className="empty-list-msg">
                                Cargando fichas...
                            </div>
                        ) : (
                            <ul className="char-list">
                                {sortedWebChars.map(char => (
                                    <li
                                        key={char.id}
                                        onClick={() => setSelectedId(char.id)}
                                        className={`web-list-item ${selectedId === char.id ? 'active' : ''}`}
                                    >
                                        <div className="list-item-info">
                                            <div className="web-char-name">
                                                {char.data.alias ? (
                                                    <>
                                                        {char.data.alias}
                                                        {char.data.name && <div className="secondary-name">{char.data.name}</div>}
                                                    </>
                                                ) : (
                                                    char.data.name
                                                )}
                                            </div>
                                            <div className="web-char-details">
                                                Nivel {char.data.level || 1} • {char.data?.origin?.items?.[0] ? Object.keys(char.data.origin.items[0])[0] : 'Desconocido'}
                                            </div>
                                        </div>
                                        <span title="Ficha Oficial" className="official-badge">🌐</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

            </div>

            {/* Main Content */}
            <div className="viewer-content">
                {selectedCharacter ? (
                    <div className="content-card">
                        <div className="content-header">
                            <h2 className="content-title">
                                {selectedCharacter.data.alias ? selectedCharacter.data.alias : selectedCharacter.data.name}
                                {selectedCharacter.data.alias && selectedCharacter.data.name && (
                                    <div className="secondary-title">
                                        {selectedCharacter.data.name}
                                    </div>
                                )}
                            </h2>
                            <span className="content-source-badge">
                                {selectedCharacter.source === 'web'
                                    ? '🌐 Ficha Oficial de la Web'
                                    : `Añadido: ${new Date(selectedCharacter.addedAt).toLocaleDateString()}`}
                            </span>
                        </div>
                        
                        <div className="character-summary">
                            <h4 className="summary-title">Resumen de Ficha</h4>
                            <div className="summary-grid">
                                <div>
                                    <strong>Nivel:</strong> {selectedCharacter.data.level || 1}
                                </div>
                                <div>
                                    <strong>Origen:</strong> {selectedCharacter.data?.origin?.items?.[0] ? Object.keys(selectedCharacter.data.origin.items[0])[0] : 'Desconocido'}
                                </div>
                                {selectedCharacter.data.meta?.version && (
                                    <div>
                                        <strong>Versión Wizard:</strong> <span className="version-badge">{selectedCharacter.data.meta.version}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="viewer-actions">
                            <button
                                onClick={() => {
                                    try {
                                        localStorage.setItem('shi_tpt_character', JSON.stringify(adaptWebCharacter(selectedCharacter.data)));
                                        window.open('/recursos/tactic-player-terminal', '_blank');
                                    } catch (error) {
                                        Logger.error('Error sending character to terminal:', error);
                                        alert('Error al enviar el personaje al terminal');
                                    }
                                }}
                                className="tpt-button"
                            >
                                🎮 Abrir en SHI TPT
                            </button>
                            <button className="tpt-button" disabled={true}>
                                🎯 Enviar a SHI TMT
                            </button>
                        </div>

                        <div className="character-sheet-container">
                            <CharacterSheet character={adaptWebCharacter(selectedCharacter.data)} totalPCs={selectedCharacter.data.totalCost} />
                        </div>
                    </div>
                ) : (
                    <div className="empty-viewer">
                        <div className="empty-icon">👈</div>
                        <h3 className="empty-title">Selecciona un personaje</h3>
                        <p className="empty-text">
                            Selecciona una ficha oficial de la web o importa tus propios archivos JSON.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
