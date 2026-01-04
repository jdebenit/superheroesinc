import React, { useRef, useEffect } from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../data/backgroundTables';
import { SPELLS } from '../../data/spells';
import { POWERS } from '../../data/powers';

import { TECH_MODULES } from '../../data/techModules';
import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';
import { MAGICAL_BONDS } from '../../data/magicalBonds';
import { EXOSKELETON_CONFIGS } from '../../data/exoskeletonConfigs';
import { ENTE_FORMS, ENTE_EFFECTS } from './steps/Step3_Especials/sections/EnteSection';
import { MALDITO_DATA } from './steps/Step3_Especials/sections/MalditoSection';
import { ALTERADO_DATA } from './steps/Step3_Especials/sections/AlteradoSection';
import { SEQUELS } from '../../data/sequels';
import { INCOME_SOURCES } from '../../data/technologicalOptions';

import { calculateEM, hasSubtype } from './steps/Step3_Especials/utils';
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

interface CharacterPreviewProps {
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

export default function CharacterPreview({ character, totalPCs }: CharacterPreviewProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openModal = () => {
        dialogRef.current?.showModal();
    };

    const closeModal = () => {
        dialogRef.current?.close();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(character, null, 2));
        alert("JSON copiado al portapapeles!");
    };

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${character.name.toLowerCase().replace(/\s+/g, '-')}.json`);
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
        let costVal = 0;

        if (powerData) {
            const baseCost = powerData.cost || 0;
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
                costVal = baseCost + penalty + (powerMod / 10);
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
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px #1e40af, 0 15px 30px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px #1e40af, 0 10px 20px rgba(37, 99, 235, 0.3)';
                }}
            >
                📋 Previsualizar Ficha
            </button>

            <dialog ref={dialogRef} className="character-dialog">
                <div className="dialog-content">
                    <div className="dialog-header">
                        <div className="header-info">
                            <span className="dialog-title">{character.name || "Nuevo Personaje"}</span>
                        </div>
                        <div className="dialog-actions">
                            <button onClick={copyToClipboard} className="action-btn" title="Copiar JSON">
                                📋
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
                                {character.alias && <h4 style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '1.25rem', fontStyle: 'italic' }}>"{character.alias}"</h4>}

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
                                        <div className="weapons-grid" style={{ display: 'grid', gap: '0.5rem' }}>
                                            {character.weapons.items.map((item: any, i: number) => (
                                                <div key={i} className="weapon-item" style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>{item.name}</div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                        <div><span style={{ fontWeight: 'bold' }}>Daño:</span> {item.damage || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>DxA:</span> {item.dxa || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>CAR:</span> {item.car || '-'}</div>
                                                        {item.notes && <div style={{ gridColumn: '1 / -1', color: '#666', fontStyle: 'italic' }}>{item.notes}</div>}
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
                                        <div className="artifacts-grid" style={{ display: 'grid', gap: '0.5rem' }}>
                                            {character.artifacts.items.map((item: any, i: number) => (
                                                <div key={i} className="artifact-item" style={{ padding: '0.75rem', backgroundColor: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '6px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.5rem' }}>{item.name}</div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                        <div><span style={{ fontWeight: 'bold' }}>Fiabilidad:</span> {item.reliability || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>Valor:</span> {item.value || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>Coste:</span> {item.cost || '0'} PCs</div>
                                                    </div>
                                                    {item.notes && (
                                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
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
                                        <div className="magic-objects-grid" style={{ display: 'grid', gap: '0.5rem' }}>
                                            {character.magicObjects.items.map((item: any, i: number) => (
                                                <div key={i} className="magic-object-item" style={{ padding: '0.75rem', backgroundColor: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '6px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#9333ea', marginBottom: '0.5rem' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Coste EM:</span> {item.em}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
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
                                        <div className="magic-table-grid" style={{ display: 'grid', gap: '0.5rem' }}>
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
                                                    <div key={i} className="magic-table-item" style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#0369a1' }}>{opt.label}</div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: 'white', padding: '2px 8px', borderRadius: '4px', color: '#0284c7' }}>
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
                                        <div className="vehicles-grid" style={{ display: 'grid', gap: '0.5rem' }}>
                                            {character.vehicles.items.map((item: any, i: number) => (
                                                <div key={i} className="vehicle-item" style={{ padding: '0.75rem', backgroundColor: '#ecfeff', border: '1px solid #cffafe', borderRadius: '6px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#0891b2', marginBottom: '0.5rem' }}>{item.name}</div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                        <div><span style={{ fontWeight: 'bold' }}>Blindaje:</span> {item.armor || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>PE:</span> {item.pe || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>Velocidad:</span> {item.speed || '-'}</div>
                                                        <div><span style={{ fontWeight: 'bold' }}>Autonomía:</span> {item.range || '-'}</div>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{
                                                                paddingRight: '0.5rem',
                                                                fontWeight: isSubtypeHeader ? 'bold' : 'normal',
                                                                color: isSubtypeHeader ? '#b91c1c' : 'inherit',
                                                                fontSize: isSubtypeHeader ? '1rem' : 'inherit'
                                                            }}>
                                                                {detailName}
                                                            </span>
                                                            {detailValue && (
                                                                <>
                                                                    <span style={{
                                                                        flexGrow: 1,
                                                                        borderBottom: '1px dotted #ccc',
                                                                        margin: '0 0.5rem',
                                                                        position: 'relative',
                                                                        top: '-4px',
                                                                        minWidth: '20px'
                                                                    }}></span>
                                                                    <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                        {detailValue}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                };

                                                return (
                                                    <li key={i} className="no-bullet-item" style={{ marginBottom: '0.75rem' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#8B4513', marginBottom: '0.25rem' }}>
                                                            {name}
                                                        </div>
                                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                            {nodes.map((node, j) => (
                                                                <li key={j} className="no-bullet-item" style={{
                                                                    marginBottom: '0.25rem',
                                                                    marginTop: node.type === 'subtype' ? '0.5rem' : '0',
                                                                    position: 'relative'
                                                                }}>
                                                                    {renderDetailContent(node.text, node.type === 'subtype')}

                                                                    {/* Render Subtype Children */}
                                                                    {node.children && (
                                                                        <ul style={{
                                                                            listStyle: 'none',
                                                                            padding: 0,
                                                                            margin: '0.25rem 0 0.5rem 0',
                                                                            borderLeft: '2px solid #fee2e2',
                                                                            paddingLeft: '0.75rem'
                                                                        }}>
                                                                            {node.children.map((child, k) => (
                                                                                <li key={k} className="no-bullet-item" style={{ marginBottom: '0.25rem' }}>
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

                                {/* Ente Params */}
                                {character.enteParams && (character.enteParams.formType || character.enteParams.visualEffect) && (
                                    <div className="sheet-section ente-params">
                                        <div className="section-header">
                                            <h4>Ente</h4>
                                        </div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.enteParams.formType && (() => {
                                                const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                                                return form && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#7e22ce' }}>Forma en el plano</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {form.label} ({form.cost > 0 ? '+' : ''}{form.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.enteParams.visualEffect && (() => {
                                                const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                                                return effect && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#7e22ce' }}>Efecto visual</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.malditoParams.magnitude && (() => {
                                                const mag = MALDITO_DATA.MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
                                                return mag && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#c2410c' }}>Magnitud de la maldición</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {mag.label} ({mag.cost > 0 ? '+' : ''}{mag.cost} PC)
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                                                            {mag.description}
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.malditoParams.source && (() => {
                                                const src = MALDITO_DATA.SOURCE.find(s => s.id === character.malditoParams.source);
                                                return src && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#c2410c' }}>Fuente de la maldición</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {src.label}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                                                            {src.description}
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {/* Agent */}
                                            {character.alteradoParams.agent && (() => {
                                                const agent = ALTERADO_DATA.AGENTS.find(a => a.id === character.alteradoParams.agent);
                                                return agent && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#15803d' }}>Agente del Cambio</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {agent.label} {agent.cost > 0 && <span style={{ color: '#16a34a' }}>(-{agent.cost} PC)</span>}
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Sequels */}
                                            {character.alteradoParams.sequels && character.alteradoParams.sequels.length > 0 && (
                                                <li style={{ marginTop: '0.5rem' }}>
                                                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#15803d', fontWeight: 'bold', marginBottom: '0.25rem' }}>Secuelas</span>
                                                    <ul style={{ paddingLeft: '0.5rem', margin: 0, listStyle: 'none', borderLeft: '2px solid #bbf7d0' }}>
                                                        {character.alteradoParams.sequels.map((s: any, idx: number) => {
                                                            const def = SEQUELS.find(d => d.id === s.id);
                                                            if (!def) return null;
                                                            return (
                                                                <li key={idx} style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem' }}>
                                                                        {def.label} <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>(-{def.cost} PC)</span>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ marginTop: '0.5rem' }}>
                                                <span style={{ display: 'block', fontSize: '0.9rem', color: '#86198f', fontWeight: 'bold', marginBottom: '0.25rem' }}>Secuelas</span>
                                                <ul style={{ paddingLeft: '0.5rem', margin: 0, listStyle: 'none', borderLeft: '2px solid #e879f9' }}>
                                                    {character.mutanteParams.sequels.map((s: any, idx: number) => {
                                                        const def = SEQUELS.find(d => d.id === s.id);
                                                        if (!def) return null;
                                                        return (
                                                            <li key={idx} style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                                                                <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem' }}>
                                                                    {def.label} <span style={{ color: '#c026d3', fontSize: '0.85rem' }}>(-{def.cost} PC)</span>
                                                                </div>
                                                                <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
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
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#1e40af' }}>Objeto de Poder</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>{obj.label}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Quality */}
                                            {character.guardianParams.quality && (() => {
                                                const qual = GUARDIAN_QUALITIES.find(q => q.id === character.guardianParams.quality);
                                                return qual && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#1e40af' }}>Cualidad</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
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
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#1e40af' }}>Rasgo Especial</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>{feat.label}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}

                                            {/* Transformation */}
                                            {character.guardianParams.transformation && (() => {
                                                const trans = GUARDIAN_TRANSFORMATIONS.find(t => t.id === character.guardianParams.transformation);
                                                return trans && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#1e40af' }}>Transformación</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>{trans.label}</span>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {(() => {
                                                const focus = DIVINE_FOCUS_OPTIONS.find(f => f.id === character.divineParams.focus);
                                                return focus && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#b45309' }}>Foco del Poder</span>
                                                            <span style={{ flexGrow: 1, borderBottom: '1px dotted #ccc', margin: '0 0.5rem', position: 'relative', top: '-4px', minWidth: '20px' }}></span>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.skills.generalItems.map((item: any, i: number) => (
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.enteParams.formType && (() => {
                                                const form = ENTE_FORMS.find(f => f.id === character.enteParams.formType);
                                                return form && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#7e22ce' }}>Forma en el plano</span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {form.label} ({form.cost > 0 ? '+' : ''}{form.cost} PC)
                                                            </span>
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.enteParams.visualEffect && (() => {
                                                const effect = ENTE_EFFECTS.find(e => e.id === character.enteParams.visualEffect);
                                                return effect && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#7e22ce' }}>Efecto visual</span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
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
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.malditoParams.magnitude && (() => {
                                                const mag = MALDITO_DATA.MAGNITUDE.find(m => m.id === character.malditoParams.magnitude);
                                                return mag && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#c2410c' }}>Magnitud de la maldición</span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {mag.label} ({mag.cost > 0 ? '+' : ''}{mag.cost} PC)
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                                                            {mag.description}
                                                        </div>
                                                    </li>
                                                );
                                            })()}
                                            {character.malditoParams.source && (() => {
                                                const src = MALDITO_DATA.SOURCE.find(s => s.id === character.malditoParams.source);
                                                return src && (
                                                    <li className="no-bullet-item" style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ paddingRight: '0.5rem', fontWeight: 'bold', color: '#c2410c' }}>Fuente de la maldición</span>
                                                            <span style={{
                                                                flexGrow: 1,
                                                                borderBottom: '1px dotted #ccc',
                                                                margin: '0 0.5rem',
                                                                position: 'relative',
                                                                top: '-4px',
                                                                minWidth: '20px'
                                                            }}></span>
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap' }}>
                                                                {src.label}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
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

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                            {/* Status Grid */}
                                            {(character.background?.economicStatus || character.background?.legalStatus || character.background?.socialStatus || character.background?.friendsAndAssociates || character.profession || character.sexualIdentity) && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                                                    {character.profession && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>PROFESIÓN</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{character.profession}</span>
                                                        </div>
                                                    )}
                                                    {character.sexualIdentity && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>IDENTIDAD SEXUAL</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{character.sexualIdentity}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.economicStatus && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>POSICIÓN ECONÓMICA</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{ECONOMIC_STATUS.find(e => e.id === character.background.economicStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.legalStatus && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>SITUACIÓN LEGAL</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{LEGAL_STATUS.find(l => l.id === character.background.legalStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.socialStatus && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>POSICIÓN SOCIAL</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{SOCIAL_STATUS.find(s => s.id === character.background.socialStatus)?.label}</span>
                                                        </div>
                                                    )}
                                                    {character.background?.friendsAndAssociates && (
                                                        <div>
                                                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>AMISTADES Y ALLEGADOS</span>
                                                            <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{FRIENDS_AND_ASSOCIATES.find(f => f.id === character.background.friendsAndAssociates)?.label}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Background Items */}
                                            {character.background?.items?.length > 0 && (
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '0.5rem' }}>NOTAS DE TRASFONDO</span>
                                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#374151', fontSize: '0.9rem' }}>
                                                        {character.background.items.map((item: string, i: number) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Prejudice Resistance */}
                                            {character.background?.prejudiceResistance && (
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: '#eff6ff',
                                                    padding: '0.75rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#1e40af', fontWeight: 'bold' }}>RESISTENCIA A PREJUICIOS</span>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a' }}>{character.background.prejudiceResistance}%</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>
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
                                                    <li key={`${module.id}-${idx}`} style={{
                                                        listStyle: 'none',
                                                        marginBottom: '0.75rem',
                                                        borderBottom: '1px solid #e5e7eb',
                                                        paddingBottom: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '0.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{module.name}</span>

                                                            <span className="type-tag" style={{
                                                                fontSize: '0.7rem',
                                                                padding: '0.2rem 0.5rem',
                                                                borderRadius: '12px',
                                                                fontWeight: 600,
                                                                border: type === 'Mejora Interna' ? '1px solid #fbcfe8' : '1px solid #90caf9',
                                                                background: type === 'Mejora Interna' ? '#fce7f3' : '#e3f2fd',
                                                                color: type === 'Mejora Interna' ? '#be123c' : '#1565c0',
                                                            }}>
                                                                {type}
                                                            </span>

                                                            <div style={{ flexGrow: 1 }}></div>

                                                            {module.location && (
                                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic', marginRight: '0.5rem' }}>
                                                                    {module.location}
                                                                </span>
                                                            )}

                                                            <span style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '0.875rem' }}>
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
                                                <h4>Exoesqueleto Energético</h4>
                                                <span className="cost">({config.pcCost} PCs)</span>
                                            </div>
                                            <div style={{
                                                backgroundColor: '#f8fafc',
                                                border: '2px solid #cbd5e1',
                                                borderRadius: '8px',
                                                padding: '1rem'
                                            }}>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                                    gap: '0.75rem'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Fuerza</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{config.fue}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Puntos de Vida</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{config.pv}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>D.A. Físico</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>
                                                            {config.daCinetico}/{config.daEnergia}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Regeneración</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{config.regeneracion} PV/h</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Emisión</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#7c3aed', fontFamily: 'monospace' }}>{config.emision}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Velocidad</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{config.velocidad} Mach</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

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
                                                    <li key={`${power.id}-${idx}`} style={{
                                                        listStyle: 'none',
                                                        marginBottom: '0.75rem',
                                                        borderBottom: '1px solid #e5e7eb',
                                                        paddingBottom: '0.5rem'
                                                    }}>

                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%', marginBottom: '0.25rem' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: 'bold', color: '#059669' }}>
                                                                    {powerData.name}
                                                                    {power.selectedOption && (
                                                                        <span style={{ fontWeight: 'normal', color: '#047857', fontSize: '0.9em', marginLeft: '0.25rem' }}>
                                                                            ({power.selectedOption})
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                {power.customizations && power.customizations.length > 0 && (
                                                                    <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.1rem', fontStyle: 'italic' }}>
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
                                                            <span style={{ fontWeight: 'bold', color: '#8B4513', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                                                                {!powerData.characteristic ? (
                                                                    <>
                                                                        {getRankLevel(power.rank)} <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({power.rank})</span>
                                                                    </>
                                                                ) : (
                                                                    <>Mod: +{power.powerMod || 0}</>
                                                                )}
                                                            </span>
                                                            {powerData.skillCalc && (
                                                                <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '500', marginLeft: '0.5rem' }}>
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
                                                        <span className="cost" style={{ color: '#4f46e5', fontWeight: 'bold' }}>
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
                                                    <span className="cost" style={{ color: '#4f46e5', fontWeight: 'bold' }}>
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
                                                    <li key={`${spell.id}-${idx}`} style={{
                                                        listStyle: 'none',
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', width: '100%' }}>
                                                            <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                                                                {spellData.name}
                                                                {spell.selectedOption && (
                                                                    <span style={{ fontWeight: 'normal', color: '#4338ca', fontSize: '0.9em', marginLeft: '0.25rem' }}>
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
                                                            <span style={{
                                                                fontSize: '0.875rem',
                                                                color: spell.rank > maxRank ? '#a855f7' : '#8B4513',
                                                                fontWeight: spell.rank > maxRank ? 'bold' : 'normal',
                                                                whiteSpace: 'nowrap'
                                                            }}>
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
                                        <ul className="no-bullets-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {character.magicalBonds?.map((bondId: string, idx: number) => {
                                                const bond = MAGICAL_BONDS.find(b => b.id === bondId);
                                                if (!bond) return null;
                                                return (
                                                    <li key={bondId} style={{ marginBottom: '0.75rem', borderBottom: '1px solid #f3e8ff', paddingBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#6b21a8', display: 'block' }}>{bond.name}</span>
                                                        <span style={{ display: 'block', fontSize: '0.9rem', color: '#4b5563' }}>
                                                            {bond.description}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                            {/* New Custom Bond Structure */}
                                            {character.magicalBondsCustomName && (
                                                <li style={{ marginBottom: '0.75rem', borderBottom: '1px solid #f3e8ff', paddingBottom: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#6b21a8', display: 'block' }}>
                                                        {character.magicalBondsCustomName} <span className="text-xs text-gray-400 font-normal uppercase ml-2">(Personalizada)</span>
                                                    </span>
                                                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#4b5563' }}>
                                                        {character.magicalBondsCustomDescription}
                                                    </span>
                                                </li>
                                            )}
                                            {/* Legacy Custom Bond (Fallback) */}
                                            {!character.magicalBondsCustomName && character.magicalBondsCustom && (
                                                <li style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#6b21a8', display: 'block' }}>Vinculación Personalizada</span>
                                                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#4b5563', fontStyle: 'italic' }}>
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
                                                <li key={idx} style={{ marginBottom: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#991b1b', textTransform: 'uppercase', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                                        {specialty}
                                                    </div>
                                                    <div style={{ fontStyle: 'italic', color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.4', paddingLeft: '0.5rem', borderLeft: '3px solid #fee2e2' }}>
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
                                        <div style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {character.notes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Force remove bullets and ALL spacing from specific lists */
                    .no-bullets-list, .no-bullets-list li {
                        list-style-type: none !important;
                        list-style: none !important;
                        padding-left: 0 !important;
                        margin-left: 0 !important;
                        padding-inline-start: 0 !important;
                    }
                    .no-bullets-list li::before {
                        content: none !important;
                        display: none !important;
                    }
                    
                    .character-dialog {
                        padding: 0;
                        border: none;
                        border-radius: 12px;
                        background: transparent;
                        max-width: 90vw;
                        max-height: 90vh;
                        width: 1000px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                        text-align: left;
                    }
                    .character-dialog::backdrop {
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(3px);
                    }
                    .dialog-content {
                        background: #f9f7f1;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        max-height: 90vh;
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .dialog-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem 1.5rem;
                        background: white;
                        border-bottom: 2px solid #8B4513;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }
                    .dialog-actions {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;
                    }
                    .action-btn {
                        background: none;
                        border: none;
                        font-size: 1.2rem;
                        cursor: pointer;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .action-btn:hover {
                        background: #eee;
                        transform: scale(1.1);
                    }
                    .close-btn {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #666;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .close-btn:hover {
                        background: #eee;
                        color: #d32f2f;
                        transform: rotate(90deg);
                    }
                    .dialog-title {
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #333;
                        text-transform: uppercase;
                    }
                    .dialog-body {
                        overflow-y: auto;
                        padding: 1rem;
                        flex: 1;
                    }
                    .character-sheet {
                        margin: 0;
                        border: none;
                        box-shadow: none;
                        padding: 0;
                    }
                    .sheet-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #8B4513;
                        margin-bottom: 1.5rem;
                        padding-bottom: 0.5rem;
                    }
                    .sheet-header h3 {
                        margin: 0;
                        font-size: 1.5rem;
                        color: #333;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .header-stats {
                        display: flex;
                        gap: 1rem;
                        align-items: center;
                    }
                    .level-badge {
                        background: #d32f2f;
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 2px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .total-cost {
                        font-weight: bold;
                        background: #8B4513;
                        color: white;
                        padding: 0.25rem 0.75rem;
                        border-radius: 2px;
                    }
                    .sheet-grid {
                        column-count: 1;
                        column-gap: 2rem;
                    }
                    @media (min-width: 1024px) {
                        .sheet-grid {
                            column-count: 2;
                        }
                        .combat-section {
                            column-span: all;
                        }
                    }
                    .sheet-section {
                        background: rgba(255, 255, 255, 0.5);
                        padding: 1rem;
                        border: 1px dashed #ccc;
                        break-inside: avoid;
                        margin-bottom: 1.5rem;
                    }
                    .section-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: baseline;
                        margin-bottom: 1rem;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 0.25rem;
                    }
                    .section-header h4 {
                        margin: 0;
                        color: #8B4513;
                        font-size: 1.1rem;
                        text-transform: uppercase;
                    }
                    .cost {
                        font-size: 0.9rem;
                        color: #666;
                    }
                    .combat-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 1rem;
                        justify-content: space-between;
                    }
                    .combat-stat-box {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        flex: 1;
                        min-width: 100px;
                        border: 1px solid #e0e0e0;
                        padding: 0.5rem;
                        background: white;
                        border-radius: 4px;
                    }
                    .stat-label {
                        font-size: 0.8rem;
                        text-transform: uppercase;
                        color: #666;
                        text-align: center;
                        margin-bottom: 0.25rem;
                    }
                    .stat-value {
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #333;
                    }
                    .attr-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
                        gap: 1rem;
                    }
                    .attr-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        border: 1px solid #ddd;
                        padding: 0.5rem;
                        background: white;
                    }
                    .attr-label {
                        font-size: 0.8rem;
                        text-transform: uppercase;
                        color: #666;
                        margin-bottom: 0.25rem;
                    }
                    .attr-value {
                        font-size: 1.25rem;
                        font-weight: bold;
                        color: #333;
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .dialog-body li {
                        margin-bottom: 0.5rem;
                        padding-left: 1.2rem;
                        position: relative;
                    }
                    .dialog-body li::before {
                        content: "•";
                        color: #d32f2f;
                        position: absolute;
                        left: 0;
                        font-weight: bold;
                    }
                    .dialog-body li.no-bullet-item {
                        padding-left: 0;
                    }
                    .dialog-body li.no-bullet-item::before {
                        display: none;
                    }
                `}} />
            </dialog >
        </>
    );
}
