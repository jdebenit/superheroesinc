import { useState, useMemo, useEffect, useCallback } from 'react';
import { POWERS } from '../../../../../data/powers';
import { SPELLS, type Spell } from '../../../../../data/spells';
import { TECH_MODULES } from '../../../../../data/techModules';
import { useCharacterAutoEffects } from '../../../../../hooks/wizard/useCharacterAutoEffects';
import { useCharacterValidation } from './useCharacterValidation';
import { hasOtherSobrenaturalPowerOrigin } from '../../../../../data/werewolfOptions';
import {
    hasOrigin,
    hasSubtype,
    getVigilanteSpecialties,
    calculateEM,
    isGuardian,
    isMaldito,
    getPowerPenalty,
    getCharacterOriginFlags
} from '../utils';
import { getEMFormulaOptions } from '../../../../../utils/calculations/magicCalculations';
import type { SelectedPower, SelectedSpell, TechModule, ModalType } from '../types';
import type { CyborgImplant } from '../../../../../data/cyborgImplantConfigs';

export function useStep3Logic(data: any, onChange: (updates: any) => void, onShowToast?: (msg: string, type: 'error' | 'success') => void) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    // Centralized origin flags
    const originFlags = useMemo(() => getCharacterOriginFlags(data), [
        data.origin?.items,
        data.origins,
        data.parahumanoParams,
        data.liberadoParams,
        data.werewolfParams
    ]);

    const {
        isGuardian: isGuardianChar,
        isMaldito: isMalditoChar,
        isParahumano,
        isParahumanoHybrid,
        isMago,
        isDotado,
        isHibrido,
        isTerrano,
        isPoseido,
        isElfoMagico,
        isHadaEter,
        isHadaAire,
        isHadaFuego,
        isHadaAgua,
        isHadaTierra,
        isGrifo,
        isElfoFisico,
        isVampiro,
        isHombreLobo,
        isSemidemonio,
        isEnte,
        isThals,
        isDios,
        isDiosMenor,
        isSemidios,
        isDivino,
        isCosmico,
        isMutante,
        isVigilante,
        isTroll,
        isMinotauro,
        isEnano,
        isElfoPsiquico,
        isTesKhar,
        isAtlante,
        isLiberadoEntropia,
        isLiberadoUnidad,
        isLiberadoEquidad,
        isLiberado,
        activeLiberados,
        isAlterado,
        isTecnologico,
        isTecnoarmadura,
        isCyborg,
        isTecnovehiculo,
        isExoskeleton,
        isInventor,
        isTechnological,
        hasBaseEMOrigin,
        hasEMFormula,
        hasEM,
        hasAnyOrigin
    } = originFlags;

    // Selections
    const selectedPowers: SelectedPower[] = useMemo(() => {
        if (!Array.isArray(data.powers?.selected)) return [];
        return data.powers.selected.filter((p: any) => typeof p === 'object' && p.id && p.origin);
    }, [data.powers?.selected]);

    const selectedSpellsWithRank: SelectedSpell[] = useMemo(() => {
        if (!Array.isArray(data.spells?.selected)) return [];
        return data.spells.selected.filter((s: any) => typeof s === 'object' && s.id && s.rank);
    }, [data.spells?.selected]);

    const techModules: TechModule[] = data.techModules || [];
    const magicTableRolls: string[] = data.magicTableRolls || [];

    // Hooks
    useCharacterAutoEffects(data, onChange);
    const { validatePowerSelection, validateMagicTableRoll } = useCharacterValidation(data);

    // Helpers
    const updatePowers = useCallback((newSelected: SelectedPower[]) => {
        onChange({ ...data, powers: { ...data.powers, selected: newSelected } });
    }, [data, onChange]);

    const updateSpells = useCallback((newSelected: SelectedSpell[]) => {
        onChange({ ...data, spells: { ...data.spells, selected: newSelected } });
    }, [data, onChange]);

    const updateEMFormula = useCallback((divisor: number, pcCost: number) => {
        onChange({
            ...data,
            spells: {
                ...data.spells,
                emFormula: { divisor, pcCost },
                selected: (divisor === 0 && !isLiberado) ? [] : data.spells.selected
            }
        });
    }, [data, onChange, isLiberado]);

    // EM Logic
    const rawEmFormula = data.spells?.emFormula || (isPoseido && !isDotado && !isHibrido && !isTerrano ? { divisor: 0, pcCost: 0 } : { divisor: 4, pcCost: 0 });
    let emFormula = rawEmFormula;
    if (isMago || isElfoMagico) emFormula = { divisor: 1, pcCost: 0 };
    else if (isHadaEter) emFormula = { divisor: 2, pcCost: 0 };
    else if (!hasBaseEMOrigin && isLiberado) emFormula = { divisor: 0, pcCost: 0 };

    // Auto-effects for EM and Powers
    useEffect(() => {
        if (isMago || isElfoMagico) {
            if (rawEmFormula.divisor !== 1 || rawEmFormula.pcCost !== 0) updateEMFormula(1, 0);
            return;
        }
        if (isHadaEter) {
            if (rawEmFormula.divisor !== 2 || rawEmFormula.pcCost !== 0) updateEMFormula(2, 0);
            return;
        }
        if (hasEMFormula) {
            const validOptions = getEMFormulaOptions({ isDotado, isHibrido, isTerrano, isPoseido });
            const currentId = `${rawEmFormula.divisor}|${rawEmFormula.pcCost}`;
            if (validOptions.length > 0 && !validOptions.some(o => o.id === currentId)) {
                const defaultOpt = validOptions.find(o => o.cost === 0) || validOptions[0];
                const [div, cost] = defaultOpt.id.split('|').map(Number);
                updateEMFormula(div, cost);
            }
        }
    }, [isPoseido, isDotado, isHibrido, isTerrano, isMago, isElfoMagico, isHadaEter, hasEMFormula, rawEmFormula]);

    useEffect(() => {
        if (!hasEM) return;
        const divisor = !hasBaseEMOrigin
            ? 0
            : (isMago || isElfoMagico)
                ? 1
                : isHadaEter
                    ? 2
                    : emFormula.divisor;
        const calculated = divisor > 0 ? calculateEM(data, selectedPowers, divisor) : 0;
        if (data.spells?.calculatedEM !== calculated) {
            onChange({
                ...data,
                spells: { ...data.spells, calculatedEM: calculated }
            });
        }
    }, [hasEM, hasBaseEMOrigin, isMago, isElfoMagico, isHadaEter, emFormula.divisor, data.attributes, data.level, selectedPowers]);
 
    // Auto-initialize and cleanup techParams based on isTecnologico
    useEffect(() => {
        if (isTecnologico && !data.techParams) {
            onChange({
                ...data,
                techParams: { incomeSource: 'agencia_priv' }
            });
        } else if (!isTecnologico && data.techParams !== null) {
            onChange({
                ...data,
                techParams: null
            });
        }
    }, [isTecnologico, data.techParams]);

    // Selection Handlers
    const togglePowerSelection = (powerId: string) => {
        if (!modalOriginFilter) return;

        const validation = validatePowerSelection(powerId, modalOriginFilter);
        if (!validation.allowed) {
            onShowToast?.(validation.message || 'Poder no permitido', 'error');
            return;
        }

        const powerDef = POWERS.find(p => p.id === powerId);
        const penaltyInfo = getPowerPenalty(data, powerDef);
        const powerData: SelectedPower = {
            id: powerId,
            origin: modalOriginFilter,
            rank: 1,
            isCrossType: penaltyInfo.type === 'cross-type',
            isCrossOrigin: isGuardianChar && penaltyInfo.type === 'cross-origin',
            isCrossOriginMaldito: isMalditoChar && penaltyInfo.type === 'cross-origin',
            isCrossOriginDivino: isDivino && penaltyInfo.type === 'cross-origin'
        };

        if (powerDef?.options?.length) {
            updatePowers([...selectedPowers, powerData]);
        } else {
            const idx = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);
            if (idx >= 0) {
                const next = [...selectedPowers];
                next.splice(idx, 1);
                updatePowers(next);
            } else {
                updatePowers([...selectedPowers, powerData]);
            }
        }
    };

    const toggleSpellSelection = (id: string) => {
        updateSpells([...selectedSpellsWithRank, { id, rank: 1 }]);
    };

    const toggleTechModule = (defId: string) => {
        const idx = techModules.findIndex(m => m.definitionId === defId);
        if (idx >= 0) {
            onChange({ ...data, techModules: techModules.filter((_, i) => i !== idx) });
        } else {
            const def = TECH_MODULES.find(m => m.id === defId);
            if (def) {
                onChange({
                    ...data,
                    techModules: [...techModules, { id: Date.now().toString(), definitionId: def.id, name: def.name, location: def.locations[0] || 'Integrado', pcCost: def.cost }]
                });
            }
        }
    };

    // Modal Helpers
    const modalItems = useMemo(() => {
        if (!modalType || modalType === 'magical_bonds') return [];
        if (modalType === 'powers') {
            return POWERS.filter(p => {
                if (modalOriginFilter === 'Grifo') return p.id === 'volar';
                if (modalOriginFilter === 'Psíquico') return p.types.includes('Psíquico');
                if ((isGuardianChar && (modalOriginFilter === 'Guardián' || modalOriginFilter === 'Guardian')) ||
                    (isMalditoChar && modalOriginFilter === 'Sobrenatural')) return true;
                if (modalOriginFilter === 'Ente') {
                    return p.origins.includes('Mutante') && p.types.some(t => t === 'Psíquico' || t === 'Energético');
                }
                // Divine cross-origin: show all powers that are NOT from Divino origin
                if (modalOriginFilter === 'OtroDivino') {
                    return !p.origins.includes('Divino');
                }
                if (modalOriginFilter) {
                    if (modalOriginFilter === 'Guardián' && p.origins.includes('Guardian')) return true;
                    return p.origins.includes(modalOriginFilter);
                }
                return true;
            });
        }
        if (modalType === 'spells') return SPELLS;
        if (modalType === 'techModules') return TECH_MODULES;
        return [];
    }, [modalType, modalOriginFilter, isGuardianChar, isMalditoChar]);

    const openModal = (type: ModalType, originFilter: string | null = null) => {
        setModalType(type);
        setModalOriginFilter(originFilter);
        setModalOpen(true);
    };

    return {
        // State
        modalOpen, setModalOpen, modalType, modalOriginFilter,

        // Origin Flags
        originFlags,

        // Flags
        isGuardianChar, isMalditoChar, isParahumano, isParahumanoHybrid,
        isMago, isDotado, isHibrido, isTerrano, isPoseido, isElfoMagico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra,
        isGrifo, isElfoFisico, isVampiro, isHombreLobo, isSemidemonio, isEnte, isThals,
        isDios, isDiosMenor, isSemidios, isDivino, isCosmico, isMutante, isVigilante,
        isTecnologico, isTecnoarmadura, isCyborg, isTecnovehiculo, isExoskeleton, isInventor, isTechnological,
        isTesKhar, isAtlante, isTroll, isMinotauro, isEnano, isElfoPsiquico,
        isLiberado, isLiberadoEntropia, isLiberadoUnidad, isLiberadoEquidad, activeLiberados,
        isAlterado, hasAnyOrigin,

        // Data
        selectedPowers,
        selectedSpellsWithRank,
        selectedSpells: selectedSpellsWithRank.map(sw => {
            const spell = SPELLS.find(s => s.id === sw.id);
            if (!spell) return null;
            const item: Spell & { rank: number; selectedOption?: string } = { ...spell, rank: sw.rank, selectedOption: sw.selectedOption };
            return item;
        }).filter((s): s is (Spell & { rank: number; selectedOption?: string }) => s !== null),
        techModules,
        magicTableRolls,
        emFormula,
        hasEMFormula,
        hasEM,
        hasBaseEMOrigin,
        vigilanteSpecialties: getVigilanteSpecialties(data),
        modalItems,

        // Handlers
        updatePowers,
        updateSpells,
        updateEMFormula,
        openModal,
        togglePowerSelection,
        toggleSpellSelection,
        toggleTechModule,

        // Specific updates
        updatePowerRank: (idx: number, rank: number) => {
            const next = [...selectedPowers];
            if (next[idx]) {
                if (next[idx].isWerewolfInnate && !hasOtherSobrenaturalPowerOrigin(data)) {
                    return;
                }
                next[idx] = { ...next[idx], rank: Math.max(1, Math.min(100, rank)) };
                updatePowers(next);
            }
        },
        updatePowerMod: (idx: number, mod: number) => {
            const next = [...selectedPowers];
            if (next[idx]) { next[idx] = { ...next[idx], powerMod: mod }; updatePowers(next); }
        },
        updatePowerSkillValue: (idx: number, val: number) => {
            const next = [...selectedPowers];
            if (next[idx]) { next[idx] = { ...next[idx], skillValue: val }; updatePowers(next); }
        },
        updatePowerOption: (idx: number, opt: string) => {
            const next = [...selectedPowers];
            if (next[idx]) { next[idx] = { ...next[idx], selectedOption: opt }; updatePowers(next); }
        },
        updatePowerCustomizations: (idx: number, cust: any[]) => {
            const next = [...selectedPowers];
            if (next[idx]) { next[idx] = { ...next[idx], customizations: cust }; updatePowers(next); }
        },
        removePower: (idx: number) => {
            const next = [...selectedPowers];
            next.splice(idx, 1);
            updatePowers(next);
        },
        updateSpellRank: (idx: number, rank: number) => {
            const next = [...selectedSpellsWithRank];
            if (next[idx]) { next[idx] = { ...next[idx], rank }; updateSpells(next); }
        },
        updateSpellOption: (idx: number, opt: string) => {
            const next = [...selectedSpellsWithRank];
            if (next[idx]) { next[idx] = { ...next[idx], selectedOption: opt }; updateSpells(next); }
        },
        removeSpell: (idx: number) => {
            const next = [...selectedSpellsWithRank];
            next.splice(idx, 1);
            updateSpells(next);
        },
        updateModuleLocation: (id: string, loc: string) => {
            onChange({ ...data, techModules: techModules.map(m => m.id === id ? { ...m, location: loc } : m) });
        },
        updateModuleCost: (id: string, cost: number) => {
            onChange({ ...data, techModules: techModules.map(m => m.id === id ? { ...m, pcCost: cost } : m) });
        },
        removeTechModule: (id: string) => {
            onChange({ ...data, techModules: techModules.filter(m => m.id !== id) });
        },
        addMagicTableRoll: (roll: string) => {
            const v = validateMagicTableRoll();
            if (v.allowed) onChange({ ...data, magicTableRolls: [...magicTableRolls, roll] });
            else onShowToast?.(v.message || 'Error', 'error');
        },
        removeMagicTableRoll: (idx: number) => {
            const next = [...magicTableRolls];
            next.splice(idx, 1);
            onChange({ ...data, magicTableRolls: next });
        },
        updateTrauma: (spec: string, text: string) => {
            onChange({ ...data, traumas: { ...data.traumas, [spec]: text } });
        },
        toggleMagicalBond: (id: string) => {
            const curr = data.magicalBonds || [];
            onChange({ ...data, magicalBonds: curr.includes(id) ? curr.filter((b: string) => b !== id) : [...curr, id] });
        }
    };
}
