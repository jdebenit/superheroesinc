import React, { useRef, useEffect } from 'react';
import './CharacterSheet.css';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../data/backgroundTables';
import { SPELLS } from '../../data/spells';
import { POWERS } from '../../data/powers';

import { TECH_MODULES } from '../../data/techModules';
import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';
import { MAGICAL_BONDS } from '../../data/magicalBonds';
import { EXOSKELETON_CONFIGS } from '../../data/exoskeletonConfigs';
import { EXOSKELETON_ARMOR_CONFIGS } from '../../data/exoskeletonArmorConfigs';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../../data/technoSuitStrengthConfigs';
import { CYBORG_IMPLANT_STATS, CYBORG_IMPLANT_STRENGTHS } from '../../data/cyborgImplantConfigs';
import { ENTE_FORMS, ENTE_EFFECTS } from '../wizard/steps/Step3_Especials/sections/EnteSection';
import { MALDITO_DATA } from '../wizard/steps/Step3_Especials/sections/MalditoSection';
import { ALTERADO_DATA } from '../wizard/steps/Step3_Especials/sections/AlteradoSection';
import { POSEIDO_FORMS } from '../wizard/steps/Step3_Especials/sections/PoseidoSection';
import { SEQUELS } from '../../data/sequels';
import { INCOME_SOURCES } from '../../data/technologicalOptions';

import { calculateDiff } from '../../utils/dataCleaner';
import { initialCharacterState } from '../../data/wizardConfig';
import { calculateEM, hasSubtype } from '../wizard/steps/Step3_Especials/utils';
// Calculations
// Calculations
import { calculateDerivedStats, calculateSkillBase } from '../../utils/characterCalculations';
import { calculateGeneralSkillValues, calculateSpecialSkillValues } from '../../utils/calculations/skillCalculations';

import {
    GUARDIAN_QUALITIES,
    GUARDIAN_OBJECTS,
    GUARDIAN_FEATURES,
    GUARDIAN_TRANSFORMATIONS
} from '../../data/guardianOptions';
import { DIVINE_FOCUS_OPTIONS } from '../../data/divineOptions';

interface CharacterSheetProps {
    character: any;
    totalPCs?: number | string;
}


const calculatePowerSkillBase = (char: any, formula: string): number => {
    if (!formula) return 0;
    const getVal = (abbr: string) => {
        const map: Record<string, string> = {
            'FUE': 'Fuerza', 'AGI': 'Agilidad', 'CON': 'Constitución',
            'INT': 'Inteligencia', 'PER': 'Percepción', 'VOL': 'Voluntad', 'APA': 'Apariencia'
        };
        const fullKey = map[abbr];
        return char.attributes?.values?.[fullKey] || 0;
    };
    try {
        const evalFormula = formula.replace(/[A-Z]{3}/g, (match) => getVal(match).toString());
        return Math.floor(new Function('return ' + evalFormula)()) || 0;
    } catch (e) {
        return 0;
    }
};

export default function CharacterSheet({ character, totalPCs }: CharacterSheetProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [isFullScreen, setIsFullScreen] = React.useState(false);

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
        // Ensure name is preserved even if it matches default (e.g. "Nuevo Personaje"), though usually it's custom.
        // But cleanData handles diffs. If name matches default, it's removed.
        // However, we want at least validation keys.
        // Let's force some restore: upon load we merge with defaults. So it's fine.

        // Actually, if we export standard cleanData, valid keys should remain.
        // The file name relies on character.name, which works.

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
                // User cancelled or API error
                if (err.name !== 'AbortError') {
                    console.error('File Picker Error:', err);
                }
                // If specific error (not abort), fall back? 
                // Usually reasonable to just return if user aborted.
                // If it wasn't an abort error, we might want to fallback, but let's stick to abort = stop.
                // If it fails for other reasons, fallback to classic download.
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

    // CALCULATE STATS LIVE to ensure they are up to date and match PDF export
    const derivedStats = calculateDerivedStats(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills || {}
    );

    const generalSkillsData = calculateGeneralSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.generalManualMods || {},
        character.skills?.manualBases || {}
    );

    const specialSkillsData = calculateSpecialSkillValues(
        character.attributes?.values || {},
        character.origin?.items || [],
        character.skills?.learning?.selected || {},
        character.skills?.learning?.specified || {}
    );

    // Format stats for display (Live values)
    const combatStats = [
        `Acciones por asalto: ${derivedStats.combat.acciones}`,
        `Iniciativa y Reflejos: ${derivedStats.combat.iniciativa}`,
        `Puntos de Vida: ${derivedStats.combat.pv}`,
        `Equilibrio Mental: ${derivedStats.combat.equilibrio}`
    ];

    // Calculate EM for display
    const emFormula = character.spells?.emFormula || { divisor: 4, pcCost: 0 };
    // Check if character has magic access (Divisor > 0)
    if (emFormula.divisor > 0 || (character.origin?.items?.some((i: any) => i.Mago) /* Mago always has magic */)) {
        const isMago = character.origin?.items?.some((i: any) => i.Mago);
        const divisor = isMago ? 1 : emFormula.divisor;
        if (divisor > 0) {
            // Need selectedPowers for calculateEM
            const selectedPowers = character.powers?.selected || [];
            const em = calculateEM(character, selectedPowers, divisor);
            combatStats.push(`Energía Mágica: ${em}`);
        }
    }

    // Note: display logic for 'other' stats currently iterates otherStats strings. 
    // We should probably rely on derivedStats.other to ensure freshness too.
    // Mapping derivedStats.other to the string format expected by UI loop:
    const otherStats = [
        `Inconsciencia: ${derivedStats.other.inconsciencia}`,
        `Recuperación: ${derivedStats.other.recuperacion}`,
        `Resistencia a gases y venenos: ${derivedStats.other.resistenciaGases}`,
        `Modificador de fuerza: ${derivedStats.other.modFuerza}`,
        `Peso Levantado: ${derivedStats.other.pesoLevantado}`,
        `Daño absorbido físico: ${derivedStats.other.daAbsorbidoFisico}`,
        `Daño absorbido mental: ${derivedStats.other.daAbsorbidoMental}`,
        `Modificador de impacto: ${derivedStats.other.modImpacto}`,
        `Modificador Psionico: ${derivedStats.other.modPsionico}`,
        `Parada Fisica: ${derivedStats.other.paradaFisica}`,
        `Parada mental: ${derivedStats.other.paradaMental}`,
        `Salto (alto / largo): ${derivedStats.other.salto}`
    ];

    // --- PRE-CALCULATE LISTS FOR PDF (Powers, Spells, etc.) ---

    // Powers
    const powersData = (character.powers?.selected || []).map((p: any) => {
        const powerData = POWERS.find(data => data.id === p.id);
        const baseName = powerData ? powerData.name : (p.name || '');
        const displayName = p.selectedOption ? `${baseName} (${p.selectedOption})` : baseName;

        // Cost calculation logic (Moved from pdfExport)
        const isHybridPenalty = character.isParahumanoHybrid && p.origin === 'Alterado';

        const isSemidemonio = character.origin?.items?.some((item: any) =>
            Object.keys(item).some(key => {
                const val = item[key];
                return key === 'Sobrenatural' && Array.isArray(val) && val.includes('Semidemonio');
            })
        );
        const isSemidemonioBonus = isSemidemonio && p.origin === 'Sobrenatural';

        let costVal = 0;

        if (powerData) {
            let baseCost = powerData.cost || 0;

            // Semidemonio Bonus: -1 PC for Sobrenatural powers (Base cost discount)
            if (isSemidemonioBonus && !powerData.characteristic) {
                baseCost = Math.max(0, baseCost - 1);
            }

            const penalty = isHybridPenalty ? 3 : 0;

            if (!powerData.characteristic) {
                // Skill type
                const rank = p.rank || 1;
                const minVal = powerData.skillCalc ? calculateSkillBase(character.attributes?.values || {}, character.origin?.items || [], powerData.skillCalc) : 0;

                const currentVal = p.skillValue !== undefined ? p.skillValue : minVal;
                // Simplified extra cost logic from pdfExport
                const extraCost = Math.max(0, currentVal - minVal) * 0.1;
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal = baseCost + penalty + (rank * 0.1) + extraCost + custCost;
            } else {
                // Attribute type
                const powerMod = p.powerMod || 0;
                let modCost = powerMod / 10;

                if (isSemidemonioBonus) {
                    // Semidemonio Bonus for characteristic powers: 10 points free (1 PC discount equivalent)
                    modCost = Math.max(0, (powerMod - 10) / 10);
                }

                costVal = baseCost + penalty + modCost;
                // Technically custom powers shouldn't have customizations in this logic branch based on current UI,
                // but if we support it later:
                const custCost = (p.customizations || []).reduce((sum: number, c: any) => sum + (c.cost || 0), 0);
                costVal += custCost;
            }
        } else {
            costVal = p.cost || 0;
        }

        // Add customization descriptions to name/notes
        let customNotes = "";
        if (p.customizations && p.customizations.length > 0) {
            const custTexts = p.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`);
            customNotes = custTexts.join(', ');
        }

        const finalDisplayName = customNotes ? `${displayName} [${customNotes}]` : displayName;

        return {
            name: finalDisplayName,
            cost: costVal.toFixed(1),
            val: (p.skillValue !== undefined ? p.skillValue : (p.powerMod || '')).toString(),
            rank: (p.rank || '').toString(),
            notes: (p.effect || '')
        };
    });

    // Spells
    const spellsData = (character.spells?.selected || []).map((s: any) => {
        const spellDef = SPELLS.find(def => def.id === s.id);
        const maxRank = spellDef?.maxRank || 5;
        const isMaestria = s.rank === maxRank + 2;
        const baseCost = spellDef ? (parseInt(spellDef.cost, 10) || 0) : 0;
        const effectiveRank = s.rank || 1;

        const baseName = spellDef?.name || s.name || '';
        const displayName = s.selectedOption ? `${baseName} (${s.selectedOption})` : baseName;

        return {
            name: displayName,
            rank: isMaestria ? 'Maestría' : (s.rank || '').toString(),
            cost: (baseCost * effectiveRank).toString(),
            notes: spellDef?.requirements || s.effect || s.description || ''
        };
    });

    // Tech Modules
    const techData = (character.techModules?.installed || []).map((m: any) => ({
        name: m.name || m.definitionId || '',
        location: m.location || '',
        notes: m.notes || ''
    }));

    // Weapons
    const weaponsData = (character.weapons?.items || []).map((w: any) => ({
        name: w.name || '',
        damage: w.damage || '',
        dxa: w.dxa || '',
        car: w.car || '',
        notes: w.notes || w.special || ''
    }));

    // Artifacts
    const artifactsData = (character.artifacts?.items || []).map((a: any) => ({
        name: a.name || '',
        reliability: a.reliability || '',
        value: a.value || '',
        cost: a.cost || '',
        notes: a.notes || ''
    }));

    // Vehicles
    const vehiclesData = (character.vehicles?.items || []).map((v: any) => ({
        name: v.name || '',
        armor: v.armor || '',
        pe: v.pe || '',
        speed: v.speed || '',
        range: v.range || ''
    }));

    // Equipment
    const equipmentData = (character.equipment?.items || []).map((e: any) => ({
        name: e.name || '',
        notes: e.notes || ''
    }));


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
                                        const { generateCharacterSheetPDF, downloadPDF } = await import('../../utils/pdfExport');
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
                            <div className="sheet-header">
                                <h3>{character.name || "Nuevo Personaje"}</h3>
                                {character.alias && <h4 className="character-alias">"{character.alias}"</h4>}

                                <div className="header-stats">
                                    {character.level && <span className="level-badge">Nivel {character.level}</span>}
                                    {(totalPCs || character.totalCost) && (
                                        <span className="total-cost">Total PCs: {totalPCs || character.totalCost}</span>
                                    )}
                                </div>
                            </div>

                            <div className="sheet-grid">
                                {/* Combat Stats */}
                                {combatStats.length > 0 && (
                                    <div className="sheet-section combat-section">
                                        <div className="section-header">
                                            <h4>Resumen de Combate</h4>
                                        </div>
                                        <div className="combat-grid">
                                            {combatStats.map((item: string, i: number) => {
                                                const [label, value] = item.split(':').map(s => s.trim());
                                                return (
                                                    <div key={i} className="combat-stat-box">
                                                        <span className="stat-label">{label}</span>
                                                        <span className="stat-value">{value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Weapons */}
                                {character.weapons && character.weapons.items.length > 0 && (
                                    <div className="sheet-section weapons">
                                        <div className="section-header">
                                            <h4>Armas</h4>
                                        </div>
                                        <div className="preview-section-grid">
                                            {character.weapons.items.map((item: any, i: number) => (
                                                <div key={i} className="preview-card theme-weapon">
                                                    <div className="preview-card-title">{item.name}</div>
                                                    <div className="preview-stats-grid cols-2">
                                                        <div><span className="preview-stat-label">Daño:</span> {item.damage || '-'}</div>
                                                        <div><span className="preview-stat-label">DxA:</span> {item.dxa || '-'}</div>
                                                        <div><span className="preview-stat-label">CAR:</span> {item.car || '-'}</div>
                                                        {item.notes && <div className="preview-notes">{item.notes}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Artifacts */}
                                {character.artifacts && character.artifacts.items.length > 0 && (
                                    <div className="sheet-section artifacts">
                                        <div className="section-header">
                                            <h4>Artefactos</h4>
                                        </div>
                                        <div className="preview-section-grid">
                                            {character.artifacts.items.map((item: any, i: number) => (
                                                <div key={i} className="preview-card theme-artifact">
                                                    <div className="preview-card-title">{item.name}</div>
                                                    <div className="preview-stats-grid cols-3">
                                                        <div><span className="preview-stat-label">Fiabilidad:</span> {item.reliability || '-'}</div>
                                                        <div><span className="preview-stat-label">Valor:</span> {item.value || '-'}</div>
                                                        <div><span className="preview-stat-label">Coste:</span> {item.cost || '0'} PCs</div>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="preview-notes">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Magic Objects (Normal) */}
                                {character.magicObjects && character.magicObjects.items.length > 0 && (
                                    <div className="sheet-section magic-objects">
                                        <div className="section-header">
                                            <h4>Objetos Mágicos</h4>
                                        </div>
                                        <div className="preview-section-grid">
                                            {character.magicObjects.items.map((item: any, i: number) => (
                                                <div key={i} className="preview-card theme-magic">
                                                    <div className="preview-card-title">{item.name}</div>
                                                    <div className="magic-object-cost">
                                                        <span className="magic-object-cost-label">Coste EM:</span> {item.em}
                                                    </div>
                                                    <div className="magic-object-desc">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Magic Objects Table (Terrano) */}
                                {character.magicTableRolls && character.magicTableRolls.length > 0 && (
                                    <div className="sheet-section magic-objects-terrano">
                                        <div className="section-header">
                                            <h4>Tabla de Objetos (Terrano)</h4>
                                        </div>
                                        <div className="preview-section-grid">
                                            {character.magicTableRolls.map((rollId: string, i: number) => {
                                                const options = [
                                                    { id: '180_EM', label: 'Acceso a objetos de 180 EM', cost: '+1 PC' },
                                                    { id: '120_EM', label: 'Acceso a objetos de 120 EM', cost: '+0 PC' },
                                                    { id: '60_EM', label: 'Acceso a objetos de 60 EM', cost: '-1 PC' },
                                                    { id: 'none', label: 'Ningún objeto', cost: '-2 PC' },
                                                    { id: 'guardian_power', label: 'Acceso a Poder de Guardián', cost: '+2 PC' },
                                                ];
                                                const opt = options.find(o => o.id === rollId) || { label: rollId, cost: '' };

                                                return (
                                                    <div key={i} className="preview-card theme-magic-table magic-table-row">
                                                        <div className="preview-card-title magic-table-title">{opt.label}</div>
                                                        <div className="magic-table-cost">
                                                            {opt.cost}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Vehicles */}
                                {character.vehicles && character.vehicles.items.length > 0 && (
                                    <div className="sheet-section vehicles">
                                        <div className="section-header">
                                            <h4>Vehículos</h4>
                                        </div>
                                        <div className="preview-section-grid">
                                            {character.vehicles.items.map((item: any, i: number) => (
                                                <div key={i} className="preview-card theme-vehicle">
                                                    <div className="preview-card-title">{item.name}</div>
                                                    <div className="preview-stats-grid cols-2">
                                                        <div><span className="preview-stat-label">Blindaje:</span> {item.armor || '-'}</div>
                                                        <div><span className="preview-stat-label">PE:</span> {item.pe || '-'}</div>
                                                        <div><span className="preview-stat-label">Velocidad:</span> {item.speed || '-'}</div>
                                                        <div><span className="preview-stat-label">Autonomía:</span> {item.range || '-'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Origin */}
                                {character.origin && character.origin.items.length > 0 && (
                                    <div className="sheet-section origin">
                                        <div className="section-header">
                                            <h4>Origen</h4>
                                            {character.origin.cost && <span className="cost">({character.origin.cost} PCs)</span>}
                                        </div>
                                        <ul className="clean-list">
                                            {character.origin.items.map((item: any, i: number) => {
                                                const name = Object.keys(item)[0];
                                                const rawDetails = item[name] || [];
                                                const originDef = ORIGIN_CATEGORIES[name];

                                                // Build structured nodes for rendering
                                                const nodes: Array<{ text: string, type: 'default' | 'subtype' | 'normal', children?: string[] }> = [];

                                                // 1. Add Default Effects
                                                if (originDef?.defaultEffects) {
                                                    originDef.defaultEffects.forEach(eff => {
                                                        // Avoid duplicates if already in rawDetails (though unlikely for defaults)
                                                        if (!rawDetails.includes(eff)) {
                                                            nodes.push({ text: eff, type: 'default' });
                                                        }
                                                    });
                                                }

                                                // 2. Process User Details
                                                rawDetails.forEach((detail: string) => {
                                                    // Skip if already added (e.g. matched a default effect)
                                                    if (nodes.some(n => n.text === detail)) return;

                                                    // Check if it is a Subtype
                                                    if (originDef?.subtypes && originDef.subtypes[detail]) {
                                                        nodes.push({
                                                            text: detail,
                                                            type: 'subtype',
                                                            children: originDef.subtypes[detail]
                                                        });
                                                        return;
                                                    }

                                                    // Normal Item
                                                    nodes.push({ text: detail, type: 'normal' });
                                                });

                                                const renderDetailContent = (detail: string, isSubtypeHeader: boolean = false) => {
                                                    const parts = detail.includes(':') ? detail.split(':').map(s => s.trim()) : [detail];
                                                    const detailName = parts[0];
                                                    const detailValue = parts.length > 1 ? parts.slice(1).join(':') : undefined;

                                                    return (
                                                        <div className="origin-detail-row">
                                                            <span className={`origin-detail-label ${isSubtypeHeader ? 'subtype-header' : ''}`}>
                                                                {detailName}
                                                            </span>
                                                            {detailValue && (
                                                                <>
                                                                    <span className="origin-detail-dots"></span>
                                                                    <span className="origin-detail-value">
                                                                        {detailValue}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <li key={i} className="no-bullet-item origin-item">
                                                        <div className="origin-category-name">
                                                            {name}
                                                        </div>
                                                        <ul className="origin-sublist">
                                                            {nodes.map((node, j) => (
                                                                <li key={j} className={`no-bullet-item origin-detail-item ${node.type === 'subtype' ? 'subtype' : ''}`}>
                                                                    {renderDetailContent(node.text, node.type === 'subtype')}

                                                                    {/* Render Subtype Children */}
                                                                    {node.children && (
                                                                        <ul className="origin-subtype-list">
                                                                            {node.children.map((child, k) => (
                                                                                <li key={k} className="no-bullet-item mb-1" style={{ marginBottom: '0.25rem' }}>
                                                                                    {renderDetailContent(child)}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {character.isParahumanoHybrid && (
                                    hasSubtype(character, 'Parahumano', 'Thals') ||
                                    hasSubtype(character, 'Parahumano', 'Tes-khar') ||
                                    hasSubtype(character, 'Parahumano', 'Atlante')
                                ) && (
                                        <div className="sheet-section hybrid-params">
                                            <div className="section-header">
                                                <h4>Híbrido</h4>
                                            </div>
                                            <ul className="clean-list">
                                                <li className="no-bullet-item mb-2">
                                                    <div className="flex-row-baseline">
                                                        <span className="hybrid-condition-label">Condición</span>
                                                        <span className="flex-spacer-dotted"></span>
                                                        <span className="value-highlight-brown">
                                                            Híbrido con Humano
                                                        </span>
                                                    </div>
                                                    <div className="section-note">
                                                        Acceso a poderes de Alterado (+3 PC/poder)
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                {/* Ente Params */}
                                {character.enteParams && (character.enteParams.formType || character.enteParams.visualEffect) && (
                                    <div className="sheet-section ente-params">
                                        <div className="section-header">
                                            <h4>Ente</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {character.enteParams.formType && (() => {
                                                const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                                                return form && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="ente-label">Forma en el plano</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {form.label} ({form.cost > 0 ? '+' : ''}{form.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.enteParams.visualEffect && (() => {
                                                const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                                                return effect && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="ente-label">Efecto visual</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {effect.label} ({effect.cost > 0 ? '+' : ''}{effect.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* Alterado Params */}
                                {character.alteradoParams && (character.alteradoParams.agent || (character.alteradoParams.sequels && character.alteradoParams.sequels.length > 0)) && (
                                    <div className="sheet-section alterado-params">
                                        <div className="section-header">
                                            <h4>Alterado</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {/* Agent */}
                                            {character.alteradoParams.agent && (() => {
                                                const agent = ALTERADO_DATA.AGENTS.find(a => a.id === character.alteradoParams.agent);
                                                return agent && (
                                                    <li className="no-bullet-item mb-3">
                                                        <div className="flex-row-baseline">
                                                            <span className="agent-label">Agente del Cambio</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {agent.label} {agent.cost > 0 && <span className="agent-cost">(-{agent.cost} PC)</span>}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Sequels */}
                                            {character.alteradoParams.sequels && character.alteradoParams.sequels.length > 0 && (
                                                <li className="sequels-container">
                                                    <span className="sequels-header alterado">Secuelas</span>
                                                    <ul className="sequels-list alterado">
                                                        {character.alteradoParams.sequels.map((s: any, idx: number) => {
                                                            const def = SEQUELS.find(d => d.id === s.id);
                                                            if (!def) return null;
                                                            return (
                                                                <li key={idx} className="sequel-item">
                                                                    <div className="sequel-name">
                                                                        {def.label} <span className="sequel-cost alterado">(-{def.cost} PC)</span>
                                                                    </div>
                                                                    <div className="sequel-description">
                                                                        {def.description}
                                                                    </div>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Mutante Params */}
                                {character.mutanteParams && character.mutanteParams.sequels && character.mutanteParams.sequels.length > 0 && (
                                    <div className="sheet-section mutante-params">
                                        <div className="section-header">
                                            <h4>Mutante</h4>
                                        </div>
                                        <ul className="clean-list">
                                            <li className="sequels-container">
                                                <span className="sequels-header mutante">Secuelas</span>
                                                <ul className="sequels-list mutante">
                                                    {character.mutanteParams.sequels.map((s: any, idx: number) => {
                                                        const def = SEQUELS.find(d => d.id === s.id);
                                                        if (!def) return null;
                                                        return (
                                                            <li key={idx} className="sequel-item">
                                                                <div className="sequel-name">
                                                                    {def.label} <span className="sequel-cost mutante">(-{def.cost} PC)</span>
                                                                </div>
                                                                <div className="sequel-description">
                                                                    {def.description}
                                                                </div>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                )}



                                {/* Poseído Params */}
                                {character.poseidoParams && character.poseidoParams.formType && (
                                    <div className="sheet-section poseido-params">
                                        <div className="section-header">
                                            <h4>Poseído</h4>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {(() => {
                                                const form = POSEIDO_FORMS.find(f => f.id === character.poseidoParams.formType);
                                                return form && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span className="poseido-form-label">Tipo de Forma</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {form.label} ({form.pc > 0 ? '+' : ''}{form.pc} PC)
                                                            </span>
                                                        </div>
                                                        <div className="poseido-description">
                                                            {form.description}
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* Guardian Params */}
                                {character.guardianParams && (character.guardianParams.objectType || character.guardianParams.quality) && (
                                    <div className="sheet-section guardian-params">
                                        <div className="section-header">
                                            <h4>Guardián</h4>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {/* Object Type */}
                                            {character.guardianParams.objectType && (() => {
                                                const obj = GUARDIAN_OBJECTS.find(o => o.id === character.guardianParams.objectType);
                                                return obj && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="guardian-label">Objeto de Poder</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="guardian-value">{obj.label}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Quality */}
                                            {character.guardianParams.quality && (() => {
                                                const qual = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
                                                return qual && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="guardian-label">Cualidad</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="guardian-value">
                                                                {qual.label} ({qual.cost > 0 ? '+' : ''}{qual.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Feature */}
                                            {character.guardianParams.feature && (() => {
                                                const feat = GUARDIAN_FEATURES.find(f => f.id === character.guardianParams.feature);
                                                return feat && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="guardian-label">Rasgo Especial</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="guardian-value">{feat.label}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Transformation */}
                                            {character.guardianParams.transformation && (() => {
                                                const trans = GUARDIAN_TRANSFORMATIONS.find(t => t.id === character.guardianParams.transformation);
                                                return trans && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="guardian-label">Transformación</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="guardian-value">{trans.label}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* Divine Params */}
                                {character.divineParams && character.divineParams.focus && (
                                    <div className="sheet-section divine-params">
                                        <div className="section-header">
                                            <h4>Divinidad</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {(() => {
                                                const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
                                                return focus && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="divine-label">Foco del Poder</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {focus.label} ({focus.cost > 0 ? `+${focus.cost}` : '0'} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* Other Stats */}
                                {otherStats.length > 0 && (
                                    <div className="sheet-section other">
                                        <div className="section-header">
                                            <h4>Datos de Combate</h4>
                                        </div>
                                        <ul>
                                            {otherStats.map((item: string, i: number) => (
                                                <li key={i} className="no-bullet-item">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Attributes */}
                                {character.attributes && Object.keys(character.attributes.values).length > 0 && (
                                    <div className="sheet-section attributes">
                                        <div className="section-header">
                                            <h4>Características</h4>
                                            {character.attributes.cost && <span className="cost">({character.attributes.cost} PCs)</span>}
                                        </div>
                                        <div className="attr-grid">
                                            {Object.entries(character.attributes.values).map(([key, value]: [string, any]) => (
                                                <div key={key} className="attr-item">
                                                    <span className="attr-label">{key}</span>
                                                    <span className="attr-value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* General Skills */}
                                {character.skills && character.skills.generalItems && character.skills.generalItems.length > 0 && (
                                    <div className="sheet-section skills-general">
                                        <div className="section-header">
                                            <h4>Habilidades Generales</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {character.skills.generalItems.map((item: any, i: number) => (
                                                <li key={i} className="no-bullet-item skill-item">
                                                    <div className="skill-row">
                                                        <span className="skill-name">
                                                            {item.name}
                                                            {item.math && <span className="skill-math">{item.math}</span>}
                                                        </span>
                                                        <span className="skill-dots"></span>
                                                        <span className="skill-value">
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Learning Skills (Special Skills) */}
                                {character.skills && character.skills.specialItems && character.skills.specialItems.length > 0 && (
                                    <div className="sheet-section skills-learning">
                                        <div className="section-header">
                                            <h4>Habilidades de Aprendizaje</h4>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.skills.specialItems.map((item: any, i: number) => (
                                                <li key={i} className="no-bullet-item" style={{ marginBottom: '0.5rem', position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                        <span style={{ paddingRight: '0.5rem' }}>
                                                            {item.name}
                                                            {item.math && <span style={{ fontSize: '0.7em', color: '#999', marginLeft: '0.5ch', fontFamily: 'monospace' }}>{item.math}</span>}
                                                        </span>
                                                        <span style={{
                                                            flexGrow: 1,
                                                            borderBottom: '1px dotted #ccc',
                                                            margin: '0 0.5rem',
                                                            position: 'relative',
                                                            top: '-4px',
                                                            minWidth: '20px'
                                                        }}></span>
                                                        <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Ente Params */}
                                {character.enteParams && (character.enteParams.formType || character.enteParams.visualEffect) && (
                                    <div className="sheet-section ente-params">
                                        <div className="section-header">
                                            <h4>Ente</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {character.enteParams.formType && (() => {
                                                const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                                                return form && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="ente-label">Forma en el plano</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {form.label} ({form.cost > 0 ? '+' : ''}{form.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.enteParams.visualEffect && (() => {
                                                const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                                                return effect && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="ente-label">Efecto visual</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {effect.label} ({effect.cost > 0 ? '+' : ''}{effect.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* Maldito Params */}
                                {character.malditoParams && (character.malditoParams.magnitude || character.malditoParams.source) && (
                                    <div className="sheet-section maldito-params">
                                        <div className="section-header">
                                            <h4>Maldito</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {character.malditoParams.magnitude && (() => {
                                                const mag = MALDITO_DATA.MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
                                                return mag && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="maldito-label">Magnitud de la maldición</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {mag.label} ({mag.cost > 0 ? '+' : ''}{mag.cost} PC)
                                                            </span>
                                                        </div>
                                                        <div className="maldito-description">
                                                            {mag.description}
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.malditoParams.source && (() => {
                                                const src = MALDITO_DATA.SOURCE.find(s => s.id === character.malditoParams.source);
                                                return src && (
                                                    <li className="no-bullet-item mb-2">
                                                        <div className="flex-row-baseline">
                                                            <span className="maldito-label">Fuente de la maldición</span>
                                                            <span className="flex-spacer-dotted"></span>
                                                            <span className="value-highlight-brown">
                                                                {src.label}
                                                            </span>
                                                        </div>
                                                        <div className="maldito-description">
                                                            {src.description}
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                        </ul>
                                    </div>
                                )}

                                {/* History & Background Section */}
                                {(character.background?.items?.length > 0 || character.background?.economicStatus || character.background?.legalStatus || character.background?.socialStatus || character.background?.prejudiceResistance || character.profession || character.sexualIdentity) && (
                                    <div className="sheet-section background">
                                        <div className="section-header">
                                            <h4>Historial</h4>
                                        </div>

                                        <div className="background-col-layout">

                                            {/* Status Grid */}
                                            {(character.background?.economicStatus || character.background?.legalStatus || character.background?.socialStatus || character.background?.friendsAndAssociates || character.profession || character.sexualIdentity) && (
                                                <div className="background-grid">
                                                    {character.profession && (
                                                        <div>
                                                            <span className="background-label">PROFESIÓN</span>
                                                            <span className="background-value">{character.profession}</span>
                                                        </div>
                                                    )}
                                                    {character.sexualIdentity && (
                                                        <div>
                                                            <span className="background-label">IDENTIDAD SEXUAL</span>
                                                            <span className="background-value">{character.sexualIdentity}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.economicStatus && (
                                                        <div>
                                                            <span className="background-label">POSICIÓN ECONÓMICA</span>
                                                            <span className="background-value">{ECONOMIC_STATUS.find(e => e.id === character.background.economicStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.legalStatus && (
                                                        <div>
                                                            <span className="background-label">SITUACIÓN LEGAL</span>
                                                            <span className="background-value">{LEGAL_STATUS.find(l => l.id === character.background.legalStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.socialStatus && (
                                                        <div>
                                                            <span className="background-label">POSICIÓN SOCIAL</span>
                                                            <span className="background-value">{SOCIAL_STATUS.find(s => s.id === character.background.socialStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.friendsAndAssociates && (
                                                        <div>
                                                            <span className="background-label">AMISTADES Y ALLEGADOS</span>
                                                            <span className="background-value">{FRIENDS_AND_ASSOCIATES.find(f => f.id === character.background.friendsAndAssociates)?.label}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Background Items */}
                                            {character.background?.items?.length > 0 && (
                                                <div>
                                                    <span className="bg-notes-label">NOTAS DE TRASFONDO</span>
                                                    <ul className="bg-notes-list">
                                                        {character.background.items.map((item: string, i: number) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Prejudice Resistance */}
                                            {character.background?.prejudiceResistance && (
                                                <div className="prejudice-container">
                                                    <div>
                                                        <span className="prejudice-label">RESISTENCIA A PREJUICIOS</span>
                                                        <span className="prejudice-value">{character.background.prejudiceResistance}%</span>
                                                    </div>
                                                    <span className="prejudice-cost">
                                                        ({((character.background.prejudiceResistance - 50) * 0.1).toFixed(1)} PCs)
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Equipment */}
                                {character.equipment && character.equipment.items.length > 0 && (
                                    <div className="sheet-section equipment">
                                        <div className="section-header">
                                            <h4>Equipamiento</h4>
                                            {character.equipment.cost && <span className="cost">({character.equipment.cost} PCs)</span>}
                                        </div>
                                        <ul>
                                            {character.equipment.items.map((item: any, i: number) => (
                                                <li key={i}>
                                                    <strong>{item.name}</strong>
                                                    {item.notes && <span>: {item.notes}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Tech Modules */}
                                {character.techModules && character.techModules.length > 0 && (
                                    <div className="sheet-section tech-modules">
                                        <div className="section-header">
                                            <h4>Módulos Tecnológicos</h4>
                                            {/* Calculate total cost just for display if needed, though usually included in global total */}
                                            <span className="cost">
                                                ({character.techModules.reduce((acc: number, m: any) => acc + (m.pcCost || 0), 0)} PCs)
                                            </span>
                                        </div>
                                        <ul className="no-bullets-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.techModules.map((module: any, idx: number) => {
                                                const definition = TECH_MODULES.find(d => d.id === module.definitionId);
                                                const type = definition?.type || 'General';

                                                return (
                                                    <li key={`${module.id}-${idx}`} className="tech-module-item">
                                                        <div className="tech-module-row">
                                                            <span className="tech-module-name">{module.name}</span>

                                                            <span className={`tech-type-tag ${type === 'Mejora Interna' ? 'tech-type-internal' : 'tech-type-external'}`}>
                                                                {type}
                                                            </span>

                                                            <div style={{ flexGrow: 1 }}></div>

                                                            {module.location && (
                                                                <span className="tech-location">
                                                                    {module.location}
                                                                </span>
                                                            )}

                                                            <span className="tech-cost">
                                                                {module.pcCost} PC
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Exoskeleton Energy Configuration */}
                                {character.exoskeletonConfig && (() => {
                                    const config = EXOSKELETON_CONFIGS.find(c => c.id === character.exoskeletonConfig);
                                    if (!config) return null;

                                    return (
                                        <div className="sheet-section exoskeleton">
                                            <div className="section-header">
                                                <h4>Exoesqueleto (Energía)</h4>
                                                <span className="cost">({config.pcCost} PCs)</span>
                                            </div>
                                            <div className="exoskeleton-grid">
                                                <div className="exoskeleton-card">
                                                    <div className="exoskeleton-header">
                                                        {config.label}
                                                    </div>
                                                    <div className="exoskeleton-stats">
                                                        <div className="exoskeleton-stat-item">
                                                            <span className="exoskeleton-stat-label">Puntos de Vida</span>
                                                            <span className="exoskeleton-stat-value">{config.pv}</span>
                                                        </div>
                                                        <div className="exoskeleton-stat-item">
                                                            <span className="exoskeleton-stat-label">D.A. Físico</span>
                                                            <span className="exoskeleton-stat-value mono">
                                                                {config.daCinetico}/{config.daEnergia}
                                                            </span>
                                                        </div>
                                                        <div className="exoskeleton-stat-item">
                                                            <span className="exoskeleton-stat-label">Regeneración</span>
                                                            <span className="exoskeleton-stat-value">{config.regeneracion} PV/h</span>
                                                        </div>
                                                        <div className="exoskeleton-stat-item">
                                                            <span className="exoskeleton-stat-label">Emisión</span>
                                                            <span className="exoskeleton-stat-value highlight">{config.emision}</span>
                                                        </div>
                                                        <div className="exoskeleton-stat-item">
                                                            <span className="exoskeleton-stat-label">Velocidad</span>
                                                            <span className="exoskeleton-stat-value">{config.velocidad} Mach</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Exoskeleton Armor & Strength (Tecnoarmadura/Tecnovehiculo) */}
                                {(character.exoskeletonArmorConfig || character.technoSuitStrengthConfig) && (
                                    <div className="sheet-section tech-armor-strength">
                                        <div className="section-header">
                                            <h4>Tecnificado</h4>
                                            {(() => {
                                                let cost = 0;
                                                if (character.exoskeletonArmorConfig) {
                                                    const armor = EXOSKELETON_ARMOR_CONFIGS.find(c => c.id === character.exoskeletonArmorConfig);
                                                    if (armor) cost += armor.pcCost;
                                                }
                                                if (character.technoSuitStrengthConfig) {
                                                    const str = TECHNOSUIT_STRENGTH_CONFIGS.find(c => c.id === character.technoSuitStrengthConfig);
                                                    if (str) cost += str.pcCost;
                                                }
                                                return <span className="cost">({cost} PCs)</span>;
                                            })()}
                                        </div>
                                        <div className="tech-container">

                                            {/* Armor / Structure */}
                                            {character.exoskeletonArmorConfig && (() => {
                                                const config = EXOSKELETON_ARMOR_CONFIGS.find(c => c.id === character.exoskeletonArmorConfig);
                                                if (!config) return null;
                                                return (
                                                    <div className="tech-card">
                                                        <div className="tech-card-header">
                                                            Exoesqueleto / Estructura
                                                        </div>
                                                        <div className="tech-card-stats">
                                                            <div className="tech-stat-row">
                                                                <span className="tech-stat-label">Puntos de Vida</span>
                                                                <span className="tech-stat-value">{config.pv}</span>
                                                            </div>
                                                            <div className="tech-stat-row">
                                                                <span className="tech-stat-label">D.A. Físico</span>
                                                                <span className="tech-stat-value">{config.daFisico}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Techno-Suit Strength */}
                                            {character.technoSuitStrengthConfig && (() => {
                                                const config = TECHNOSUIT_STRENGTH_CONFIGS.find(c => c.id === character.technoSuitStrengthConfig);
                                                if (!config) return null;
                                                return (
                                                    <div className="tech-card">
                                                        <div className="tech-card-header">
                                                            Fuerza
                                                        </div>
                                                        <div className="tech-card-stats">
                                                            <div className="tech-stat-row">
                                                                <span className="tech-stat-label">Fuerza Tecnoarmadura</span>
                                                                <span className="tech-stat-value">{config.fuerza}</span>
                                                            </div>
                                                            {config.fiabilidad && (
                                                                <div className="tech-stat-row">
                                                                    <span className="tech-stat-label">Fiabilidad</span>
                                                                    <span className="tech-stat-value alert">{config.fiabilidad}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* Cyborg Implants */}
                                            {character.cyborgImplants && character.cyborgImplants.length > 0 && (
                                                <div className="cyborg-container">
                                                    <div className="tech-card-header">
                                                        Implantes Cibernéticos
                                                    </div>
                                                    <div className="tech-card-stats">
                                                        {character.cyborgImplants.map((implant: any) => {
                                                            const stat = CYBORG_IMPLANT_STATS.find(s => s.id === implant.statConfigId);
                                                            const str = CYBORG_IMPLANT_STRENGTHS.find(s => s.id === implant.strengthConfigId);
                                                            return (
                                                                <div key={implant.id} className="cyborg-item">
                                                                    <div>
                                                                        <span className="cyborg-name">{implant.name}</span>
                                                                        <div className="cyborg-details">
                                                                            {stat && `PV +${stat.pvBonus} / DA ${stat.daFisico}`}
                                                                            {str && str.pcCost > 0 && ` • FUE ${str.fuerza}`}
                                                                        </div>
                                                                    </div>
                                                                    {/* Sum cost of stat + strength */}
                                                                    {(stat || str) && (
                                                                        <div style={{ textAlign: 'right' }}>
                                                                            <span className="cyborg-cost">
                                                                                {((stat?.pcCost || 0) + (str?.pcCost || 0))} PC
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Powers / Poderes Especiales */}
                                {character.powers?.selected && character.powers.selected.length > 0 && (
                                    <div className="sheet-section powers">
                                        <div className="section-header">
                                            <h4>Poderes</h4>
                                        </div>
                                        <ul className="no-bullets-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.powers.selected.map((power: any, idx: number) => {
                                                const powerData = POWERS.find(p => p.id === power.id);
                                                if (!powerData) return null;

                                                const getRankLevel = (rank: number) => {
                                                    if (rank <= 20) return 'Bajo';
                                                    if (rank <= 40) return 'Medio';
                                                    if (rank <= 70) return 'Elevado';
                                                    if (rank <= 95) return 'Alto';
                                                    return 'Cósmico';
                                                };

                                                return (
                                                    <li key={`${power.id}-${idx}`} className="power-item">

                                                        <div className="power-row">
                                                            <span className="power-name-container">
                                                                <span className="power-name">
                                                                    {powerData.name}
                                                                    {power.selectedOption && (
                                                                        <span className="power-option">
                                                                            ({power.selectedOption})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {power.customizations && power.customizations.length > 0 && (
                                                                    <div className="power-customizations">
                                                                        {power.customizations.map((c: any) => `${c.description} (${c.cost > 0 ? '+' : ''}${c.cost})`).join(', ')}
                                                                    </div>
                                                                )}
                                                            </span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span className="power-rank">
                                                                {!powerData.characteristic ? (
                                                                    <>
                                                                        {getRankLevel(power.rank)} <span className="power-rank-value">({power.rank})</span>
                                                                    </>
                                                                ) : (
                                                                    <>Mod: +{power.powerMod || 0}</>
                                                                )}
                                                            </span>
                                                            {powerData.skillCalc && (
                                                                <span className="power-skill-value">
                                                                    {power.skillValue || calculatePowerSkillBase(character, powerData.skillCalc)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Spells / Artes Mágicas */}
                                {character.spells?.selected && character.spells.selected.length > 0 && (
                                    <div className="sheet-section spells">
                                        <div className="section-header">
                                            <h4>Hechizos</h4>
                                            {(() => {
                                                // 1. Try to use stored value
                                                if (character.spells?.calculatedEM !== undefined) {
                                                    return (
                                                        <span className="cost spells-em-cost">
                                                            ({character.spells.calculatedEM} EM)
                                                        </span>
                                                    );
                                                }

                                                // 2. Fallback: Calculate Base EM
                                                const isMago = hasSubtype(character, 'Arcano', 'Mago');
                                                // Default to 4 if not set, unless Mago (1)
                                                let divisor = character.spells?.emFormula?.divisor || 4;
                                                if (isMago) divisor = 1;

                                                if (divisor === 0) return null;

                                                const calculatedEM = calculateEM(character, character.powers?.selected || [], divisor);

                                                return (
                                                    <span className="cost spells-em-cost">
                                                        ({calculatedEM} EM)
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <ul className="no-bullets-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.spells.selected.map((spell: any, idx: number) => {
                                                const spellData = SPELLS.find(s => s.id === spell.id);
                                                if (!spellData) return null;

                                                const maxRank = spellData.maxRank || 1;
                                                const rankDisplay = spell.rank > maxRank
                                                    ? `Maestría (${spell.rank})`
                                                    : `Rango ${spell.rank}`;

                                                return (
                                                    <li key={`${spell.id}-${idx}`} className="spell-item">
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span className="spell-name">
                                                                {spellData.name}
                                                                {spell.selectedOption && (
                                                                    <span className="spell-option">
                                                                        ({spell.selectedOption})
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span className={`spell-rank ${spell.rank > maxRank ? 'master' : 'normal'}`}>
                                                                {rankDisplay}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                {/* Magical Bonds */}
                                {(character.magicalBonds?.length > 0 || character.magicalBondsCustomName || character.magicalBondsCustom) && (
                                    <div className="sheet-section magical-bonds">
                                        <div className="section-header">
                                            <h4>Vinculaciones Mágicas</h4>
                                        </div>
                                        <ul className="clean-list">
                                            {character.magicalBonds?.map((bondId: string, idx: number) => {
                                                const bond = MAGICAL_BONDS.find(b => b.id === bondId);
                                                if (!bond) return null;
                                                return (
                                                    <li key={bondId} className="magical-bond-item">
                                                        <span className="magical-bond-title">{bond.name}</span>
                                                        <span className="magical-bond-desc">
                                                            {bond.description}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                            {/* New Custom Bond Structure */}
                                            {character.magicalBondsCustomName && (
                                                <li className="magical-bond-item">
                                                    <span className="magical-bond-title">
                                                        {character.magicalBondsCustomName} <span className="text-xs-gray">(Personalizada)</span>
                                                    </span>
                                                    <span className="magical-bond-desc">
                                                        {character.magicalBondsCustomDescription}
                                                    </span>
                                                </li>
                                            )}
                                            {/* Legacy Custom Bond (Fallback) */}
                                            {!character.magicalBondsCustomName && character.magicalBondsCustom && (
                                                <li className="magical-bond-item" style={{ marginTop: '0.5rem' }}>
                                                    <span className="magical-bond-title">Vinculación Personalizada</span>
                                                    <span className="magical-bond-desc-italic">
                                                        "{character.magicalBondsCustom}"
                                                    </span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Traumas (Vigilante) */}
                                {character.traumas && Object.keys(character.traumas).length > 0 && (
                                    <div className="sheet-section traumas">
                                        <div className="section-header">
                                            <h4>Traumas</h4>
                                        </div>
                                        <ul className="no-bullets-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {Object.entries(character.traumas).map(([specialty, trauma]: [string, any], idx: number) => (
                                                <li key={idx} className="trauma-item">
                                                    <div className="trauma-header">
                                                        {specialty}
                                                    </div>
                                                    <div className="trauma-description">
                                                        "{trauma}"
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Notes */}
                                {character.notes && (
                                    <div className="sheet-section notes">
                                        <div className="section-header">
                                            <h4>Notas y Descripción</h4>
                                        </div>
                                        <div className="notes-content">
                                            {character.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </dialog >
        </>
    );
}
