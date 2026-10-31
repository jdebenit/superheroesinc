import React from 'react';
import type { StoredCharacter } from '../types';
import { getInitials, getCharacterDisplayName, normalizeCharacterIconUrl } from '../../../utils/characterDisplay';

export interface ViewerSidebarProps {
    localCharacters: StoredCharacter[];
    webCharacters: StoredCharacter[];
    selectedId: string | null;
    deletingId: string | null;
    showWebCharacters: boolean;
    error: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onSelect: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onToggleWebCharacters: () => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onTriggerUpload: () => void;
}

export const ViewerSidebar: React.FC<ViewerSidebarProps> = ({
    localCharacters,
    webCharacters,
    selectedId,
    deletingId,
    showWebCharacters,
    error,
    fileInputRef,
    onSelect,
    onDelete,
    onToggleWebCharacters,
    onFileChange,
    onTriggerUpload
}) => {
    return (
        <div className="viewer-sidebar">
            {/* Mis Fichas (Locales) */}
            <div className="sidebar-section-header">
                <h3 className="section-title">Mis Fichas</h3>
                <div className="section-subtitle">
                    {localCharacters.length} locales
                </div>
            </div>

            <div className="local-list">
                {localCharacters.length === 0 ? (
                    <div className="empty-list-msg">
                        No hay fichas subidas.
                    </div>
                ) : (
                    <ul className="char-list">
                        {localCharacters.map(char => {
                            const displayName = getCharacterDisplayName(char.data);
                            const iconUrl = normalizeCharacterIconUrl(char.data?.icon);

                            return (
                                <li
                                    key={char.id}
                                    className={`list-item ${selectedId === char.id ? 'active' : ''} ${deletingId === char.id ? 'deleting' : ''}`}
                                >
                                    <div className="list-item-clickable" onClick={() => onSelect(char.id)}>
                                        <div className={`char-avatar ${char.source || 'local'}`}>
                                            {iconUrl ? (
                                                <img src={iconUrl} alt={displayName} />
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                        <div className="list-item-info">
                                            <div className="char-name">
                                                {char.data?.alias ? (
                                                    <>
                                                        {char.data.alias}
                                                        {char.data.name && <div className="secondary-name">{char.data.name}</div>}
                                                    </>
                                                ) : (
                                                    char.data?.name || '(Sin nombre)'
                                                )}
                                            </div>
                                            <div className="char-details">
                                                Nivel {char.data?.level || 1}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => onDelete(char.id, e)}
                                        title={deletingId === char.id ? "Click para confirmar borrado" : "Eliminar"}
                                        className={`delete-btn ${deletingId === char.id ? 'confirm-mode' : ''}`}
                                    >
                                        {deletingId === char.id ? '⚠️ OK?' : '🗑️'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Subida de Fichas JSON */}
            <div className="upload-section">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept=".json"
                    style={{ display: 'none' }}
                />
                <button
                    onClick={onTriggerUpload}
                    className="upload-btn"
                >
                    ➕ Subir JSON
                </button>
                {error && (
                    <div className="error-msg">
                        {error}
                    </div>
                )}
            </div>

            {/* Fichas Oficiales de la Web */}
            <div
                onClick={onToggleWebCharacters}
                className={`web-section-toggle ${showWebCharacters ? 'open' : ''}`}
            >
                <div>
                    <h3 className="web-section-title">Fichas de la Web</h3>
                    <div className="web-section-subtitle">
                        {webCharacters.length} oficiales
                    </div>
                </div>
                <span className={`toggle-icon ${showWebCharacters ? 'open' : ''}`}>
                    ▼
                </span>
            </div>

            {showWebCharacters && (
                <div className="web-list">
                    {webCharacters.length === 0 ? (
                        <div className="empty-list-msg">
                            Cargando fichas...
                        </div>
                    ) : (
                        <ul className="char-list">
                            {webCharacters.map(char => {
                                const displayName = getCharacterDisplayName(char.data);
                                const iconUrl = normalizeCharacterIconUrl(char.data?.icon);

                                return (
                                    <li
                                        key={char.id}
                                        onClick={() => onSelect(char.id)}
                                        className={`web-list-item ${selectedId === char.id ? 'active' : ''}`}
                                    >
                                        <div className="char-avatar web">
                                            {iconUrl ? (
                                                <img src={iconUrl} alt={displayName} />
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                        <div className="list-item-info">
                                            <div className="web-char-name">
                                                {char.data?.alias ? (
                                                    <>
                                                        {char.data.alias}
                                                        {char.data.name && <div className="secondary-name">{char.data.name}</div>}
                                                    </>
                                                ) : (
                                                    char.data?.name || '(Sin nombre)'
                                                )}
                                            </div>
                                            <div className="web-char-details">
                                                Nivel {char.data?.level || 1}
                                            </div>
                                        </div>
                                        <span title="Ficha Oficial" className="official-badge">🌐</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
