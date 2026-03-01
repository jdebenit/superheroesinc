import React from 'react';
import { WizardSection } from '../../shared/layout/WizardSection';
import '../../shared/layout/WizardStep.css';
import './Step7_Evolution.css';

interface Step7Props {
    onShowHelp?: () => void;
}

export default function Step7_Evolution({ onShowHelp }: Step7Props) {
    return (
        <div className="wizard-step-container">
            <WizardSection
                title="Evolución del Personaje"
                description="Gestiona la subida de nivel de tu personaje"
                onHelp={onShowHelp}
            />

            <WizardSection
                title="Funcionalidad en Desarrollo"
                icon="🚧"
            >
                <p className="step7-wip-description">
                    La funcionalidad de subida de nivel del personaje
                    estará disponible próximamente. Aquí podrás gestionar el
                    crecimiento y desarrollo de tu personaje a medida que avanza
                    en sus aventuras por el increible mundo de Superheroes INC.
                </p>
                <div className="step7-wip-notice">
                    <strong>Próximamente:</strong> Incremento de características,
                    mejora de habilidades, hechizos adicionales y más.
                </div>
            </WizardSection>
        </div>
    );
}
