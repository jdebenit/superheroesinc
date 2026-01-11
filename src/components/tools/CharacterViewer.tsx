
import React, { useState, useRef, useEffect } from 'react';
import CharacterSheet from '../character/CharacterSheet';
import { adaptWebCharacter } from '../../utils/characterAdapter';
import './CharacterViewer.css';

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
            console.error("Error loading characters from localStorage:", e);
        }
    }, []);

    // Save to localStorage whenever localCharacters change
    useEffect(() => {
        try {
            localStorage.setItem('shi_viewer_characters', JSON.stringify(localCharacters));
        } catch (e) {
            console.error("Error saving characters to localStorage:", e);
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
            if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.attributes) {
                throw new Error("El archivo JSON no tiene la estructura de un personaje válido.");
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
            console.error(err);
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
        <div className="viewer-layout" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) 3fr',
            gap: '2rem',
            alignItems: 'start'
        }}>
            {/* Sidebar */}
            <div className="viewer-sidebar" style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Local Characters Section */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Mis Fichas</h3>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {localCharacters.length} locales
                    </div>
                </div>

                <div className="local-list" style={{ overflowY: 'auto', flex: '0 0 auto', maxHeight: '50vh', borderBottom: '1px solid #e5e7eb' }}>
                    {localCharacters.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            No hay fichas subidas.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {localCharacters.map(char => (
                                <li
                                    key={char.id}
                                    onClick={() => setSelectedId(char.id)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid #f3f4f6',
                                        cursor: 'pointer',
                                        backgroundColor: selectedId === char.id ? '#eff6ff' : 'white',
                                        borderLeft: selectedId === char.id ? '4px solid #2563eb' : '4px solid transparent',
                                        transition: 'background-color 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 'bold', color: selectedId === char.id ? '#1e40af' : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {char.data.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            Nivel {char.data.level || 1}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(char.id, e)}
                                        title="Eliminar"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            opacity: 0.6
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', flexShrink: 0 }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                    <button
                        onClick={triggerFileInput}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        ➕ Subir JSON
                    </button>
                    {error && (
                        <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.85rem', textAlign: 'left' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Web Characters Section */}
                <div
                    onClick={() => setShowWebCharacters(!showWebCharacters)}
                    style={{
                        padding: '1rem',
                        borderBottom: showWebCharacters ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: '#f0fdf4',
                        flexShrink: 0,
                        borderTop: '4px solid #bbf7d0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        userSelect: 'none'
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#166534' }}>Fichas de la Web</h3>
                        <div style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.25rem' }}>
                            {sortedWebChars.length} oficiales
                        </div>
                    </div>
                    <span style={{ fontSize: '1.2rem', transform: showWebCharacters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#166534' }}>
                        ▼
                    </span>
                </div>

                {showWebCharacters && (
                    <div className="web-list" style={{ overflowY: 'auto', flex: '0 0 auto', backgroundColor: '#f0fdf4', maxHeight: '50vh' }}>
                        {sortedWebChars.length === 0 ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                Cargando fichas...
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {sortedWebChars.map(char => (
                                    <li
                                        key={char.id}
                                        onClick={() => setSelectedId(char.id)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid #dcfce7',
                                            cursor: 'pointer',
                                            backgroundColor: selectedId === char.id ? '#dcfce7' : 'transparent',
                                            borderLeft: selectedId === char.id ? '4px solid #16a34a' : '4px solid transparent',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 'bold', color: selectedId === char.id ? '#14532d' : '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {char.data.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#15803d' }}>
                                                Nivel {char.data.level || 1} • {char.data?.origin?.items?.[0] ? Object.keys(char.data.origin.items[0])[0] : 'Desconocido'}
                                            </div>
                                        </div>
                                        <span title="Ficha Oficial" style={{ fontSize: '1rem' }}>🌐</span>
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
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>
                                {selectedCharacter.data.name}
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                {selectedCharacter.source === 'web'
                                    ? '🌐 Ficha Oficial de la Web'
                                    : `Añadido: ${new Date(selectedCharacter.addedAt).toLocaleDateString()}`}
                            </span>
                        </div>
                        <div className="viewer-actions">
                            <CharacterSheet character={adaptWebCharacter(selectedCharacter.data)} totalPCs={selectedCharacter.data.totalCost} />
                            <button
                                onClick={() => {
                                    try {
                                        localStorage.setItem('shi_tpt_character', JSON.stringify(adaptWebCharacter(selectedCharacter.data)));
                                        window.open('/recursos/tactic-player-terminal', '_blank');
                                    } catch (error) {
                                        console.error('Error sending character to terminal:', error);
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
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem 2rem',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '2px dashed #e5e7eb',
                        color: '#9ca3af',
                        textAlign: 'center',
                        minHeight: '400px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👈</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>Selecciona un personaje</h3>
                        <p style={{ maxWidth: '300px' }}>
                            Selecciona una ficha oficial de la web o importa tus propios archivos JSON.
                        </p>
                    </div>
                )}
            </div>

            {/* Mobile Responsive Style */}
            <style>{`
                @media (max-width: 768px) {
                    .viewer-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .viewer-sidebar {
                        margin-bottom: 2rem;
                        max-height: 50vh;
                    }
                }
            `}</style>
        </div>
    );
}
