import React from 'react';

interface Step7Props {
    data: any;
    onChange: (updates: any) => void;
}

export default function Step7_Evolution({ data, onChange }: Step7Props) {
    return (
        <div className="step-container">
            <div className="step-header">
                <h2 className="step-title">📈 Evolución del Personaje</h2>
                <p className="step-description">
                    Gestiona la subida de nivel de tu personaje
                </p>
            </div>

            <div className="step-content">
                <div style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-bg-secondary, #f8f9fa)',
                    borderRadius: '12px',
                    border: '2px dashed var(--color-border, #dee2e6)'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1.5rem',
                        opacity: 0.6
                    }}>
                        🚧
                    </div>
                    <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        color: 'var(--color-text-primary, #212529)'
                    }}>
                        Funcionalidad en Desarrollo
                    </h3>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--color-text-secondary, #6c757d)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        La funcionalidad de subida de nivel del personaje
                        estará disponible próximamente. Aquí podrás gestionar el
                        crecimiento y desarrollo de tu personaje a medida que avanza
                        en sus aventuras por el increible mundo de Superheroes INC.
                    </p>
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: 'var(--color-bg-tertiary, #e9ecef)',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        color: 'var(--color-text-secondary, #495057)'
                    }}>
                        <strong>Próximamente:</strong> Incremento de características,
                        mejora de habilidades, hechizos adicionales y más.
                    </div>
                </div>
            </div>
        </div>
    );
}
