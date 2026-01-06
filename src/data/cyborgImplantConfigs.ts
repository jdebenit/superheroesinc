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

export const CYBORG_IMPLANT_STATS: CyborgImplantStatConfig[] = [
    { id: 'imp_stat_1', pcCost: 1, pvBonus: 2, daFisico: 50 },
    { id: 'imp_stat_2', pcCost: 2, pvBonus: 5, daFisico: 60 },
    { id: 'imp_stat_3', pcCost: 3, pvBonus: 8, daFisico: 75 },
    { id: 'imp_stat_4', pcCost: 4, pvBonus: 10, daFisico: 105 },
    { id: 'imp_stat_5', pcCost: 5, pvBonus: 15, daFisico: 135 },
    { id: 'imp_stat_6', pcCost: 6, pvBonus: 20, daFisico: 150 },
];

export const CYBORG_IMPLANT_STRENGTHS: CyborgImplantStrengthConfig[] = [
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
