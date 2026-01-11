import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { InfoCard } from '../common/InfoCard';

interface ArtifactsSectionProps {
    artifacts: any;
}

export const ArtifactsSection: React.FC<ArtifactsSectionProps> = ({ artifacts }) => {
    if (!artifacts || !artifacts.items || artifacts.items.length === 0) return null;

    return (
        <SheetSection title="Artefactos" className="artifacts">
            <div className="preview-section-grid">
                {artifacts.items.map((item: any, i: number) => (
                    <InfoCard
                        key={i}
                        title={item.name}
                        theme="theme-artifact"
                        cols={3}
                        stats={[
                            { label: 'Fiabilidad:', value: item.reliability || '-' },
                            { label: 'Valor:', value: item.value || '-' },
                            { label: 'Coste:', value: `${item.cost || '0'} PCs` },
                        ]}
                        notes={item.notes}
                    />
                ))}
            </div>
        </SheetSection>
    );
};
