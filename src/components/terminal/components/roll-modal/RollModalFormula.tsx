import React from 'react';

interface RollModalFormulaProps {
    targetValue: number;
    modifiersSum: number;
    parsedCustomMod: number;
    mode: 'basic' | 'combat' | 'opposed';
    subMode: 'melee' | 'distance';
    parryValue: number;
    opposedValue?: number;
    divisionFactor?: number;
    isAutoHit: boolean;
    finalProbability: number;
}

export const RollModalFormula: React.FC<RollModalFormulaProps> = ({
    targetValue,
    modifiersSum,
    parsedCustomMod,
    mode,
    subMode,
    parryValue,
    opposedValue,
    divisionFactor,
    isAutoHit,
    finalProbability
}) => {
    return (
        <div className="roll-attribute-info compact">
            <div className="roll-formula">
                {mode === 'opposed' ? (
                    <>
                        <span className="formula-part" title="Base">50</span>
                        <span className="formula-op">+</span>
                        <span className="formula-part" title="Habilidad">{targetValue}</span>
                        <span className="formula-op">-</span>
                        <span className="formula-part negative" title="Valor Oponente">{opposedValue || 0}</span>
                    </>
                ) : (
                    <>
                        <span className="formula-part" title="Valor Base">
                            {divisionFactor && divisionFactor > 1 ? `${targetValue}/${divisionFactor}` : targetValue}
                        </span>

                        {/* Modifiers Sum */}
                        <span className="formula-op">{modifiersSum >= 0 ? '+' : ''}</span>
                        <span className={`formula-part ${modifiersSum < 0 ? 'negative' : 'positive'}`} title="Modificadores">
                            {Math.abs(modifiersSum)}
                        </span>

                        {/* Deduction */}
                        <span className="formula-op">-</span>
                        {mode === 'basic' ? (
                            <span className={`formula-part ${parsedCustomMod !== 0 ? 'active' : ''}`} title="Personalizado (ya incluido arriba)">
                                0
                            </span>
                        ) : (
                            <span className="formula-part negative" title={subMode === 'distance' ? 'Mod. Defensor' : 'Parada'}>
                                {parryValue}
                            </span>
                        )}
                    </>
                )}

                <span className="formula-eq">=</span>
                <span className="formula-result">{isAutoHit ? 'AUTO' : `${finalProbability}%`}</span>
            </div>
            <div className="roll-formula-label">
                Probabilidad de Éxito {isAutoHit && '(Solo Pifia)'}
            </div>
        </div>
    );
};
