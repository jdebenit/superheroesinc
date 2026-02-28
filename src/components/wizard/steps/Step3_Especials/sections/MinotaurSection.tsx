import React from 'react';
import { ORIGIN_CATEGORIES } from '../../../../../data/originDefinitions';
import { WizardSection } from '../../../shared/WizardSection';
import { InfoBox } from '../../../shared/InfoBox';

export default function MinotaurSection() {
    const arcano = ORIGIN_CATEGORIES['Arcano'];
    const minotauroEffects = arcano?.subtypes?.['Minotauro'] || [];
    const arcanoEffects = arcano?.defaultEffects || [];

    return (
        <WizardSection
            title="Opciones de Origen: Minotauro"
            color="#b45309"
            description="Efectos pasivos y rasgos especiales derivados de tu origen Arcano / Minotauro."
        >
            <InfoBox variant="warning">
                <strong>Rasgo Físico Distintivo:</strong> Tienes cuernos que actuan como arma blanca. Puedes adquirir la habilidad de arma especial para usarlos, o usarlos directamente con la maniobra de Embestida.
            </InfoBox>

            {(arcanoEffects.length > 0 || minotauroEffects.length > 0) && (
                <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Efectos Pasivos (Arcano / Minotauro)
                    </p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                        {arcanoEffects.map((effect: string, idx: number) => (
                            <li key={`arc-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                <span style={{ color: '#6366f1', fontWeight: 'bold', flexShrink: 0 }}>•</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                        {minotauroEffects.map((effect: string, idx: number) => (
                            <li key={`min-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                                <span style={{ color: '#b45309', fontWeight: 'bold', flexShrink: 0 }}>•</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </WizardSection>
    );
}

