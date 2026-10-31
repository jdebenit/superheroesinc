import React from 'react';
import { ECONOMIC_STATUS, LEGAL_STATUS, SOCIAL_STATUS, FRIENDS_AND_ASSOCIATES } from '../../../data/backgroundTables';
import './LevelHistoryModal.css';

interface LevelHistoryModalProps {
    character: any;
    isOpen: boolean;
    onClose: () => void;
}

export const LevelHistoryModal: React.FC<LevelHistoryModalProps> = ({ character, isOpen, onClose }) => {
    if (!isOpen) return null;

    const currentLevel = Number(character?.level) || 1;
    const modPerLevel = character?.modPerLevel || {};

    // Obtener los niveles disponibles ordenados ascendentemente (2, 3, 4, etc.)
    const levelKeys = Object.keys(modPerLevel)
        .map(Number)
        .filter(n => !isNaN(n) && n > 1)
        .sort((a, b) => a - b);

    const getBgLabel = (list: readonly any[], id: string) => {
        return list.find(item => item.id === id)?.label || id;
    };

    // Helper para normalizar los cambios por categoría para un nivel dado
    const getLevelChanges = (lvl: number) => {
        const lvlData = modPerLevel[lvl.toString()] || modPerLevel[lvl] || {};
        const combatChanges: Record<string, any> = {};
        const skillChanges: Record<string, any> = {};
        const backgroundChanges: Record<string, any> = {};
        const otherChanges: Record<string, any> = {};

        // Si contiene claves de categorías organizadas
        if (lvlData.combatstats || lvlData.skills || lvlData.background) {
            if (lvlData.combatstats && typeof lvlData.combatstats === 'object') {
                Object.assign(combatChanges, lvlData.combatstats);
            }
            if (lvlData.skills && typeof lvlData.skills === 'object') {
                Object.assign(skillChanges, lvlData.skills);
            }
            if (lvlData.background && typeof lvlData.background === 'object') {
                Object.assign(backgroundChanges, lvlData.background);
            }
            // Claves sueltas restantes
            Object.entries(lvlData).forEach(([key, val]) => {
                if (!['combatstats', 'skills', 'background'].includes(key)) {
                    otherChanges[key] = val;
                }
            });
        } else {
            // Formato plano (direct key: val)
            Object.entries(lvlData).forEach(([key, val]) => {
                if (typeof val === 'number' || typeof val === 'string') {
                    if (['Puntos de Vida', 'Acciones por asalto', 'Iniciativa y Reflejos', 'Equilibrio Mental'].includes(key)) {
                        combatChanges[key] = val;
                    } else if (['economicStatus', 'legalStatus', 'socialStatus', 'friendsAndAssociates', 'prejudiceResistance', 'items'].includes(key)) {
                        backgroundChanges[key] = val;
                    } else {
                        skillChanges[key] = val;
                    }
                }
            });
        }

        return {
            combatChanges,
            skillChanges,
            backgroundChanges,
            otherChanges
        };
    };

    return (
        <div className="level-history-backdrop" onClick={onClose}>
            <div className="level-history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="level-history-header">
                    <div className="level-history-title-area">
                        <span className="level-history-badge">Nivel {currentLevel}</span>
                        <h3>Historial de Progresión por Nivel</h3>
                    </div>
                    <button className="level-history-close-btn" onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                <div className="level-history-body">
                    {/* Nivel 1: Estado Base */}
                    <div className="level-timeline-card base-level">
                        <div className="level-timeline-badge">Nivel 1</div>
                        <div className="level-timeline-content">
                            <h4 className="level-card-title">Creación de Personaje (Base Inicial)</h4>
                            <p className="level-card-description">
                                Estadísticas, habilidades y trasfondos determinados durante la ficha de origen y atributos base.
                            </p>
                            {character?.background && (
                                <div className="level-subgroup">
                                    <span className="level-subgroup-title">Trasfondo Inicial:</span>
                                    <ul className="level-change-list">
                                        {character.background.economicStatus && (
                                            <li>
                                                <strong>Estatus Económico:</strong> {getBgLabel(ECONOMIC_STATUS, character.background.economicStatus)}
                                            </li>
                                        )}
                                        {character.background.legalStatus && (
                                            <li>
                                                <strong>Estatus Legal:</strong> {getBgLabel(LEGAL_STATUS, character.background.legalStatus)}
                                            </li>
                                        )}
                                        {character.background.socialStatus && (
                                            <li>
                                                <strong>Estatus Social:</strong> {getBgLabel(SOCIAL_STATUS, character.background.socialStatus)}
                                            </li>
                                        )}
                                        {character.background.friendsAndAssociates && (
                                            <li>
                                                <strong>Contactos:</strong> {getBgLabel(FRIENDS_AND_ASSOCIATES, character.background.friendsAndAssociates)}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Niveles siguientes definidos en modPerLevel */}
                    {levelKeys.length === 0 ? (
                        <div className="level-history-empty">
                            <p>No se han registrado modificaciones personalizadas por nivel para este personaje.</p>
                        </div>
                    ) : (
                        levelKeys.map(lvl => {
                            const { combatChanges, skillChanges, backgroundChanges, otherChanges } = getLevelChanges(lvl);
                            const isCurrent = lvl === currentLevel;
                            const isPast = lvl <= currentLevel;

                            return (
                                <div key={lvl} className={`level-timeline-card ${isCurrent ? 'current-level' : ''} ${!isPast ? 'future-level' : ''}`}>
                                    <div className="level-timeline-badge">
                                        Nivel {lvl}
                                        {isCurrent && <span className="level-current-tag">Actual</span>}
                                    </div>
                                    <div className="level-timeline-content">
                                        <h4 className="level-card-title">Subida a Nivel {lvl}</h4>

                                        {/* Modificaciones de Combate */}
                                        {Object.keys(combatChanges).length > 0 && (
                                            <div className="level-subgroup combat">
                                                <span className="level-subgroup-title">⚔️ Estadísticas de Combate:</span>
                                                <ul className="level-change-list">
                                                    {Object.entries(combatChanges).map(([stat, val]) => (
                                                        <li key={stat}>
                                                            <span className="stat-name">{stat}:</span>
                                                            <span className="stat-mod positive">+{val}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Modificaciones de Habilidades */}
                                        {Object.keys(skillChanges).length > 0 && (
                                            <div className="level-subgroup skills">
                                                <span className="level-subgroup-title">🎯 Habilidades:</span>
                                                <ul className="level-change-list">
                                                    {Object.entries(skillChanges).map(([skill, val]) => (
                                                        <li key={skill}>
                                                            <span className="stat-name">{skill}:</span>
                                                            <span className="stat-mod positive">+{val}%</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Modificaciones de Trasfondo */}
                                        {Object.keys(backgroundChanges).length > 0 && (
                                            <div className="level-subgroup background">
                                                <span className="level-subgroup-title">📜 Trasfondo:</span>
                                                <ul className="level-change-list">
                                                    {backgroundChanges.economicStatus && (
                                                        <li>
                                                            <span className="stat-name">Estatus Económico pasa a:</span>
                                                            <span className="stat-mod highlight">
                                                                {getBgLabel(ECONOMIC_STATUS, backgroundChanges.economicStatus)}
                                                            </span>
                                                        </li>
                                                    )}
                                                    {backgroundChanges.legalStatus && (
                                                        <li>
                                                            <span className="stat-name">Estatus Legal pasa a:</span>
                                                            <span className="stat-mod highlight">
                                                                {getBgLabel(LEGAL_STATUS, backgroundChanges.legalStatus)}
                                                            </span>
                                                        </li>
                                                    )}
                                                    {backgroundChanges.socialStatus && (
                                                        <li>
                                                            <span className="stat-name">Estatus Social pasa a:</span>
                                                            <span className="stat-mod highlight">
                                                                {getBgLabel(SOCIAL_STATUS, backgroundChanges.socialStatus)}
                                                            </span>
                                                        </li>
                                                    )}
                                                    {backgroundChanges.friendsAndAssociates && (
                                                        <li>
                                                            <span className="stat-name">Contactos pasa a:</span>
                                                            <span className="stat-mod highlight">
                                                                {getBgLabel(FRIENDS_AND_ASSOCIATES, backgroundChanges.friendsAndAssociates)}
                                                            </span>
                                                        </li>
                                                    )}
                                                    {backgroundChanges.items && Array.isArray(backgroundChanges.items) && (
                                                        <li>
                                                            <span className="stat-name">Nuevos beneficios / Coberturas:</span>
                                                            <span className="stat-mod highlight">
                                                                {backgroundChanges.items.join(', ')}
                                                            </span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Otras modificaciones */}
                                        {Object.keys(otherChanges).length > 0 && (
                                            <div className="level-subgroup other">
                                                <span className="level-subgroup-title">✨ Otras Modificaciones:</span>
                                                <ul className="level-change-list">
                                                    {Object.entries(otherChanges).map(([key, val]) => (
                                                        <li key={key}>
                                                            <span className="stat-name">{key}:</span>
                                                            <span className="stat-mod">
                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="level-history-footer">
                    <span className="level-history-note">
                        💡 Las modificaciones por nivel se reflejan automáticamente en los cálculos de la ficha.
                    </span>
                    <button className="level-history-confirm-btn" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
