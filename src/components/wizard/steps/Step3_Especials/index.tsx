import React from 'react';
import type { Step3Props } from './types';
import './Step3_Especials.css';
import { useStep3Logic } from './hooks/useStep3Logic';

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
import MinotaurSection from './sections/MinotaurSection';
import HibridoSection from './sections/HibridoSection';
import { WizardSection } from '../../shared/layout/WizardSection';
import '../../shared/layout/WizardStep.css';

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';

export default function Step3_Especials({ data, onChange, onShowToast, onShowHelp }: Step3Props) {
    const {
        // State
        modalOpen, setModalOpen, modalType, modalOriginFilter,

        // Flags
        isGuardianChar, isMalditoChar, isParahumano, isParahumanoHybrid,
        isMago, isDotado, isHibrido, isTerrano, isPoseido, isElfoMagico,
        isHadaEter, isHadaAire, isHadaFuego, isHadaAgua, isHadaTierra,
        isGrifo, isElfoFisico, isVampiro, isSemidemonio, isEnte, isThals,
        isDios, isDiosMenor, isSemidios, isDivino, isCosmico, isMutante, isVigilante,
        isTecnologico, isTecnoarmadura, isCyborg, isTecnovehiculo, isExoskeleton, isTechnological,
        isTesKhar, isAtlante, isTroll, isMinotauro, isEnano, isElfoPsiquico,

        // Data
        selectedPowers,
        selectedSpells,
        selectedSpellsWithRank,
        techModules,
        magicTableRolls,
        emFormula,
        hasEMFormula,
        hasEM,
        vigilanteSpecialties,
        modalItems,

        // Handlers
        updateEMFormula,
        openModal,
        togglePowerSelection,
        toggleSpellSelection,
        toggleTechModule,
        updatePowerRank,
        updatePowerMod,
        updatePowerSkillValue,
        updatePowerOption,
        updatePowerCustomizations,
        removePower,
        updateSpellRank,
        updateSpellOption,
        removeSpell,
        updateModuleLocation,
        updateModuleCost,
        removeTechModule,
        addMagicTableRoll,
        removeMagicTableRoll,
        updateTrauma,
        toggleMagicalBond
    } = useStep3Logic(data, onChange, onShowToast);

    const hasAnyOrigin = isGuardianChar || hasOrigin(data, 'Alterado') || hasEM || isVampiro || isSemidemonio || isMalditoChar ||
        isEnte || isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton || isTesKhar || isAtlante || isParahumano || isTroll || isMinotauro || isPoseido || isEnano || isGrifo || isElfoFisico || isElfoPsiquico || isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;

    function hasOrigin(data: any, name: string) {
        return data.origin?.items?.some((item: any) => Object.keys(item)[0] === name);
    }

    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Poderes y Especialidades"
                description="Configura los poderes, características especiales y otras ventajas de tu personaje basándose en sus orígenes."
                onHelp={onShowHelp}
            >
                {!hasAnyOrigin && (
                    <div className="wizard-empty-state">
                        <div className="wizard-empty-icon">⚡</div>
                        <h4 className="wizard-empty-title">
                            Sin Origen Seleccionado
                        </h4>
                        <p className="wizard-empty-description">
                            Necesitas seleccionar al menos un origen en el primer paso para desbloquear estas opciones.
                        </p>
                        <button
                            onClick={() => {
                                const originTab = document.querySelector<HTMLButtonElement>('button[title="Origen"]');
                                if (originTab) originTab.click();
                            }}
                            className="wizard-button primary wizard-flex-center wizard-gap-sm"
                        >
                            <span>← Volver al Paso 1</span>
                        </button>
                    </div>
                )}
            </WizardSection>

            {isParahumano && (
                <ParahumanoSection
                    parahumanoParams={data.parahumanoParams || { isHybridWithHuman: false }}
                    onChange={onChange}
                />
            )}

            {isEnte && (
                <EnteSection
                    enteParams={data.enteParams || { formType: null, visualEffect: null }}
                    onChange={onChange}
                />
            )}

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

            {hasOrigin(data, 'Alterado') && (
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

            {isHibrido && (
                <HibridoSection
                    hibridoParams={data.hibridoParams || { sequels: [] }}
                    onChange={onChange}
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

            <VigilanteTraumasSection
                vigilanteSpecialties={vigilanteSpecialties}
                traumas={data.traumas || {}}
                onUpdateTrauma={updateTrauma}
            />

            {isTecnologico && (
                <TechnologicalSection
                    techParams={data.techParams}
                    onChange={(params) => onChange({ ...data, techParams: { ...(data.techParams || {}), ...params } })}
                />
            )}

            {isExoskeleton && (
                <ExoskeletonSection
                    selectedConfig={data.exoskeletonConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, exoskeletonConfig: id })}
                />
            )}

            {(isTecnoarmadura || isTecnovehiculo) && (
                <ExoskeletonArmorSection
                    selectedConfig={data.exoskeletonArmorConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, exoskeletonArmorConfig: id })}
                />
            )}

            {isTecnoarmadura && (
                <TechnoSuitStrengthSection
                    selectedConfig={data.technoSuitStrengthConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, technoSuitStrengthConfig: id })}
                />
            )}

            {isCyborg && (
                <CyborgSection
                    implants={data.cyborgImplants || []}
                    onChange={(implants) => onChange({ ...data, cyborgImplants: implants })}
                />
            )}

            {(isTecnoarmadura || isCyborg || isTecnovehiculo) && (
                <TechModulesSection
                    techModules={techModules}
                    onOpenModal={() => openModal('techModules')}
                    onUpdateLocation={updateModuleLocation}
                    onUpdateCost={updateModuleCost}
                    onRemove={removeTechModule}
                />
            )}

            <PowersSection
                data={data}
                selectedPowers={selectedPowers}
                onOpenModal={(origin) => openModal('powers', origin)}
                onUpdateRank={updatePowerRank}
                onUpdateMod={updatePowerMod}
                onUpdateSkillValue={updatePowerSkillValue}
                onUpdateOption={updatePowerOption}
                onUpdateCustomizations={updatePowerCustomizations}
                onRemove={removePower}
                isGuardian={isGuardianChar}
                isAlterado={hasOrigin(data, 'Alterado') || isParahumanoHybrid}
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
                isHibrido={isHibrido}
            />

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
                    onOpenSpellModal={() => openModal('spells')}
                    onUpdateEMFormula={updateEMFormula}
                    onUpdateSpellRank={updateSpellRank}
                    onUpdateOption={updateSpellOption}
                    onRemoveSpell={removeSpell}
                    magicTableRolls={magicTableRolls}
                    onAddMagicTableRoll={addMagicTableRoll}
                    onRemoveMagicTableRoll={removeMagicTableRoll}
                />
            )}

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

            <MagicalBondsModal
                isOpen={modalOpen && modalType === 'magical_bonds'}
                selectedBonds={data.magicalBonds || []}
                onClose={() => setModalOpen(false)}
                onToggleBond={toggleMagicalBond}
            />

            {isMago && (
                <MagicalBondsSection
                    data={data}
                    onChange={onChange}
                    onOpenModal={() => openModal('magical_bonds')}
                />
            )}
        </div>
    );
}
