/**
 * Definiciones de datos para el origen Hombre Lobo (Licántropos)
 * y configuraciones del sistema de Formas / Transformaciones (CharacterForm).
 * Las funciones de cálculo y sincronización se encuentran en `src/utils/calculations/formCalculations.ts`.
 */

export type WerewolfSubtypeId = 'puro' | 'hibrido' | 'renegado';

export interface TransitionStatConfig {
    id: string;
    label: string;
    abbr: string;
    base: number;
    max: number;
}

export interface WerewolfSubtypeConfig {
    id: WerewolfSubtypeId;
    name: string;
    shortName: string;
    cost: number;
    silverDamageBonus: number;
    regenRank: number;
    regenRankLabel: string;
    naturalWeaponRank: number;
    naturalWeaponRankLabel: string;
    hasPurePowers: boolean;
    description: string;
    rageDescription: string;
    silverDescription: string;
    extraRules?: string;
    transitionStats: Record<string, TransitionStatConfig>;
}

export interface CharacterForm {
    id: string;
    name: string;
    source: string;
    subtype?: string;
    cost: number;
    attributes: {
        values: {
            Fuerza: number;
            Constitución: number;
            Agilidad: number;
            Inteligencia: number;
            Percepción: number;
            Apariencia: number;
            Voluntad: number;
        };
        breakdown?: Record<string, {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
            otherMod: number;
            min: number;
            max: number;
        }>;
    };
    combatstats?: Record<string, any>;
    otherstats?: Record<string, any>;
}

export interface WerewolfParams {
    subtype: WerewolfSubtypeId;
}

export interface PowerTransformationConfig {
    formId: string;
    powerId: string;
    name: string;
    shortName: string;
    icon: string;
    description: string;
    readOnly: boolean;
    statBonuses: Partial<Record<string, number>>;
}

export const WEREWOLF_TRANSITION_FORM_ID = 'werewolf_transition';
export const BLINDAJE_NATURAL_FORM_ID = 'blindaje_natural';

export const POWER_TRANSFORMATIONS: PowerTransformationConfig[] = [
    {
        formId: BLINDAJE_NATURAL_FORM_ID,
        powerId: 'blindaje_natural',
        name: 'Forma de Transición (Blindaje Natural)',
        shortName: 'Blindaje Natural',
        icon: '🛡️',
        description: 'Transformación otorgada por el poder Blindaje Natural. Suma +50 a Fuerza y +50 a Constitución sobre las características de la Forma Humana. No permite modificar ningún otro valor.',
        readOnly: true,
        statBonuses: {
            fuerza: 50,
            constitucion: 50
        }
    }
];

export const TRANSITION_CHARACTERISTICS_ORDER = [
    { id: 'fuerza', key: 'Fuerza', abbr: 'FUE' },
    { id: 'constitucion', key: 'Constitución', abbr: 'CON' },
    { id: 'agilidad', key: 'Agilidad', abbr: 'AGI' },
    { id: 'inteligencia', key: 'Inteligencia', abbr: 'INT' },
    { id: 'percepcion', key: 'Percepción', abbr: 'PER' },
    { id: 'apariencia', key: 'Apariencia', abbr: 'APA' },
] as const;

export const WEREWOLF_SUBTYPES: Record<WerewolfSubtypeId, WerewolfSubtypeConfig> = {
    puro: {
        id: 'puro',
        name: 'Hombre Lobo Puro',
        shortName: 'Puro',
        cost: 4,
        silverDamageBonus: 20,
        regenRank: 41,
        regenRankLabel: 'Elevado (41)',
        naturalWeaponRank: 1,
        naturalWeaponRankLabel: 'Bajo (1)',
        hasPurePowers: true,
        description: 'Fuertemente conectados con la naturaleza y los espíritus de la Madre Tierra. Poseen el don de la Empatía animal (rango medio) y Donación de vida (rango elevado) mediante el contacto físico.',
        rageDescription: 'En estado híbrido pierden gran parte de su control: si son atacados deben superar una tirada de Voluntad para no caer en una rabia asesina y atacar a sus compañeros, y otra cada vez que vayan a actuar en contra de su rabia.',
        silverDescription: 'Alergia severa a la plata: cualquier arma de plata suma +20 al daño y anula sus poderes de regeneración.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 120 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 120 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 110 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 100 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 130 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 80 }
        }
    },
    hibrido: {
        id: 'hibrido',
        name: 'Hombre Lobo Híbrido',
        shortName: 'Híbrido',
        cost: 0,
        silverDamageBonus: 10,
        regenRank: 41,
        regenRankLabel: 'Elevado (41)',
        naturalWeaponRank: 1,
        naturalWeaponRankLabel: 'Bajo (1)',
        hasPurePowers: false,
        description: 'Descendientes mezclados con humanos que conservan la capacidad de adoptar la forma intermedia y lupina, aunque con menor control sobre sus instintos.',
        rageDescription: 'Mayor tendencia a transformarse: cualquier situación de peligro o herida desencadena el cambio salvo que supere una tirada de Voluntad Difícil. En las noches de luna llena la transformación es inevitable.',
        silverDescription: 'Alergia a la plata moderada: las armas de plata les afectan con un bonificador de +10 al daño y anulan su regeneración.',
        extraRules: 'Mordisco infeccioso: transmite la enfermedad mental de licantropía si la víctima no supera una tirada de Resistencia a Venenos y otra de EQM.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 120 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 120 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 110 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 60 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 120 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 90 }
        }
    },
    renegado: {
        id: 'renegado',
        name: 'Hombre Lobo Renegado',
        shortName: 'Renegado',
        cost: 9,
        silverDamageBonus: 20,
        regenRank: 71,
        regenRankLabel: 'Alto (71)',
        naturalWeaponRank: 21,
        naturalWeaponRankLabel: 'Medio (21)',
        hasPurePowers: false,
        description: 'Licántropos que renegaron de sus códigos morales para tomar venganza contra los humanos. Carecen de la paz interna para Empatía animal y Donación de vida, pero poseen una Regeneración de tejidos superior (rango alto) y Arma Natural mejorada (rango medio).',
        rageDescription: 'Carácter sumamente violento que les lleva a perder el control al adoptar su forma intermedia. Si son atacados o intentan actuar contra su rabia deben superar tiradas de Voluntad.',
        silverDescription: 'Alergia severa a la plata: cualquier arma de plata suma +20 al daño y anula sus poderes de regeneración.',
        transitionStats: {
            fuerza: { id: 'fuerza', label: 'Fuerza', abbr: 'FUE', base: 100, max: 130 },
            constitucion: { id: 'constitucion', label: 'Constitución', abbr: 'CON', base: 100, max: 130 },
            agilidad: { id: 'agilidad', label: 'Agilidad', abbr: 'AGI', base: 100, max: 120 },
            inteligencia: { id: 'inteligencia', label: 'Inteligencia', abbr: 'INT', base: 40, max: 80 },
            percepcion: { id: 'percepcion', label: 'Percepción', abbr: 'PER', base: 100, max: 120 },
            apariencia: { id: 'apariencia', label: 'Apariencia', abbr: 'APA', base: 20, max: 60 }
        }
    }
};

export {
    getWerewolfSubtypeConfig,
    getPowerTransformationConfig,
    hasPowerTransformation,
    getActivePowerTransformations,
    buildPowerTransformationForm,
    buildWerewolfTransitionForm,
    hasHombreLobo,
    hasOtherSobrenaturalPowerOrigin,
    syncCharacterTransformations,
    syncWerewolfState,
    getCharacterForActiveForm
} from '../utils/calculations/formCalculations';
