export interface MagicalBond {
    id: string;
    name: string;
    description: string;
}

export const MAGICAL_BONDS: MagicalBond[] = [
    {
        id: "tatuaje",
        name: "Tatuaje Místico",
        description: "Marcas rúnicas o símbolos grabados en la piel que canalizan y estabilizan el flujo mágico."
    },
    {
        id: "foco",
        name: "Foco de Poder",
        description: "Un objeto físico (varita, bastón, amuleto) necesario para concentrar las energías arcanas."
    },
    {
        id: "maestro",
        name: "Maestro / Mentor",
        description: "Un guía experimentado que enseña y supervisa el aprendizaje de las artes mágicas."
    },
    {
        id: "linaje",
        name: "Linaje de Sangre",
        description: "La magia es una herencia ancestral, transmitida a través de generaciones de una familia poderosa."
    },
    {
        id: "pacto",
        name: "Pacto con Entidad",
        description: "El poder proviene de un acuerdo con un ser superior (demonio, fey, celestial) a cambio de servicio o tributo."
    },
    {
        id: "lugar",
        name: "Lugar de Poder",
        description: "El mago extrae su energía de una localización geográfica específica cargada de magia (nexo, templo, bosque)."
    },
    {
        id: "libro",
        name: "Libro de Hechizos",
        description: "El conocimiento y las fórmulas mágicas residen en un grimorio que el mago debe consultar."
    }
];
