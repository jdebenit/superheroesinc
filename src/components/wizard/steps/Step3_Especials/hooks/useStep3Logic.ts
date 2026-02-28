import { useState, useMemo, useEffect, useCallback } from 'react';
import { POWERS } from '../../../../../data/powers';
import { SPELLS, type Spell } from '../../../../../data/spells';
import { TECH_MODULES } from '../../../../../data/techModules';
import { useCharacterAutoEffects } from '../../../../../hooks/wizard/useCharacterAutoEffects';
import { useCharacterValidation } from '../../../../../hooks/wizard/useCharacterValidation';
import {
    hasOrigin,
    hasSubtype,
    getVigilanteSpecialties,
    calculateEM,
    isGuardian,
    isMaldito,
    getPowerPenalty
} from '../utils';
import type { SelectedPower, SelectedSpell, TechModule, ModalType } from '../types';
import type { CyborgImplant } from '../../../../../data/cyborgImplantConfigs';

export function useStep3Logic(data: any, onChange: (updates: any) => void, onShowToast?: (msg: string, type: 'error' | 'success') => void) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    // Initial derived flags
    const isGuardianChar = isGuardian(data);
    const isMalditoChar = isMaldito(data);
    const isParahumano = hasOrigin(data, 'Parahumano');
    const isParahumanoHybrid = isParahumano && (data.parahumanoParams?.isHybridWithHuman === true);

    // Subtype flags
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isPoseido = hasSubtype(data, 'Sobrenatural', 'Poseidó') || hasSubtype(data, 'Sobrenatural', 'Poseido');
    const isElfoMagico = hasSubtype(data, 'Arcano', 'Elfo Mágico');
    const isHadaEter = hasSubtype(data, 'Arcano', 'Hada Eter');
    const isHadaAire = hasSubtype(data, 'Arcano', 'Hada Aire');
    const isHadaFuego = hasSubtype(data, 'Arcano', 'Hada Fuego');
    const isHadaAgua = hasSubtype(data, 'Arcano', 'Hada Agua');
    const isHadaTierra = hasSubtype(data, 'Arcano', 'Hada Tierra');
    const isGrifo = hasSubtype(data, 'Arcano', 'Grifo');
    const isElfoFisico = hasSubtype(data, 'Arcano', 'Elfo Físico');
    const isVampiro = hasSubtype(data, 'Sobrenatural', 'Vampiro');
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const isEnte = hasSubtype(data, 'Sobrenatural', 'Ente');
    const isThals = hasSubtype(data, 'Parahumano', 'Thals');
    const isDios = hasSubtype(data, 'Divino', 'Dios');
    const isDiosMenor = hasSubtype(data, 'Divino', 'Dios menor');
    const isSemidios = hasSubtype(data, 'Divino', 'Semidios');
    const isDivino = isDios || isDiosMenor || isSemidios;
    const isCosmico = hasOrigin(data, 'Cósmico');
    const isMutante = hasOrigin(data, 'Mutante');
    const isVigilante = hasOrigin(data, 'Vigilante');
    const isTroll = hasSubtype(data, 'Arcano', 'Troll');
    const isMinotauro = hasSubtype(data, 'Arcano', 'Minotauro');
    const isEnano = hasSubtype(data, 'Arcano', 'Enano');
    const isElfoPsiquico = hasSubtype(data, 'Arcano', 'Elfo Psíquico');
    const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar');
    const isAtlante = hasSubtype(data, 'Parahumano', 'Atlante');

    // Technological
    const isTecnologico = hasOrigin(data, 'Tecnológico');
    const isTecnoarmadura = hasSubtype(data, 'Tecnológico', 'Tecnoarmadura');
    const isCyborg = hasSubtype(data, 'Tecnológico', 'Cyborg');
    const isTecnovehiculo = hasSubtype(data, 'Tecnológico', 'Tecnovehículo');
    const isExoskeleton = hasSubtype(data, 'Tecnológico', 'Exoesqueleto Energético');
    const isInventor = hasSubtype(data, 'Tecnológico', 'Inventor o forjador');
    const isTechnological = isTecnoarmadura || isCyborg || isTecnovehiculo || isInventor;

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
                selected: divisor === 0 ? [] : data.spells.selected
            }
        });
    }, [data, onChange]);

    // EM Logic
    const rawEmFormula = data.spells?.emFormula || (isPoseido ? { divisor: 0, pcCost: 0 } : { divisor: 4, pcCost: 0 });
    let emFormula = rawEmFormula;
    if (isMago || isElfoMagico) emFormula = { divisor: 1, pcCost: 0 };
    else if (isHadaEter) emFormula = { divisor: 2, pcCost: 0 };

    const hasEMFormula = !isMago && !isElfoMagico && !isHadaEter && (isDotado || isHibrido || isTerrano || isPoseido);
    const hasEM = isMago || isElfoMagico || isHadaEter || isDotado || isHibrido || isTerrano || isPoseido;

    // Auto-effects for EM and Powers
    useEffect(() => {
        if (isPoseido && rawEmFormula.divisor === 4) updateEMFormula(0, 0);
        if ((isMago || isElfoMagico) && (rawEmFormula.divisor !== 1 || rawEmFormula.pcCost !== 0)) updateEMFormula(1, 0);
        if (isHadaEter && (rawEmFormula.divisor !== 2 || rawEmFormula.pcCost !== 0)) updateEMFormula(2, 0);
    }, [isPoseido, isMago, isElfoMagico, isHadaEter, rawEmFormula]);

    useEffect(() => {
        if (!hasEM) return;
        const divisor = (isMago || isElfoMagico) ? 1 : isHadaEter ? 2 : emFormula.divisor;
        if (divisor === 0) return;
        const calculated = calculateEM(data, selectedPowers, divisor);
        if (data.spells?.calculatedEM !== calculated) {
            onChange({
                ...data,
                spells: { ...data.spells, calculatedEM: calculated }
            });
        }
    }, [hasEM, isMago, isElfoMagico, isHadaEter, emFormula.divisor, data.attributes, selectedPowers]);

    // Auto-select powers
    useEffect(() => {
        if (isGrifo && !selectedPowers.some(p => p.id === 'volar')) {
            const volarPower = POWERS.find(p => p.id === 'volar');
            if (volarPower) {
                updatePowers([...selectedPowers, {
                    id: volarPower.id, origin: 'Grifo', rank: 11, customizations: [{ id: Date.now().toString(), description: "Tiene alas para volar", cost: 0 }]
                }]);
            }
        }
    }, [isGrifo, selectedPowers, updatePowers]);

    useEffect(() => {
        if (isElfoFisico && !selectedPowers.some(p => p.id === 'supervelocidad')) {
            const svPower = POWERS.find(p => p.id === 'supervelocidad');
            if (svPower) {
                updatePowers([...selectedPowers, { id: svPower.id, origin: 'Elfo Físico', rank: 1, customizations: [] }]);
            }
        }
    }, [isElfoFisico, selectedPowers, updatePowers]);

    useEffect(() => {
        if (isTroll && !selectedPowers.some(p => p.id === 'regeneracion_de_tejidos')) {
            const trollPower = POWERS.find(p => p.id === 'regeneracion_de_tejidos');
            if (trollPower) {
                updatePowers([...selectedPowers, { id: trollPower.id, origin: 'Arcano', rank: 81, customizations: [] }]);
            }
        }
    }, [isTroll, selectedPowers, updatePowers]);

    useEffect(() => {
        if (isTesKhar && !selectedPowers.some(p => p.id === 'superhabilidad')) {
            const tkPower = POWERS.find(p => p.id === 'superhabilidad');
            if (tkPower) {
                updatePowers([...selectedPowers, { id: tkPower.id, origin: 'Parahumano', rank: 11, customizations: [] }]);
            }
        }
    }, [isTesKhar, selectedPowers, updatePowers]);

    // Handle Hada automatic powers
    useEffect(() => {
        const isHada = isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;
        if (!isHada) return;

        let newPowers = [...selectedPowers];
        let changed = false;

        const ensurePower = (id: string, rank: number, origin: string = 'Arcano') => {
            if (!newPowers.some(p => p.id === id)) {
                const pDef = POWERS.find(p => p.id === id);
                if (pDef) {
                    newPowers.push({ id, origin, rank, customizations: [] });
                    changed = true;
                }
            }
        };

        ensurePower('volar', 11);
        if (isHadaAire) ensurePower('supervelocidad', 1);
        if (isHadaFuego) ensurePower('control_del_fuego', 21);
        if (isHadaAgua) ensurePower('control_del_agua', 21);
        if (isHadaTierra) {
            ensurePower('control_de_la_vegetacion', 11);
            ensurePower('control_de_la_geodinamica', 11);
        }

        if (changed) updatePowers(newPowers);
    }, [isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra, selectedPowers, updatePowers]);

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
            isCrossOriginMaldito: isMalditoChar && penaltyInfo.type === 'cross-origin'
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

        // Flags
        isGuardianChar, isMalditoChar, isParahumano, isParahumanoHybrid,
        isMago, isDotado, isHibrido, isTerrano, isPoseido, isElfoMagico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra,
        isGrifo, isElfoFisico, isVampiro, isSemidemonio, isEnte, isThals,
        isDios, isDiosMenor, isSemidios, isDivino, isCosmico, isMutante, isVigilante,
        isTecnologico, isTecnoarmadura, isCyborg, isTecnovehiculo, isExoskeleton, isInventor, isTechnological,
        isTesKhar, isAtlante, isTroll, isMinotauro, isEnano, isElfoPsiquico,

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
            if (next[idx]) { next[idx] = { ...next[idx], rank: Math.max(1, Math.min(100, rank)) }; updatePowers(next); }
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
