import React from 'react';
import { type TmtCharacterEntry } from '../hooks/useTmtStore';
import { initials, charName, getStatValue } from '../utils/tmtUtils';
import MiniStatCard from './MiniStatCard';

interface CombatCardProps {
    entry: TmtCharacterEntry;
    onOpenEdit: (id: string, type: 'health' | 'mental') => void;
    onOpenHistory: (id: string, type: 'health' | 'mental') => void;
}

export default function CombatCard({ entry, onOpenEdit, onOpenHistory }: CombatCardProps) {
    const isNpc = entry.role === 'pnj';
    const displayName = charName(entry);
    const os = entry.characterData.otherstats;

    return (
        <div className="tmt-combat-card">
            <div className="tmt-combat-card-header">
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
                <div>
                    <p className="tmt-combat-card-name">{displayName}</p>
                    <span className={`tmt-combat-card-badge ${entry.role}`}>
                        {entry.role.toUpperCase()}
                    </span>
                </div>
            </div>
            <div className="tmt-combat-card-body">
                <MiniStatCard
                    label="PVs"
                    max={entry.maxHealth || 1}
                    current={entry.currentHealth || 0}
                    type="health"
                    onEdit={() => onOpenEdit(entry.id, 'health')}
                    onViewHistory={() => onOpenHistory(entry.id, 'health')}
                />
                <MiniStatCard
                    label="EQM"
                    max={entry.maxMental || 1}
                    current={entry.currentMental || 0}
                    type="mental"
                    onEdit={() => onOpenEdit(entry.id, 'mental')}
                    onViewHistory={() => onOpenHistory(entry.id, 'mental')}
                />

                <div className="tmt-combat-stats-extras">
                    <div className="tmt-stat-extra"><span className="label">Parada Física</span> <span className="value">{getStatValue(os, "Parada Física")}</span></div>
                    <div className="tmt-stat-extra"><span className="label">Parada Mental</span> <span className="value">{getStatValue(os, "Parada Mental")}</span></div>
                    <div className="tmt-stat-extra"><span className="label">D.A. Físico</span> <span className="value">{getStatValue(os, "Daño absorbido físico")}</span></div>
                    <div className="tmt-stat-extra"><span className="label">D.A. Mental</span> <span className="value">{getStatValue(os, "Daño absorbido mental")}</span></div>
                    <div className="tmt-stat-extra"><span className="label">Mod. Impacto</span> <span className="value">{getStatValue(os, "Modificador de impacto")}</span></div>
                    <div className="tmt-stat-extra"><span className="label">Mod. Psiónico</span> <span className="value">{getStatValue(os, "Modificador Psiónico")}</span></div>
                </div>
            </div>
        </div>
    );
}

