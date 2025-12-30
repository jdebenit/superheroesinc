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

export const EXOSKELETON_CONFIGS: ExoskeletonConfig[] = [
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
        daEnergia: 105,
        regeneracion: 25,
        emision: '1d100+80',
        velocidad: 2.0,
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
        velocidad: 2.0,
        pcCost: 70
    }
];
