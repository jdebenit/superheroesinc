import React, { useRef, useEffect } from 'react';
import './CharacterSheet.css';

import { calculateDiff } from '../../utils/dataCleaner';
import { initialCharacterState } from '../../data/wizardConfig';
import { useCharacterSheetData } from './hooks/useCharacterSheetData';

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
}

export default function CharacterSheet({ character, totalPCs }: CharacterSheetProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    // Use the custom hook to get all calculated data
    const sheetData = useCharacterSheetData(character);
    const {
        derivedStats,
        generalSkillsData,
        specialSkillsData,
        combatStats,
        otherStats,
        powersData,
        spellsData,
        techData,
        weaponsData,
        artifactsData,
        vehiclesData,
        equipmentData
    } = sheetData;


    const openModal = () => {
        setIsFullScreen(false); // Reset to normal on open
        dialogRef.current?.showModal();
    };

    const closeModal = () => {
        dialogRef.current?.close();
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const downloadJson = async () => {
        // Calculate clean data (diff from defaults)
        const cleanData = calculateDiff(character, initialCharacterState);

        const filename = `${(character.name || 'personaje').toLowerCase().replace(/\s+/g, '-')}.json`;
        const jsonStr = JSON.stringify(cleanData || {}, null, 2);

        // Try using the File System Access API
        if ('showSaveFilePicker' in window) {
            try {
                // @ts-ignore - Types for showSaveFilePicker might not be available in all envs
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(jsonStr);
                await writable.close();
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error('File Picker Error:', err);
                }
                if (err.name === 'AbortError') return;
            }
        }

        // Fallback or if API not supported
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    return (
        <>
            <button
                onClick={openModal}
                className="visualize-btn"
            >
                📋 Visualizar Ficha
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
                            <button onClick={downloadJson} className="action-btn" title="Descargar JSON">
                                💾
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const { downloadPDF, generateCharacterSheetPDF } = await import('../../utils/pdfExport');
                                        // Pass pre-calculated data to avoid re-calculation in PDF export
                                        const preCalculatedData = {
                                            derivedStats,
                                            generalSkillsData,
                                            specialSkillsData,
                                            powersData,
                                            spellsData,
                                            techData,
                                            weaponsData,
                                            artifactsData,
                                            vehiclesData,
                                            equipmentData
                                        };
                                        // @ts-ignore - Argument count mismatch until pdfExport is updated
                                        const pdfBytes = await generateCharacterSheetPDF('/ficha_template.pdf', character, totalPCs || 0, preCalculatedData);
                                        downloadPDF(pdfBytes, `Ficha_SHI_${character.name.replace(/\s+/g, '_') || 'Personaje'}.pdf`);
                                    } catch (error) {
                                        console.error('Error generando PDF:', error);
                                        alert('Error al generar el PDF. Asegúrate de que el template "ficha_template.pdf" está en la carpeta public.');
                                    }
                                }}
                                className="action-btn"
                                title="Exportar PDF"
                            >
                                📥
                            </button>
                            <button onClick={closeModal} className="close-btn">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="dialog-body">
                        <div className="character-sheet">

                            <SheetHeader character={character} totalPCs={totalPCs} />

                            <div className="sheet-grid">
                                <CombatSection combatStats={combatStats} />
                                <WeaponsSection weapons={character.weapons} />
                                <ArtifactsSection artifacts={character.artifacts} />
                                <MagicObjectsSection magicObjects={character.magicObjects} magicTableRolls={character.magicTableRolls} />
                                <VehiclesSection vehicles={character.vehicles} />
                                <OriginSection character={character} />
                                <HybridSection character={character} />
                                <EnteSection character={character} />
                                <AlteradoSection character={character} />
                                <MutanteSection character={character} />
                                <PoseidoSection character={character} />
                                <GuardianSection character={character} />
                                <DivineSection character={character} />
                                <OtherStatsSection otherStats={otherStats} />
                                <AttributesSection character={character} />
                                <SkillsGeneralSection character={character} />
                                <SkillsLearningSection character={character} />
                                <MalditoSection character={character} />
                                <BackgroundSection character={character} />
                                <EquipmentSection equipment={character.equipment} />
                                <TechModulesSection techModules={character.techModules?.installed || []} />
                                <ExoskeletonSection character={character} />
                                <TechnifiedSection character={character} />
                                <PowersSection character={character} />
                                <SpellsSection character={character} />
                                <MagicalBondsSection character={character} />
                                <TraumasSection character={character} />
                                <NotesSection character={character} />
                            </div>
                        </div>
                    </div>
                </div>

            </dialog >
        </>
    );
}
