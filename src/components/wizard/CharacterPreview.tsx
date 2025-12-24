import React, { useRef, useEffect } from 'react';

interface CharacterPreviewProps {
    character: any;
    totalPCs?: number | string;
}

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
                    padding: '1rem 1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '4px solid #1e40af',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '4px 4px 0px #1e40af, 0 10px 20px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
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

                                {/* Origin */}
                                {character.origin && character.origin.items.length > 0 && (
                                    <div className="sheet-section origin">
                                        <div className="section-header">
                                            <h4>Origen</h4>
                                            {character.origin.cost && <span className="cost">({character.origin.cost} PCs)</span>}
                                        </div>
                                        <ul>
                                            {character.origin.items.map((item: any, i: number) => {
                                                const name = Object.keys(item)[0];
                                                const details = item[name];
                                                return (
                                                    <li key={i}>
                                                        <strong>{name}</strong>
                                                        <ul>
                                                            {details.map((detail: string, j: number) => (
                                                                <li key={j}>{detail}</li>
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
                                                <li key={i}>{item}</li>
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
                                        <ul>
                                            {character.skills.generalItems.map((item: any, i: number) => (
                                                <li key={i}>
                                                    <strong>{item.name}</strong>
                                                    {item.math && <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>({item.math})</span>}
                                                    : {item.value}
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
                                        <ul>
                                            {character.skills.specialItems.map((item: any, i: number) => (
                                                <li key={i}>
                                                    <strong>{item.name}</strong>
                                                    {item.math && <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>({item.math})</span>}
                                                    : {item.value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Background */}
                                {character.background && character.background.items.length > 0 && (
                                    <div className="sheet-section background">
                                        <div className="section-header">
                                            <h4>Historial</h4>
                                            {character.background.cost && <span className="cost">({character.background.cost} PCs)</span>}
                                        </div>
                                        <ul>
                                            {character.background.items.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Special Skills */}
                                {character.specialskills && character.specialskills.items.length > 0 && (
                                    <div className="sheet-section special-skills">
                                        <div className="section-header">
                                            <h4>Habilidades Especiales</h4>
                                            {character.specialskills.cost && <span className="cost">({character.specialskills.cost} PCs)</span>}
                                        </div>
                                        <ul>
                                            {character.specialskills.items.map((item: any, i: number) => (
                                                <li key={i}>{item.name}: {item.value}</li>
                                            ))}
                                        </ul>
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
                            </div>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .character-dialog {
                        padding: 0;
                        border: none;
                        border-radius: 12px;
                        background: transparent;
                        max-width: 90vw;
                        max-height: 90vh;
                        width: 800px;
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
                `}} />
            </dialog>
        </>
    );
}
