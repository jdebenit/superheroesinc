import React from 'react';
import { SectionContainer } from '../../../shared/SectionContainer';
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
        <SectionContainer
            title="Traumas/Motivaciones del Vigilante"
            description="Como Vigilante, cada especialidad proviene de un trauma o una motivación profunda. Describe el evento que te llevó a desarrollar estas habilidades."
            theme="red"
        >
            <div className="space-y-6">
                {vigilanteSpecialties.map((specialty: string) => (
                    <div key={specialty} className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                        <ComicTextArea
                            label={`Trauma/Motivación: ${specialty}`}
                            value={traumas?.[specialty] || ''}
                            onChange={(e) => onUpdateTrauma(specialty, e.target.value)}
                            placeholder={`Describe el trauma que te convirtió en ${specialty}...`}
                        />
                    </div>
                ))}
            </div>
        </SectionContainer>
    );
}
