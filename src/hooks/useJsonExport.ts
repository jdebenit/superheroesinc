import { useCallback } from 'react';
import { APP_VERSIONS } from '../data/appVersions';
import { calculateDiff } from '../utils/dataCleaner';
import { initialCharacterState } from '../data/wizardConfig';
import { calculateDerivedStats, formatDerivedStats, applyStatsOverrides } from '../utils/characterCalculations';
import Logger from '../utils/Logger';

/**
 * Custom hook for handling JSON export functionality
 * Supports File System Access API with automatic fallback
 */
export const useJsonExport = (
    character: any,
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void
) => {
    const downloadJson = useCallback(async () => {
        // 1. Calculate clean data (diff from defaults)
        const cleanData = calculateDiff(character, initialCharacterState);

        // 2. Force calculation of latest derived stats for the export
        // This ensures the JSON has valid stats even if the user hasn't visited Step 6
        const derivedStats = calculateDerivedStats(
            character.attributes?.values || {},
            character.origin?.items || [],
            character.skills || {}
        );
        const { combatStats: calculatedCombatStats, otherStats: calculatedOtherStats } = formatDerivedStats(derivedStats);
        
        // Apply overrides to export current values (stable format)
        const combatStats = applyStatsOverrides(calculatedCombatStats, character.combatstats);
        const otherStats = applyStatsOverrides(calculatedOtherStats, character.otherstats);

        // 3. Prepare export object
        // Use 'any' to allow adding properties easily
        const exportData: any = cleanData || {};

        // 4. Inject stats and critical fields
        exportData.combatstats = combatStats;
        exportData.otherstats = otherStats;

        // Force critical fields to always be present
        // This ensures valid import even if values match defaults
        exportData.name = character.name || character.alias || "Nuevo Personaje";
        exportData.alias = character.alias || "";
        exportData.attributes = character.attributes;
        exportData.origin = character.origin;
        exportData.skills = character.skills;
        exportData.powers = character.powers;
        
        exportData.meta = {
            ...character.meta,
            version: APP_VERSIONS.WIZARD,
            generator: 'SHI Wizard'
        };

        // Recursive helper to remove null, undefined, empty strings, empty arrays, and isParahumanoHybrid: false from the export object
        const removeNullValues = (obj: any): any => {
            if (obj === null || obj === undefined) {
                return undefined;
            }
            if (typeof obj === 'string' && obj.trim() === '') {
                return undefined;
            }
            if (Array.isArray(obj)) {
                const cleanedArr = obj
                    .map(item => removeNullValues(item))
                    .filter(item => item !== undefined && item !== null);
                return cleanedArr.length > 0 ? cleanedArr : undefined;
            }
            if (typeof obj === 'object') {
                const cleaned: any = {};
                let hasKeys = false;
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        if (key === 'isParahumanoHybrid' && obj[key] === false) {
                            continue;
                        }
                        const val = removeNullValues(obj[key]);
                        if (val !== undefined && val !== null) {
                            cleaned[key] = val;
                            hasKeys = true;
                        }
                    }
                }
                return hasKeys ? cleaned : undefined;
            }
            return obj;
        };

        const cleanedExportData = removeNullValues(exportData) || {};

        const baseName = (character.alias || character.name || 'personaje');
        const filename = `${baseName.toLowerCase().trim().replace(/\s+/g, '-')}.json`;
        const jsonStr = JSON.stringify(cleanedExportData, null, 2);

        // Try using the File System Access API
        if ('showSaveFilePicker' in window) {
            try {
                // @ts-ignore - Types for showSaveFilePicker might not be available in all envs
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonStr);
                await writable.close();
                if (onShowToast) onShowToast('¡Personaje exportado correctamente!', 'success');
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    Logger.error('File Picker Error:', err);
                    if (onShowToast) onShowToast('Hubo un error al exportar el archivo.', 'error');
                }
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback or if API not supported
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        if (onShowToast) onShowToast('¡Personaje exportado correctamente!', 'success');
    }, [character, onShowToast]);

    return { downloadJson };
};
