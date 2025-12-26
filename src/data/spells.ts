
export interface Spell {
    name: string;
    cost: string; // e.g. "75"
    requirements: string;
    description?: string; // Optional for now
    maxRank: number;
    hasRequirements: boolean;
}

export const SPELLS: Spell[] = [
    {
        name: "Abrir Portales",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Anular Conjuros",
        cost: "100",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Cadenas del Tártaro",
        cost: "90",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Consumir energía mágica",
        cost: "85",
        requirements: "Rango 1 en Envejecimiento acelerado y rango 5 en Controlar espíritu.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        name: "Controlar Espíritu",
        cost: "65",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Crear Ilusiones",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Crear realidad periférica",
        cost: "75",
        requirements: "Maestría en Escudos místicos y rango 5 en Abrir portales.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        name: "Curación",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Encantar Objetos",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Envejecimiento Acelerado",
        cost: "300",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Escudos Místicos",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Inmaterializar cuerpo",
        cost: "25",
        requirements: "Al menos rango 3 en Proyección Astral.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        name: "Invocar Animales",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Invocar Elemento",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Invocar Espíritu",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Invocar Espíritu Totémico",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Levitar",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Liberar retoños",
        cost: "60",
        requirements: "Al menos rango 1 en Transformación de materiales o rango 2 en Animar objetos.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        name: "Maldecir",
        cost: "80",
        requirements: "Al menos rango 4 en Metamorfosis Oscura y rango 9 en Encantar Objetos.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        name: "Metamorfosis Oscura",
        cost: "85",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Paralizar",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Percepción Mágica",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Protección",
        cost: "80",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Proyección de Energía Mágica",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Proyección del Cuerpo Astral",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Pseudo Psi",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Revivir Muertos",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Transformar Materiales",
        cost: "100",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Vedar Entrada",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        name: "Viajar en el Tiempo",
        cost: "150",
        requirements: "Se necesita tener al menos Maestría en Abrir Portales. Además para arcanos que no tengan una vinculación con el Cronos Supremo serán necesarios tener todos conjuros del libro básico al máximo rango para poder aprender a dominar este hechizo.",
        maxRank: 1,
        hasRequirements: true
    }
];
