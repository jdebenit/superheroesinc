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
        fuerza: { modifier: 100, max: 200, min: 100 },
        constitucion: { modifier: 100, max: 200, min: 100 },
        agilidad: { modifier: 0, max: 100 },
        inteligencia: { modifier: 0, max: 100 },
        percepcion: { modifier: 0, max: 100 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 }
    },
    "Dios menor": {
        fuerza: { modifier: 100, max: 200, min: 100 },
        constitucion: { modifier: 100, max: 200, min: 100 },
        agilidad: { modifier: 0, max: 100 },
        inteligencia: { modifier: 0, max: 100 },
        percepcion: { modifier: 0, max: 100 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 }
    },
    "Semidios": {
        fuerza: { modifier: 60, max: 200, min: 60 },
        constitucion: { modifier: 60, max: 200, min: 60 },
        agilidad: { modifier: 30, max: 130, min: 30 },
        inteligencia: { modifier: 30, max: 130, min: 30 },
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
    "Maldito": allCharacteristics(0, 100),
    "Ente": allCharacteristics(0, 200),
    "Vampiro": {
        fuerza: { modifier: 12, max: 112 },
        constitucion: { modifier: 30, max: 130 },
        agilidad: { modifier: 40, max: 140 },
        inteligencia: { modifier: 0, max: 100 },
        percepcion: { modifier: 30, max: 130 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 },
    },
    "Hombre Lobo": allCharacteristics(25, 125),
    "Semidemonio": {
        fuerza: { modifier: 0, max: 100 },
        constitucion: { modifier: 0, max: 100 },
        agilidad: { modifier: 0, max: 100 },
        inteligencia: { modifier: 0, max: 200 },
        percepcion: { modifier: 0, max: 200 },
        apariencia: { modifier: 0, max: 100 },
        voluntad: { modifier: 0, max: 100 },
    },

    // Arcano
    "Mago": allCharacteristics(0, 100),
    "Dotado": allCharacteristics(15, 115),
    "Terrano": allCharacteristics(10, 110, 50),  // Terranos tienen mínimo 50

    // Parahumano
    "Atlante": {
        fuerza: { modifier: 20, max: 120, min: 60 },
        constitucion: { modifier: 60, max: 160, min: 60 },
        agilidad: { modifier: 40, max: 140, min: 40 },
        inteligencia: { modifier: 60, max: 160, min: 60 },
        percepcion: { modifier: 30, max: 130, min: 30 },
        apariencia: { modifier: 30, max: 120, min: 30 },
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
    "Acróbata": allCharacteristics(0, 100),
    "Arquero": allCharacteristics(0, 100),
    "Cazador": allCharacteristics(0, 100),
    "Espadachín": allCharacteristics(0, 100),
    "Espía / Ladrón": allCharacteristics(0, 100),
    "Fanático": allCharacteristics(0, 100),
    "Justiciero": allCharacteristics(0, 100),
    "Vengador": allCharacteristics(0, 100),
    "Francotirador": allCharacteristics(0, 100),
    "Mente Maestra": allCharacteristics(0, 100),
    "Manipulador": allCharacteristics(0, 100),
    "Militar": allCharacteristics(0, 100),
    "Pistolero": allCharacteristics(0, 100),
    "Artista marcial": allCharacteristics(0, 100),
    "Artista marcial con chi": allCharacteristics(0, 100),

    // Orígenes sin subtipos
    "Guardián": allCharacteristics(0, 100),
    "Alterado": allCharacteristics(0, 100),
    "Mutante": allCharacteristics(0, 100)
};

/**
 * Modificadores de especialidad por subtipo de Vigilante
 * Estos se aplican al campo specialtyMod en Step2
 */
export interface SpecialtyCharacteristicModifiers {
    distributablePoints?: number;  // Puntos para distribuir libremente
    allowedCharacteristics?: string[];  // Características donde se pueden distribuir los puntos (si no se especifica, todas)
    fuerza?: number;
    constitucion?: number;
    agilidad?: number;
    inteligencia?: number;
    percepcion?: number;
    apariencia?: number;
    voluntad?: number;
}

export const VIGILANTE_SPECIALTY_MODIFIERS: { [key: string]: SpecialtyCharacteristicModifiers } = {
    // Especialidades físicas
    "Acrobata": {
        agilidad: 40,
        percepcion: 20
    },
    "Arquero": {
        percepcion: 40,
        agilidad: 32
    },
    "Cazador": {
        percepcion: 30,
        agilidad: 15
    },
    "Espadachin": {
        agilidad: 35,
        percepcion: 30
    },
    "Artista Marcial": {
        agilidad: 50,
        percepcion: 50
    },
    "Artista Marcial con Chi": {
        agilidad: 50,
        percepcion: 50
    },

    // Especialidades tácticas
    "Militar": {
        distributablePoints: 50  // 50 puntos para distribuir
    },
    "Francotirador": {
        percepcion: 35,
        agilidad: 15
    },
    "Pistolero": {
        agilidad: 30,
        percepcion: 20
    },

    // Especialidades mentales/sociales
    "Manipulador": {
        inteligencia: 30,
        apariencia: 30
    },
    "Mente Maestra": {
        inteligencia: 50,
    },

    // Especialidades equilibradas
    "Fanático": {
        distributablePoints: 20,
        allowedCharacteristics: ['fuerza', 'constitucion', 'agilidad', 'percepcion'],
        agilidad: 30,
        percepcion: 30,
        voluntad: 10
    },
    "Vengador": {
        distributablePoints: 20,
        allowedCharacteristics: ['fuerza', 'constitucion', 'agilidad', 'percepcion'],
        agilidad: 30,
        percepcion: 30,
        voluntad: 10
    },
    "Justiciero": {
        distributablePoints: 20,
        allowedCharacteristics: ['fuerza', 'constitucion', 'agilidad', 'percepcion'],
        agilidad: 30,
        percepcion: 30,
        voluntad: 10
    }
};
