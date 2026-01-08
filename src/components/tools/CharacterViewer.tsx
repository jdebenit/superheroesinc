import React, { useState, useRef, useEffect } from 'react';
import CharacterPreview from '../wizard/CharacterPreview';

interface StoredCharacter {
    id: string;
    data: any;
    addedAt: number;
}

export default function CharacterViewer() {
    const [characters, setCharacters] = useState<StoredCharacter[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('shi_viewer_characters');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setCharacters(parsed);
                    if (parsed.length > 0) {
                        // Automatically select the most recently added or first one
                        setSelectedId(parsed[0].id);
                    }
                }
            }
        } catch (e) {
            console.error("Error loading characters from localStorage:", e);
        }
    }, []);

    // Save to localStorage whenever characters change
    useEffect(() => {
        try {
            localStorage.setItem('shi_viewer_characters', JSON.stringify(characters));
        } catch (e) {
            console.error("Error saving characters to localStorage:", e);
        }
    }, [characters]);

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
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                data: parsed,
                addedAt: Date.now()
            };

            setCharacters(prev => [newChar, ...prev]);
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

        setCharacters(prev => prev.filter(c => c.id !== id));
        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const selectedCharacter = characters.find(c => c.id === selectedId);

    return (
        <div className="viewer-layout" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(250px, 1fr) 3fr',
            gap: '2rem',
            alignItems: 'start'
        }}>
            {/* Sidebar */}
            <div className="viewer-sidebar" style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>Mis Personajes</h3>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {characters.length} almacenados
                    </div>
                </div>

                <div className="character-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {characters.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                            No hay personajes guardados.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {characters.map(char => (
                                <li
                                    key={char.id}
                                    onClick={() => setSelectedId(char.id)}
                                    style={{
                                        padding: '1rem',
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
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
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
                                            fontSize: '1.1rem',
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

                <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
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
                            padding: '0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        ➕ Importar JSON
                    </button>
                    {error && (
                        <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.85rem', textAlign: 'left' }}>
                            {error}
                        </div>
                    )}
                </div>
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
                                Añadido: {new Date(selectedCharacter.addedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <CharacterPreview character={selectedCharacter.data} totalPCs={selectedCharacter.data.totalCost} />
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
                            Selecciona un personaje de la lista o importa un nuevo archivo JSON para visualizarlo.
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
                    }
                }
            `}</style>
        </div>
    );
}
