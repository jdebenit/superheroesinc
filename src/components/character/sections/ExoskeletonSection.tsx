import React from 'react';
import { EXOSKELETON_CONFIGS } from '../../../data/exoskeletonConfigs';

interface ExoskeletonSectionProps {
    character: any;
}

export const ExoskeletonSection: React.FC<ExoskeletonSectionProps> = ({ character }) => {
    if (!character.exoskeletonConfig) return null;

    const config = EXOSKELETON_CONFIGS.find(c => c.id === character.exoskeletonConfig);
    if (!config) return null;

    return (
        <div className="sheet-section exoskeleton">
            <div className="section-header">
                <h4>Exoesqueleto (Energía)</h4>
                <span className="cost">({config.pcCost} PCs)</span>
            </div>
            <div className="exoskeleton-grid">
                <div className="exoskeleton-card">
                    <div className="exoskeleton-header">
                        {config.label}
                    </div>
                    <div className="exoskeleton-stats">
                        <div className="exoskeleton-stat-item">
                            <span className="exoskeleton-stat-label">Puntos de Vida</span>
                            <span className="exoskeleton-stat-value">{config.pv}</span>
                        </div>
                        <div className="exoskeleton-stat-item">
                            <span className="exoskeleton-stat-label">D.A. Físico</span>
                            <span className="exoskeleton-stat-value mono">
                                {config.daCinetico}/{config.daEnergia}
                            </span>
                        </div>
                        <div className="exoskeleton-stat-item">
                            <span className="exoskeleton-stat-label">Regeneración</span>
                            <span className="exoskeleton-stat-value">{config.regeneracion} PV/h</span>
                        </div>
                        <div className="exoskeleton-stat-item">
                            <span className="exoskeleton-stat-label">Emisión</span>
                            <span className="exoskeleton-stat-value highlight">{config.emision}</span>
                        </div>
                        <div className="exoskeleton-stat-item">
                            <span className="exoskeleton-stat-label">Velocidad</span>
                            <span className="exoskeleton-stat-value">{config.velocidad} Mach</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
