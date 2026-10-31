import React from 'react';
import type { StoredCharacter } from '../types';
import CharacterSheet from '../../character/CharacterSheet';
import { adaptWebCharacter } from '../../../utils/characterAdapter';
import { getStatDisplayValue } from '../../../utils/characterCalculations';
import { getCharacterDisplayName } from '../../../utils/characterDisplay';
import { ViewerToolbar } from './ViewerToolbar';

export interface ViewerContentProps {
    selectedCharacter?: StoredCharacter;
    onEditInWizard: () => void;
    onDownloadJson: () => void;
}

export const ViewerContent: React.FC<ViewerContentProps> = ({
    selectedCharacter,
    onEditInWizard,
    onDownloadJson
}) => {
    if (!selectedCharacter) {
        return (
            <div className="viewer-content">
                <div className="empty-viewer">
                    <div className="empty-icon">👈</div>
                    <h3 className="empty-title">Selecciona un personaje</h3>
                    <p className="empty-text">
                        Selecciona una ficha oficial de la web o importa tus propios archivos JSON.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = getCharacterDisplayName(selectedCharacter.data);
    const originName = selectedCharacter.data?.origin?.items?.[0]
        ? Object.keys(selectedCharacter.data.origin.items[0])[0]
        : 'Desconocido';

    return (
        <div className="viewer-content">
            <div className="content-card">
                {/* Cabecera del Personaje */}
                <div className="content-header">
                    <h2 className="content-title">
                        {displayName}
                        {selectedCharacter.data?.alias && selectedCharacter.data?.name && (
                            <div className="content-subtitle">
                                {selectedCharacter.data.name}
                            </div>
                        )}
                    </h2>
                    <span className="content-source-badge">
                        {selectedCharacter.source === 'web'
                            ? '🌐 Ficha Oficial de la Web'
                            : `Añadido: ${new Date(selectedCharacter.addedAt).toLocaleDateString()}`}
                    </span>
                </div>

                {/* Resumen de Ficha */}
                <div className="character-summary">
                    <div className="summary-header">
                        <h4 className="summary-title">Resumen de Ficha</h4>
                        <CharacterSheet
                            character={adaptWebCharacter(selectedCharacter.data)}
                            totalPCs={selectedCharacter.data.totalCost}
                            renderTrigger={(open) => (
                                <button onClick={open} className="expand-summary-btn" title="Ver ficha completa">
                                    🔍 Ficha Completa
                                </button>
                            )}
                        />
                    </div>
                    <div className="summary-grid">
                        <div>
                            <strong>Nivel:</strong> {selectedCharacter.data?.level || 1}
                        </div>
                        <div>
                            <strong>Alias:</strong> {selectedCharacter.data?.alias || '-'}
                        </div>
                        <div>
                            <strong>Nombre:</strong> {selectedCharacter.data?.name || '-'}
                        </div>
                        <div>
                            <strong>Puntos de Vida:</strong> {getStatDisplayValue(selectedCharacter.data?.combatstats?.["Puntos de Vida"])}
                        </div>
                        <div>
                            <strong>Equilibrio Mental:</strong> {getStatDisplayValue(selectedCharacter.data?.combatstats?.["Equilibrio Mental"])}
                        </div>
                        <div>
                            <strong>Origen:</strong> {originName}
                        </div>
                        {selectedCharacter.data?.meta?.version && (
                            <div>
                                <strong>Versión Wizard:</strong> <span className="version-badge">{selectedCharacter.data.meta.version}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra de Acciones */}
                <ViewerToolbar
                    character={selectedCharacter}
                    onEditInWizard={onEditInWizard}
                    onDownloadJson={onDownloadJson}
                />
            </div>
        </div>
    );
};
