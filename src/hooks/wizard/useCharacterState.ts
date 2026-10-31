import { useReducer, useEffect, useCallback, useRef } from 'react';
import { initialCharacterState } from '../../data/wizardConfig';
import { characterReducer, type CharacterAction } from '../../utils/characterReducer';
import { mergeWithDefaults } from '../../utils/dataCleaner';
import Logger from '../../utils/Logger';
import { APP_VERSIONS } from '../../data/appVersions';
import type { CharacterData } from '../../types/character';

const STORAGE_KEY = 'characterWizardState';

export interface UseCharacterStateReturn {
    character: CharacterData;
    dispatch: React.Dispatch<CharacterAction>;
    updateCharacter: (updates: Partial<CharacterData> | Record<string, any> | ((prev: CharacterData) => Partial<CharacterData>)) => void;
    handleStepChange: (field: string, value: any) => void;
    loadCharacter: (loadedData: any) => void;
    resetCharacter: () => void;
    syncTransformations: () => void;
}

/**
 * Custom hook centralizado para la gestión del estado del personaje en el Wizard.
 * Usa `characterReducer` para garantizar transiciones inmutables, atómicas y con
 * auto-sincronización de transformaciones (Hombre Lobo, Poderes, etc.).
 */
export function useCharacterState(): UseCharacterStateReturn {
    const [character, dispatch] = useReducer(characterReducer, initialCharacterState as CharacterData);
    const isMounted = useRef(false);

    // 1. Cargar personaje desde localStorage al montar (lado cliente únicamente)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                const validated = mergeWithDefaults(parsed, initialCharacterState);

                // MIGRATION: Asegurar bonos manuales si faltan en guardados antiguos
                if (validated.attributes && !validated.attributes.manualBonuses) {
                    validated.attributes.manualBonuses = {
                        Fuerza: 0, Agilidad: 0, Constitución: 0,
                        Inteligencia: 0, Percepción: 0, Voluntad: 0, Apariencia: 0
                    };
                }

                Logger.log('✅ Loaded character from localStorage:', validated);
                dispatch({ type: 'SET_CHARACTER', payload: validated });
            }
        } catch (e) {
            Logger.error('❌ Error loading character from localStorage:', e);
        } finally {
            isMounted.current = true;
        }
    }, []);

    // 2. Asegurar que los metadatos siempre coinciden con la versión actual de la aplicación
    useEffect(() => {
        const currentMeta = character.meta || {};
        if (currentMeta.version !== APP_VERSIONS.WIZARD || currentMeta.generator !== 'SHI Wizard') {
            const newMeta = {
                ...currentMeta,
                version: APP_VERSIONS.WIZARD,
                generator: 'SHI Wizard'
            };
            Logger.log('🔄 Updating Character Metadata:', newMeta);
            dispatch({
                type: 'APPLY_PATCH',
                payload: { meta: newMeta }
            });
        }
    }, [character.meta]);

    // 3. Persistir en localStorage cada vez que cambie el personaje (sólo tras montar)
    useEffect(() => {
        if (typeof window === 'undefined' || !isMounted.current) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
            Logger.log('💾 Saved character to localStorage');
        } catch (e) {
            Logger.error('❌ Error saving to localStorage:', e);
        }
    }, [character]);

    // Acciones de actualización compatibles y atómicas
    const updateCharacter = useCallback((updates: any) => {
        dispatch({ type: 'APPLY_PATCH', payload: updates });
    }, []);

    const handleStepChange = useCallback((field: string, value: any) => {
        Logger.log('🔄 handleStepChange:', field, value);
        dispatch({ type: 'APPLY_PATCH', payload: { [field]: value } });
    }, []);

    const loadCharacter = useCallback((loadedData: any) => {
        dispatch({ type: 'SET_CHARACTER', payload: loadedData });
    }, []);

    const resetCharacter = useCallback(() => {
        dispatch({ type: 'RESET_CHARACTER' });
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY);
                Logger.log('🗑️ Cleared localStorage');
            } catch (e) {
                Logger.error('❌ Error clearing localStorage:', e);
            }
        }
    }, []);

    const syncTransformations = useCallback(() => {
        dispatch({ type: 'SYNC_TRANSFORMATIONS' });
    }, []);

    return {
        character,
        dispatch,
        updateCharacter,
        handleStepChange,
        loadCharacter,
        resetCharacter,
        syncTransformations
    };
}
