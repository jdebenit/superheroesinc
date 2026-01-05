export interface ExoskeletonArmorConfig {
    id: string;
    pcCost: number;
    pv: number;
    daFisico: number;
}

export const EXOSKELETON_ARMOR_CONFIGS: ExoskeletonArmorConfig[] = [
    { id: 'exo_armor_1', pcCost: 1, pv: 100, daFisico: 50 },
    { id: 'exo_armor_2', pcCost: 2, pv: 110, daFisico: 60 },
    { id: 'exo_armor_4', pcCost: 4, pv: 125, daFisico: 75 },
    { id: 'exo_armor_6', pcCost: 6, pv: 155, daFisico: 105 },
    { id: 'exo_armor_8', pcCost: 8, pv: 185, daFisico: 135 },
    { id: 'exo_armor_10', pcCost: 10, pv: 200, daFisico: 150 },
];
