import React, { useState, useMemo, useEffect } from 'react';
import { POWERS } from '../../../../data/powers';
import { SPELLS, type Spell } from '../../../../data/spells';
import { useCharacterAutoEffects } from '../../../../hooks/wizard/useCharacterAutoEffects';
import { useCharacterValidation } from '../../../../hooks/wizard/useCharacterValidation';
import { TECH_MODULES } from '../../../../data/techModules';
import {
    hasOrigin,
    hasSubtype,
    getVigilanteSpecialties,
    calculateEM,
    isGuardian,
    isMaldito,
    getPowerPenalty
} from './utils';
import type { Step3Props, SelectedPower, SelectedSpell, TechModule, ModalType, TechTypeFilter } from './types';
import { modalStyles } from './styles';

// Section Components
import VigilanteTraumasSection from './sections/VigilanteTraumasSection';
import MagicalBondsSection from './sections/MagicalBondsSection';
import TechModulesSection from './sections/TechModulesSection';
import PowersSection from './sections/PowersSection';
import MagicSection from './sections/MagicSection';
import ExoskeletonSection from './sections/ExoskeletonSection';
import EnteSection from './sections/EnteSection';
import MalditoSection from './sections/MalditoSection';
import PoseidoSection from './sections/PoseidoSection';
import AlteradoSection from './sections/AlteradoSection';
import MutanteSection from './sections/MutanteSection';
import GuardianSection from './sections/GuardianSection';
import DivineSection from './sections/DivineSection';
import TechnologicalSection from './sections/TechnologicalSection';
import ExoskeletonArmorSection from './sections/ExoskeletonArmorSection';
import TechnoSuitStrengthSection from './sections/TechnoSuitStrengthSection';
import { CyborgSection } from './sections/CyborgSection';
import ParahumanoSection from './sections/ParahumanoSection';
import type { CyborgImplant } from '../../../../data/cyborgImplantConfigs';
import { stepPageTitleStyle } from '../../shared/stepStyles';

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';
import MinotaurSection from './sections/MinotaurSection';

export default function Step3_Especials({ data, onChange, onShowToast }: Step3Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar');
    const isAtlante = hasSubtype(data, 'Parahumano', 'Atlante');
    const isTroll = hasSubtype(data, 'Arcano', 'Troll');
    const isMinotauro = hasSubtype(data, 'Arcano', 'Minotauro');
    const isTecnologico = hasOrigin(data, 'Tecnológico');
    // Hybrid logic
    const isParahumano = hasOrigin(data, 'Parahumano');
    const isParahumanoHybrid = isParahumano && (data.parahumanoParams?.isHybridWithHuman === true); // Defined early for useEffect

    // Powers are stored as objects { id, origin, rank, powerMod?, skillValue? }
    const selectedPowers: SelectedPower[] = useMemo(() => {
        if (!Array.isArray(data.powers?.selected)) return [];
        return data.powers.selected.filter((p: any) => typeof p === 'object' && p.id && p.origin);
    }, [data.powers?.selected]);

    // Spells are stored as objects { id, rank }
    const selectedSpellsWithRank: SelectedSpell[] = useMemo(() => {
        if (!Array.isArray(data.spells?.selected)) return [];
        return data.spells.selected.filter((s: any) => typeof s === 'object' && s.id && s.rank);
    }, [data.spells?.selected]);

    // Tech Modules
    const techModules: TechModule[] = data.techModules || [];

    // Magic Table Rolls (Terrano)
    const magicTableRolls: string[] = data.magicTableRolls || [];

    // Use custom hooks
    useCharacterAutoEffects(data, onChange);
    const { validatePowerSelection, validateMagicTableRoll } = useCharacterValidation(data);

    // Update functions
    const updatePowers = (newSelected: SelectedPower[]) => {
        onChange({ ...data, powers: { ...data.powers, selected: newSelected } });
    };

    const updateSpells = (newSelected: SelectedSpell[]) => {
        onChange({ ...data, spells: { ...data.spells, selected: newSelected } });
    };

    const updateEMFormula = (divisor: number, pcCost: number) => {
        onChange({
            ...data,
            spells: {
                ...data.spells,
                emFormula: { divisor, pcCost },
                selected: divisor === 0 ? [] : data.spells.selected
            }
        });
    };

    // Magic Table Handlers
    const addMagicTableRoll = (rollId: string) => {
        const validation = validateMagicTableRoll();
        if (!validation.allowed) {
            if (onShowToast) {
                onShowToast(validation.message || 'Opción no permitida', 'error');
            } else {
                alert(validation.message || 'Opción no permitida');
            }
            return;
        }

        onChange({
            ...data,
            magicTableRolls: [...magicTableRolls, rollId]
        });
    };

    const removeMagicTableRoll = (index: number) => {
        const newRolls = [...magicTableRolls];
        newRolls.splice(index, 1);
        onChange({ ...data, magicTableRolls: newRolls });
    };

    const updateTrauma = (specialty: string, text: string) => {
        onChange({
            ...data,
            traumas: {
                ...data.traumas,
                [specialty]: text
            }
        });
    };

    // Exoskeleton handler
    const updateExoskeletonConfig = (configId: string | null) => {
        onChange({ ...data, exoskeletonConfig: configId });
    };

    // Exoskeleton Armor handler
    const updateExoskeletonArmorConfig = (configId: string | null) => {
        onChange({ ...data, exoskeletonArmorConfig: configId });
    };

    // Techno-Suit Strength handler
    const updateTechnoSuitStrengthConfig = (configId: string | null) => {
        onChange({ ...data, technoSuitStrengthConfig: configId });
    };

    // Cyborg Implants handler
    const updateCyborgImplants = (implants: CyborgImplant[]) => {
        onChange({ ...data, cyborgImplants: implants });
    };

    // Modal handlers
    const openPowerModal = (originContext: string) => {
        setModalType('powers');
        setModalOriginFilter(originContext);
        setModalOpen(true);
    };

    const openSpellModal = () => {
        setModalType('spells');
        setModalOriginFilter(null);
        setModalOpen(true);
    };

    const openTechModuleModal = () => {
        setModalType('techModules');
        setModalOriginFilter(null);
        setModalOpen(true);
    };

    const openMagicalBondsModal = () => {
        setModalType('magical_bonds');
        setModalOriginFilter('');
        setModalOpen(true);
    };

    // Power handlers
    const togglePowerSelection = (powerId: string) => {
        if (!modalOriginFilter) return;

        // Use validation hook
        const validation = validatePowerSelection(powerId, modalOriginFilter);
        if (!validation.allowed) {
            if (onShowToast) {
                onShowToast(validation.message || 'Poder no permitido', 'error');
            } else {
                alert(validation.message || 'Poder no permitido');
            }
            return;
        }

        const powerDef = POWERS.find(p => p.id === powerId);
        const hasOptions = powerDef?.options && powerDef.options.length > 0;

        // Check if this is a cross-type power for mutants
        // Calculate penalties using centralized helper
        const penaltyInfo = getPowerPenalty(data, powerDef);

        const isCrossType = penaltyInfo.type === 'cross-type';
        const isCrossOrigin = isGuardian(data) && penaltyInfo.type === 'cross-origin';
        const isCrossOriginMaldito = isMaldito(data) && penaltyInfo.type === 'cross-origin';

        if (hasOptions) {
            // Always add new instance for powers with options
            const newSelected = [...selectedPowers, {
                id: powerId,
                origin: modalOriginFilter,
                rank: 1,
                isCrossType,
                isCrossOrigin,
                isCrossOriginMaldito
            }];
            updatePowers(newSelected);
        } else {
            // Toggle behavior for standard powers
            const existingIndex = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);
            let newSelected: SelectedPower[];

            if (existingIndex >= 0) {
                newSelected = [...selectedPowers];
                newSelected.splice(existingIndex, 1);
            } else {
                newSelected = [...selectedPowers, {
                    id: powerId,
                    origin: modalOriginFilter,
                    rank: 1,
                    isCrossType,
                    isCrossOrigin,
                    isCrossOriginMaldito
                }];
            }
            updatePowers(newSelected);
        }
    };

    const updatePowerRank = (index: number, newRank: number) => {
        const updated = [...selectedPowers];
        if (updated[index]) {
            updated[index] = { ...updated[index], rank: Math.max(1, Math.min(100, newRank)) };
            updatePowers(updated);
        }
    };

    const updatePowerMod = (index: number, newMod: number) => {
        const updated = [...selectedPowers];
        if (updated[index]) {
            updated[index] = { ...updated[index], powerMod: newMod };
            updatePowers(updated);
        }
    };

    const updatePowerSkillValue = (index: number, newValue: number) => {
        const updated = [...selectedPowers];
        if (updated[index]) {
            updated[index] = { ...updated[index], skillValue: newValue };
            updatePowers(updated);
        }
    };

    const updatePowerOption = (index: number, newOption: string) => {
        const updated = [...selectedPowers];
        if (updated[index]) {
            updated[index] = { ...updated[index], selectedOption: newOption };
            updatePowers(updated);
        }
    };

    const removePower = (index: number) => {
        const newSelected = [...selectedPowers];
        newSelected.splice(index, 1);
        updatePowers(newSelected);
    };

    const updatePowerCustomizations = (index: number, customizations: { id: string; description: string; cost: number }[]) => {
        const updated = [...selectedPowers];
        if (updated[index]) {
            updated[index] = { ...updated[index], customizations };
            updatePowers(updated);
        }
    };


    // Spell handlers
    // Spell handlers
    const toggleSpellSelection = (id: string) => {
        // Always add a new instance for spells (allow duplicates)
        const newSelected = [...selectedSpellsWithRank, { id, rank: 1 }];
        updateSpells(newSelected);
    };

    const updateSpellRank = (index: number, rank: number) => {
        const newSelected = [...selectedSpellsWithRank];
        if (newSelected[index]) {
            newSelected[index] = { ...newSelected[index], rank };
            updateSpells(newSelected);
        }
    };

    const updateSpellOption = (index: number, option: string) => {
        const newSelected = [...selectedSpellsWithRank];
        if (newSelected[index]) {
            newSelected[index] = { ...newSelected[index], selectedOption: option };
            updateSpells(newSelected);
        }
    };

    const removeSpell = (index: number) => {
        const newSelected = [...selectedSpellsWithRank];
        newSelected.splice(index, 1);
        updateSpells(newSelected);
    };

    // Tech Module handlers
    const toggleTechModule = (defId: string) => {
        const existingIndex = techModules.findIndex(m => m.definitionId === defId);
        let newModules: TechModule[];

        if (existingIndex >= 0) {
            newModules = [...techModules];
            newModules.splice(existingIndex, 1);
        } else {
            const def = TECH_MODULES.find(m => m.id === defId);
            if (!def) return;

            const newModule: TechModule = {
                id: Date.now().toString(),
                definitionId: def.id,
                name: def.name,
                location: def.locations[0] || 'Integrado',
                pcCost: def.cost
            };
            newModules = [...techModules, newModule];
        }
        onChange({ ...data, techModules: newModules });
    };

    const updateModuleLocation = (id: string, newLocation: string) => {
        onChange({
            ...data,
            techModules: techModules.map(m => m.id === id ? { ...m, location: newLocation } : m)
        });
    };

    const updateModuleCost = (id: string, newCost: number) => {
        onChange({
            ...data,
            techModules: techModules.map(m => m.id === id ? { ...m, pcCost: newCost } : m)
        });
    };

    const removeTechModule = (id: string) => {
        onChange({
            ...data,
            techModules: techModules.filter(m => m.id !== id)
        });
    };

    // Magical Bonds handlers
    const toggleMagicalBond = (bondId: string) => {
        const current = data.magicalBonds || [];
        const newBonds = current.includes(bondId)
            ? current.filter((id: string) => id !== bondId)
            : [...current, bondId];
        onChange({ ...data, magicalBonds: newBonds });
    };

    // Origin flags needed for modal filtering - using robust helpers
    const isGuardianChar = isGuardian(data);
    const isMalditoChar = isMaldito(data);

    // Filter modal items
    const modalItems = useMemo(() => {
        if (!modalType || modalType === 'magical_bonds') return [];

        if (modalType === 'powers') {
            return POWERS.filter(p => {
                if (modalOriginFilter === 'Grifo') {
                    return p.id === 'volar';
                }

                if (modalOriginFilter === 'Psíquico') {
                    return p.types.includes('Psíquico');
                }

                // Guardián can see all powers when opening Guardián modal (cross-origin selection)
                // Check both spelling variations to be safe
                if (isGuardianChar && (modalOriginFilter === 'Guardián' || modalOriginFilter === 'Guardian')) {
                    return true; // Show all powers
                }

                // Maldito can see all powers when opening Sobrenatural modal (cross-origin selection)
                if (isMalditoChar && modalOriginFilter === 'Sobrenatural') {
                    return true; // Show all powers
                }

                if (modalOriginFilter) {
                    // Special handling for Guardián/Guardian mismatch in data vs UI
                    if (modalOriginFilter === 'Guardián' && p.origins.includes('Guardian')) {
                        // Allow match
                    } else if (!p.origins.includes(modalOriginFilter)) {
                        return false;
                    }
                }

                // NOTE: Removed type filtering for Mutante to allow cross-type selection
                // Mutants can now select any power from their origin, with cross-type penalty

                return true;
            });
        } else if (modalType === 'spells') {
            return SPELLS;
        } else if (modalType === 'techModules') {
            return TECH_MODULES;
        }

        return [];
    }, [modalType, modalOriginFilter, data]);

    // Derived state for display
    const isAlterado = hasOrigin(data, 'Alterado');
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isEnano = hasSubtype(data, 'Arcano', 'Enano');
    const isGrifo = hasSubtype(data, 'Arcano', 'Grifo');
    const isElfoFisico = hasSubtype(data, 'Arcano', 'Elfo Físico');
    const isElfoPsiquico = hasSubtype(data, 'Arcano', 'Elfo Psíquico');
    const isElfoMagico = hasSubtype(data, 'Arcano', 'Elfo Mágico');
    const isHadaEter = hasSubtype(data, 'Arcano', 'Hada Eter');
    const isHadaAire = hasSubtype(data, 'Arcano', 'Hada Aire');
    const isHadaFuego = hasSubtype(data, 'Arcano', 'Hada Fuego');
    const isHadaAgua = hasSubtype(data, 'Arcano', 'Hada Agua');
    const isHadaTierra = hasSubtype(data, 'Arcano', 'Hada Tierra');
    const isVampiro = hasSubtype(data, 'Sobrenatural', 'Vampiro');

    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const isPoseido = hasSubtype(data, 'Sobrenatural', 'Poseidó') || hasSubtype(data, 'Sobrenatural', 'Poseido'); // Check both just in case, though definitions say Poseido
    const isEnte = hasSubtype(data, 'Sobrenatural', 'Ente');
    const isThals = hasSubtype(data, 'Parahumano', 'Thals');
    const isDios = hasSubtype(data, 'Divino', 'Dios');
    const isDiosMenor = hasSubtype(data, 'Divino', 'Dios menor');
    const isSemidios = hasSubtype(data, 'Divino', 'Semidios');
    const isDivino = isDios || isDiosMenor || isSemidios; // Specific subtypes requested
    // const isDivino = hasOrigin(data, 'Divino'); // Old generic check
    const isCosmico = hasOrigin(data, 'Cósmico');
    const isMutante = hasOrigin(data, 'Mutante');
    const isVigilante = hasOrigin(data, 'Vigilante');
    // const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar'); // Already defined at top

    // Technological
    const isTecnoarmadura = hasSubtype(data, 'Tecnológico', 'Tecnoarmadura');
    const isCyborg = hasSubtype(data, 'Tecnológico', 'Cyborg');
    const isTecnovehiculo = hasSubtype(data, 'Tecnológico', 'Tecnovehículo');
    const isExoskeleton = hasSubtype(data, 'Tecnológico', 'Exoesqueleto Energético');
    const isTechnological = isTecnoarmadura || isCyborg || isTecnovehiculo;

    // Get Vigilante specialties
    const vigilanteSpecialties = getVigilanteSpecialties(data);

    // EM Formula state
    // For Magos and Magical Elves, FORCE the best formula (Divisor 1, Cost 0)
    // For Hada Eter, FORCE Divisor 2, Cost 0
    // This overrides any other potential formulas (e.g. if they are also Dotado)
    const rawEmFormula = data.spells?.emFormula ||
        (isPoseido ? { divisor: 0, pcCost: 0 } : { divisor: 4, pcCost: 0 });

    let emFormula = rawEmFormula;
    if (isMago || isElfoMagico) {
        emFormula = { divisor: 1, pcCost: 0 };
    } else if (isHadaEter) {
        emFormula = { divisor: 2, pcCost: 0 };
    }

    const hasEMFormula = !isMago && !isElfoMagico && !isHadaEter && (isDotado || isHibrido || isTerrano || isPoseido);
    const hasEM = isMago || isElfoMagico || isHadaEter || isDotado || isHibrido || isTerrano || isPoseido;

    // Auto-correct EM formula for Poseido if it has the generic default (4)
    useEffect(() => {
        if (isPoseido && rawEmFormula.divisor === 4) {
            updateEMFormula(0, 0); // Default to No Access
        }
    }, [isPoseido, rawEmFormula.divisor]);

    // Enforce Mago/Elfo Magico formula (1/0)
    useEffect(() => {
        if ((isMago || isElfoMagico) && (rawEmFormula.divisor !== 1 || rawEmFormula.pcCost !== 0)) {
            updateEMFormula(1, 0);
        }
    }, [isMago, isElfoMagico, rawEmFormula.divisor, rawEmFormula.pcCost]);

    // Enforce Hada Eter formula (2/0)
    useEffect(() => {
        if (isHadaEter && (rawEmFormula.divisor !== 2 || rawEmFormula.pcCost !== 0)) {
            updateEMFormula(2, 0);
        }
    }, [isHadaEter, rawEmFormula.divisor, rawEmFormula.pcCost]);

    // Spells - enrich with full spell data and rank
    const selectedSpells = selectedSpellsWithRank.map(sw => {
        const spell = SPELLS.find(s => s.id === sw.id);
        if (!spell) return null;
        const result: Spell & { rank: number; selectedOption?: string } = {
            ...spell,
            rank: sw.rank,
            selectedOption: sw.selectedOption
        };
        return result;
    }).filter((s): s is (Spell & { rank: number; selectedOption?: string }) => s !== null);

    const hasAnyOrigin = isGuardianChar || isAlterado || hasEM || isVampiro || isSemidemonio || isMalditoChar ||
        isEnte || isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton || isTesKhar || isAtlante || isParahumano || isTroll || isMinotauro || isPoseido || isEnano || isGrifo || isElfoFisico || isElfoPsiquico || isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;

    // Auto-select Volar for Grifo
    useEffect(() => {
        if (isGrifo) {
            const hasVolar = selectedPowers.some(p => p.id === 'volar');
            if (!hasVolar) {
                const volarPower = POWERS.find(p => p.id === 'volar');
                if (volarPower) {
                    const newPower: SelectedPower = {
                        id: volarPower.id,
                        origin: 'Grifo', // Custom origin for display logic
                        rank: 11, // Free at Rank 11
                        customizations: [{
                            id: Date.now().toString(),
                            description: "Tiene alas para volar",
                            cost: 0 // Assumed 0 cost as it's partial limitation/flavor, or we don't charge for it? The user didn't specify cost, usually flavor is free or limitations are negative. Assuming 0 for now unless rules say otherwise.
                        }]
                    };
                    updatePowers([...selectedPowers, newPower]);
                }
            }
        }
    }, [isGrifo, selectedPowers]);

    // Auto-select Supervelocidad for Elfo Físico
    useEffect(() => {
        if (isElfoFisico) {
            const hasSupervelocidad = selectedPowers.some(p => p.id === 'supervelocidad');
            if (!hasSupervelocidad) {
                const svPower = POWERS.find(p => p.id === 'supervelocidad');
                if (svPower) {
                    const newPower: SelectedPower = {
                        id: svPower.id,
                        origin: 'Elfo Físico',
                        rank: 1,
                        customizations: []
                    };
                    updatePowers([...selectedPowers, newPower]);
                }
            }
        }
    }, [isElfoFisico, selectedPowers]);

    // Auto-add Powers for Hada Eter, Aire, Fuego, Agua, Tierra
    useEffect(() => {
        const isHada = isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;
        if (!isHada) return;

        let newPowers = [...selectedPowers];
        let changed = false;

        // Volar (Rank 11) for ALL Hadas
        const hasFly = newPowers.some(p => p.id === 'volar');
        if (!hasFly) {
            const volarPower = POWERS.find(p => p.id === 'volar');
            if (volarPower) {
                newPowers.push({
                    id: volarPower.id,
                    origin: 'Arcano',
                    rank: 11,
                    customizations: []
                });
                changed = true;
            }
        }

        // Supervelocidad for Hada Aire
        if (isHadaAire) {
            const hasSpeed = newPowers.some(p => p.id === 'supervelocidad');
            if (!hasSpeed) {
                const speedPower = POWERS.find(p => p.id === 'supervelocidad');
                if (speedPower) {
                    newPowers.push({
                        id: speedPower.id,
                        origin: 'Arcano',
                        rank: 1,
                        customizations: []
                    });
                    changed = true;
                }
            }
        }

        // Control del Fuego (Rank 21) for Hada Fuego
        if (isHadaFuego) {
            const hasFire = newPowers.some(p => p.id === 'control_del_fuego');
            if (!hasFire) {
                const firePower = POWERS.find(p => p.id === 'control_del_fuego');
                if (firePower) {
                    newPowers.push({
                        id: firePower.id,
                        origin: 'Arcano',
                        rank: 21,
                        customizations: []
                    });
                    changed = true;
                }
            }
        }

        // Control del Agua (Rank 21) for Hada Agua
        if (isHadaAgua) {
            const hasWater = newPowers.some(p => p.id === 'control_del_agua');
            if (!hasWater) {
                const waterPower = POWERS.find(p => p.id === 'control_del_agua');
                if (waterPower) {
                    newPowers.push({
                        id: waterPower.id,
                        origin: 'Arcano',
                        rank: 21,
                        customizations: []
                    });
                    changed = true;
                }
            }
        }

        // Control de la Vegetación (Rank 11) & Geodinámica (Rank 11) for Hada Tierra
        if (isHadaTierra) {
            const hasPlants = newPowers.some(p => p.id === 'control_de_la_vegetacion');
            if (!hasPlants) {
                const plantPower = POWERS.find(p => p.id === 'control_de_la_vegetacion');
                if (plantPower) {
                    newPowers.push({
                        id: plantPower.id,
                        origin: 'Arcano',
                        rank: 11,
                        customizations: []
                    });
                    changed = true;
                }
            }

            const hasGeo = newPowers.some(p => p.id === 'control_de_la_geodinamica');
            if (!hasGeo) {
                const geoPower = POWERS.find(p => p.id === 'control_de_la_geodinamica');
                if (geoPower) {
                    newPowers.push({
                        id: geoPower.id,
                        origin: 'Arcano',
                        rank: 11,
                        customizations: []
                    });
                    changed = true;
                }
            }
        }

        if (changed) {
            updatePowers(newPowers);
        }
    }, [isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra, selectedPowers]);

    // Calculate and store EM in state
    useEffect(() => {
        if (!hasEM) return;

        // Determine divisor
        let divisor = emFormula.divisor;
        if (isMago) divisor = 1;

        if (divisor === 0) return;

        // We use data directly to avoid issues with stale closures if props change
        // But we need to use the calculateEM util
        const calculated = calculateEM(data, selectedPowers, divisor);

        // Only update if changed prevents infinite loop
        if (data.spells?.calculatedEM !== calculated) {
            onChange({
                ...data,
                spells: {
                    ...data.spells,
                    calculatedEM: calculated,
                    emFormula: data.spells.emFormula, // Preserve existing
                    selected: data.spells.selected // Preserve existing
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        hasEM,
        isMago,
        emFormula.divisor,
        data.attributes,
        selectedPowers,
        data.spells?.calculatedEM
    ]);

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={stepPageTitleStyle}>
                Poderes y Habilidades Especiales
            </h2>

            {!hasAnyOrigin && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem 2rem',
                    backgroundColor: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    textAlign: 'center',
                    marginTop: '2rem'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>⚡</div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
                        Sin Origen Seleccionado
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.6, marginBottom: '2rem' }}>
                        Este paso gestiona los poderes y habilidades especiales derivadas de tus orígenes (Mutante, Arcano, Tecnológico, etc.). Necesitas seleccionar al menos uno en el primer paso para desbloquear estas opciones.
                    </p>
                    <button
                        onClick={() => {
                            const originTab = document.querySelector<HTMLButtonElement>('button[title="Origen"]');
                            if (originTab) originTab.click();
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <span>← Volver al Paso 1</span>
                    </button>
                </div>
            )}

            {/* Parahumano Section */}
            {isParahumano && (
                <ParahumanoSection
                    parahumanoParams={data.parahumanoParams || { isHybridWithHuman: false }}
                    onChange={onChange}
                />
            )}

            {/* ENTE SECTION */}
            {isEnte && (
                <EnteSection
                    enteParams={data.enteParams || { formType: null, visualEffect: null }}
                    onChange={onChange}
                />
            )}

            {/* MALDITO SECTION */}
            {isMalditoChar && (
                <MalditoSection
                    malditoParams={data.malditoParams || { magnitude: null, source: null }}
                    onChange={onChange}
                />
            )}

            {isPoseido && (
                <PoseidoSection
                    poseidoParams={data.poseidoParams || { formType: null }}
                    onChange={onChange}
                />
            )}

            {isAlterado && (
                <AlteradoSection
                    alteradoParams={data.alteradoParams || { agent: null, sequels: [] }}
                    onChange={onChange}
                />
            )}

            {isMutante && (
                <MutanteSection
                    mutanteParams={data.mutanteParams || { sequels: [] }}
                    onChange={onChange}
                    data={data}
                />
            )}

            {isGuardianChar && (
                <GuardianSection
                    guardianParams={data.guardianParams || { quality: null, objectType: null, feature: null, transformation: null }}
                    onChange={onChange}
                />
            )}

            {(isDios || isDiosMenor) && (
                <DivineSection
                    divineParams={data.divineParams || { focus: null }}
                    onChange={onChange}
                />
            )}

            {isMinotauro && <MinotaurSection />}

            {/* VIGILANTE TRAUMAS SECTION */}
            <VigilanteTraumasSection
                vigilanteSpecialties={vigilanteSpecialties}
                traumas={data.traumas || {}}
                onUpdateTrauma={updateTrauma}
            />

            {/* TECHNOLOGICAL INCOME SECTION */}
            {isTecnologico && (
                <TechnologicalSection
                    techParams={data.techParams}
                    onChange={(params) => onChange({ ...data, techParams: { ...data.techParams, ...params } })}
                />
            )}

            {/* EXOSKELETON SECTION */}
            {isExoskeleton && (
                <ExoskeletonSection
                    selectedConfig={data.exoskeletonConfig || null}
                    onSelectConfig={updateExoskeletonConfig}
                />
            )}

            {(isTecnoarmadura || isTecnovehiculo) && (
                <ExoskeletonArmorSection
                    selectedConfig={data.exoskeletonArmorConfig || null}
                    onSelectConfig={updateExoskeletonArmorConfig}
                />
            )}

            {isTecnoarmadura && (
                <TechnoSuitStrengthSection
                    selectedConfig={data.technoSuitStrengthConfig || null}
                    onSelectConfig={updateTechnoSuitStrengthConfig}
                />
            )}

            {isCyborg && (
                <CyborgSection
                    implants={data.cyborgImplants || []}
                    onChange={updateCyborgImplants}
                />
            )}

            {/* TECHNOLOGICAL MODULES SECTION */}
            {isTechnological && (
                <TechModulesSection
                    techModules={techModules}
                    onOpenModal={openTechModuleModal}
                    onUpdateLocation={updateModuleLocation}
                    onUpdateCost={updateModuleCost}
                    onRemove={removeTechModule}
                />
            )}

            {/* POWERS SECTION */}
            <PowersSection
                data={data}
                selectedPowers={selectedPowers}
                onOpenModal={openPowerModal}
                onUpdateRank={updatePowerRank}
                onUpdateMod={updatePowerMod}
                onUpdateSkillValue={updatePowerSkillValue}
                onUpdateOption={updatePowerOption}
                onUpdateCustomizations={updatePowerCustomizations}
                onRemove={removePower}
                isGuardian={isGuardianChar}
                isAlterado={isAlterado || isParahumanoHybrid}
                isVampiro={isVampiro}
                isSemidemonio={isSemidemonio}
                isMaldito={isMalditoChar}
                isEnte={isEnte}
                isThals={isThals}
                isDivino={isDivino}
                isTerrano={isTerrano}
                isDotado={isDotado}
                isCosmico={isCosmico}
                isMutante={isMutante}
                isTesKhar={isTesKhar}
                isAtlante={isAtlante}
                isParahumanoHybrid={isParahumanoHybrid}
                isTroll={isTroll}
                isPoseido={isPoseido}
                isEnano={isEnano}
                isGrifo={isGrifo}
                isElfoFisico={isElfoFisico}
                isElfoPsiquico={isElfoPsiquico}
                isHadaEter={isHadaEter}
                isHadaAire={isHadaAire}
                isHadaFuego={isHadaFuego}
                isHadaAgua={isHadaAgua}
                isHadaTierra={isHadaTierra}
            />

            {/* MAGIC SECTION */}
            {hasEM && (
                <MagicSection
                    data={data}
                    selectedSpells={selectedSpells}
                    selectedPowers={selectedPowers}
                    emFormula={emFormula}
                    hasEMFormula={hasEMFormula}
                    isMago={isMago}
                    isDotado={isDotado}
                    isHibrido={isHibrido}
                    isTerrano={isTerrano}
                    isPoseido={isPoseido}
                    isElfoMagico={isElfoMagico}
                    isHadaEter={isHadaEter}
                    onOpenSpellModal={openSpellModal}
                    onUpdateEMFormula={updateEMFormula}
                    onUpdateSpellRank={updateSpellRank}
                    onUpdateOption={updateSpellOption}
                    onRemoveSpell={removeSpell}
                    magicTableRolls={magicTableRolls}
                    onAddMagicTableRoll={addMagicTableRoll}
                    onRemoveMagicTableRoll={removeMagicTableRoll}
                />
            )}

            {/* SELECTION MODAL */}
            {modalType && modalType !== 'magical_bonds' && (
                <SelectionModal
                    isOpen={modalOpen}
                    type={modalType}
                    originFilter={modalOriginFilter}
                    items={modalItems}
                    selectedItems={
                        modalType === 'powers' ? selectedPowers :
                            modalType === 'spells' ? selectedSpellsWithRank :
                                techModules
                    }
                    onClose={() => setModalOpen(false)}
                    onToggleItem={
                        modalType === 'powers' ? togglePowerSelection :
                            modalType === 'spells' ? toggleSpellSelection :
                                toggleTechModule
                    }
                    characterData={data}
                    isMaldito={isMalditoChar}
                />
            )}

            {/* MAGICAL BONDS MODAL */}
            <MagicalBondsModal
                isOpen={modalOpen && modalType === 'magical_bonds'}
                selectedBonds={data.magicalBonds || []}
                onClose={() => setModalOpen(false)}
                onToggleBond={toggleMagicalBond}
            />

            {/* MAGICAL BONDS SECTION FOR MAGO */}
            {isMago && (
                <MagicalBondsSection
                    data={data}
                    onChange={onChange}
                    onOpenModal={openMagicalBondsModal}
                />
            )}

            <style>{modalStyles}</style>
        </div>
    );
}
