import { useCallback } from 'react';
import { calculateDiff } from '../../../utils/dataCleaner';
import { initialCharacterState } from '../../../data/wizardConfig';
import { calculateDerivedStats, formatDerivedStats } from '../../../utils/characterCalculations';

/**
 * Custom hook for handling JSON export functionality
 * Supports File System Access API with automatic fallback
 */
export const useJsonExport = (character: any) => {
    const downloadJson = useCallback(async () => {
        // Calculate clean data (diff from defaults)
        const cleanData = calculateDiff(character, initialCharacterState);

        // Force calculation of latest derived stats for the export
        // This ensures the JSON has valid stats even if the user hasn't visited Step 6
        const derivedStats = calculateDerivedStats(
            character.attributes?.values || {},
            character.origin?.items || [],
            character.skills || {}
        );
        const { combatStats, otherStats } = formatDerivedStats(derivedStats);

        // Inject calculated stats into the export data
        if (cleanData) {
            cleanData.combatstats = combatStats;
            cleanData.otherstats = otherStats;
        }

        const filename = `${(character.name || 'personaje').toLowerCase().replace(/\s+/g, '-')}.json`;
        const jsonStr = JSON.stringify(cleanData || {}, null, 2);

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
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('File Picker Error:', err);
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
    }, [character]);

    return { downloadJson };
};
