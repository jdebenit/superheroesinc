import React from 'react';
import { stepPageTitleStyle, stepPageSubtitleStyle } from '../shared/stepStyles';
import '../shared/WizardStep.css';
import './Step7_Evolution.css';

export default function Step7_Evolution() {
    return (
        <div className="wizard-step-container">
            <h2 style={stepPageTitleStyle}>Evolución del Personaje</h2>
            <p style={stepPageSubtitleStyle}>
                Gestiona la subida de nivel de tu personaje
            </p>
            <div className="step7-wip-card">
                <div className="step7-wip-icon">
                    🚧
                </div>
                <h3 className="step7-wip-title">
                    Funcionalidad en Desarrollo
                </h3>
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
            </div>
        </div>
    );
}
