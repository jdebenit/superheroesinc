import React, { useState, useMemo } from 'react';
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

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';

export default function Step3_Especials({ data, onChange }: Step3Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

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

                // Special filtering for Mutant powers by type
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
    const isThals = hasOrigin(data, 'Thals');
    const isDivino = hasOrigin(data, 'Divino');
    const isCosmico = hasOrigin(data, 'Cósmico');
    const isMutante = hasOrigin(data, 'Mutante');
    const isVigilante = hasOrigin(data, 'Vigilante');

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

    const hasAnyOrigin = isGuardian || isAlterado || hasEM || isVampiro || isSemidemonio ||
        isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton;

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

            {/* MAGICAL BONDS SECTION FOR MAGO */}
            {isMago && (
                <MagicalBondsSection
                    data={data}
                    onChange={onChange}
                    onOpenModal={openMagicalBondsModal}
                />
            )}

            {/* VIGILANTE TRAUMAS SECTION */}
            <VigilanteTraumasSection
                vigilanteSpecialties={vigilanteSpecialties}
                traumas={data.traumas || {}}
                onUpdateTrauma={updateTrauma}
            />

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
                onRemove={removePower}
                isGuardian={isGuardian}
                isAlterado={isAlterado}
                isVampiro={isVampiro}
                isSemidemonio={isSemidemonio}
                isThals={isThals}
                isDivino={isDivino}
                isTerrano={isTerrano}
                isDotado={isDotado}
                isCosmico={isCosmico}
                isMutante={isMutante}
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
