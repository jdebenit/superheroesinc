import React from 'react';
import { type TmtCharacterEntry } from '../hooks/tmtTypes';
import { charName, initials, getIniciativa } from '../utils/tmtUtils';
import './PlayerCombatScreen.css';

interface PlayerCombatScreenProps {
    characters: TmtCharacterEntry[];
    currentTurn: number;
    currentRound: number;
    playerCharacterName?: string;
}

export default function PlayerCombatScreen({ 
    characters, 
    currentTurn = 0,
    currentRound = 1,
    playerCharacterName 
}: PlayerCombatScreenProps) {
    
    const sorted = [...characters].sort((a, b) => getIniciativa(b) - getIniciativa(a));

    const renderHealthBar = (c: TmtCharacterEntry) => {
        const isPlayer = playerCharacterName && (charName(c).toLowerCase() === playerCharacterName.toLowerCase());
        const healthPercent = Math.max(0, Math.min(100, (c.currentHealth || 0) / (c.maxHealth || 1) * 100));
        const mentalPercent = Math.max(0, Math.min(100, (c.currentMental || 0) / (c.maxMental || 1) * 100));

        return (
            <div className="player-view-bars">
                <div className="player-view-bar-group">
                    <div className="player-view-bar-bg">
                        <div className="player-view-bar-fill health" style={{ width: `${healthPercent}%` }} />
                    </div>
                    {isPlayer && <span className="player-view-bar-value">{c.currentHealth} / {c.maxHealth}</span>}
                </div>
                <div className="player-view-bar-group">
                    <div className="player-view-bar-bg">
                        <div className="player-view-bar-fill mental" style={{ width: `${mentalPercent}%` }} />
                    </div>
                    {isPlayer && <span className="player-view-bar-value">{c.currentMental} / {c.maxMental}</span>}
                </div>
            </div>
        );
    };

    if (sorted.length === 0) {
        return (
            <div className="player-combat-empty">
                <div className="empty-icon">🛡️</div>
                <h3>No hay combate activo</h3>
                <p>El Máster aún no ha iniciado el encuentro o no hay combatientes visibles.</p>
            </div>
        );
    }

    return (
        <div className="player-combat-screen">
            <div className="player-combat-header">
                <div className="combat-title-wrap">
                    <h2>Combate - Asalto {currentRound}</h2>
                    <div className="combat-meta">
                        <span>Combatientes visibles: {sorted.length}</span>
                    </div>
                </div>
            </div>

            <div className="player-initiative-list">
                {sorted.map((c, i) => {
                    const isCurrent = i === currentTurn;
                    const isPlayer = playerCharacterName && (charName(c).toLowerCase() === playerCharacterName.toLowerCase());
                    const isNpc = c.role === 'pnj';

                    return (
                        <div key={c.id} className={`player-initiative-row ${isCurrent ? 'current' : ''} ${isPlayer ? 'is-player' : ''}`}>
                            <span className="rank-num">{i + 1}</span>
                            <div className="char-info">
                                <div className={`char-avatar ${isNpc ? 'npc' : ''}`}>
                                    {c.characterData.icon ? (
                                        <img 
                                            src={c.characterData.icon.startsWith('http') || c.characterData.icon.startsWith('/') || c.characterData.icon.startsWith('data:') 
                                                ? c.characterData.icon 
                                                : `/${c.characterData.icon}`} 
                                            alt="" 
                                        />
                                    ) : (
                                        initials(charName(c))
                                    )}
                                </div>
                                <div className="char-details">
                                    <span className="char-name">{charName(c)} {isPlayer && <small>(Tú)</small>}</span>
                                    {renderHealthBar(c)}
                                </div>
                            </div>
                            <div className="ini-val">
                                <span className="ini-badge">{getIniciativa(c)}</span>
                                <span className="ini-label">INI</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
