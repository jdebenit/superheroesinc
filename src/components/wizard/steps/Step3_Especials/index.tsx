import React, { useState, useMemo, useEffect } from 'react';
import { POWERS } from '../../../../data/powers';
import { SPELLS, type Spell } from '../../../../data/spells';
import { TECH_MODULES } from '../../../../data/techModules';
import {
    hasOrigin,
    hasSubtype,
    getVigilanteSpecialties,
    getMutantPowerTypes,
    calculateEM
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
import type { CyborgImplant } from '../../../../data/cyborgImplantConfigs';

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';
import MinotaurSection from './sections/MinotaurSection';

export default function Step3_Especials({ data, onChange }: Step3Props) {
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
    const isParahumanoHybrid = isParahumano && (data.isParahumanoHybrid === true); // Defined early for useEffect

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

    // Auto-add Superhabilidad for Tes-khar
    useEffect(() => {
        if (isTesKhar) {
            const hasSuperhabilidad = selectedPowers.some(p => p.id === 'superhabilidad');
            if (!hasSuperhabilidad) {
                // Add Superhabilidad at High Rank (80)
                const newPower: SelectedPower = {
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 80, // Rango Alto (71-95)
                    skillValue: 0,
                    selectedOption: 'Esconderse'
                };
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...(data.powers?.selected || []), newPower]
                    }
                });
            }
        }
    }, [isTesKhar, selectedPowers, onChange, data]);

    // Auto-add Powers for Atlante
    // Auto-add Powers for Atlante
    useEffect(() => {
        if (isAtlante) {
            const hasWaterControl = selectedPowers.some(p => p.id === 'control_del_agua');
            const hasNativeLanguage = selectedPowers.some(p => p.id === 'superhabilidad' && p.selectedOption === 'Idioma nativo');
            const hasSwimming = selectedPowers.some(p => p.id === 'superhabilidad' && p.selectedOption === 'Nadar');
            const hasAnimalEmpathy = selectedPowers.some(p => p.id === 'empatia_animal');

            let newPowers: SelectedPower[] = [];

            if (!hasWaterControl) {
                // Add Control del agua at Rank 11
                newPowers.push({
                    id: 'control_del_agua',
                    origin: 'Parahumano',
                    rank: 11,
                    skillValue: 0
                });
            }

            if (!hasNativeLanguage) {
                // Add Superhabilidad at Rank 41 (Idioma nativo)
                newPowers.push({
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 41,
                    skillValue: 0,
                    selectedOption: 'Idioma nativo'
                });
            }

            if (!hasSwimming) {
                // Add Superhabilidad at Rank 81 (Nadar)
                newPowers.push({
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 81,
                    skillValue: 0,
                    selectedOption: 'Nadar'
                });
            }

            if (!hasAnimalEmpathy) {
                // Add Empatía animal at Rank 11 with customization
                newPowers.push({
                    id: 'empatia_animal',
                    origin: 'Parahumano',
                    rank: 11,
                    skillValue: 0,
                    customizations: [{
                        id: 'atlante_cetaceos',
                        description: 'Hablar solo con cetáceos',
                        cost: 0
                    }]
                });
            }

            if (newPowers.length > 0) {
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...(data.powers?.selected || []), ...newPowers]
                    }
                });
            }
        }
    }, [isAtlante, selectedPowers, onChange, data]);

    // Auto-add Regeneration for Troll
    useEffect(() => {
        if (isTroll) {
            const hasRegeneration = selectedPowers.some(p => p.id === 'regeneracion_de_tejidos');
            if (!hasRegeneration) {
                // Add Regeneración de tejidos at Rank 81
                const newPower: SelectedPower = {
                    id: 'regeneracion_de_tejidos',
                    origin: 'Arcano',
                    rank: 81,
                    skillValue: 0
                };
                onChange({
                    ...data,
                    powers: {
                        ...data.powers,
                        selected: [...(data.powers?.selected || []), newPower]
                    }
                });
            }
        }
    }, [isTroll, selectedPowers, onChange, data]);

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
        if (!isTerrano) return;

        const divisor = data.spells?.emFormula?.divisor ?? 4; // Default safe
        // Check if Ajeno (divisor === 0)
        const isAjeno = divisor === 0;
        const maxSlots = isAjeno ? 2 : 1;

        const guardianPowerCount = selectedPowers.filter(p => p.origin === 'Guardian').length;
        const rollCount = magicTableRolls.length;

        // Revised Logic: We only care about SLOTS used in the table.
        // Selecting "Acceso a Poder de Guardián" USES a slot.
        // Selecting a power relies on having that access token.
        if (rollCount >= maxSlots) {
            alert(`Los Terranos solo tienen ${maxSlots} slots disponibles en la Tabla de Objetos.`);
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

        // Terrano Restriction Logic
        // Terranos (Arcano -> Terrano) can normally only select 1 Guardian power.
        // Exception: If they chose "Ajeno - No EM" (divisor === 0), they can select up to 2.
        // Note: isTerrano is defined in component scope.
        if (isTerrano && modalOriginFilter === 'Guardian') {
            const isAjeno = emFormula.divisor === 0;
            const maxGuardianPowers = isAjeno ? 2 : 1;

            // Check if we are trying to ADD a new power (not removing/toggling off)
            const isAlreadySelected = selectedPowers.some(p => p.id === powerId && p.origin === 'Guardian');

            if (!isAlreadySelected) {
                // Count existing Guardian powers
                const currentGuardianCount = selectedPowers.filter(p => p.origin === 'Guardian').length;
                // Count "guardian_power" rolls in Magic Table
                const allowedGuardianCount = magicTableRolls.filter(r => r === 'guardian_power').length;

                if (currentGuardianCount >= allowedGuardianCount) {
                    alert(`Para seleccionar un Poder de Guardián, debes gastar un slot en la "Tabla de Objetos Mágicos" seleccionando la opción "Acceso a Poder de Guardián". Tienes ${allowedGuardianCount} accesos y ya usas ${currentGuardianCount}.`);
                    return;
                }
            }
        }

        const powerDef = POWERS.find(p => p.id === powerId);
        const hasOptions = powerDef?.options && powerDef.options.length > 0;

        if (hasOptions) {
            // Always add new instance for powers with options
            const newSelected = [...selectedPowers, { id: powerId, origin: modalOriginFilter, rank: 1 }];
            updatePowers(newSelected);
        } else {
            // Toggle behavior for standard powers
            const existingIndex = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);
            let newSelected: SelectedPower[];

            if (existingIndex >= 0) {
                newSelected = [...selectedPowers];
                newSelected.splice(existingIndex, 1);
            } else {
                newSelected = [...selectedPowers, { id: powerId, origin: modalOriginFilter, rank: 1 }];
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

    // Filter modal items
    const modalItems = useMemo(() => {
        if (!modalType || modalType === 'magical_bonds') return [];

        if (modalType === 'powers') {
            return POWERS.filter(p => {
                if (modalOriginFilter && !p.origins.includes(modalOriginFilter)) return false;

                // Special filtering for Mutant powers by type (for both Mutante origin and Ente)
                if (modalOriginFilter === 'Mutante') {
                    const allowedTypes = getMutantPowerTypes(data);
                    if (allowedTypes.length > 0 && !p.types.some(t => allowedTypes.includes(t))) {
                        return false;
                    }
                }

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
    const isGuardian = hasOrigin(data, 'Guardián');
    const isAlterado = hasOrigin(data, 'Alterado');
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isVampiro = hasSubtype(data, 'Sobrenatural', 'Vampiro');
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const isMaldito = hasSubtype(data, 'Sobrenatural', 'Maldito');
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
    const emFormula = data.spells?.emFormula ||
        (isPoseido ? { divisor: 0, pcCost: 0 } : { divisor: 4, pcCost: 0 });
    const hasEMFormula = !isMago && (isDotado || isHibrido || isTerrano || isPoseido);
    const hasEM = isMago || isDotado || isHibrido || isTerrano || isPoseido;

    // Auto-correct EM formula for Poseido if it has the generic default (4)
    useEffect(() => {
        if (isPoseido && emFormula.divisor === 4) {
            updateEMFormula(0, 0); // Default to No Access
        }
    }, [isPoseido, emFormula.divisor]);

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

    const hasAnyOrigin = isGuardian || isAlterado || hasEM || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton || isTesKhar || isAtlante || isParahumano || isTroll || isMinotauro || isPoseido;

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
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-black mb-8 uppercase text-center font-comic tracking-wide text-gray-800">
                Poderes y Habilidades Especiales
            </h2>

            {!hasAnyOrigin && (
                <div className="text-center py-12 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <p className="text-xl text-gray-500 font-bold">
                        No has seleccionado ningún origen que actualmente tenga habilitado este paso. Recuerda es una Beta.
                    </p>
                    <p className="text-gray-400 mt-2 font-comic">Prueba con Guardián, Alterado, Arcano, Sobrenatural, Thals, Divino, Cósmico, Mutante o Tecnológico</p>
                </div>
            )}

            {/* Parahumano Hybrid Checkbox */}
            {isParahumano && (
                <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg shadow-md mb-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.isParahumanoHybrid || false}
                            onChange={(e) => onChange({ ...data, isParahumanoHybrid: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-yellow-600 rounded focus:ring-yellow-500 border-gray-300 transition duration-150 ease-in-out"
                        />
                        <span className="text-lg font-bold text-gray-800">
                            Híbrido con Humano (Acceso a poderes de Alterado)
                        </span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1 ml-8">
                        Si marcas esta opción, tendrás acceso a la lista de poderes de Alterado con un coste adicional de +3 PCs al coste base de cada poder seleccionado.
                    </p>
                </div>
            )}

            {/* MAGICAL BONDS SECTION FOR MAGO */}
            {isMago && (
                <MagicalBondsSection
                    data={data}
                    onChange={onChange}
                    onOpenModal={openMagicalBondsModal}
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
            {isMaldito && (
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
                />
            )}

            {isGuardian && (
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

            {isMinotauro && <MinotaurSection />}

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
                isGuardian={isGuardian}
                isAlterado={isAlterado || isParahumanoHybrid}
                isVampiro={isVampiro}
                isSemidemonio={isSemidemonio}
                isMaldito={isMaldito}
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
                />
            )}

            {/* MAGICAL BONDS MODAL */}
            <MagicalBondsModal
                isOpen={modalOpen && modalType === 'magical_bonds'}
                selectedBonds={data.magicalBonds || []}
                onClose={() => setModalOpen(false)}
                onToggleBond={toggleMagicalBond}
            />

            <style>{modalStyles}</style>
        </div>
    );
}
