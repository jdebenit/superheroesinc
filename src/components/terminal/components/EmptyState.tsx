import React from 'react';

export default function EmptyState() {
    return (
        <div className="terminal-empty-state">
            <div className="terminal-empty-icon">📋</div>
            <div className="terminal-empty-text">
                Carga un archivo JSON de personaje para comenzar
            </div>
        </div>
    );
}
