
export interface Spell {
    id: string;
    name: string;
    cost: string; // e.g. "75"
    requirements: string;
    description?: string; // Optional for now
    maxRank: number;
    hasRequirements: boolean;
}

export const SPELLS: Spell[] = [
    {
        id: "abrir_portales",
        name: "Abrir Portales",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "anular_conjuros",
        name: "Anular Conjuros",
        cost: "100",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "cadenas_del_tartaro",
        name: "Cadenas del Tártaro",
        cost: "90",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "consumir_energia_magica",
        name: "Consumir energía mágica",
        cost: "85",
        requirements: "Rango 1 en Envejecimiento acelerado y rango 5 en Controlar espíritu.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        id: "controlar_espiritu",
        name: "Controlar Espíritu",
        cost: "65",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "crear_ilusiones",
        name: "Crear Ilusiones",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "crear_realidad_periferica",
        name: "Crear realidad periférica",
        cost: "75",
        requirements: "Maestría en Escudos místicos y rango 5 en Abrir portales.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        id: "curacion",
        name: "Curación",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "encantar_objetos",
        name: "Encantar Objetos",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "envejecimiento_acelerado",
        name: "Envejecimiento Acelerado",
        cost: "300",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "escudos_misticos",
        name: "Escudos Místicos",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "inmaterializar_cuerpo",
        name: "Inmaterializar cuerpo",
        cost: "25",
        requirements: "Al menos rango 3 en Proyección Astral.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        id: "invocar_animales",
        name: "Invocar Animales",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "invocar_elemento",
        name: "Invocar Elemento",
        cost: "50",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "invocar_espiritu",
        name: "Invocar Espíritu",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "invocar_espiritu_totemico",
        name: "Invocar Espíritu Totémico",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "levitar",
        name: "Levitar",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "liberar_retonos",
        name: "Liberar retoños",
        cost: "60",
        requirements: "Al menos rango 1 en Transformación de materiales o rango 2 en Animar objetos.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        id: "maldecir",
        name: "Maldecir",
        cost: "80",
        requirements: "Al menos rango 4 en Metamorfosis Oscura y rango 9 en Encantar Objetos.",
        maxRank: 1,
        hasRequirements: true
    },
    {
        id: "metamorfosis_oscura",
        name: "Metamorfosis Oscura",
        cost: "85",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "paralizar",
        name: "Paralizar",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "percepcion_magica",
        name: "Percepción Mágica",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "proteccion",
        name: "Protección",
        cost: "80",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "proyeccion_de_energia_magica",
        name: "Proyección de Energía Mágica",
        cost: "25",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "proyeccion_del_cuerpo_astral",
        name: "Proyección del Cuerpo Astral",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "pseudo_psi",
        name: "Pseudo Psi",
        cost: "35",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "revivir_muertos",
        name: "Revivir Muertos",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "transformar_materiales",
        name: "Transformar Materiales",
        cost: "100",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "vedar_entrada",
        name: "Vedar Entrada",
        cost: "75",
        requirements: "No especificado",
        maxRank: 1,
        hasRequirements: false
    },
    {
        id: "viajar_en_el_tiempo",
        name: "Viajar en el Tiempo",
        cost: "150",
        requirements: "Se necesita tener al menos Maestría en Abrir Portales. Además para arcanos que no tengan una vinculación con el Cronos Supremo serán necesarios tener todos conjuros del libro básico al máximo rango para poder aprender a dominar este hechizo.",
        maxRank: 1,
        hasRequirements: true
    }
];
