import React, { useState, useMemo } from 'react';
import './CharacterSheet.css';

import { useCharacterSheetData } from './hooks/useCharacterSheetData';
import { useJsonExport } from '../../hooks/useJsonExport';
import { usePdfExport } from './hooks/usePdfExport';
import { useModal } from './hooks/useModal';
import { ActionButtons } from './common/ActionButtons';
import { LevelHistoryModal } from './modals/LevelHistoryModal';
import {
    syncCharacterTransformations,
    getCharacterForActiveForm,
    getPowerTransformationConfig,
    WEREWOLF_TRANSITION_FORM_ID,
    type CharacterForm
} from '../../utils/calculations/formCalculations';

// Section Components
import { SheetHeader } from './sections/SheetHeader';
import { CombatSection } from './sections/CombatSection';
import { WeaponsSection } from './sections/WeaponsSection';
import { ArtifactsSection } from './sections/ArtifactsSection';
import { MagicObjectsSection } from './sections/MagicObjectsSection';
import { VehiclesSection } from './sections/VehiclesSection';
import { OriginSection } from './sections/OriginSection';
import { HybridSection } from './sections/HybridSection';
import { EnteSection } from './sections/EnteSection';
import { AlteradoSection } from './sections/AlteradoSection';
import { HibridoSheetSection } from './sections/HibridoSheetSection';
import { MutanteSection } from './sections/MutanteSection';
import { PoseidoSection } from './sections/PoseidoSection';
import { GuardianSection } from './sections/GuardianSection';
import { DivineSection } from './sections/DivineSection';
import { OtherStatsSection } from './sections/OtherStatsSection';
import { AttributesSection } from './sections/AttributesSection';
import { SkillsGeneralSection } from './sections/SkillsGeneralSection';
import { SkillsLearningSection } from './sections/SkillsLearningSection';
import { MalditoSection } from './sections/MalditoSection';
import { LiberadoSection } from './sections/LiberadoSection';
import { WerewolfSheetSection } from './sections/WerewolfSheetSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { EquipmentSection } from './sections/EquipmentSection';
import { VariosSection } from './sections/VariosSection';
import { TechParamsSection } from './sections/TechParamsSection';
import { TechModulesSection } from './sections/TechModulesSection';
import { ExoskeletonSection } from './sections/ExoskeletonSection';
import { TechnifiedSection } from './sections/TechnifiedSection';
import { PowersSection } from './sections/PowersSection';
import { SpellsSection } from './sections/SpellsSection';
import { MagicalBondsSection } from './sections/MagicalBondsSection';
import { TraumasSection } from './sections/TraumasSection';
import { NotesSection } from './sections/NotesSection';


interface CharacterSheetProps {
    character: any;
    totalPCs?: number | string;
    mode?: 'modal' | 'inline';
    renderTrigger?: (openModal: () => void) => React.ReactNode;
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CharacterSheet({
    character,
    totalPCs,
    mode = 'modal',
    renderTrigger,
    onShowToast
}: CharacterSheetProps) {
    const [activeFormId, setActiveFormId] = useState<string>('base');

    // Ensure forms array includes werewolf transition form and any active power transformation forms
    const availableForms: CharacterForm[] = useMemo(() => {
        const synced = syncCharacterTransformations(character);
        return (synced && synced.forms) || character?.forms || [];
    }, [character]);

    const effectiveFormId = useMemo(() => {
        if (activeFormId === 'base') return 'base';
        return availableForms.some(f => f.id === activeFormId) ? activeFormId : 'base';
    }, [activeFormId, availableForms]);

    const characterWithForms = useMemo(() => {
        if (availableForms.length === 0) return character;
        return { ...character, forms: availableForms };
    }, [character, availableForms]);

    const activeCharacter = useMemo(() => {
        return getCharacterForActiveForm(characterWithForms, effectiveFormId);
    }, [characterWithForms, effectiveFormId]);

    // Use the custom hook to get all calculated data for the active form
    const sheetData = useCharacterSheetData(activeCharacter);
    const {
        combatStats,
        otherStats
    } = sheetData;

    // Use custom hooks for export functionality
    const { downloadJson } = useJsonExport(characterWithForms, onShowToast);
    const { handleExportPDF } = usePdfExport(activeCharacter, totalPCs, sheetData);
    const { dialogRef, isFullScreen, openModal, closeModal, toggleFullScreen } = useModal();
    const [isLevelHistoryOpen, setIsLevelHistoryOpen] = useState(false);

    // Render the sheet content (reusable for both modes)
    const renderSheetContent = () => (
        <div className="character-sheet">
            <SheetHeader
                character={activeCharacter}
                totalPCs={totalPCs}
                onLevelClick={() => setIsLevelHistoryOpen(true)}
            />

            {availableForms.length > 0 && (
                <div className="sheet-form-switcher">
                    <span className="sheet-form-switcher-label">🔄 Forma Activa:</span>
                    <div className="sheet-form-switcher-buttons">
                        <button
                            type="button"
                            onClick={() => setActiveFormId('base')}
                            className={`sheet-form-btn ${effectiveFormId === 'base' ? 'active' : ''}`}
                        >
                            👤 Forma Base / Humana
                        </button>
                        {availableForms.map(form => {
                            const powerCfg = getPowerTransformationConfig(form.id);
                            const icon = form.id === WEREWOLF_TRANSITION_FORM_ID ? '🐺' : (powerCfg?.icon || '🔄');
                            return (
                                <button
                                    key={form.id}
                                    type="button"
                                    onClick={() => setActiveFormId(form.id)}
                                    className={`sheet-form-btn ${effectiveFormId === form.id ? 'active' : ''}`}
                                >
                                    {icon} {form.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="sheet-grid">
                <OriginSection character={activeCharacter} />
                <BackgroundSection character={activeCharacter} />
                <AttributesSection character={activeCharacter} />
                <CombatSection combatStats={combatStats} />
                <OtherStatsSection otherStats={otherStats} />
                <SkillsGeneralSection character={activeCharacter} />
                <SkillsLearningSection character={activeCharacter} />
                <PowersSection character={activeCharacter} />
                <SpellsSection character={activeCharacter} />
                <WeaponsSection weapons={activeCharacter.weapons} />
                <HybridSection character={activeCharacter} />
                <EnteSection character={activeCharacter} />
                <AlteradoSection character={activeCharacter} />
                <HibridoSheetSection character={activeCharacter} />
                <MutanteSection character={activeCharacter} />
                <PoseidoSection character={activeCharacter} />
                <GuardianSection character={activeCharacter} />
                <DivineSection character={activeCharacter} />
                <MalditoSection character={activeCharacter} />
                <LiberadoSection character={activeCharacter} />
                <WerewolfSheetSection character={activeCharacter} baseCharacter={characterWithForms} />
                <ArtifactsSection artifacts={activeCharacter.artifacts} />
                <MagicObjectsSection magicObjects={activeCharacter.magicObjects} magicTableRolls={activeCharacter.magicTableRolls} />
                <VehiclesSection vehicles={activeCharacter.vehicles} />
                <EquipmentSection equipment={activeCharacter.equipment} />
                <VariosSection varios={activeCharacter.varios} />
                <TechParamsSection character={activeCharacter} />
                <TechModulesSection techModules={activeCharacter.techModules || []} />
                <ExoskeletonSection character={activeCharacter} />
                <TechnifiedSection character={activeCharacter} />
                <MagicalBondsSection character={activeCharacter} />
                <TraumasSection character={activeCharacter} />
                <NotesSection character={activeCharacter} />
            </div>
        </div>
    );

    // Inline mode: render directly without modal
    if (mode === 'inline') {
        return (
            <div className="character-sheet-inline" id="character-sheet">
                <ActionButtons
                    onDownloadJson={downloadJson}
                    onExportPdf={handleExportPDF}
                    variant="inline"
                />
                {renderSheetContent()}
                <LevelHistoryModal
                    character={activeCharacter}
                    isOpen={isLevelHistoryOpen}
                    onClose={() => setIsLevelHistoryOpen(false)}
                />
            </div>
        );
    }

    // Modal mode: render button + dialog (original behavior)
    return (
        <>
            {renderTrigger ? (
                renderTrigger(openModal)
            ) : (
                <button
                    onClick={openModal}
                    className="visualize-btn"
                >
                    📋 <span className="visualize-label">Visualizar Ficha</span>
                </button>
            )}

            <dialog ref={dialogRef} className={`character-dialog ${isFullScreen ? 'full-screen' : ''}`}>
                <div className="dialog-content">
                    <div className="dialog-header">
                        <div className="header-info">
                            <span className="dialog-title">{character.alias || character.name || "Nuevo Personaje"}</span>
                        </div>
                        <div className="dialog-actions">
                            <button onClick={toggleFullScreen} className="action-btn" title={isFullScreen ? "Salir de Pantalla Completa" : "Ver Ficha Completa"}>
                                {isFullScreen ? "❎" : "⛶"}
                            </button>
                            <ActionButtons
                                onDownloadJson={downloadJson}
                                onExportPdf={handleExportPDF}
                                variant="modal"
                            />
                            <button onClick={closeModal} className="close-btn">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="dialog-body">
                        {renderSheetContent()}
                    </div>
                    <LevelHistoryModal
                        character={activeCharacter}
                        isOpen={isLevelHistoryOpen}
                        onClose={() => setIsLevelHistoryOpen(false)}
                    />
                </div>
            </dialog>
        </>
    );
}
