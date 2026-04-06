/** A group to categorize characters */
export interface TmtGroup {
    id: string;
    name: string;
    color?: string;
}

export interface HistoryEntry {
    timestamp: string;
    type: 'health' | 'mental' | 'willpower' | 'chi';
    change: number;
    newValue: number;
    notes: string;
}

/** A character entry stored inside the TMT session */
export interface TmtCharacterEntry {
    /** Unique ID for this slot */
    id: string;
    /** 'pj' = player character, 'pnj' = non-player character */
    role: 'pj' | 'pnj';
    /** ISO timestamp of when it was added/last updated */
    addedAt: string;
    /** The raw character JSON as exported from the Wizard / CharacterViewer */
    characterData: Record<string, any>;
    /** IDs of groups this character belongs to */
    groupIds: string[];
    /** Current initiative roll/value for the combat tracker */
    initiative?: number;
    /** The actual roll component (1-100) for transparency */
    roll?: number;
    /** Number of actions already spent/used in the current round */
    usedActions?: number;
    /** Modifier for initiative rolls (Surprised, Stunned, etc.) */
    initiativeMod?: number;
    /** Health & Vitals Tracking */
    currentHealth?: number;
    maxHealth?: number;
    currentMental?: number;
    maxMental?: number;
    history?: HistoryEntry[];
    /** Master Privacy */
    isHidden?: boolean;
}


/** Root structure written to localStorage */
export interface TmtStore {
    meta: {
        version: string;
        savedAt: string;
        generator: string;
    };
    characters: TmtCharacterEntry[];
    groups: TmtGroup[];
    activeCombatGroupIds?: string[];
    details?: {
        name: string;
        description: string;
        notes: string;
    };
    currentTurn?: number;
    currentRound?: number;
}

