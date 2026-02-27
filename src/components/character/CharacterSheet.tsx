import React from 'react';
import './CharacterSheet.css';

import { useCharacterSheetData } from './hooks/useCharacterSheetData';
import { useJsonExport } from './hooks/useJsonExport';
import { usePdfExport } from './hooks/usePdfExport';
import { useModal } from './hooks/useModal';
import { ActionButtons } from './common/ActionButtons';

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
import { MutanteSection } from './sections/MutanteSection';
import { PoseidoSection } from './sections/PoseidoSection';
import { GuardianSection } from './sections/GuardianSection';
import { DivineSection } from './sections/DivineSection';
import { OtherStatsSection } from './sections/OtherStatsSection';
import { AttributesSection } from './sections/AttributesSection';
import { SkillsGeneralSection } from './sections/SkillsGeneralSection';
import { SkillsLearningSection } from './sections/SkillsLearningSection';
import { MalditoSection } from './sections/MalditoSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { EquipmentSection } from './sections/EquipmentSection';
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
    mode?: 'modal' | 'inline'; // New prop to control rendering mode
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CharacterSheet({ character, totalPCs, mode = 'modal', onShowToast }: CharacterSheetProps) {
    // Use the custom hook to get all calculated data
    const sheetData = useCharacterSheetData(character);
    const {
        combatStats,
        otherStats
    } = sheetData;

    // Use custom hooks for export functionality
    const { downloadJson } = useJsonExport(character, onShowToast);
    const { handleExportPDF } = usePdfExport(character, totalPCs, sheetData);
    const { dialogRef, isFullScreen, openModal, closeModal, toggleFullScreen } = useModal();

    // Render the sheet content (reusable for both modes)
    const renderSheetContent = () => (
        <div className="character-sheet">
            <SheetHeader character={character} totalPCs={totalPCs} />

            <div className="sheet-grid">
                <OriginSection character={character} />
                <BackgroundSection character={character} />
                <AttributesSection character={character} />
                <CombatSection combatStats={combatStats} />
                <OtherStatsSection otherStats={otherStats} />
                <SkillsGeneralSection character={character} />
                <SkillsLearningSection character={character} />
                <PowersSection character={character} />
                <SpellsSection character={character} />
                <WeaponsSection weapons={character.weapons} />
                <HybridSection character={character} />
                <EnteSection character={character} />
                <AlteradoSection character={character} />
                <MutanteSection character={character} />
                <PoseidoSection character={character} />
                <GuardianSection character={character} />
                <DivineSection character={character} />
                <MalditoSection character={character} />
                <ArtifactsSection artifacts={character.artifacts} />
                <MagicObjectsSection magicObjects={character.magicObjects} magicTableRolls={character.magicTableRolls} />
                <VehiclesSection vehicles={character.vehicles} />
                <EquipmentSection equipment={character.equipment} />
                <TechModulesSection techModules={character.techModules?.installed || []} />
                <ExoskeletonSection character={character} />
                <TechnifiedSection character={character} />
                <MagicalBondsSection character={character} />
                <TraumasSection character={character} />
                <NotesSection character={character} />
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
            </div>
        );
    }

    // Modal mode: render button + dialog (original behavior)
    return (
        <>
            <button
                onClick={openModal}
                className="visualize-btn"
            >
                📋 <span className="visualize-label">Visualizar Ficha</span>
            </button>

            <dialog ref={dialogRef} className={`character-dialog ${isFullScreen ? 'full-screen' : ''}`}>
                <div className="dialog-content">
                    <div className="dialog-header">
                        <div className="header-info">
                            <span className="dialog-title">{character.name || "Nuevo Personaje"}</span>
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
                </div>
            </dialog>
        </>
    );
}
