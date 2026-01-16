import React from 'react';

interface RollModalResultProps {
    rollResult: {
        roll: number;
        success: boolean;
        isCrit: boolean;
        isFumble: boolean;
        finalFunction: number;
        margin: number;
        hitLocation?: { roll: number, location: string, effect: string };
    };
    onRetry: () => void;
}

export const RollModalResult: React.FC<RollModalResultProps> = ({ rollResult, onRetry }) => {
    return (
        <div className="roll-result-container">
            <div className="roll-result-label">
                {rollResult.isCrit ? '¡CRÍTICO!' :
                    rollResult.isFumble ? '¡PIFIA!' :
                        rollResult.success ? 'ÉXITO' : 'FALLO'}
            </div>
            <div className={`roll-result-number ${rollResult.success ? 'success' : 'failure'} ${rollResult.isCrit ? 'critical-success' : ''} ${rollResult.isFumble ? 'critical-failure' : ''}`}>
                {rollResult.roll}
            </div>
            <div className="roll-details">
                Margen: {rollResult.margin > 0 ? '+' : ''}{rollResult.margin}
            </div>

            {rollResult.hitLocation && (
                <div className="hit-location-container">
                    <div className="hit-location-roll">
                        Localización (d20: {rollResult.hitLocation.roll})
                    </div>
                    <div className="hit-location-name">
                        {rollResult.hitLocation.location}
                    </div>
                    <div className="hit-location-effect">
                        {rollResult.hitLocation.effect}
                    </div>
                </div>
            )}

            <button className="btn-retry" onClick={onRetry}>
                🔄 Tirar de nuevo
            </button>
        </div>
    );
};
