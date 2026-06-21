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
                <button onClick={onDownloadJson} className="inline-action-btn" title="Descargar JSON">
                    💾 Descargar JSON
                </button>
                <button onClick={onExportPdf} className="inline-action-btn pdf-btn" title="Exportar PDF">
                    <img src="/icons/descargar-pdf.png" alt="PDF" className="btn-icon" />
                    <span>Exportar PDF</span>
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
            <button onClick={onExportPdf} className="action-btn pdf-btn" title="Exportar PDF">
                <img src="/icons/descargar-pdf.png" alt="PDF" className="btn-icon" />
            </button>
        </>
    );
};
