export const STEPS = [
    { id: 1, name: 'Origen', icon: '🎭' },
    { id: 2, name: 'Características', icon: '💪' },
    { id: 3, name: 'Especial', icon: '⚡' },
    { id: 4, name: 'Habilidades', icon: '🎯' },
    { id: 5, name: 'Trasfondo', icon: '📖' },
    { id: 6, name: 'Detalles', icon: '⭐' },
    { id: 7, name: 'Evolución', icon: '📈' }
];

export const initialCharacterState = {
    name: "Nuevo Personaje",
    alias: "",
    notes: "",
    totalCost: "",
    level: 1,
    origin: { items: [] },
    combatstats: [
        "Acciones por asalto: -",
        "Iniciativa y Reflejos: -",
        "Puntos de Vida: -",
        "Equilibrio Mental: -"
    ],
    otherstats: [
        "Inconsciencia: -",
        "Recuperación: - PV/h",
        "Resistencia a gases y venenos: -",
        "Modificador de fuerza: -",
        "Peso Levantado: -",
        "Daño absorbido físico: -",
        "Daño absorbido mental: -",
        "Modificador de impacto: -",
        "Modificador Psionico: -",
        "Parada Fisica: -",
        "Parada mental: -",
        "Salto (alto / largo): -"
    ],
    attributes: {
        values: {
            "Fuerza": 40,
            "Constitución": 40,
            "Agilidad": 40,
            "Inteligencia": 40,
            "Percepción": 40,
            "Apariencia": 40,
            "Voluntad": 40
        },
        breakdown: {
            fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
            voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 }
        }
    },
    skills: {
        generalItems: [],
        specialItems: [],
        generalManualMods: {},
        manualBases: {},
        selected: {},
        specified: {}
    },
    specialskills: { items: [] },
    background: {
        items: [],
        prejudiceResistance: 50,
        economicStatus: 'clase_media',
        legalStatus: 'sin_antecedentes',
        socialStatus: 'anonimo',
        friendsAndAssociates: 'conocido'
    },
    equipment: { items: [] },
    weapons: { items: [] },
    artifacts: { items: [] },
    magicObjects: { items: [] },
    vehicles: { items: [] },
    spells: {
        selected: [],
        emFormula: { divisor: 4, pcCost: 0 } // Default for Dotado/Híbrido
    },
    powers: {
        selected: []
    },
    magicalBonds: [],
    magicalBondsCustomName: "",
    magicalBondsCustomDescription: "",
    enteParams: {
        formType: null,
        visualEffect: null
    },
    malditoParams: {
        magnitude: null,
        source: null
    },
    poseidoParams: {
        formType: null
    },
    alteradoParams: null,
    mutanteParams: null,
    guardianParams: null, // Added for Guardian origin
    magicTableRolls: [], // Added for Terrano Magic Table trade-off
    divineParams: null, // Added for Divine origin
    techModules: [],
    techParams: { incomeSource: 'agencia_priv' }, // Default to 0 PC option
    exoskeletonConfig: null,
    exoskeletonArmorConfig: null, // For Tecnoarmadura/Tecnovehiculo
    technoSuitStrengthConfig: null, // For Tecnoarmadura only
    cyborgImplants: [], // For Cyborg only
    isParahumanoHybrid: false, // Checkbox state for Parahumano hybrid with human
};
