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
}

export const ORIGIN_CATEGORIES: { [key: string]: OriginCategory } = {
    "Origen Divino": {
        name: "Origen Divino",
        subtypes: {
            "Dios": ["Poder divino", "+20 a la parada mental"],
            "Semidios": ["Herencia divina", "+10 a la parada mental"]
        }
    },
    "Origen Cósmico": {
        name: "Origen Cósmico",
        subtypes: {
            "Avatar Cósmico": ["Poder cósmico ilimitado", "Energía cósmica"],
            "Heraldo Cósmico": ["Heraldo de entidad cósmica", "Poder cósmico otorgado"]
        }
    },
    "Origen Guardian": {
        name: "Origen Guardian",
        defaultEffects: ["Protección de la humanidad", "+10 a la parada mental"]
    },
    "Origen Alterado": {
        name: "Origen Alterado",
        defaultEffects: ["Desplazamiento social", "Poderes alterados"]
    },
    "Origen Sobrenatural": {
        name: "Origen Sobrenatural",
        subtypes: {
            "Maldito": [
                "Condenado a recorrer la Tierra hasta que sus buenas obras le rediman.",
                "+20 a la parada mental"
            ],
            "Vampiro": ["algo", "algo", "algo"],
            "Hombre Lobo": ["algo", "algo", "algo"],
            "Semidemonio": ["algo", "algo", "algo"]
        }
    },
    "Origen Arcano": {
        name: "Origen Arcano",
        subtypes: {
            "Mago": ["Conocimiento arcano", "Comprensión de la senda: Magia", "+20 a la parada mental"],
            "Dotado": ["algo", "algo", "algo"],
            "Terrano": [
                "Energía mágica por el vinculo con terra",
                "-10 a la habilidad de Conocimientos",
                "-15 al uso de cualquier aparato tecnológico",
                "-25 al uso de armas cortas, armas largas y armas militares",
                "+20 a la parada mental"
            ]
        }
    },
    "Origen Parahumano": {
        name: "Origen Parahumano",
        subtypes: {
            "Atlante": ["Herencia atlante", "Resistencia acuática"],
            "Tes-khar": ["Fisiología alienígena"],
            "Thals": ["Poderes psíquicos avanzados"],
            "Híbridos de humano y no-humano": ["algo", "algo", "algo"]
        }
    },
    "Origen Tecnológico": {
        name: "Origen Tecnológico",
        subtypes: {
            "Tecnoarmadura": ["Armadura tecnológica avanzada", "Sistemas integrados"],
            "Cyborg": ["Mejoras cibernéticas", "Interface neural"],
            "Exoesqueleto Energético": ["Exoesqueleto de energía", "Protección energética"],
            "Inventor": ["Genio tecnológico", "Acceso a tecnología avanzada"]
        }
    },
    "Origen Vigilante": {
        name: "Origen Vigilante",
        subtypes: {
            "Fanático": [
                "+20 Habilidad a elección",
                "+20 Mod. de Impacto",
                "-20 a las tiradas de EQM cuando alguien se vaya a irse de rositas sin un buen golpe"
            ],
            "Manipulador": [
                "+20 Idea",
                "+20 Influencia",
                "+20 Otro Idioma",
                "Puede repetir una tirada fallida de resistencia a prejuicios"
            ],
            "Vengador": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Vigilante Base": [
                "Disponibilidad de armamento a dificultad reducida",
                "Recarga rápida",
                "Recuerdos dolorosos",
                "Voluntad férrea"
            ]
        }
    },
    "Origen Múltiple": {
        name: "Origen Múltiple",
        defaultEffects: ["Permite múltiples orígenes"]
    }
};
