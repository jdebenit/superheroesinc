import { useCallback } from 'react';
import { validateAndSanitizeCharacter } from '../../utils/characterAdapter';
import { useJsonExport } from '../useJsonExport';
import Logger from '../../utils/Logger';
import type { CharacterData } from '../../types/character';
import type { ToastType } from '../../components/wizard/shared/layout/WizardDialogs';

interface UseCharacterIOOptions {
    character: CharacterData;
    loadCharacter: (loadedData: any) => void;
    resetCharacter: () => void;
    onNavigateToFirstStep: () => void;
    showToast: (message: string, type?: ToastType) => void;
    askConfirm: (message: string, onConfirm: () => void) => void;
}

/**
 * Hook que encapsula las operaciones de Entrada/Salida (I/O) del Wizard:
 * importación y validación de JSON, exportación de ficha y reinicio de personaje.
 */
export function useCharacterIO({
    character,
    loadCharacter,
    resetCharacter,
    onNavigateToFirstStep,
    showToast,
    askConfirm
}: UseCharacterIOOptions) {
    const { downloadJson } = useJsonExport(character, showToast);

    const handleFinish = useCallback(() => {
        downloadJson();
    }, [downloadJson]);

    const handleReset = useCallback(() => {
        askConfirm(
            '¿Estás seguro de que quieres reiniciar toda la creación del personaje? Esta acción no se puede deshacer.',
            () => {
                resetCharacter();
                onNavigateToFirstStep();
                showToast('Personaje reiniciado.', 'success');
            }
        );
    }, [askConfirm, resetCharacter, onNavigateToFirstStep, showToast]);

    const handleImportJSON = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e: any) => {
            const file = e.target?.files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                let rawImport: any;
                try {
                    rawImport = JSON.parse(text);
                } catch {
                    showToast('❌ El archivo no es un JSON válido.', 'error');
                    return;
                }

                // Validar y sanear estructuralmente la ficha
                const validation = validateAndSanitizeCharacter(rawImport, file.name);
                if (!validation.isValid || !validation.character) {
                    showToast(`❌ ${validation.errors[0] || 'El archivo JSON no contiene un personaje válido.'}`, 'error');
                    return;
                }

                if (validation.warnings.length > 0) {
                    Logger.warn('⚠️ Advertencias al importar personaje:', validation.warnings);
                }

                loadCharacter(validation.character);
                onNavigateToFirstStep();

                showToast(`Personaje "${validation.character.name}" cargado correctamente!`, 'success');
                Logger.log('📥 Imported character:', validation.character);
            } catch (error) {
                Logger.error('Error importing JSON:', error);
                showToast('Error al leer el archivo JSON. Asegúrate de que es un archivo válido.', 'error');
            }
        };

        input.click();
    }, [loadCharacter, onNavigateToFirstStep, showToast]);

    return {
        handleImportJSON,
        handleReset,
        handleFinish
    };
}
