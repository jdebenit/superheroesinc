import React from 'react';
import { type TmtCharacterEntry, type HistoryEntry } from '../hooks/useTmtStore';
import { charName, initials, getIniciativa, getStatValue, openPlayerTerminal } from '../utils/tmtUtils';


interface CombatTableProps {
    characters: TmtCharacterEntry[];
    currentTurn: number;
    onOpenEdit: (id: string, type: 'health' | 'mental' | 'willpower') => void;
    onOpenHistory: (id: string, type: 'health' | 'mental' | 'willpower') => void;
    onToggleVisibility: (id: string) => void;

}


export default function CombatTable({
    characters,
    currentTurn,
    onOpenEdit,
    onOpenHistory,
    onToggleVisibility
}: CombatTableProps) {



    const renderStatBar = (charId: string, current: number, max: number, type: 'health' | 'mental' | 'willpower') => {
        const percentage = Math.max(0, Math.min(100, (current / (max || 1)) * 100));
        const colorClass = type === 'health' ? 'health' : (type === 'mental' ? 'mental' : 'willpower');


        return (
            <div className="combat-table-stat-cell" onClick={() => onOpenEdit(charId, type)}>
                <div className="combat-table-stat-values">

                    {current} / {max}
                </div>
                <div className="combat-table-bar-bg">
                    <div
                        className={`combat-table-bar-fill ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="combat-table-container">
            <table className="combat-table">
                <thead>
                    <tr>
                        <th className="sticky-col">Combatiente</th>
                        <th>PVs</th>
                        <th>EQM</th>
                        <th>Voluntad</th>
                        <th>Otros</th>

                        <th className="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map((c, idx) => {
                        const isCurrent = idx === currentTurn;
                        const os = c.characterData.otherstats;

                        return (
                            <tr key={c.id} className={isCurrent ? 'current-turn-row' : ''}>
                                <td className="sticky-col">
                                    <div
                                        className="char-name-wrapper"
                                        onClick={() => openPlayerTerminal(c)}
                                        style={{ cursor: 'pointer' }}
                                        title="Abrir terminal del jugador"
                                    >
                                        <span className={`role-indicator ${c.role}`}>{c.role === 'pj' ? 'P' : 'N'}</span>
                                        <div className="char-avatar-mini">
                                            {c.characterData.icon ? (
                                                <img
                                                    src={c.characterData.icon.startsWith('http') || c.characterData.icon.startsWith('/') || c.characterData.icon.startsWith('data:')
                                                        ? c.characterData.icon : `/${c.characterData.icon}`}
                                                    alt=""
                                                />
                                            ) : (
                                                <span>{initials(charName(c))}</span>
                                            )}
                                        </div>
                                        <span className="char-name-text">{charName(c)}</span>
                                    </div>
                                </td>

                                <td>
                                    <div className="clickable-cell">
                                        {renderStatBar(c.id, c.currentHealth || 0, c.maxHealth || 1, 'health')}
                                    </div>
                                </td>
                                <td>
                                    <div className="clickable-cell">
                                        {renderStatBar(c.id, c.currentMental || 0, c.maxMental || 1, 'mental')}
                                    </div>
                                </td>
                                <td>
                                    <div className="clickable-cell">
                                        {renderStatBar(c.id, c.currentWillpower || 0, c.maxWillpower || 1, 'willpower')}
                                    </div>
                                </td>


                                <td className="defenses-cell">
                                    <div className="defense-badges">
                                        <span className="def-badge phys" title="Parada Física">PF: {getStatValue(os, "Parada Física")}</span>
                                        <span className="def-badge ment" title="Parada Mental">PM: {getStatValue(os, "Parada Mental")}</span>
                                        <span className="def-badge da-phys" title="D.A. Físico">DAF: {getStatValue(os, "Daño absorbido físico")}</span>
                                        <span className="def-badge da-ment" title="D.A. Mental">DAM: {getStatValue(os, "Daño absorbido mental")}</span>
                                        <span className="def-badge impact" title="Modif. de Impacto">IMP: {getStatValue(os, "Modificador de impacto")}</span>
                                        <span className="def-badge psionic" title="Modif. Psiónico">PSI: {getStatValue(os, "Modificador Psiónico")}</span>
                                    </div>
                                </td>


                                <td className="row-actions-cell">
                                    <div className="row-actions">
                                        <button className="row-action-btn" onClick={() => onOpenHistory(c.id, 'health')} title="Historial PV">📋</button>
                                        <button className="row-action-btn" onClick={() => onOpenHistory(c.id, 'mental')} title="Historial EQM">🧠</button>
                                        <button className="row-action-btn" onClick={() => onOpenHistory(c.id, 'willpower')} title="Historial VLT">✨</button>
                                    </div>
                                </td>


                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
