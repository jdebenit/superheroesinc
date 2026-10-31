import React from 'react';
import type { StoredCharacter } from '../types';
import { adaptWebCharacter } from '../../../utils/characterAdapter';
import { pushCharacterToTmt } from '../../terminal/utils/tmtStorage';
import Logger from '../../../utils/Logger';

export interface ViewerToolbarProps {
    character: StoredCharacter;
    onEditInWizard: () => void;
    onDownloadJson: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
    character,
    onEditInWizard,
    onDownloadJson
}) => {
    const handleOpenTpt = () => {
        try {
            localStorage.setItem('shi_tpt_character', JSON.stringify(adaptWebCharacter(character.data)));
            window.open('/recursos/tactic-player-terminal', 'shi_tpt_terminal');
        } catch (error) {
            Logger.error('Error sending character to terminal:', error);
            alert('Error al enviar el personaje al terminal');
        }
    };

    const handleOpenTmt = () => {
        try {
            pushCharacterToTmt(
                adaptWebCharacter(character.data),
                'pj'
            );
            window.open('/recursos/tactic-master-terminal', 'shi_tmt_terminal');
        } catch (error) {
            Logger.error('Error sending character to TMT:', error);
            alert('Error al enviar el personaje al TMT');
        }
    };

    return (
        <div className="viewer-actions">
            <button
                onClick={handleOpenTpt}
                className="viewer-button btn-primary"
                title="Abrir en Tactic Player Terminal"
            >
                🎮 Abrir en SHI TPT
            </button>
            <button
                onClick={handleOpenTmt}
                className="viewer-button btn-primary"
                title="Abrir en Tactic Master Terminal"
            >
                🎯 Abrir en SHI TMT
            </button>
            <button
                onClick={onDownloadJson}
                className="viewer-button download-btn"
                title="Descargar ficha como JSON"
            >
                ⬇️ Descargar JSON
            </button>
            <button
                onClick={onEditInWizard}
                className="viewer-button edit-wizard-btn"
                title="Abrir en el Generador"
            >
                🛠️ Editar en Wizard
            </button>
        </div>
    );
};
