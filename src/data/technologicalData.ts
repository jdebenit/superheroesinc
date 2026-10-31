/**
 * Configuración y opciones del subsistema Tecnológico para Superhéroes Inc.
 * Centraliza fuentes de ingresos, exoesqueletos, tecnoarmaduras e implantes cibernéticos.
 */

// ── Fuentes de Ingreso Tecnológico ──────────────────────────────────────────

export interface IncomeSource {
    id: string;
    label: string;
    description: string;
    pc: number;
}

export const INCOME_SOURCES: readonly IncomeSource[] = [
    {
        id: 'propios',
        label: 'Ingresos Propios',
        description: 'El personaje tiene sus recursos para mantener y poseer la tecnología.',
        pc: 8
    },
    {
        id: 'mecenas',
        label: 'Mecenas',
        description: 'Un personaje importante decide financiar el gasto y la manutención. El mecenas puede requerir la colaboración del personaje, aunque por lo general es libre de tomar sus propias decisiones.',
        pc: 6
    },
    {
        id: 'compania',
        label: 'Compañía Privada',
        description: 'El PJ trabaja para una compañía privada no relacionada con el tema de los metahumanos, pero que le ha contratado para proteger sus activos. Esto le acarrea ciertas responsabilidades, pero también le deja las manos libres para actuar en otros temas.',
        pc: 4
    },
    {
        id: 'agencia_gub',
        label: 'Agencia de metahumanos gubernamental',
        description: 'El personaje se encuentra dentro de un programa civil o militar que le permite financiar sus necesidades aunque esto vincula sus acciones a los intereses de esa agencia.',
        pc: 2
    },
    {
        id: 'agencia_priv',
        label: 'Agencia de metahumanos privada',
        description: 'Idéntica a la opción anterior, salvo quien paga las facturas es una agencia privada.',
        pc: 0
    }
];

// ── Exoesqueleto Energético ──────────────────────────────────────────────────

export interface ExoskeletonConfig {
    id: string;
    fue: number;
    pv: number;
    daCinetico: number;
    daEnergia: number;
    regeneracion: number;
    emision: string;
    velocidad: number;
    pcCost: number;
}

export const EXOSKELETON_CONFIGS: readonly ExoskeletonConfig[] = [
    {
        id: 'exo_config_1',
        fue: 105,
        pv: 100,
        daCinetico: 60,
        daEnergia: 75,
        regeneracion: 5,
        emision: '1d100',
        velocidad: 0.5,
        pcCost: 20
    },
    {
        id: 'exo_config_2',
        fue: 110,
        pv: 120,
        daCinetico: 75,
        daEnergia: 90,
        regeneracion: 10,
        emision: '1d100+20',
        velocidad: 0.5,
        pcCost: 30
    },
    {
        id: 'exo_config_3',
        fue: 120,
        pv: 140,
        daCinetico: 80,
        daEnergia: 105,
        regeneracion: 15,
        emision: '1d100+40',
        velocidad: 1.0,
        pcCost: 40
    },
    {
        id: 'exo_config_4',
        fue: 130,
        pv: 160,
        daCinetico: 105,
        daEnergia: 120,
        regeneracion: 20,
        emision: '1d100+60',
        velocidad: 1.0,
        pcCost: 50
    },
    {
        id: 'exo_config_5',
        fue: 140,
        pv: 180,
        daCinetico: 120,
        daEnergia: 135,
        regeneracion: 25,
        emision: '1d100+80',
        velocidad: 1.0,
        pcCost: 60
    },
    {
        id: 'exo_config_6',
        fue: 150,
        pv: 200,
        daCinetico: 135,
        daEnergia: 150,
        regeneracion: 30,
        emision: '1d100+100',
        velocidad: 1.5,
        pcCost: 70
    },
    {
        id: 'exo_config_7',
        fue: 160,
        pv: 220,
        daCinetico: 150,
        daEnergia: 165,
        regeneracion: 35,
        emision: '1d100+120',
        velocidad: 1.5,
        pcCost: 80
    },
    {
        id: 'exo_config_8',
        fue: 170,
        pv: 240,
        daCinetico: 165,
        daEnergia: 180,
        regeneracion: 40,
        emision: '1d100+140',
        velocidad: 1.5,
        pcCost: 90
    },
    {
        id: 'exo_config_9',
        fue: 180,
        pv: 260,
        daCinetico: 180,
        daEnergia: 195,
        regeneracion: 45,
        emision: '1d100+160',
        velocidad: 2.0,
        pcCost: 100
    },
    {
        id: 'exo_config_10',
        fue: 190,
        pv: 280,
        daCinetico: 195,
        daEnergia: 210,
        regeneracion: 50,
        emision: '1d100+180',
        velocidad: 2.0,
        pcCost: 110
    },
    {
        id: 'exo_config_11',
        fue: 200,
        pv: 300,
        daCinetico: 210,
        daEnergia: 225,
        regeneracion: 55,
        emision: '1d100+200',
        velocidad: 2.5,
        pcCost: 120
    }
];

// ── Tecnoarmadura (Blindaje y Fuerza) ────────────────────────────────────────

export interface ExoskeletonArmorConfig {
    id: string;
    pcCost: number;
    pv: number;
    daFisico: number;
}

export const EXOSKELETON_ARMOR_CONFIGS: readonly ExoskeletonArmorConfig[] = [
    { id: 'exo_armor_1', pcCost: 1, pv: 100, daFisico: 50 },
    { id: 'exo_armor_2', pcCost: 2, pv: 110, daFisico: 60 },
    { id: 'exo_armor_4', pcCost: 4, pv: 125, daFisico: 75 },
    { id: 'exo_armor_6', pcCost: 6, pv: 155, daFisico: 105 },
    { id: 'exo_armor_8', pcCost: 8, pv: 185, daFisico: 135 },
    { id: 'exo_armor_10', pcCost: 10, pv: 200, daFisico: 150 },
];

export interface TechnoSuitStrengthConfig {
    id: string;
    fuerza: number;
    fiabilidad: string | null;
    pcCost: number;
}

export const TECHNOSUIT_STRENGTH_CONFIGS: readonly TechnoSuitStrengthConfig[] = [
    { id: 'ts_str_100', fuerza: 100, fiabilidad: null, pcCost: 0 },
    { id: 'ts_str_110', fuerza: 110, fiabilidad: null, pcCost: 1 },
    { id: 'ts_str_120', fuerza: 120, fiabilidad: null, pcCost: 2 },
    { id: 'ts_str_130', fuerza: 130, fiabilidad: null, pcCost: 3 },
    { id: 'ts_str_140', fuerza: 140, fiabilidad: null, pcCost: 4 },
    { id: 'ts_str_150', fuerza: 150, fiabilidad: null, pcCost: 5 },
    { id: 'ts_str_160', fuerza: 160, fiabilidad: null, pcCost: 6 },
    { id: 'ts_str_170', fuerza: 170, fiabilidad: null, pcCost: 7 },
    { id: 'ts_str_180', fuerza: 180, fiabilidad: null, pcCost: 8 },
    { id: 'ts_str_190', fuerza: 190, fiabilidad: null, pcCost: 9 },
    { id: 'ts_str_200', fuerza: 200, fiabilidad: '80%', pcCost: 10 },
];

// ── Implantes Cibernéticos (Cyborg) ──────────────────────────────────────────

export interface CyborgImplantStatConfig {
    id: string;
    pcCost: number;
    pvBonus: number;
    daFisico: number;
}

export interface CyborgImplantStrengthConfig {
    id: string;
    fuerza: number;
    pcCost: number;
}

export const CYBORG_IMPLANT_STATS: readonly CyborgImplantStatConfig[] = [
    { id: 'imp_stat_1', pcCost: 1, pvBonus: 2, daFisico: 50 },
    { id: 'imp_stat_2', pcCost: 2, pvBonus: 5, daFisico: 60 },
    { id: 'imp_stat_3', pcCost: 3, pvBonus: 8, daFisico: 75 },
    { id: 'imp_stat_4', pcCost: 4, pvBonus: 10, daFisico: 105 },
    { id: 'imp_stat_5', pcCost: 5, pvBonus: 15, daFisico: 135 },
    { id: 'imp_stat_6', pcCost: 6, pvBonus: 20, daFisico: 150 },
];

export const CYBORG_IMPLANT_STRENGTHS: readonly CyborgImplantStrengthConfig[] = [
    { id: 'imp_str_0', fuerza: 100, pcCost: 0 },
    { id: 'imp_str_1', fuerza: 110, pcCost: 1 },
    { id: 'imp_str_2', fuerza: 130, pcCost: 2 },
    { id: 'imp_str_3', fuerza: 150, pcCost: 3 },
    { id: 'imp_str_4', fuerza: 170, pcCost: 4 },
    { id: 'imp_str_5', fuerza: 190, pcCost: 5 },
];

export interface CyborgImplant {
    id: string; // unique ID for the instance
    name: string;
    statConfigId: string;
    strengthConfigId: string;
}
