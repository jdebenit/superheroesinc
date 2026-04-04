import React from 'react';
import { type TmtCharacterEntry } from '../hooks/useTmtStore';
import { initials, charName, getBaseIniciativa, getIniciativa, getAcciones, INITIATIVE_MODS } from '../utils/tmtUtils';

interface InitiativeRowProps {
    entry: TmtCharacterEntry;
    index: number;
    isCurrent: boolean;
    onUpdateUsedActions: (id: string, count: number) => void;
    onOpenEdit: (id: string, type: 'health' | 'mental') => void;
    onOpenHistory: (id: string, type: 'health' | 'mental') => void;
    onUpdateInitiative: (id: string, value: number, roll?: number) => void;
    onUpdateModifier: (id: string, value: number) => void;
}

export default function InitiativeRow({
    entry,
    index,
    isCurrent,
    onUpdateUsedActions,
    onOpenEdit,
    onOpenHistory,
    onUpdateInitiative,
    onUpdateModifier
}: InitiativeRowProps) {
    const isNpc = entry.role === 'pnj';
    const displayName = charName(entry);

    return (
        <div className={`tmt-initiative-row${isCurrent ? ' current' : ''}`}>
            <span className="tmt-initiative-rank">{index + 1}</span>
            <div className="tmt-initiative-main-info">
                <div className={`tmt-entity-avatar tmt-avatar-mini${isNpc ? ' npc' : ''}`}>
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
                <div>
                    <div className="tmt-initiative-name">{displayName}</div>
                    <div className="tmt-initiative-actions-tracker">
                        {Array.from({ length: getAcciones(entry) }).map((_, idx) => (
                            <span 
                                key={idx} 
                                className={`tmt-action-dot${(entry.usedActions || 0) > idx ? ' used' : ''}`} 
                                onClick={() => onUpdateUsedActions(entry.id, (entry.usedActions || 0) > idx ? idx : idx + 1)} 
                            />
                        ))}
                    </div>
                </div>
                <div className="tmt-entity-vitals">
                    <div className="tmt-vital-badge health" onClick={() => onOpenEdit(entry.id, 'health')} onDoubleClick={() => onOpenHistory(entry.id, 'health')}>
                        <span className="label">PV</span> <span className="value">{entry.currentHealth}/{entry.maxHealth}</span>
                    </div>
                    <div className="tmt-vital-badge mental" onClick={() => onOpenEdit(entry.id, 'mental')} onDoubleClick={() => onOpenHistory(entry.id, 'mental')}>
                        <span className="label">EQM</span> <span className="value">{entry.currentMental}/{entry.maxMental}</span>
                    </div>
                </div>
            </div>
            <div className="tmt-initiative-edit-wrap">
                {entry.roll && (
                    <span className="tmt-initiative-breakdown">
                        ({getBaseIniciativa(entry)} + {entry.roll}
                        {entry.initiativeMod ? ` ${entry.initiativeMod > 0 ? '+' : ''}${entry.initiativeMod}` : ''})
                    </span>
                )}
                <button
                    className="tmt-dice-btn"
                    title="Lanzar iniciativa individual"
                    onClick={() => {
                        const roll = Math.floor(Math.random() * 100) + 1;
                        onUpdateInitiative(entry.id, getBaseIniciativa(entry) + roll, roll);
                    }}
                >
                    🎲
                </button>
                <select 
                    className="tmt-initiative-mod-select"
                    value={entry.initiativeMod || 0}
                    onChange={(ev) => onUpdateModifier(entry.id, parseInt(ev.target.value))}
                >
                    {INITIATIVE_MODS.map(m => (
                        <option key={m.label} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <span className="tmt-initiative-icon">⚡</span>
                <input 
                    type="number" 
                    className="tmt-initiative-input" 
                    value={getIniciativa(entry)} 
                    onChange={(ev) => onUpdateInitiative(entry.id, parseInt(ev.target.value) || 0)} 
                />
            </div>
        </div>
    );
}
