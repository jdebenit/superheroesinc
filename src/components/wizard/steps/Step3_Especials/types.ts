import type { Power, PowerType } from '../../../../data/powers';
import type { Spell } from '../../../../data/spells';

export interface Step3Props {
    data: any;
    // data.malditoParams, data.enteParams, etc are assumed dynamic
    onChange: (updates: any) => void;
}


export interface SelectedPower {
    id: string;
    origin: string;
    rank: number; // 1-100, adds 0.1 PC per unit
    powerMod?: number; // For powers with characteristics, max total 200
    skillValue?: number; // Input for skill calculation base
    selectedOption?: string; // For powers with options
}

export interface TechModule {
    id: string;
    definitionId: string; // ID from TECH_MODULES
    name: string;
    location: string;
    pcCost: number;
}

export interface SelectedSpell {
    id: string;
    rank: number;
    selectedOption?: string;
}

export type ModalType = 'powers' | 'spells' | 'techModules' | 'magical_bonds' | null;
export type ViewMode = 'grid' | 'table';
export type TechTypeFilter = 'General' | 'Mejora Interna' | 'All';
