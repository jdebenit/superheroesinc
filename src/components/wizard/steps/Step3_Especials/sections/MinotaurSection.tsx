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
                <div className="wizard-margin-top">
                    <p className="form-field-description wizard-table-cell--bold" style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                        Efectos Pasivos (Arcano / Minotauro)
                    </p>
                    <ul className="wizard-list">
                        {arcanoEffects.map((effect: string, idx: number) => (
                            <li key={`arc-${idx}`} className="wizard-list-item">
                                <span className="wizard-list-bullet" style={{ color: '#6366f1' }}>•</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                        {minotauroEffects.map((effect: string, idx: number) => (
                            <li key={`min-${idx}`} className="wizard-list-item">
                                <span className="wizard-list-bullet" style={{ color: '#b45309' }}>•</span>
                                <span>{effect}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </WizardSection>
    );
}

