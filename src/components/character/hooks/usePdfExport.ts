import { useCallback } from 'react';
import Logger from '../../../utils/Logger';

interface SheetData {
    derivedStats: any;
    generalSkillsData: any;
    specialSkillsData: any;
    powersData: any;
    spellsData: any;
    techData: any;
    weaponsData: any;
    artifactsData: any;
    vehiclesData: any;
    equipmentData: any;
}

/**
 * Custom hook for handling PDF export functionality
 * Uses dynamic import to avoid loading PDF library until needed
 */
export const usePdfExport = (
    character: any,
    totalPCs: number | string | undefined,
    sheetData: SheetData
) => {
    const handleExportPDF = useCallback(async () => {
        try {
            const { downloadPDF, generateCharacterSheetPDF } = await import('../../../utils/pdfExport');
            const { PDF_TEMPLATE_BASE64 } = await import('../../../data/pdfTemplate');

            // Pass pre-calculated data to avoid re-calculation in PDF export
            const preCalculatedData = {
                derivedStats: sheetData.derivedStats,
                generalSkillsData: sheetData.generalSkillsData,
                specialSkillsData: sheetData.specialSkillsData,
                powersData: sheetData.powersData,
                spellsData: sheetData.spellsData,
                techData: sheetData.techData,
                weaponsData: sheetData.weaponsData,
                artifactsData: sheetData.artifactsData,
                vehiclesData: sheetData.vehiclesData,
                equipmentData: sheetData.equipmentData
            };

            // @ts-ignore - Argument count mismatch until pdfExport is updated
            const pdfBytes = await generateCharacterSheetPDF(
                PDF_TEMPLATE_BASE64, // Use embedded Base64
                character,
                totalPCs || 0,
                preCalculatedData
            );

            const sanitizedName = (character.name || 'Personaje')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^a-zA-Z0-9\s-_]/g, "") // Remove special chars
                .replace(/\s+/g, '_'); // Spaces to underscores

            downloadPDF(pdfBytes, `Ficha_SHI_${sanitizedName}.pdf`);
        } catch (error) {
            Logger.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Asegúrate de que el template "ficha_template.pdf" está en la carpeta public.');
        }
    }, [character, totalPCs, sheetData]);

    return { handleExportPDF };
};
