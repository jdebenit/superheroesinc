import React from 'react';
import CharacterSheet from '../../character/CharacterSheet';

interface TerminalHeaderProps {
    title: string;
    version: string;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onImportCharacter: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport?: () => void;
    onReset?: () => void;
    character?: any;
    adaptedCharacter?: any;
    showCharacterSheet?: boolean;
}

export default function TerminalHeader({
    title,
    version,
    onImport,
    onImportCharacter,
    onExport,
    onReset,
    character,
    adaptedCharacter,
    showCharacterSheet = false
}: TerminalHeaderProps) {
    const triggerImportInput = () => {
        document.getElementById('tpt-json-import')?.click();
    };

    const triggerCharacterImport = () => {
        document.getElementById('character-json-import')?.click();
    };

    const hasCharacter = character !== null && character !== undefined;

    return (
        <div className="terminal-header-internal">
            <h1 className="terminal-title-internal">
                {title} <span className="terminal-title-version">({version})</span>
            </h1>
            <div className="terminal-header-actions">
                {/* Hidden input for TPT State */}
                <input
                    type="file"
                    id="tpt-json-import"
                    accept=".json"
                    onChange={onImport}
                    style={{ display: 'none' }}
                />
                {/* Hidden input for Character JSON */}
                <input
                    type="file"
                    id="character-json-import"
                    accept=".json"
                    onChange={onImportCharacter}
                    style={{ display: 'none' }}
                />

                <button onClick={triggerImportInput} className="import-btn" title="Importar estado guardado (SHI-TPT)">
                    📥 Importar TPT
                </button>

                {!hasCharacter && (
                    <button onClick={triggerCharacterImport} className="terminal-btn-secondary" title="Importar personaje nuevo para iniciar sesión">
                        👤 Cargar Personaje
                    </button>
                )}

                {showCharacterSheet && adaptedCharacter && (
                    <CharacterSheet
                        character={adaptedCharacter}
                        totalPCs={0}
                        renderTrigger={(open) => (
                            <button onClick={open} className="terminal-btn-secondary" title="Ver ficha detallada">
                                📋 Visualizar Ficha
                            </button>
                        )}
                    />
                )}
                {onExport && (
                    <button onClick={onExport} className="export-btn">
                        💾 Exportar JSON
                    </button>
                )}
                {onReset && (
                    <button onClick={onReset} className="reset-btn">
                        🔄 Reset
                    </button>
                )}
            </div>
        </div>
    );
}
