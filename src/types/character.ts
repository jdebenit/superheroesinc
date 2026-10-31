import type { CyborgImplant } from '../data/technologicalData';
import type { WerewolfSubtypeId } from '../data/werewolfOptions';

export type CharacteristicId =
    | 'fuerza'
    | 'constitucion'
    | 'agilidad'
    | 'inteligencia'
    | 'percepcion'
    | 'apariencia'
    | 'voluntad';

export type CharacteristicName =
    | 'Fuerza'
    | 'Constitución'
    | 'Agilidad'
    | 'Inteligencia'
    | 'Percepción'
    | 'Apariencia'
    | 'Voluntad';

export interface AttributeBreakdownItem {
    base: number;
    originMod: number;
    specialtyMod: number;
    powerMod: number;
    otherMod?: number;
    min?: number;
    max?: number;
    invested?: number;
}

export type AttributeValues = Record<CharacteristicName, number> & Record<string, number>;
export type AttributeBreakdown = Record<CharacteristicId, AttributeBreakdownItem> & Record<string, AttributeBreakdownItem>;

export interface CharacterAttributes {
    values: AttributeValues;
    breakdown?: AttributeBreakdown;
    manualBonuses?: Record<string, number>;
    cost?: number;
}

export type CharacterOriginItem = Record<string, string[]>;

export interface PowerCustomization {
    id: string;
    description: string;
    cost: number;
}

export interface SelectedPower {
    id: string;
    name?: string;
    origin: string;
    rank: number;
    powerMod?: number;
    skillValue?: number;
    selectedOption?: string;
    isCrossType?: boolean;
    isCrossOrigin?: boolean;
    isCrossOriginMaldito?: boolean;
    isCrossOriginDivino?: boolean;
    isWerewolfInnate?: boolean;
    customizations?: PowerCustomization[];
    effect?: string;
    cost?: number;
    val?: string | number;
    value?: string | number;
}

export interface SelectedSpell {
    id: string;
    name?: string;
    rank: number;
    selectedOption?: string;
    effect?: string;
    description?: string;
}

export interface TechModule {
    id: string;
    definitionId: string;
    name: string;
    location: string;
    pcCost: number;
    notes?: string;
}

export interface CharacterForm {
    id: string;
    name: string;
    source: string;
    subtype?: string;
    cost: number;
    attributes: {
        values: AttributeValues;
        breakdown?: Record<string, AttributeBreakdownItem>;
    };
    combatstats?: Record<string, any>;
    otherstats?: Record<string, any>;
}

export interface SelectedSkillEntry {
    isFree: boolean;
    isRequired: boolean;
    manualMods: number;
    manualBases: number;
}

export interface SpecifiedSkillEntry extends SelectedSkillEntry {
    skillId: string;
    specification: string;
}

export interface SkillDisplayItem {
    name: string;
    math: string;
    value: string;
}

export interface CharacterSkills {
    generalItems: SkillDisplayItem[];
    specialItems: SkillDisplayItem[];
    generalManualMods: Record<string, number>;
    manualBases: Record<string, number>;
    nativeLanguage?: string;
    selected: Record<string, SelectedSkillEntry>;
    specified: Record<string, SpecifiedSkillEntry>;
    learning?: {
        selected?: Record<string, SelectedSkillEntry>;
        specified?: Record<string, SpecifiedSkillEntry>;
    };
    items?: SkillDisplayItem[];
}

export interface SelectedSequel {
    id: string;
    description?: string;
}

export interface EnteParams {
    formType: string | null;
    visualEffect: string | null;
}

export interface MalditoParams {
    magnitude: string | null;
    source: string | null;
}

export interface PoseidoParams {
    formType: string | null;
}

export interface AlteradoParams {
    agent: string | null;
    sequels: SelectedSequel[];
}

export interface MutanteParams {
    sequels: SelectedSequel[];
}

export interface HibridoParams {
    sequels: SelectedSequel[];
}

export interface GuardianParams {
    quality: string | null;
    objectType?: string | null;
    feature?: string | null;
    transformation?: string | null;
}

export interface DivineParams {
    focus: string | null;
    hasPhysicalAlteration?: boolean;
    physicalAlterationDescription?: string;
}

export interface LiberadoParams {
    gifts?: string[];
    gift?: string | null;
    comprensionChoice?: 'second_characteristic' | 'no_limit' | null;
    secondCharacteristic?: string | null;
}

export interface ParahumanoParams {
    isHybridWithHuman?: boolean;
}

export interface WerewolfParams {
    subtype: WerewolfSubtypeId;
}

export interface CharacterBackground {
    items: string[];
    prejudiceResistance: number;
    economicStatus: string;
    legalStatus: string;
    socialStatus: string;
    friendsAndAssociates: string;
    baseCoverage?: string;
}

export interface CharacterData {
    name: string;
    alias: string;
    profession?: string;
    sexualIdentity?: string;
    notes: string;
    meta: {
        version: string;
        generator: string;
    };
    totalCost?: string | number;
    level: number;
    modPerLevel?: Record<string, any>;
    origin: {
        items: CharacterOriginItem[];
    };
    origins?: CharacterOriginItem[];
    combatstats: Record<string, any>;
    otherstats: Record<string, any>;
    attributes: CharacterAttributes;
    skills: CharacterSkills;
    specialskills?: { items: SkillDisplayItem[] };
    background: CharacterBackground;
    equipment: { items: any[] };
    varios: { items: any[] };
    weapons: { items: any[] };
    artifacts: { items: any[] };
    magicObjects: { items: any[] };
    vehicles: { items: any[] };
    spells: {
        selected: SelectedSpell[];
        items?: any[];
        emFormula?: { divisor: number; pcCost: number };
        calculatedEM?: number;
    };
    powers: {
        selected: SelectedPower[];
        items?: any[];
    };
    magicalBonds: string[];
    magicalBondsCustomName?: string;
    magicalBondsCustomDescription?: string;
    enteParams: EnteParams | null;
    malditoParams: MalditoParams | null;
    poseidoParams: PoseidoParams | null;
    alteradoParams: AlteradoParams | null;
    mutanteParams: MutanteParams | null;
    hibridoParams?: HibridoParams | null;
    guardianParams: GuardianParams | null;
    magicTableRolls: string[];
    divineParams: DivineParams | null;
    techModules: TechModule[];
    techParams: { incomeSource?: string; [key: string]: any } | null;
    exoskeletonConfig: string | null;
    exoskeletonArmorConfig: string | null;
    technoSuitStrengthConfig: string | null;
    cyborgImplants: CyborgImplant[];
    isParahumanoHybrid?: boolean;
    parahumanoParams?: ParahumanoParams | null;
    liberadoParams: LiberadoParams | null;
    chosenBonusCharacteristic: string | null;
    chosenCharacteristics: Record<string, string>;
    werewolfParams: WerewolfParams | null;
    forms: CharacterForm[];
    traumas?: Record<string, string>;
    uiState?: {
        unlockManualCharacteristics?: boolean;
        unlockManualSkills?: boolean;
        unlockCombatStats?: boolean;
        unlockOtherStats?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface BaseStepProps {
    data: CharacterData;
    onChange: (updates: Partial<CharacterData> | Record<string, any>) => void;
    onShowHelp?: () => void;
}

export interface CharacterOriginFlags {
    // Primary Origins
    isGuardian: boolean;
    isAlterado: boolean;
    isParahumano: boolean;
    isParahumanoHybrid: boolean;
    isMutante: boolean;
    isVigilante: boolean;
    isCosmico: boolean;
    isDivino: boolean;
    isTecnologico: boolean;

    // Arcano Subtypes
    isMago: boolean;
    isDotado: boolean;
    isHibrido: boolean;
    isTerrano: boolean;
    isElfoMagico: boolean;
    isElfoFisico: boolean;
    isElfoPsiquico: boolean;
    isHadaEter: boolean;
    isHadaAire: boolean;
    isHadaFuego: boolean;
    isHadaAgua: boolean;
    isHadaTierra: boolean;
    isHada: boolean;
    isGrifo: boolean;
    isTroll: boolean;
    isMinotauro: boolean;
    isEnano: boolean;

    // Sobrenatural Subtypes
    isPoseido: boolean;
    isMaldito: boolean;
    isVampiro: boolean;
    isHombreLobo: boolean;
    isSemidemonio: boolean;
    isEnte: boolean;
    isLiberadoEntropia: boolean;
    isLiberadoUnidad: boolean;
    isLiberadoEquidad: boolean;
    isLiberado: boolean;
    activeLiberados: string[];
    hasConocimientoEsferas: boolean;

    // Parahumano Subtypes
    isThals: boolean;
    isTesKhar: boolean;
    isAtlante: boolean;

    // Divino Subtypes
    isDios: boolean;
    isDiosMenor: boolean;
    isSemidios: boolean;

    // Cosmico Subtypes
    isHeraldoCosmico: boolean;

    // Tecnológico Subtypes
    isTecnoarmadura: boolean;
    isCyborg: boolean;
    isTecnovehiculo: boolean;
    isExoskeleton: boolean;
    isInventor: boolean;
    isTechnological: boolean;

    // Derived EM & Origin Group Flags
    hasBaseEMOrigin: boolean;
    hasEMFormula: boolean;
    hasEM: boolean;
    hasAnyOrigin: boolean;
}
