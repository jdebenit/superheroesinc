import React, { useState, useRef, useEffect } from 'react';
import CharacterSheet from '../character/CharacterSheet';
import { adaptWebCharacter } from '../../utils/characterAdapter';
import { useJsonExport } from '../../hooks/useJsonExport';
import { pushCharacterToTmt } from '../terminal/hooks/useTmtStore';
import { initialCharacterState } from '../../data/wizardConfig';
import { mergeWithDefaults } from '../../utils/dataCleaner';
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
    const [deletingId, setDeletingId] = useState<string | null>(null);
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

        Logger.info("--- Iniciando subida de archivo ---", file.name);

        try {
            const text = await file.text();
            Logger.info("Contenido del archivo leído correctamente");

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                Logger.error("Error al parsear JSON", e);
                throw new Error("El archivo no es un JSON válido.");
            }

            Logger.info("JSON parseado:", parsed);

            // Minimal validation - just check if it's an object
            if (!parsed || typeof parsed !== 'object') {
                throw new Error("El archivo no es un objeto válido.");
            }

            // Fallback for missing attributes OR skills
            if (!parsed.attributes) {
                parsed.attributes = { values: {} };
            }
            if (!parsed.skills) {
                parsed.skills = { items: [] };
            }

            // Fallback for missing name
            if (!parsed.name && !parsed.alias) {
                parsed.name = file.name.replace(/\.json$/i, '') || "Sin Nombre";
            }

            // CRITICAL: Merge with defaults to avoid "blank" characters if the JSON was too clean
            const fullData = mergeWithDefaults(parsed, initialCharacterState);

            setError(null);
            Logger.info("Validación superada. Personaje procesado.");

            // Create new stored character
            const newChar: StoredCharacter = {
                id: 'local_' + Date.now().toString() + Math.random().toString(36).substr(2, 9),
                data: fullData, // Use the merged data
                addedAt: Date.now(),
                source: 'local'
            };

            setLocalCharacters(prev => {
                Logger.info("Actualizando lista de personajes locales (prev count:", prev.length, ")");
                return [newChar, ...prev];
            });
            setSelectedId(newChar.id);
            Logger.info("Subida completada con éxito. ID seleccionado:", newChar.id);

        } catch (err: any) {
            Logger.error("Error crítico en handleFileChange:", err);
            setError(err.message || "Error al leer el archivo.");
            // Alerta de emergencia si falla en silencio
            if (!err.message) alert("Error fatal al subir: " + String(err));
        }

        // Reset input
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDelete = React.useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (deletingId !== id) {
            setDeletingId(id);
            // Auto-cancel after 3 seconds
            setTimeout(() => setDeletingId(null), 3000);
            return;
        }

        // Second click -> Actual delete
        setLocalCharacters(prev => {
            const newList = prev.filter(c => c.id !== id);
            try {
                localStorage.setItem('shi_viewer_characters', JSON.stringify(newList));
            } catch (err) {
                Logger.error("Error saving after delete:", err);
            }
            return newList;
        });

        if (selectedId === id) {
            setSelectedId(null);
        }
        setDeletingId(null);
    }, [deletingId, selectedId]);

    const handleEditInWizard = () => {
        if (!selectedCharacter) return;
        try {
            // Adapt to wizard format to ensure compatibility
            const adapted = adaptWebCharacter(selectedCharacter.data);
            localStorage.setItem('characterWizardState', JSON.stringify(adapted));
            window.location.href = '/recursos/wizard-fullscreen';
        } catch (error) {
            Logger.error('Error sending character to wizard:', error);
            alert('Error al abrir el personaje en el editor');
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

    // JSON export using the same hook as CharacterSheet
    const adaptedForExport = selectedCharacter ? adaptWebCharacter(selectedCharacter.data) : null;
    const { downloadJson } = useJsonExport(adaptedForExport ?? {});

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
                                    className={`list-item ${selectedId === char.id ? 'active' : ''} ${deletingId === char.id ? 'deleting' : ''}`}
                                >
                                    <div className="list-item-clickable" onClick={() => setSelectedId(char.id)}>
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
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(char.id, e)}
                                        title={deletingId === char.id ? "Click para confirmar borrado" : "Eliminar"}
                                        className={`delete-btn ${deletingId === char.id ? 'confirm-mode' : ''}`}
                                    >
                                        {deletingId === char.id ? '⚠️ OK?' : '🗑️'}
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
                                    <div className="content-subtitle">
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
                            <div className="summary-header">
                                <h4 className="summary-title">Resumen de Ficha</h4>
                                <CharacterSheet
                                    character={adaptWebCharacter(selectedCharacter.data)}
                                    totalPCs={selectedCharacter.data.totalCost}
                                    renderTrigger={(open) => (
                                        <button onClick={open} className="expand-summary-btn" title="Ver ficha completa">
                                            🔍 Ficha Completa
                                        </button>
                                    )}
                                />
                            </div>
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
                                        window.open('/recursos/tactic-player-terminal', 'shi_tpt_terminal');
                                    } catch (error) {
                                        Logger.error('Error sending character to terminal:', error);
                                        alert('Error al enviar el personaje al terminal');
                                    }
                                }}
                                className="viewer-button btn-primary"
                            >
                                🎮 Abrir en SHI TPT
                            </button>
                            <button
                                onClick={() => {
                                    try {
                                        pushCharacterToTmt(
                                            adaptWebCharacter(selectedCharacter.data),
                                            'pj'
                                        );
                                        window.open('/recursos/tactic-master-terminal', 'shi_tmt_terminal');
                                    } catch (error) {
                                        Logger.error('Error sending character to TMT:', error);
                                        alert('Error al enviar el personaje al TMT');
                                    }
                                }}
                                className="viewer-button btn-primary"
                            >
                                🎯 Abrir en SHI TMT
                            </button>
                            <button
                                onClick={downloadJson}
                                className="viewer-button download-btn"
                                title="Descargar ficha como JSON"
                            >
                                ⬇️ Descargar JSON
                            </button>

                            <button
                                onClick={handleEditInWizard}
                                className="viewer-button edit-wizard-btn"
                                title="Abrir en el Generador"
                            >
                                🛠️ Editar en Wizard
                            </button>
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
