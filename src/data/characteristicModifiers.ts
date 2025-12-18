/**
 * Modificadores de características por tipo de origen
 * Cada origen puede tener modificadores específicos por característica
 */

export interface CharacteristicModifier {
    modifier: number;
    min?: number;  // Mínimo informativo (por defecto 40 si no se especifica)
    max: number;
}

export interface OriginCharacteristicModifiers {
    // Si tiene distributablePoints, el usuario puede distribuir esos puntos libremente
    distributablePoints?: number;
    // Si tiene choosableCharacteristic, el usuario elige una característica para aplicar el bonus fijo
    choosableCharacteristic?: {
        bonus: number;  // Bonus fijo que se aplica a la característica elegida
        distributablePoints?: number;  // Puntos adicionales que se pueden distribuir
    };
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
const allCharacteristics = (modifier: number, max: number, min?: number): OriginCharacteristicModifiers => ({
    fuerza: { modifier, max, min },
    constitucion: { modifier, max, min },
    agilidad: { modifier, max, min },
    inteligencia: { modifier, max, min },
    percepcion: { modifier, max, min },
    apariencia: { modifier, max, min },
    voluntad: { modifier, max, min }
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
    "Heraldo Cósmico": {
        choosableCharacteristic: {
            bonus: 100,
            distributablePoints: 100
        },
        fuerza: { modifier: 0, max: 200 },
        constitucion: { modifier: 0, max: 200 },
        agilidad: { modifier: 0, max: 200 },
        inteligencia: { modifier: 0, max: 200 },
        percepcion: { modifier: 0, max: 200 },
        apariencia: { modifier: 0, max: 200 },
        voluntad: { modifier: 0, max: 200 }
    },

    // Sobrenatural
    "Maldito": allCharacteristics(20, 120),
    "Vampiro": allCharacteristics(30, 130),
    "Hombre Lobo": allCharacteristics(25, 125),
    "Semidemonio": allCharacteristics(40, 140),

    // Arcano
    "Mago": allCharacteristics(10, 110),
    "Dotado": allCharacteristics(15, 115),
    "Terrano": allCharacteristics(10, 110, 50),  // Terranos tienen mínimo 50

    // Parahumano
    "Atlante": {
        fuerza: { modifier: 20, max: 120 },
        constitucion: { modifier: 60, max: 160 },
        agilidad: { modifier: 40, max: 140 },
        inteligencia: { modifier: 60, max: 160 },
        percepcion: { modifier: 30, max: 130 },
        apariencia: { modifier: 30, max: 120 },
        voluntad: { modifier: 0, max: 100 },
    },
    "Tes-khar": {
        fuerza: { modifier: 20, max: 120 },
        constitucion: { modifier: 30, max: 160 },
        agilidad: { modifier: 40, max: 140 },
        inteligencia: { modifier: 0, max: 100 },
        percepcion: { modifier: 20, max: 120 },
        apariencia: { modifier: 0, max: 90, min: 30 },
        voluntad: { modifier: 0, max: 90 },
    },
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
