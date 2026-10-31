import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { StoredCharacter, CharacterViewerProps } from './types';
import { adaptWebCharacter, validateAndSanitizeCharacter } from '../../utils/characterAdapter';
import { useJsonExport } from '../../hooks/useJsonExport';
import { initialCharacterState } from '../../data/wizardConfig';
import { mergeWithDefaults } from '../../utils/dataCleaner';
import { getCharacterDisplayName } from '../../utils/characterDisplay';
import { ViewerSidebar } from './sections/ViewerSidebar';
import { ViewerContent } from './sections/ViewerContent';
import Logger from '../../utils/Logger';
import './CharacterViewer.css';

export default function CharacterViewer({ webCharacters = [] }: CharacterViewerProps) {
    const [localCharacters, setLocalCharacters] = useState<StoredCharacter[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showWebCharacters, setShowWebCharacters] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Normalize and adapt web characters from props
    const adaptedWebChars = useMemo(() => {
        return webCharacters.map(char => ({
            ...char,
            data: adaptWebCharacter(char.data)
        }));
    }, [webCharacters]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('shi_viewer_characters');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // MIGRATION: Ensure old stored chars have 'local' source if missing
                    const migrated = parsed
                        .filter((c: any) => c && c.data)
                        .map((c: any) => ({ ...c, source: 'local' }));
                    setLocalCharacters(migrated);

                    if (migrated.length > 0 && !selectedId) {
                        setSelectedId(migrated[0].id);
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
            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch (e) {
                Logger.error("Error al parsear JSON", e);
                throw new Error("El archivo no es un JSON válido.");
            }

            // Validación y saneamiento estructural
            const validation = validateAndSanitizeCharacter(parsed, file.name);
            if (!validation.isValid || !validation.character) {
                throw new Error(validation.errors[0] || "El archivo no contiene un personaje válido.");
            }

            if (validation.warnings.length > 0) {
                Logger.warn("Advertencias al validar personaje:", validation.warnings);
            }

            const fullData = mergeWithDefaults(validation.character, initialCharacterState);
            setError(null);

            const newChar: StoredCharacter = {
                id: 'local_' + Date.now().toString() + Math.random().toString(36).slice(2, 11),
                data: fullData,
                addedAt: Date.now(),
                source: 'local'
            };

            setLocalCharacters(prev => [newChar, ...prev]);
            setSelectedId(newChar.id);
            Logger.info("Subida completada con éxito. ID seleccionado:", newChar.id);
        } catch (err: any) {
            Logger.error("Error crítico en handleFileChange:", err);
            setError(err.message || "Error al leer el archivo.");
            if (!err.message) alert("Error fatal al subir: " + String(err));
        }

        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (deletingId !== id) {
            setDeletingId(id);
            setTimeout(() => setDeletingId(null), 3000);
            return;
        }

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

    // Combine lists for selection finding
    const allCharacters = useMemo(() => [...localCharacters, ...adaptedWebChars], [localCharacters, adaptedWebChars]);
    const selectedCharacter = useMemo(() => allCharacters.find(c => c.id === selectedId), [allCharacters, selectedId]);

    const handleEditInWizard = useCallback(() => {
        if (!selectedCharacter) return;
        try {
            const adapted = adaptWebCharacter(selectedCharacter.data);
            localStorage.setItem('characterWizardState', JSON.stringify(adapted));
            window.location.href = '/recursos/wizard-fullscreen';
        } catch (error) {
            Logger.error('Error sending character to wizard:', error);
            alert('Error al abrir el personaje en el editor');
        }
    }, [selectedCharacter]);

    // Sort web characters alphabetically by Display Name
    const sortedWebChars = useMemo(() => {
        return [...adaptedWebChars].sort((a, b) => 
            getCharacterDisplayName(a.data).localeCompare(getCharacterDisplayName(b.data))
        );
    }, [adaptedWebChars]);

    // JSON export using hook
    const adaptedForExport = useMemo(() => {
        return selectedCharacter ? adaptWebCharacter(selectedCharacter.data) : null;
    }, [selectedCharacter]);

    const { downloadJson } = useJsonExport(adaptedForExport ?? {});

    return (
        <div className="viewer-layout">
            <ViewerSidebar
                localCharacters={localCharacters}
                webCharacters={sortedWebChars}
                selectedId={selectedId}
                deletingId={deletingId}
                showWebCharacters={showWebCharacters}
                error={error}
                fileInputRef={fileInputRef}
                onSelect={setSelectedId}
                onDelete={handleDelete}
                onToggleWebCharacters={() => setShowWebCharacters(!showWebCharacters)}
                onFileChange={handleFileChange}
                onTriggerUpload={() => fileInputRef.current?.click()}
            />

            <ViewerContent
                selectedCharacter={selectedCharacter}
                onEditInWizard={handleEditInWizard}
                onDownloadJson={downloadJson}
            />
        </div>
    );
}
