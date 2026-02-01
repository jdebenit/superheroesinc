/**
 * Definiciones de Categorías de Origen para Superheroes INC.
 * 
 * Este archivo contiene todas las categorías de origen disponibles y sus subtipos.
 * Puedes editar este archivo para añadir, modificar o eliminar orígenes sin tocar
 * la lógica del componente CharacterGenerator.
 */

export interface OriginCategory {
    name: string;
    subtypes?: { [key: string]: string[] };
    subtypeModifiers?: { [key: string]: { modImpacto?: number, paradaMental?: number } };
    paradaMentalBonus?: number;
    defaultEffects?: string[];
    disabled?: boolean;
    disabledSubtypes?: string[];
}

export const ORIGIN_CATEGORIES: { [key: string]: OriginCategory } = {
    "Divino": {
        name: "Divino",
        paradaMentalBonus: 25,
        subtypes: {
            "Dios": ["Acceso a lista de poderes divinos", "+25 a la parada mental"],
            "Dios menor": ["Acceso a lista de poderes divinos", "+25 a la parada mental"],
            "Semidios": ["Acceso a lista de poderes divinos", "+25 a la parada mental"]
        }
    },
    "Cósmico": {
        name: "Cósmico",
        paradaMentalBonus: 25,
        subtypes: {
            "Avatar Cósmico": ["Acceso a lista de poderes cósmicos", "+25 a la parada mental"],
            "Heraldo Cósmico": ["Acceso a lista de poderes cósmicos", "+25 a la parada mental"]
        }
    },
    "Guardian": {
        name: "Guardian",
        defaultEffects: ["Acceso a poderes de guardianes"]
    },
    "Alterado": {
        name: "Alterado",
        defaultEffects: ["Acceso a poderes de alterados"]
    },
    "Sobrenatural": {
        name: "Sobrenatural",
        paradaMentalBonus: 20,
        disabledSubtypes: ["Hombre Lobo", "Liberado de Unidad", "Liberado de Equidad", "Liberado de Entropía"],
        subtypes: {
            "Vampiro": ["+20 a la parada mental"],
            "Hombre Lobo": ["+20 a la parada mental"],
            "Semidemonio": ["+20 a la parada mental"],
            "Poseido": ["+20 a la parada mental"],
            "Ente": ["+20 a la parada mental"],
            "Maldito": ["+20 a la parada mental"],
            "Liberado de Unidad": ["+20 a la parada mental"],
            "Liberado de Equidad": ["+20 a la parada mental"],
            "Liberado de Entropía": ["+20 a la parada mental"]
        }
    },
    "Arcano": {
        name: "Arcano",
        paradaMentalBonus: 20,
        disabledSubtypes: ["Hada Aire", "Hada Tierra", "Hada Fuego", "Hada Agua", "Centauro", "Gigante", "Hidra", "Medusa", "Esfinge"],
        defaultEffects: [
            "+20 a la parada mental",
        ],
        subtypes: {
            "Mago": ["Acceso a Magia"],
            "Dotado": ["Voluntad plena"],
            "Terrano": ["Desconexión de la tecnología moderna"],
            "Elfo Físico": ["+20 a la parada mental"],
            "Elfo Psíquico": ["+20 a la parada mental"],
            "Elfo Mágico": ["+20 a la parada mental"],
            "Hada Aire": ["+20 a la parada mental"],
            "Hada Tierra": ["+20 a la parada mental"],
            "Hada Fuego": ["+20 a la parada mental"],
            "Hada Agua": ["+20 a la parada mental"],
            "Hada Eter": ["+20 a la parada mental"],
            "Centauro": ["+20 a la parada mental"],
            "Minotauro": ["+30 al daño con armas blancas o contundentesl"],
            "Enano": ["Visión en la oscuridad a 10/15m", "Lo que forje hace +30 al daño"],
            "Gigante": ["+20 a la parada mental"],
            "Troll": ["-40 a la actividad durante el dia"],
            "Grifo": ["Superpercepción visual"],
            "Hidra": ["+20 a la parada mental"],
            "Medusa": ["+20 a la parada mental"],
            "Esfinge": ["+20 a la parada mental"],
            "Híbrido mitológico": ["+20 a la parada mental"],
        }
    },
    "Parahumano": {
        name: "Parahumano",
        subtypes: {
            "Atlante": ["fuera del agua, -25 agi y -15 a per"],
            "Tes-khar": ["Cuando se esconden son indetectables por medios psíquicos"],
            "Thals": ["Acceso a la lista de poderes de los Thals", "+10 a la parada mental"]
        },
        subtypeModifiers: {
            "Thals": { paradaMental: 10 }
        }
    },
    "Tecnológico": {
        name: "Tecnológico",
        disabledSubtypes: ["Robot gigante", "Androide / Sintetico", "Robot"],
        subtypes: {
            "Tecnoarmadura": ["Armadura tecnológica avanzada", "Sistemas integrados", "Acceso a módulos tecnológicos"],
            "Exoesqueleto Energético": ["Armadura tecnológica avanzada", "Sistemas integrados"],
            "Cyborg": ["Cuerpo cibernético", "Acceso a módulos tecnológicos"],
            "Robot": ["Como una tecnoarmadura"],
            "Androide / Sintetico": ["Como un alterado"],
            "Robot gigante": ["Gran tamaño", "Blindaje pesado"],
            "Tecnovehículo": ["Vehículo avanzado", "Acceso a módulos tecnológicos"],
            "Inventor o forjador": ["Creación de artefactos"]
        }
    },
    "Vigilante": {
        name: "Vigilante",
        defaultEffects: [
            "Disponibilidad de armamento a dificultad reducida",
            "Recarga rápida",
            "Recuerdos dolorosos",
            "Voluntad férrea"
        ],
        subtypes: {
            "Acrobata": [],
            "Arquero": [
                "Solo tarda un asalto en apuntar con un arco."
            ],
            "Cazador": [],
            "Espadachín": [
                "Cuando usa dos armas blancas, la segunda mano reduce su porcentaje en un tercio al igual que la primera mano."
            ],
            "Espia/Ladrón": [],
            "Fanático/Vengador": [
                "-20 a las tiradas de EQM cuando traten sobre su obsesion o venganza"
            ],
            "Francotirador": [
                "Solo tarda un asalto en apuntar con un arma larga."
            ],
            "Manipulador": [
                "Puede repetir una tirada fallida de resistencia a prejuicios"
            ],
            "Mente Maestra": [],
            "Militar": [],
            "Pistolero": [
                "Cuando usa dos armas cortas, la segunda mano reduce su porcentaje en un tercio al igual que la primera mano."
            ],
            "Artista Marcial": [
                "Tiene que quedar patente en el historial que un clan o varios maestros le adiestraron durante gran parte de su vida."
            ],
            "Artista Marcial con Chi": [
                "Tiene que quedar patente en el historial que un clan o varios maestros le adiestraron durante gran parte de su vida.",
                "Acceso al uso del chi"
            ],
        },
        subtypeModifiers: {
            "Acrobata": { modImpacto: 30 },
            "Artista Marcial": { modImpacto: 30 },
            "Artista Marcial con Chi": { modImpacto: 30 },
            "Arquero": { modImpacto: 20 },
            "Espadachín": { modImpacto: 20 },
            "Espia/Ladrón": { modImpacto: 20 },
            "Fanático/Vengador": { modImpacto: 20 },
            "Militar": { modImpacto: 20 },
            "Pistolero": { modImpacto: 20 }
        }
    },
    "Mutante": {
        name: "Mutante",
        subtypes: {
            "Psíquico": ["Acceso a tabla de poderes mutantes de tipo psíquico"],
            "Energético": ["Acceso a tabla de poderes mutantes de tipo energético"],
            "Físico": ["Acceso a tabla de poderes mutantes de tipo físico"],
        }
    }
};
