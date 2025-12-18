/**
 * Modificadores de características por tipo de origen
 * Cada origen puede tener modificadores específicos por característica
 */

export interface CharacteristicModifier {
    modifier: number;
    max: number;
}

export interface OriginCharacteristicModifiers {
    // Si tiene distributablePoints, el usuario puede distribuir esos puntos libremente
    distributablePoints?: number;
    // Modificadores fijos por característica
    fuerza?: CharacteristicModifier;
    constitucion?: CharacteristicModifier;
    agilidad?: CharacteristicModifier;
    inteligencia?: CharacteristicModifier;
    percepcion?: CharacteristicModifier;
    apariencia?: CharacteristicModifier;
    voluntad?: CharacteristicModifier;
}

// Helper para aplicar el mismo modificador a todas las características
const allCharacteristics = (modifier: number, max: number): OriginCharacteristicModifiers => ({
    fuerza: { modifier, max },
    constitucion: { modifier, max },
    agilidad: { modifier, max },
    inteligencia: { modifier, max },
    percepcion: { modifier, max },
    apariencia: { modifier, max },
    voluntad: { modifier, max }
});

export const ORIGIN_CHARACTERISTIC_MODIFIERS: { [key: string]: OriginCharacteristicModifiers } = {
    // Divino
    "Dios": {
        fuerza: { modifier: 100, max: 200 },
        constitucion: { modifier: 100, max: 200 },
        agilidad: { modifier: 0, max: 100 },
        inteligencia: { modifier: 0, max: 100 },
        percepcion: { modifier: 0, max: 100 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 }
    },
    "Semidios": {
        fuerza: { modifier: 60, max: 200 },
        constitucion: { modifier: 60, max: 200 },
        agilidad: { modifier: 30, max: 130 },
        inteligencia: { modifier: 30, max: 130 },
        percepcion: { modifier: 0, max: 100 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 }
    },

    // Cósmico - Avatar puede distribuir 200 puntos
    "Avatar Cósmico": {
        distributablePoints: 200,
        fuerza: { modifier: 0, max: 200 },
        constitucion: { modifier: 0, max: 200 },
        agilidad: { modifier: 0, max: 200 },
        inteligencia: { modifier: 0, max: 200 },
        percepcion: { modifier: 0, max: 200 },
        apariencia: { modifier: 0, max: 200 },
        voluntad: { modifier: 0, max: 200 }
    },
    "Heraldo Cósmico": allCharacteristics(60, 160),

    // Sobrenatural
    "Maldito": allCharacteristics(20, 120),
    "Vampiro": allCharacteristics(30, 130),
    "Hombre Lobo": allCharacteristics(25, 125),
    "Semidemonio": allCharacteristics(40, 140),

    // Arcano
    "Mago": allCharacteristics(10, 110),
    "Dotado": allCharacteristics(15, 115),
    "Terrano": allCharacteristics(10, 110),

    // Parahumano
    "Atlante": allCharacteristics(30, 130),
    "Tes-khar": allCharacteristics(35, 135),
    "Thals": allCharacteristics(25, 125),

    // Tecnológico
    "Tecnoarmadura": allCharacteristics(0, 100),
    "Cyborg": allCharacteristics(20, 120),
    "Exoesqueleto Energético": allCharacteristics(15, 115),
    "Inventor": allCharacteristics(0, 100),

    // Vigilante - Especializaciones
    "Fanático": allCharacteristics(0, 100),
    "Manipulador": allCharacteristics(0, 100),
    "Vengador": allCharacteristics(0, 100),
    "Vigilante Base": allCharacteristics(0, 100),

    // Orígenes sin subtipos
    "Guardián": allCharacteristics(10, 110),
    "Alterado": allCharacteristics(15, 115),
    "Mutante": allCharacteristics(20, 120)
};
