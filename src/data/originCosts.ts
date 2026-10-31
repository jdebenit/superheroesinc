/**
 * Costes en Puntos de Coste (PCs) para cada origen y subtipo.
 * Tabla pura y declarativa de reglas.
 */

export interface OriginCosts {
    base: number;  // Coste base del origen
    subtypes?: { [key: string]: number };  // Costes adicionales de subtipos
}

export const ORIGIN_COSTS: { [key: string]: OriginCosts } = {
    // Divino
    "Divino": {
        base: 0,
        subtypes: {
            "Dios menor": 25,
            "Dios": 50,
            "Semidios": 20
        }
    },

    // Cósmico
    "Cósmico": {
        base: 0,
        subtypes: {
            "Avatar Cósmico": 40,
            "Heraldo Cósmico": 65
        }
    },

    // Sobrenatural
    "Sobrenatural": {
        base: 0,
        subtypes: {
            "Vampiro": 16,
            "Hombre Lobo": 16,
            "Semidemonio": 25,
            "Poseído": 15,
            "Ente": 30,
            "Maldito": 5,
            "Liberado de Unidad": 15,
            "Liberado de Equidad": 15,
            "Liberado de Entropía": 15
        }
    },

    // Arcano
    "Arcano": {
        base: 0,
        subtypes: {
            "Mago": 30,
            "Terrano": 14,
            "Dotado": 15,
            "Elfo Físico": 13,
            "Elfo Psíquico": 15,
            "Elfo Mágico": 35,
            "Hada Aire": 13,
            "Hada Tierra": 15,
            "Hada Fuego": 14,
            "Hada Agua": 14,
            "Hada Eter": 20,
            "Centauro": 14,
            "Minotauro": 11,
            "Enano": 10,
            "Gigante": 7,
            "Troll": 7,
            "Grifo": 8,
            "Hidra": 9,
            "Medusa": 12,
            "Esfinge": 10,
            "Híbrido mitológico": 5
        }
    },

    // Parahumano
    "Parahumano": {
        base: 0,
        subtypes: {
            "Atlante": 35,
            "Tes-khar": 15,
            "Thals": 10,
        }
    },

    // Tecnológico
    "Tecnológico": {
        base: 0,
        subtypes: {
            "Tecnoarmadura": 5,
            "Exoesqueleto Energético": 4,
            "Cyborg": 5,
            "Robot gigante": 5,
            "Tecnovehículo": 4,
            "Inventor o forjador": 4
        }
    },

    // Vigilante (origen base + especialización)
    "Vigilante": {
        base: 1,  // Ser vigilante cuesta 1 PC base
        subtypes: {
            "Acróbata": 2,
            "Arquero": 3,
            "Cazador": 3,
            "Espadachín": 3,
            "Espia/Ladrón": 2,
            "Fanático/Vengador": 3,
            "Fánatico/Vengador": 3,
            "Francotirador": 3,
            "Manipulador": 2,
            "Mente Maestra": 2,
            "Militar": 3,
            "Pistolero": 3,
            "Artista Marcial": 4,
            "Artista Marcial con Chi": 5
        }
    },

    // Orígenes sin subtipos
    "Guardián": {
        base: 5
    },
    "Guardian": {
        base: 5
    },
    "Alterado": {
        base: 5
    },
    "Mutante": {
        base: 5
    },
    "Alienígena": {
        base: 0,
        subtypes: {
            "Ursino Nativo": 20,
        }
    }
};
