export interface TechnoSuitStrengthConfig {
    id: string;
    fuerza: number;
    fiabilidad: string | null;
    pcCost: number;
}

export const TECHNOSUIT_STRENGTH_CONFIGS: TechnoSuitStrengthConfig[] = [
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
