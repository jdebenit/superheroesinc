import React, { useState } from 'react';
import { type TmtCharacterEntry, type TmtGroup } from '../hooks/useTmtStore';
import { initials, charName, charSubtitle } from '../utils/tmtUtils';
import Modal from './Modal';
import CharacterSheet from '../../character/CharacterSheet';
import Logger from '../../../utils/Logger';

interface EntityRowProps {
    entry: TmtCharacterEntry;
    groups: TmtGroup[];
    onRemove: (id: string) => void;
    onToggleRole: (id: string, role: 'pj' | 'pnj') => void;
    onToggleGroup: (charId: string, groupId: string) => void;
}

export default function EntityRow({ entry, groups, onRemove, onToggleRole, onToggleGroup }: EntityRowProps) {
    const [showGroupModal, setShowGroupModal] = useState(false);
    const isNpc = entry.role === 'pnj';
    const displayName = charName(entry);
    const subtitle = charSubtitle(entry);
    const charGroups = groups.filter(g => entry.groupIds.includes(g.id));

    return (
        <div className="tmt-entity-card">
            <div className={`tmt-entity-avatar${isNpc ? ' npc' : ''}`}>
                {entry.characterData.icon ? (
                    <img 
                        src={entry.characterData.icon.startsWith('http') || entry.characterData.icon.startsWith('/') || entry.characterData.icon.startsWith('data:') 
                            ? entry.characterData.icon 
                            : `/${entry.characterData.icon}`} 
                        alt={displayName} 
                    />
                ) : (
                    initials(displayName)
                )}
            </div>
            <div className="tmt-entity-info">
                <p className="tmt-entity-name">{displayName}</p>
                <div className="tmt-entity-meta-row">
                    {subtitle && <span className="tmt-entity-meta">{subtitle}</span>}
                    {charGroups.map(g => (
                        <span key={g.id} className="tmt-group-tag" style={{ backgroundColor: g.color || '#4b5563' }}>
                            {g.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="tmt-entity-actions">
                <button className="tmt-icon-btn" title="Grupos" onClick={() => setShowGroupModal(true)}>🏷️</button>
                <button
                    className="tmt-icon-btn"
                    title="Abrir en SHI TPT"
                    onClick={() => {
                        try {
                            localStorage.setItem('shi_tpt_character', JSON.stringify(entry.characterData));
                            window.open('/recursos/tactic-player-terminal', 'shi_tpt_terminal');
                        } catch (err) {
                            Logger.error('Error sending character to TPT:', err);
                        }
                    }}
                >
                    🎮
                </button>
                <CharacterSheet
                    character={entry.characterData}
                    renderTrigger={(open) => (
                        <button className="tmt-icon-btn" title="Ficha Detallada" onClick={open}>
                            📋
                        </button>
                    )}
                />
                <button className="tmt-icon-btn" onClick={() => onToggleRole(entry.id, isNpc ? 'pj' : 'pnj')}>
                    {isNpc ? '🧑‍🦸' : '👾'}
                </button>
                <button className="tmt-icon-btn danger" onClick={() => onRemove(entry.id)}>🗑️</button>

                <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title={`Grupos: ${displayName}`}>
                    <div className="tmt-group-select-grid">
                        {groups.map(g => {
                            const isActive = entry.groupIds.includes(g.id);
                            return (
                                <label 
                                    key={g.id} 
                                    className={`tmt-group-select-chip${isActive ? ' active' : ''}`}
                                    style={{ '--group-color': g.color || '#4b5563' } as React.CSSProperties}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isActive} 
                                        onChange={() => onToggleGroup(entry.id, g.id)} 
                                    />
                                    <span className="tmt-group-select-label">{g.name}</span>
                                </label>
                            );
                        })}
                    </div>
                    <button className="tmt-add-btn" onClick={() => setShowGroupModal(false)} style={{ width: '100%', marginTop: '1rem' }}>Cerrar</button>
                </Modal>
            </div>
        </div>
    );
}
