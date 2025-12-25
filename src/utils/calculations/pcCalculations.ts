import { forEachOriginAndSubtype } from './originCalculations';

/**
 * Calcula los Puntos de Creación (PC) generados por las características
 * Fórmula: (Base + Mod. Otros) / 10
 */
export function calculateCreationPoints(
    characteristics: { [key: string]: { base: number; powerMod: number } },
    origins: any[] = []
): { pcValues: { [key: string]: number }; totalPC: number } {
    const pcValues: { [key: string]: number } = {};
    let totalPC = 0;

    let isEnte = false;
    let isDotado = false;

    // Detectar subtipos especiales para reducción de costes
    if (origins && origins.length > 0) {
        forEachOriginAndSubtype(origins, (name) => {
            if (name === "Ente") isEnte = true;
            if (name === "Dotado") isDotado = true;
        });
    }

    Object.keys(characteristics).forEach(charId => {
        const char = characteristics[charId];
        if (char) {
            let costMultiplier = 1.0;

            // Lógica de reducción de costes
            if (isEnte) {
                costMultiplier = 0.5;
            } else if (isDotado && charId === 'voluntad') {
                costMultiplier = 0.5;
            }

            // Calcular puntos individuales con decimales y aplicador multiplicador
            const pc = ((char.base + char.powerMod) / 10) * costMultiplier;
            pcValues[charId] = pc;
            totalPC += pc;
        }
    });

    return { pcValues, totalPC };
}
