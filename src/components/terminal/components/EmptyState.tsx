import React from 'react';

interface EmptyStateProps {
    message?: string;
    icon?: string;
}

export default function EmptyState({ 
    message = 'Carga un archivo JSON de SHI TPT para comenzar', 
    icon = '📋' 
}: EmptyStateProps) {
    return (
        <div className="terminal-empty-state">
            <div className="terminal-empty-icon">{icon}</div>
            <div className="terminal-empty-text">
                {message}
            </div>
        </div>
    );
}
