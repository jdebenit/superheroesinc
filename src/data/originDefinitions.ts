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
    defaultEffects?: string[];
    disabled?: boolean;
    disabledSubtypes?: string[];
}

export const ORIGIN_CATEGORIES: { [key: string]: OriginCategory } = {
    "Divino": {
        name: "Divino",
        subtypes: {
            "Dios": ["Acceso a lista de poderes divinos", "+25 a la parada mental"],
            "Dios menor": ["Acceso a lista de poderes divinos", "+25 a la parada mental"],
            "Semidios": ["Acceso a lista de poderes divinos", "+25 a la parada mental"]
        }
    },
    "Cósmico": {
        name: "Cósmico",
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
        disabledSubtypes: ["Hombre Lobo", "Liberado de Unidad", "Liberado de Equidad"],
        subtypes: {
            "Vampiro": ["+20 a la parada mental"],
            "Hombre Lobo": ["+20 a la parada mental"],
            "Semidemonio": ["+20 a la parada mental"],
            "Poseido": ["+20 a la parada mental"],
            "Ente": ["+20 a la parada mental"],
            "Maldito": [
                "Condenado a recorrer la Tierra hasta que sus buenas obras le rediman.",
                "+20 a la parada mental"
            ],
            "Liberado de Unidad": ["+20 a la parada mental"],
            "Liberado de Equidad": ["+20 a la parada mental"],
            "Liberado de Entropia": ["+20 a la parada mental"]
        }
    },
    "Arcano": {
        name: "Arcano",
        disabledSubtypes: ["Elfo", "Hada", "Centauro", "Minotauro", "Enano", "Gigante", "Troll", "Grifo", "Hidra", "Medusa", "Esfinge"],
        subtypes: {
            "Mago": ["+20 a la parada mental"],
            "Dotado": ["algo", "algo", "algo"],
            "Terrano": [
                "Energía mágica por el vinculo con terra",
                "Desconexión de la tecnología moderna",
                "+20 a la parada mental"
            ],
            "Elfo": ["+20 a la parada mental"],
            "Hada": ["+20 a la parada mental"],
            "Centauro": ["+20 a la parada mental"],
            "Minotauro": ["+20 a la parada mental"],
            "Enano": ["+20 a la parada mental"],
            "Gigante": ["+20 a la parada mental"],
            "Troll": ["+20 a la parada mental"],
            "Grifo": ["+20 a la parada mental"],
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
        }
    },
    "Tecnológico": {
        name: "Tecnológico",
        subtypes: {
            "Tecnoarmadura": ["Armadura tecnológica avanzada", "Sistemas integrados", "Acceso a diseño de módulos tecnológicos"],
            "Exoesqueleto Energético": ["Armadura tecnológica avanzada", "Sistemas integrados"],
            "Cyborg": ["Cuerpo cibernético", "Acceso a diseño de módulos tecnológicos"],
            "I.A.": ["Inteligencia Artificial", "Cuerpo robótico"],
            "Robot gigante": ["Gran tamaño", "Blindaje pesado"],
            "Tecnovehículo": ["Vehículo avanzado", "Acceso a diseño de módulos tecnológicos"],
            "Inventor o forjador": ["Creación de artilugios"]
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
        }
    },
    "Mutante": {
        name: "Mutante",
        subtypes: {
            "Psíquico": ["Acceso a tabla de poderes mutantes de tipo psíquico"],
            "Energético": ["Acceso a tabla de poderes mutantes de tipo energético"],
            "Físico": ["Acceso a tabla de poderes mutantes de tipo físico"],
            "Psíquico/Energético": ["Acceso a tabla de poderes mutantes de tipo psíquico y energético"],
            "Energético/Físico": ["Acceso a tabla de poderes mutantes de tipo energético y físico"],
            "Psíquico/Físico": ["Acceso a tabla de poderes mutantes de tipo psíquico y físico"]
        }
    }
};
