import React, { useState, useMemo } from 'react';
import './CharacterSheet.css';

import { useCharacterSheetData } from './hooks/useCharacterSheetData';
import { useJsonExport } from '../../hooks/useJsonExport';
import { usePdfExport } from './hooks/usePdfExport';
import { useModal } from './hooks/useModal';
import { ActionButtons } from './common/ActionButtons';
import { LevelHistoryModal } from './modals/LevelHistoryModal';

// Section & Orchestrator Components
import { SheetHeader } from './sections/SheetHeader';
import { SheetFormSwitcher } from './sections/SheetFormSwitcher';
import { OriginSection } from './sections/OriginSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { AttributesSection } from './sections/AttributesSection';
import { CombatSection } from './sections/CombatSection';
import { OtherStatsSection } from './sections/OtherStatsSection';
import { SkillsGeneralSection } from './sections/SkillsGeneralSection';
import { SkillsLearningSection } from './sections/SkillsLearningSection';
import { PowersSection } from './sections/PowersSection';
import { SpellsSection } from './sections/SpellsSection';
import { OriginSpecificSheetSections } from './sections/OriginSpecificSheetSections';
import { GearAndInventorySheetSections } from './sections/GearAndInventorySheetSections';

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
    const [isLevelHistoryOpen, setIsLevelHistoryOpen] = useState(false);

    // Capa 4: Motor centralizado y memoizado que proyecta la forma activa y calcula todos los datos
    const sheetData = useMemo(
        () => useCharacterSheetData(character, activeFormId, totalPCs),
        [character, activeFormId, totalPCs]
    );
    const {
        availableForms,
        effectiveFormId,
        characterWithForms,
        activeCharacter,
        resolvedTotalPCs,
        combatStats,
        otherStats,
        generalSkillItems,
        specialSkillItems
    } = sheetData;

    // Hooks de exportación y modal
    const { downloadJson } = useJsonExport(characterWithForms, onShowToast);
    const { handleExportPDF } = usePdfExport(activeCharacter, resolvedTotalPCs, sheetData);
    const { dialogRef, isFullScreen, openModal, closeModal, toggleFullScreen } = useModal();

    const renderSheetContent = () => (
        <div className="character-sheet">
            <SheetHeader
                character={activeCharacter}
                totalPCs={resolvedTotalPCs}
                onLevelClick={() => setIsLevelHistoryOpen(true)}
            />

            <SheetFormSwitcher
                availableForms={availableForms}
                effectiveFormId={effectiveFormId}
                onSelectForm={setActiveFormId}
            />

            <div className="sheet-grid">
                <OriginSection character={activeCharacter} />
                <BackgroundSection character={activeCharacter} />
                <AttributesSection character={activeCharacter} />
                <CombatSection combatStats={combatStats} />
                <OtherStatsSection otherStats={otherStats} />
                <SkillsGeneralSection character={activeCharacter} items={generalSkillItems} />
                <SkillsLearningSection character={activeCharacter} items={specialSkillItems} />
                <PowersSection character={activeCharacter} />
                <SpellsSection character={activeCharacter} />

                <OriginSpecificSheetSections
                    activeCharacter={activeCharacter}
                    baseCharacter={characterWithForms}
                />

                <GearAndInventorySheetSections character={activeCharacter} />
            </div>
        </div>
    );

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
