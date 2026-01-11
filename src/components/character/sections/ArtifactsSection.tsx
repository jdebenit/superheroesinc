import React from 'react';

interface ArtifactsSectionProps {
    artifacts: any;
}

export const ArtifactsSection: React.FC<ArtifactsSectionProps> = ({ artifacts }) => {
    if (!artifacts || !artifacts.items || artifacts.items.length === 0) return null;

    return (
        <div className="sheet-section artifacts">
            <div className="section-header">
                <h4>Artefactos</h4>
            </div>
            <div className="preview-section-grid">
                {artifacts.items.map((item: any, i: number) => (
                    <div key={i} className="preview-card theme-artifact">
                        <div className="preview-card-title">{item.name}</div>
                        <div className="preview-stats-grid cols-3">
                            <div><span className="preview-stat-label">Fiabilidad:</span> {item.reliability || '-'}</div>
                            <div><span className="preview-stat-label">Valor:</span> {item.value || '-'}</div>
                            <div><span className="preview-stat-label">Coste:</span> {item.cost || '0'} PCs</div>
                        </div>
                        {item.notes && (
                            <div className="preview-notes">
                                {item.notes}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
