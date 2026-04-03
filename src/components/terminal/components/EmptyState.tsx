import React from 'react';

interface EmptyStateProps {
    message?: string;
    icon?: string;
}

export default function EmptyState({
    message = 'Carga un archivo JSON para comenzar',
    icon = '📋'
}: EmptyStateProps) {
    return (
        <div className="terminal-empty-state">
            <div className="terminal-empty-icon">{icon}</div>
            <div className="terminal-empty-text">
                {message}
            </div>

            <div className="terminal-import-explanation">
                <div className="explanation-card">
                    <h4>📥 IMPORTAR TPT</h4>
                    <p>Usa esta opción si ya tienes una partida en curso. Restaurará tu vida actual, historial de combate y energía consumida.</p>
                </div>
                <div className="explanation-card">
                    <h4>👤 CARGAR PERSONAJE</h4>
                    <p>Ideal para empezar de cero con la ficha del Generador de fichas (Wizard). Se calcularán tus valores máximos de vida y equilibrio mental automáticamente.</p>
                </div>
                <div className="explanation-card">
                    <h4>💾 EXPORTAR JSON</h4>
                    <p>Guarda tu progreso actual (vida, notas, historial) en un archivo para poder continuar tu partida en otro momento.</p>
                </div>
                <div className="explanation-card">
                    <h4>🔄 RESET</h4>
                    <p>Borra todos los datos del terminal (incluyendo la memoria local) para dejarlo limpio y listo para cargar otro personaje.</p>
                </div>
            </div>
        </div>
    );
}
