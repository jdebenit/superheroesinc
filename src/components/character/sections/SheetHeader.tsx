import React from 'react';

interface SheetHeaderProps {
    character: any;
    totalPCs?: number | string;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ character, totalPCs }) => {
    return (
        <div className="sheet-header">
            <h3>{character.name || "Nuevo Personaje"}</h3>
            {character.alias && <h4 className="character-alias">"{character.alias}"</h4>}

            <div className="header-stats">
                {character.level && <span className="level-badge">Nivel {character.level}</span>}
                {(totalPCs || character.totalCost) && (
                    <span className="total-cost">Total PCs: {totalPCs || character.totalCost}</span>
                )}
            </div>
        </div>
    );
};
