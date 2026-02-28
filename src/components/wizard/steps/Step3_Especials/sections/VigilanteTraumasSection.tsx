import React from 'react';
import { WizardSection } from '../../../shared/WizardSection';

import { ComicTextArea } from '../../../shared/ComicTextArea';

interface VigilanteTraumasSectionProps {
    vigilanteSpecialties: string[];
    traumas: Record<string, string>;
    onUpdateTrauma: (specialty: string, text: string) => void;
}

export default function VigilanteTraumasSection({
    vigilanteSpecialties,
    traumas,
    onUpdateTrauma
}: VigilanteTraumasSectionProps) {
    if (vigilanteSpecialties.length === 0) return null;

    return (
        <WizardSection
            title="Traumas/Motivaciones del Vigilante"
            description="Como Vigilante, cada especialidad proviene de un trauma o una motivación profunda. Describe el evento que te llevó a desarrollar estas habilidades."
        >

            <div className="vigilante-trauma-list">
                {vigilanteSpecialties.map((specialty: string) => (
                    <div key={specialty} className="vigilante-trauma-card">
                        <ComicTextArea
                            label={`Trauma/Motivación: ${specialty}`}
                            value={traumas?.[specialty] || ''}
                            onChange={(e) => onUpdateTrauma(specialty, e.target.value)}
                            placeholder={`Describe el trauma que te convirtió en ${specialty}...`}
                        />
                    </div>
                ))}
            </div>
        </WizardSection>

    );
}
