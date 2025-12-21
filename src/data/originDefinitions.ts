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
        disabledSubtypes: ["Dios"],
        subtypes: {
            "Dios": ["Poder divino", "+20 a la parada mental"],
            "Dios menor": ["Poder divino", "+20 a la parada mental"],
            "Semidios": ["Herencia divina", "+10 a la parada mental"]
        }
    },
    "Cósmico": {
        name: "Cósmico",
        subtypes: {
            "Avatar Cósmico": ["Poder cósmico ilimitado", "Energía cósmica"],
            "Heraldo Cósmico": ["Heraldo de entidad cósmica", "Poder cósmico otorgado"]
        }
    },
    "Guardian": {
        name: "Guardian",
        defaultEffects: ["Protección de la humanidad", "+10 a la parada mental"]
    },
    "Alterado": {
        name: "Alterado",
        defaultEffects: ["Desplazamiento social", "Poderes alterados"]
    },
    "Sobrenatural": {
        name: "Sobrenatural",
        subtypes: {
            "Vampiro": ["algo", "algo", "algo"],
            "Hombre Lobo": ["algo", "algo", "algo"],
            "Semidemonio": ["algo", "algo", "algo"],
            "Poseido": ["algo", "algo", "algo"],
            "Ente": ["algo", "algo", "algo"],
            "Maldito": [
                "Condenado a recorrer la Tierra hasta que sus buenas obras le rediman.",
                "+20 a la parada mental"
            ],
            "Liberado": ["algo", "algo", "algo"]
        }
    },
    "Arcano": {
        name: "Arcano",
        subtypes: {
            "Mago": ["Conocimiento arcano", "Comprensión de la senda: Magia", "+20 a la parada mental"],
            "Dotado": ["algo", "algo", "algo"],
            "Terrano": [
                "Energía mágica por el vinculo con terra",
                "-10 a la habilidad de Conocimientos",
                "-15 al uso de cualquier aparato tecnológico",
                "-25 al uso de armas cortas, armas largas y armas militares",
                "+20 a la parada mental"
            ],
            "Elfo": ["algo", "algo", "algo"],
            "Hada": ["algo", "algo", "algo"],
            "Centauro": ["algo", "algo", "algo"],
            "Minotauro": ["algo", "algo", "algo"],
            "Enano": ["algo", "algo", "algo"],
            "Gigante": ["algo", "algo", "algo"],
            "Troll": ["algo", "algo", "algo"],
            "Grifo": ["algo", "algo", "algo"],
            "Hidra": ["algo", "algo", "algo"],
            "Medusa": ["algo", "algo", "algo"],
            "Esfinge": ["algo", "algo", "algo"],
            "Híbrido mitológico": ["algo", "algo", "algo"],
        }
    },
    "Parahumano": {
        name: "Parahumano",
        subtypes: {
            "Atlante": ["Herencia atlante", "Resistencia acuática"],
            "Tes-khar": ["Fisiología alienígena"],
            "Thals": ["Poderes psíquicos avanzados"],
            "Híbridos de humano y no-humano": ["algo", "algo", "algo"]
        }
    },
    "Tecnológico": {
        name: "Tecnológico",
        disabled: true,
        subtypes: {
            "Tecnoarmadura": ["Armadura tecnológica avanzada", "Sistemas integrados"],
            "Cyborg": ["Mejoras cibernéticas", "Interface neural"],
            "Exoesqueleto Energético": ["Exoesqueleto de energía", "Protección energética"],
            "Inventor": ["Genio tecnológico", "Acceso a tecnología avanzada"]
        }
    },
    "Vigilante": {
        name: "Vigilante",
        subtypes: {
            "Acrobata": [
                "+20 Habilidad a elección",
                "+20 Mod. de Impacto",
                "-20 a las tiradas de EQM cuando alguien se vaya a irse de rositas sin un buen golpe"
            ],
            "Arquero": [
                "+20 Habilidad a elección",
                "+20 Mod. de Impacto",
                "-20 a las tiradas de EQM cuando alguien se vaya a irse de rositas sin un buen golpe"
            ],
            "Cazador": [
                "+20 Habilidad a elección",
                "+20 Mod. de Impacto",
                "-20 a las tiradas de EQM cuando alguien se vaya a irse de rositas sin un buen golpe"
            ],
            "Espadachin": [
                "+20 Habilidad a elección",
                "+20 Mod. de Impacto",
                "-20 a las tiradas de EQM cuando alguien se vaya a irse de rositas sin un buen golpe"
            ],
            "Fanático": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Vengador": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Justiciero": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Francotirador": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Manipulador": [
                "+20 Idea",
                "+20 Influencia",
                "+20 Otro Idioma",
                "Puede repetir una tirada fallida de resistencia a prejuicios"
            ],
            "Mente Maestra": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Militar": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Pistolero": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Artista Marcial": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
            "Artista Marcial con Chi": [
                "+20 habilidad a elección",
                "-20 tiradas de EQM daños al medio ambiente"
            ],
        }
    },
    "Mutante": {
        name: "Mutante",
        subtypes: {
            "Psíquico": ["algo"],
            "Energético": ["algo"],
            "Físico": ["algo"]
        }
    }
};
