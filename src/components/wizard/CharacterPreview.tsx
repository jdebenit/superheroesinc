import React, { useRef, useEffect } from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../data/backgroundTables';
import { SPELLS } from '../../data/spells';
import { POWERS } from '../../data/powers';
import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';

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

    const combatStats = character.combatstats || [];
    const otherStats = character.otherstats || character.other || [];

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
                                                <div key={i} className="weapon-item" style={{ padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>{item.name}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                        <span style={{ fontWeight: 'bold' }}>Daño: {item.damage || '-'}</span>
                                                        <span style={{ color: '#666', fontStyle: 'italic' }}>{item.notes}</span>
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

                                {/* Powers / Poderes Especiales */}
                                {character.powers?.selected && character.powers.selected.length > 0 && (
                                    <div className="sheet-section powers">
                                        <div className="section-header">
                                            <h4>Poderes Especiales</h4>
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
                                                                <span style={{ fontWeight: 'bold', color: '#059669' }}>{powerData.name}</span>
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
                                            <h4>Artes Mágicas</h4>
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
            </dialog>
        </>
    );
}
