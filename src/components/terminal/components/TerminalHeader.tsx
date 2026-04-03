import React from 'react';
import CharacterSheet from '../../character/CharacterSheet';

interface TerminalHeaderProps {
    title: string;
    version: string;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    onExport,
    onReset,
    character,
    adaptedCharacter,
    showCharacterSheet = false
}: TerminalHeaderProps) {
    const triggerImportInput = () => {
        const id = showCharacterSheet ? 'json-import' : 'tmt-json-import';
        document.getElementById(id)?.click();
    };

    return (
        <div className="terminal-header-internal">
            <h1 className="terminal-title-internal">
                {title} <span className="terminal-title-version">({version})</span>
            </h1>
            <div className="terminal-header-actions">
                <input
                    type="file"
                    id={showCharacterSheet ? 'json-import' : 'tmt-json-import'}
                    accept=".json"
                    onChange={onImport}
                    style={{ display: 'none' }}
                    multiple={!showCharacterSheet}
                />
                <button onClick={triggerImportInput} className="import-btn">
                    📥 Importar JSON
                </button>
                {showCharacterSheet && adaptedCharacter && (
                    <CharacterSheet
                        character={adaptedCharacter}
                        totalPCs={0}
                        renderTrigger={(open) => (
                            <button onClick={open} className="terminal-btn-secondary">
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
