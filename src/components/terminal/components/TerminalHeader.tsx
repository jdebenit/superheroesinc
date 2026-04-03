import React from 'react';
import CharacterSheet from '../../character/CharacterSheet';
import { APP_VERSIONS } from '../../../data/appVersions';

interface CharacterData {
    name: string;
    alias?: string;
    [key: string]: any;
}

interface TerminalHeaderProps {
    character: CharacterData | null;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    onReset: () => void;
    adaptedCharacter: any;
}

export default function TerminalHeader({
    character,
    onImport,
    onExport,
    onReset,
    adaptedCharacter
}: TerminalHeaderProps) {
    const triggerImportInput = () => {
        document.getElementById('json-import')?.click();
    };

    return (
        <div className="terminal-header-internal">
            <h1 className="terminal-title-internal">
                SHI Tactic Player Terminal ({APP_VERSIONS.TACTIC_PLAYER_TERMINAL})
            </h1>
            <div className="terminal-header-actions">
                <input
                    type="file"
                    id="json-import"
                    accept=".json"
                    onChange={onImport}
                    style={{ display: 'none' }}
                />
                <button onClick={triggerImportInput} className="import-btn">
                    📥 Importar JSON
                </button>
                {character && (
                    <>
                        <CharacterSheet
                            character={adaptedCharacter}
                            totalPCs={0}
                        />
                        <button onClick={onExport} className="export-btn">
                            💾 Exportar JSON
                        </button>
                        <button onClick={onReset} className="reset-btn">
                            🔄 Reset
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
