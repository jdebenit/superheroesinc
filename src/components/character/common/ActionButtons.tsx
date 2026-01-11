import React from 'react';

interface ActionButtonsProps {
    onDownloadJson: () => void;
    onExportPdf: () => void;
    variant: 'modal' | 'inline';
}

/**
 * Reusable action buttons component for JSON and PDF export
 * Supports both modal (icon-only) and inline (full-text) variants
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onDownloadJson,
    onExportPdf,
    variant
}) => {
    if (variant === 'inline') {
        return (
            <div className="inline-actions">
                <button onClick={onDownloadJson} className="action-btn" title="Descargar JSON">
                    💾 Descargar JSON
                </button>
                <button onClick={onExportPdf} className="action-btn" title="Exportar PDF">
                    📥 Exportar PDF
                </button>
            </div>
        );
    }

    // Modal variant - icon only
    return (
        <>
            <button onClick={onDownloadJson} className="action-btn" title="Descargar JSON">
                💾
            </button>
            <button onClick={onExportPdf} className="action-btn" title="Exportar PDF">
                📥
            </button>
        </>
    );
};
