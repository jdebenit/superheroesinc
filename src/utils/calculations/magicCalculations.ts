import { SPELLS, type Spell } from '../../data/spells';
import { POWERS } from '../../data/powers';
import { hasSubtype } from './originFlags';
import { getCharacteristicValue } from './powerCalculations';

/**
 * Normalizes a spell ID or name for case/accent/symbol-insensitive comparison.
 */
export const normalizeSpellId = (id: string): string => {
    if (!id) return '';
    return id
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

/**
 * Known errata / typo mappings from legacy character JSONs to canonical spell IDs.
 */
export const SPELL_ERRATA_MAP: Record<string, string> = {
    pesudopsi: 'pseudo_psi',
    proyecciconastral: 'proyeccion_del_cuerpo_astral',
    proyeccionastral: 'proyeccion_del_cuerpo_astral',
    percercionmagica: 'percepcion_magica',
    proyeccionenergiamagica: 'proyeccion_de_energia_magica',
    proyecciondeenergiamagicadefensa: 'proyeccion_de_energia_magica',
    cadenasdeltartaro: 'cadenas_del_tartaro',
    escantarobjetos: 'encantar_objetos'
};

/**
 * Finds a Spell definition by ID or Name, handling parenthesized options and errata.
 */
export const findSpellByNameOrId = (nameOrId: string): Spell | undefined => {
    if (!nameOrId) return undefined;
    // Strip options in parentheses, e.g. "Invocar Elemento (clima)" -> "Invocar Elemento"
    const cleanNameOrId = nameOrId.replace(/\([^)]+\)/g, '').trim();
    const norm = normalizeSpellId(cleanNameOrId);
    if (!norm) return undefined;

    if (SPELL_ERRATA_MAP[norm]) {
        const correctId = SPELL_ERRATA_MAP[norm];
        const byErrata = SPELLS.find(s => s.id === correctId || normalizeSpellId(s.id) === normalizeSpellId(correctId));
        if (byErrata) return byErrata;
    }

    const exact = SPELLS.find(s => normalizeSpellId(s.id) === norm || normalizeSpellId(s.name) === norm);
    if (exact) return exact;

    return SPELLS.find(s => {
        const normSpellId = normalizeSpellId(s.id);
        const normSpellName = normalizeSpellId(s.name);
        return normSpellId.includes(norm) || norm.includes(normSpellId) ||
               normSpellName.includes(norm) || norm.includes(normSpellName);
    });
};

/**
 * Parses a spell rank value (number or string such as "Maestria", "Rango 3", etc.).
 */
export const parseSpellRank = (rankVal: any, maxRank: number = 5): number => {
    if (rankVal === undefined || rankVal === null) return 1;
    if (typeof rankVal === 'number') return rankVal;
    const str = String(rankVal).toLowerCase().trim();
    if (str === 'maestria' || str === 'maestría') return maxRank;
    const digits = str.replace(/\D/g, '');
    if (digits) {
        const parsed = parseInt(digits, 10);
        if (!isNaN(parsed)) return parsed;
    }
    return 1;
};

/**
 * Extracts a spell option either from an explicit option field or from parentheses in the name/id.
 */
export const extractSpellOption = (nameOrId: string, spellDef?: Spell, explicitOption?: string): string => {
    if (explicitOption) return explicitOption;
    if (!nameOrId) return '';
    const optionMatch = nameOrId.match(/\(([^)]+)\)/);
    if (!optionMatch) return '';
    const rawOpt = optionMatch[1].trim().toLowerCase();
    const matchedOpt = spellDef?.options?.find(o => o.toLowerCase() === rawOpt);
    return matchedOpt || optionMatch[1].trim();
};

/**
 * Normalizes a character's spells object (supporting both `spells.selected` and legacy `spells.items`).
 */
export const normalizeCharacterSpells = (
    spellsObj: any
): Array<{ id: string; rank: number; selectedOption: string }> => {
    if (!spellsObj) return [];

    const hasSelected = Array.isArray(spellsObj.selected) && spellsObj.selected.length > 0;
    const rawSpells = hasSelected
        ? spellsObj.selected
        : (Array.isArray(spellsObj.items) ? spellsObj.items : []);

    const normalized: Array<{ id: string; rank: number; selectedOption: string }> = [];

    rawSpells.forEach((s: any) => {
        if (!s) return;
        const nameOrId = s.id || s.name;
        const spellDef = findSpellByNameOrId(nameOrId);
        if (spellDef) {
            const rank = parseSpellRank(s.rank, spellDef.maxRank);
            const selectedOption = extractSpellOption(nameOrId, spellDef, s.selectedOption);
            normalized.push({
                id: spellDef.id,
                rank,
                selectedOption
            });
        }
    });

    return normalized;
};


/**
 * Calculates Magical Energy (EM) based on characteristics, power modifiers, Semidemonio bonus, and level.
 */
export const calculateEM = (data: any, selectedPowers: any[] = [], divisor: number = 1): number => {
    if (!divisor || divisor <= 0) return 0;

    let int = Number(getCharacteristicValue(data, 'Inteligencia')) || 0;
    let per = Number(getCharacteristicValue(data, 'Percepción')) || 0;
    let vol = Number(getCharacteristicValue(data, 'Voluntad')) || 0;
    let con = Number(getCharacteristicValue(data, 'Constitución')) || 0;

    // Apply power modifiers (subtracting any powerMod already baked into attributes.values via breakdown)
    if (selectedPowers && selectedPowers.length > 0) {
        const breakdown = data?.attributes?.breakdown;
        if (breakdown) {
            int -= Number(breakdown.inteligencia?.powerMod) || 0;
            per -= Number(breakdown.percepcion?.powerMod) || 0;
            vol -= Number(breakdown.voluntad?.powerMod) || 0;
            con -= Number(breakdown.constitucion?.powerMod) || 0;
        }

        selectedPowers.forEach(p => {
            const powerData = POWERS.find(power => power.id === p.id);
            if (powerData?.characteristic && p.powerMod) {
                const mod = Number(p.powerMod) || 0;
                switch (powerData.characteristic) {
                    case 'INT': int += mod; break;
                    case 'PER': per += mod; break;
                    case 'VOL': vol += mod; break;
                    case 'CON': con += mod; break;
                }
            }
        });
    }

    // If Semidemonio, add CON to the formula
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const conVal = isSemidemonio ? con : 0;
    const level = Math.max(1, Number(data?.level) || 1);

    return Math.floor((int + per + vol + conVal) / divisor) * level;
};

/**
 * Calculates the maximum base Magical Energy (EM) for a character taking into account
 * all active magic origins and the selected EM formula (properly respecting divisor === 0).
 */
export const getCharacterMaxEM = (
    character: any,
    selectedPowers: any[] = character?.powers?.selected || []
): number => {
    const isMago = hasSubtype(character, 'Arcano', 'Mago');
    const isElfoMagico = hasSubtype(character, 'Arcano', 'Elfo Mágico');
    const isHadaEter = hasSubtype(character, 'Arcano', 'Hada Eter');
    const isDotado = hasSubtype(character, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(character, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(character, 'Arcano', 'Terrano');
    const isPoseido = hasSubtype(character, 'Sobrenatural', 'Poseído');
    const hasBaseEMOrigin = isMago || isElfoMagico || isHadaEter || isDotado || isHibrido || isTerrano || isPoseido;

    if (!hasBaseEMOrigin) return 0;

    let divisor: number;
    if (isMago || isElfoMagico) {
        divisor = 1;
    } else if (isHadaEter) {
        divisor = 2;
    } else if (character?.spells?.emFormula?.divisor !== undefined && character?.spells?.emFormula?.divisor !== null) {
        divisor = Number(character.spells.emFormula.divisor);
    } else {
        divisor = (isPoseido && !isDotado && !isHibrido && !isTerrano) ? 0 : 4;
    }

    if (divisor <= 0) return 0;
    return calculateEM(character, selectedPowers, divisor);
};

/**
 * Calculates total EM cost of a list of selected spells.
 */
export const calculateSelectedSpellsEMCost = (selectedSpells: any[] = []): number => {
    return (selectedSpells || []).reduce((acc: number, spell: any) => {
        const s = SPELLS.find((sp: any) => sp.id === spell.id) || findSpellByNameOrId(spell.id || spell.name);
        const baseCost = s ? (parseInt(s.cost, 10) || 0) : (parseInt(spell.cost, 10) || 0);
        const rank = spell.rank || 1;
        return acc + (baseCost * rank);
    }, 0);
};

/**
 * Formats a character's spells for display in CharacterSheet and PDF export.
 */
export const formatSpellsForDisplay = (
    character: any
): Array<{ name: string; rank: string; cost: string; notes: string }> => {
    const rawSpells = (character?.spells?.selected && character.spells.selected.length > 0)
        ? character.spells.selected
        : normalizeCharacterSpells(character?.spells);

    return (rawSpells || []).map((s: any) => {
        const spellDef = findSpellByNameOrId(s.id || s.name);
        const maxRank = spellDef?.maxRank || 5;
        const isMaestria = s.rank === maxRank + 2;
        const baseCost = spellDef ? (parseInt(spellDef.cost, 10) || 0) : 0;
        const effectiveRank = s.rank || 1;

        const baseName = spellDef?.name || s.name || '';
        const displayName = s.selectedOption ? `${baseName} (${s.selectedOption})` : baseName;

        return {
            name: displayName,
            rank: isMaestria ? 'Maestría' : (s.rank || '').toString(),
            cost: (baseCost * effectiveRank).toString(),
            notes: spellDef?.requirements || s.effect || s.description || ''
        };
    });
};

export const TERRANO_TABLE_OPTIONS = [
    { id: 'guardian_power', label: 'Acceso a Poder de Guardián', cost: 2, costText: '+2 PC' },
    { id: '180_EM', label: 'Acceso a objetos de 180 EM', cost: 1, costText: '+1 PC' },
    { id: '120_EM', label: 'Acceso a objetos de 120 EM', cost: 0, costText: '+0 PC' },
    { id: '60_EM', label: 'Acceso a objetos de 60 EM', cost: -1, costText: '-1 PC' },
    { id: 'none', label: 'Ningún objeto', cost: -2, costText: '-2 PC' },
];

export const EM_FORMULA_OPTIONS_DOTADO = [
    { id: '2|8', label: 'Dotado: (PER+INT+VOL)/2 → +8 PCs', cost: 8 },
    { id: '3|3', label: 'Dotado: (PER+INT+VOL)/3 → +3 PCs', cost: 3 },
    { id: '4|0', label: 'Dotado: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
];

export const EM_FORMULA_OPTIONS_HIBRIDO = [
    { id: '2|15', label: 'Híbrido: (PER+INT+VOL)/2 → +15 PCs', cost: 15 },
    { id: '3|10', label: 'Híbrido: (PER+INT+VOL)/3 → +10 PCs', cost: 10 },
    { id: '4|7', label: 'Híbrido: (PER+INT+VOL)/4 → +7 PCs', cost: 7 },
    { id: '0|0', label: 'Híbrido: No EM', cost: 0 },
];

export const EM_FORMULA_OPTIONS_TERRANO = [
    { id: '4|0', label: 'Terrano: (PER+INT+VOL)/4 → +0 PCs', cost: 0 },
    { id: '0|-5', label: 'Terrano Ajeno: No EM → -5 PCs', cost: -5 },
];

export const EM_FORMULA_OPTIONS_POSEIDO = [
    { id: '2|3', label: 'Poseído: (INT+PER+VOL)/2 → +3 PCs', cost: 3 },
    { id: '0|0', label: 'Poseído: No accede a hechizos → +0 PCs', cost: 0 },
];

export interface EMFormulaFlags {
    isDotado?: boolean;
    isHibrido?: boolean;
    isTerrano?: boolean;
    isPoseido?: boolean;
}

/**
 * Builds the list of available EM Formula options combining all active EM-formula origins
 * (Dotado, Híbrido mitológico, Terrano, Poseído) so multiorigin characters can choose from any of their origins.
 */
export const getEMFormulaOptions = ({
    isDotado,
    isHibrido,
    isTerrano,
    isPoseido
}: EMFormulaFlags): Array<{ id: string; label: string; cost: number }> => {
    const raw: Array<{ id: string; label: string; cost: number }> = [
        ...(isDotado ? EM_FORMULA_OPTIONS_DOTADO : []),
        ...(isHibrido ? EM_FORMULA_OPTIONS_HIBRIDO : []),
        ...(isTerrano ? EM_FORMULA_OPTIONS_TERRANO : []),
        ...(isPoseido ? EM_FORMULA_OPTIONS_POSEIDO : [])
    ];

    const byId = new Map<string, { id: string; label: string; cost: number }>();
    for (const opt of raw) {
        const existing = byId.get(opt.id);
        if (!existing) {
            byId.set(opt.id, { ...opt });
        } else {
            const [existingOrigin, existingRest] = existing.label.split(': ');
            const [newOrigin, newRest] = opt.label.split(': ');
            if (existingOrigin && newOrigin && !existingOrigin.includes(newOrigin)) {
                existing.label = `${existingOrigin} / ${newOrigin}: ${newRest || existingRest}`;
            }
        }
    }

    return Array.from(byId.values());
};
