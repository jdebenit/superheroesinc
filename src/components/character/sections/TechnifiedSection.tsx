import React from 'react';
import { EXOSKELETON_ARMOR_CONFIGS } from '../../../data/exoskeletonArmorConfigs';
import { TECHNOSUIT_STRENGTH_CONFIGS } from '../../../data/technoSuitStrengthConfigs';
import { CYBORG_IMPLANT_STATS, CYBORG_IMPLANT_STRENGTHS } from '../../../data/cyborgImplantConfigs';

interface TechnifiedSectionProps {
    character: any;
}

export const TechnifiedSection: React.FC<TechnifiedSectionProps> = ({ character }) => {
    if (!character.exoskeletonArmorConfig && !character.technoSuitStrengthConfig) return null;

    return (
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
    );
};
