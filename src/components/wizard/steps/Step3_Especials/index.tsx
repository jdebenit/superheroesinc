import type { Step3Props } from './types';
import './Step3_Especials.css';
import { useStep3Logic } from './hooks/useStep3Logic';
import { useOptionalWizardContext } from '../../shared/context/WizardContext';

// Section Components
import OriginSpecificSections from './sections/OriginSpecificSections';
import MagicalBondsSection from './sections/MagicalBondsSection';
import PowersSection from './sections/PowersSection';
import MagicSection from './sections/MagicSection';
import { WizardSection } from '../../shared/layout/WizardSection';
import '../../shared/layout/WizardStep.css';

// Modal Components
import SelectionModal from './modals/SelectionModal';
import MagicalBondsModal from './modals/MagicalBondsModal';

export default function Step3_Especials({ data, onChange, onShowToast, onShowHelp }: Step3Props) {
    const wizardContext = useOptionalWizardContext();
    const {
        modalOpen,
        setModalOpen,
        modalType,
        modalOriginFilter,
        originFlags,
        selectedPowers,
        selectedSpells,
        selectedSpellsWithRank,
        techModules,
        magicTableRolls,
        emFormula,
        vigilanteSpecialties,
        modalItems,
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

    const { hasAnyOrigin, hasEM, isMaldito, isMago } = originFlags;

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
                                if (wizardContext) {
                                    wizardContext.goToStep(1);
                                } else {
                                    const originTab = document.querySelector<HTMLButtonElement>('button[title="Origen"]');
                                    if (originTab) originTab.click();
                                }
                            }}
                            className="wizard-button primary wizard-flex-center wizard-gap-sm"
                        >
                            <span>← Volver al Paso 1</span>
                        </button>
                    </div>
                )}
            </WizardSection>

            <OriginSpecificSections
                data={data}
                onChange={onChange}
                onShowToast={onShowToast}
                originFlags={originFlags}
                vigilanteSpecialties={vigilanteSpecialties}
                techModules={techModules}
                onOpenTechModulesModal={() => openModal('techModules')}
                onUpdateModuleLocation={updateModuleLocation}
                onUpdateModuleCost={updateModuleCost}
                onRemoveTechModule={removeTechModule}
                onUpdateTrauma={updateTrauma}
            />

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
                originFlags={originFlags}
                werewolfSubtype={data.werewolfParams?.subtype}
            />

            {hasEM && (
                <MagicSection
                    data={data}
                    selectedSpells={selectedSpells}
                    selectedPowers={selectedPowers}
                    emFormula={emFormula}
                    originFlags={originFlags}
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
                    isMaldito={isMaldito}
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
