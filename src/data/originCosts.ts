/**
 * Costes en Puntos de Coste (PCs) para cada origen y subtipo
 */

export interface OriginCosts {
    base: number;  // Coste base del origen
    subtypes?: { [key: string]: number };  // Costes adicionales de subtipos
}

export const ORIGIN_COSTS: { [key: string]: OriginCosts } = {
    // Divino
    "Origen Divino": {
        base: 0,
        subtypes: {
            "Dios menor": 25,
            "Dios": 50,
            "Semidios": 20
        }
    },

    // Cósmico
    "Origen Cósmico": {
        base: 0,
        subtypes: {
            "Avatar Cósmico": 40,
            "Heraldo Cósmico": 65
        }
    },

    // Sobrenatural
    "Origen Sobrenatural": {
        base: 0,
        subtypes: {
            "Maldito": 8,
            "Vampiro": 12,
            "Hombre Lobo": 10,
            "Semidemonio": 15
        }
    },

    // Arcano
    "Origen Arcano": {
        base: 0,
        subtypes: {
            "Mago": 8,
            "Dotado": 10,
            "Terrano": 8
        }
    },

    // Parahumano
    "Origen Parahumano": {
        base: 0,
        subtypes: {
            "Atlante": 12,
            "Tes-khar": 15,
            "Thals": 10,
            "Híbridos de humano y no-humano": 8
        }
    },

    // Tecnológico
    "Origen Tecnológico": {
        base: 0,
        subtypes: {
            "Tecnoarmadura": 5,
            "Cyborg": 8,
            "Exoesqueleto Energético": 6,
            "Inventor": 3
        }
    },

    // Vigilante (origen base + especialización)
    "Vigilante": {
        base: 1,  // Ser vigilante cuesta 1 PC base
        subtypes: {
            "Fanático": 3,
            "Manipulador": 2,
            "Vengador": 2
        }
    },

    // Orígenes sin subtipos
    "Guardián": {
        base: 5
    },
    "Alterado": {
        base: 5
    },
    "Mutante": {
        base: 5
    }
};

/**
 * Calcula el coste total en PCs basado en los orígenes seleccionados
 */
export function calculateOriginCost(originItems: any[]): number {
    let totalCost = 0;

    if (!originItems || originItems.length === 0) {
        return 0;
    }

    originItems.forEach((item: any) => {
        // El item puede ser un objeto con el nombre del origen como key
        const originName = Object.keys(item)[0];
        const subtypesList = item[originName] || [];

        console.log("Processing origin:", originName, "with subtypes:", subtypesList);

        // Buscar en ORIGIN_COSTS
        let found = false;

        // Caso 1: Es un origen directo (Vigilante, Guardián, etc.)
        if (ORIGIN_COSTS[originName]) {
            const costData = ORIGIN_COSTS[originName];
            totalCost += costData.base || 0;
            console.log(`  Added base cost for ${originName}: ${costData.base || 0}`);
            found = true;

            // Si tiene subtipos, sumar sus costes
            if (costData.subtypes && subtypesList.length > 0) {
                subtypesList.forEach((subtypeName: string) => {
                    const subtypeCost = costData.subtypes![subtypeName] || 0;
                    totalCost += subtypeCost;
                    console.log(`  Added subtype cost for ${subtypeName}: ${subtypeCost}`);
                });
            }
        }

        // Caso 2: Es un subtipo de una categoría (Dios, Semidios, etc.)
        if (!found) {
            for (const categoryName in ORIGIN_COSTS) {
                const categoryData = ORIGIN_COSTS[categoryName];
                if (categoryData.subtypes && categoryData.subtypes[originName]) {
                    const subtypeCost = categoryData.subtypes[originName];
                    totalCost += subtypeCost;
                    console.log(`  Added cost for ${originName} (subtipo de ${categoryName}): ${subtypeCost}`);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            console.warn(`No cost found for origin: ${originName}`);
        }
    });

    console.log("Total cost:", totalCost);
    return totalCost;
}
