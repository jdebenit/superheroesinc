import { PDFDocument } from 'pdf-lib';

/**
 * Rellena el PDF de la ficha de personaje con los datos proporcionados.
 * @param pdfUrl La URL relativa o absoluta del template PDF.
 * @param character Los datos del personaje.
 * @param totalPCs El total de puntos de creación (opcional, si no viene en character).
 * @returns Un Uint8Array con los bytes del PDF generado.
 */
export async function generateCharacterSheetPDF(pdfUrl: string, character: any, totalPCs: string | number): Promise<Uint8Array> {
    // 1. Cargar el PDF
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 2. Obtener el formulario
    const form = pdfDoc.getForm();

    // 3. Mapear campos (Fase 1: Info)
    // Definición de campos según lo acordado
    const fields = {
        'info.name': character.name,
        'info.alias': character.alias,
        'info.profession': character.profession,
        'info.identity': character.sexualIdentity,
        'info.notes': character.notes,
        'info.cost': totalPCs.toString(),
        // Futuros campos...
    };

    // 4. Rellenar campos
    for (const [fieldName, value] of Object.entries(fields)) {
        try {
            const field = form.getTextField(fieldName);
            if (field) {
                field.setText(value || '');
            }
        } catch (e) {
            console.warn(`Campo '${fieldName}' no encontrado en el PDF o no es un campo de texto.`);
        }
    }

    // Opcional: Aplanar el formulario para que no sea editable después (comentado por defecto)
    // form.flatten();

    // 5. Devolver bytes
    return await pdfDoc.save();
}

/**
 * Descarga el PDF generado en el navegador del usuario.
 * @param pdfBytes Los bytes del PDF.
 * @param filename El nombre del archivo a descargar.
 */
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
