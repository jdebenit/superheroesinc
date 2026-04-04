import React from 'react';

interface DetallesScreenProps {
    details: { name: string; description: string; notes: string };
    onUpdateDetails: (details: { name: string; description: string; notes: string }) => void;
}

export default function DetallesScreen({ details, onUpdateDetails }: DetallesScreenProps) {
    const handleChange = (field: string, value: string) => {
        onUpdateDetails({ ...details, [field]: value });
    };

    return (
        <div className="tmt-screen">
            <div className="tmt-screen-banner">
                <span className="tmt-screen-banner-icon">📝</span>
                <div className="tmt-screen-banner-text">
                    <h2>Detalles de la Sesión</h2>
                    <p>Información general y notas de la partida</p>
                </div>
            </div>

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">Información Principal</span>
                </div>
                <div className="tmt-details-form">
                    <div className="tmt-input-group-vertical">
                        <label>Nombre de la Sesión</label>
                        <input
                            type="text"
                            placeholder="Ej: Misión Alfa, Partida de Viernes..."
                            value={details.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="tmt-details-input"
                        />
                    </div>
                    <div className="tmt-input-group-vertical">
                        <label>Descripción / Contexto</label>
                        <textarea
                            placeholder="Breve descripción de la situación actual..."
                            value={details.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="tmt-details-textarea"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="tmt-section">
                <div className="tmt-section-header">
                    <span className="tmt-section-title">Notas del Director</span>
                </div>
                <div className="tmt-details-form">
                    <textarea
                        placeholder="Notas privadas, recordatorios, eventos pendientes..."
                        value={details.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="tmt-details-textarea notes"
                        rows={10}
                    />
                </div>
            </div>
        </div>
    );
}
