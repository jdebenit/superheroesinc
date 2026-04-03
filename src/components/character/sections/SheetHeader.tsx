import React from 'react';
import { APP_VERSIONS } from '../../../data/appVersions';

interface SheetHeaderProps {
    character: any;
    totalPCs?: number | string;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ character, totalPCs }) => {
    const displayName = character.alias || character.name || "Nuevo Personaje";
    const showRealName = character.alias && character.name;

    return (
        <div className="sheet-header">
            <div className="header-titles">
                <h3>{displayName}</h3>
                {showRealName && <h4 className="character-real-name">{character.name}</h4>}
            </div>

            <div className="header-stats">
                {character.level && <span className="level-badge">Nivel {character.level}</span>}
                {(totalPCs || character.totalCost) && (
                    <span className="total-cost">Total PCs: {totalPCs || character.totalCost}</span>
                )}
                <span className="sheet-version">
                    v{APP_VERSIONS.CHARACTER_SHEET}
                </span>
            </div>
        </div>
    );
};
