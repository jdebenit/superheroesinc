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
import AlteradoSection from './sections/AlteradoSection';
import MutanteSection from './sections/MutanteSection';
import GuardianSection from './sections/GuardianSection';
import DivineSection from './sections/DivineSection';
import TechnologicalSection from './sections/TechnologicalSection';

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';

export default function Step3_Especials({ data, onChange }: Step3Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar');
    const isAtlante = hasSubtype(data, 'Parahumano', 'Atlante');
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
    useEffect(() => {
        if (isAtlante) {
            const hasAnimalEmpathy = selectedPowers.some(p => p.id === 'empatia_animal');
            const hasSuperhabilidad = selectedPowers.some(p => p.id === 'superhabilidad');

            let newPowers: SelectedPower[] = [];

            if (!hasAnimalEmpathy) {
                // Add Empatía animal at Low Rank (20)
                newPowers.push({
                    id: 'empatia_animal',
                    origin: 'Parahumano',
                    rank: 20, // Rango Bajo (1-20)
                    skillValue: 0
                });
            }

            if (!hasSuperhabilidad) {
                // Add Superhabilidad at High Rank (80)
                newPowers.push({
                    id: 'superhabilidad',
                    origin: 'Parahumano',
                    rank: 80, // Rango Alto (71-95)
                    skillValue: 0,
                    selectedOption: 'Nadar'
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

        const existingIndex = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);
        let newSelected: SelectedPower[];

        if (existingIndex >= 0) {
            newSelected = [...selectedPowers];
            newSelected.splice(existingIndex, 1);
        } else {
            newSelected = [...selectedPowers, { id: powerId, origin: modalOriginFilter, rank: 1 }];
        }
        updatePowers(newSelected);
    };

    const updatePowerRank = (powerId: string, origin: string, newRank: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, rank: Math.max(1, Math.min(100, newRank)) }
                : p
        );
        updatePowers(updated);
    };

    const updatePowerMod = (powerId: string, origin: string, newMod: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, powerMod: newMod }
                : p
        );
        updatePowers(updated);
    };

    const updatePowerSkillValue = (powerId: string, origin: string, newValue: number) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, skillValue: newValue }
                : p
        );
        updatePowers(updated);
    };

    const updatePowerOption = (powerId: string, origin: string, newOption: string) => {
        const updated = selectedPowers.map(p =>
            p.id === powerId && p.origin === origin
                ? { ...p, selectedOption: newOption }
                : p
        );
        updatePowers(updated);
    };

    const removePower = (index: number) => {
        const newSelected = [...selectedPowers];
        newSelected.splice(index, 1);
        updatePowers(newSelected);
    };

    // Spell handlers
    const toggleSpellSelection = (id: string) => {
        const existingIndex = selectedSpellsWithRank.findIndex(s => s.id === id);
        let newSelected: SelectedSpell[];

        if (existingIndex >= 0) {
            newSelected = [...selectedSpellsWithRank];
            newSelected.splice(existingIndex, 1);
        } else {
            newSelected = [...selectedSpellsWithRank, { id, rank: 1 }];
        }
        updateSpells(newSelected);
    };

    const updateSpellRank = (id: string, rank: number) => {
        const newSelected = selectedSpellsWithRank.map(s =>
            s.id === id ? { ...s, rank } : s
        );
        updateSpells(newSelected);
    };

    const removeSpell = (id: string) => {
        const newSelected = selectedSpellsWithRank.filter(s => s.id !== id);
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
    const isEnte = hasSubtype(data, 'Sobrenatural', 'Ente');
    const isThals = hasOrigin(data, 'Thals');
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
    const emFormula = data.spells?.emFormula || { divisor: 4, pcCost: 0 };
    const hasEMFormula = !isMago && (isDotado || isHibrido || isTerrano);
    const hasEM = isMago || isDotado || isHibrido || isTerrano;

    // Spells - enrich with full spell data and rank
    const selectedSpells = selectedSpellsWithRank.map(sw => {
        const spell = SPELLS.find(s => s.id === sw.id);
        return spell ? { ...spell, rank: sw.rank } : null;
    }).filter((s): s is (Spell & { rank: number }) => s !== null);

    const hasAnyOrigin = isGuardian || isAlterado || hasEM || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton || isTesKhar || isAtlante || isParahumano;

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
                        No has seleccionado ningún origen que actualmente tenga habilitado este paso. Recuerda es una Alpha.
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
                    onOpenSpellModal={openSpellModal}
                    onUpdateEMFormula={updateEMFormula}
                    onUpdateSpellRank={updateSpellRank}
                    onRemoveSpell={removeSpell}
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
