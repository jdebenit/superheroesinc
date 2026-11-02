import { WizardSection } from '../../../shared/layout/WizardSection';
import { CHARACTERISTICS_CONFIG } from '../useStep2Logic';

interface OriginBonusSelectorsProps {
    isDistributableMode: boolean;
    hasSpecialtyPoints: boolean;
    choosableEntries: any[];
    chosenCharacteristics: Record<string, string>;
    chosenBonusCharacteristic: string | null | undefined;
    onSelectCharacteristic: (originKey: string, charId: string) => void;
    onShowHelp?: () => void;
}

export function OriginBonusSelectors({
    isDistributableMode,
    hasSpecialtyPoints,
    choosableEntries,
    chosenCharacteristics,
    chosenBonusCharacteristic,
    onSelectCharacteristic,
    onShowHelp
}: OriginBonusSelectorsProps) {
    const showDistributableBanner = isDistributableMode || hasSpecialtyPoints;

    return (
        <WizardSection
            title="Características del Personaje"
            description={showDistributableBanner
                ? 'Tu origen o especialidad te otorga puntos extra. Repártelos sumando en el modificador que corresponda.'
                : 'Define las características base y sus modificadores.'}
            onHelp={onShowHelp}
        >
            {showDistributableBanner && (
                <div className="step2-info-banner">
                    <span className="info-icon">💡</span>
                    <p>
                        <strong>Puntos libres para distribuir</strong>
                        Tienes puntos extra disponibles por tu Origen o Especialidad. Aumenta los valores numéricos correspondientes en las casillas <strong style={{ display: 'inline' }}>Mod. Origen (✏️)</strong> o <strong style={{ display: 'inline' }}>Mod. Especialidad (✏️)</strong> para gastarlos. Vigila tu reserva total en los indicadores redondos de la derecha.
                    </p>
                </div>
            )}

            {choosableEntries.map(entry => {
                const selectedChar = chosenCharacteristics[entry.originKey] || (choosableEntries.length === 1 ? chosenBonusCharacteristic : null);
                return (
                    <div key={entry.originKey} className="step2-bonus-box">
                        <h4 className="step2-bonus-title">
                            ⭐ {entry.title || (entry.bonus ? `${entry.originKey}: Elige la característica para el bonus de +${entry.bonus}` : `${entry.originKey}: Elige la característica para el bonus de límite (+${entry.maxLimitBonus})`)}
                        </h4>
                        <div className="step2-bonus-grid">
                            {CHARACTERISTICS_CONFIG
                                .filter(char => !entry.allowedCharacteristics || entry.allowedCharacteristics.includes(char.id))
                                .map(char => {
                                    const isSelected = selectedChar === char.id;
                                    return (
                                        <button
                                            key={char.id}
                                            type="button"
                                            onClick={() => onSelectCharacteristic(entry.originKey, char.id)}
                                            className={`step2-bonus-btn ${isSelected ? 'selected' : 'unselected'}`}
                                        >
                                            {char.name} {isSelected && (entry.maxLimitBonus ? `✓ (Máx. ${100 + entry.maxLimitBonus})` : '✓')}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                );
            })}
        </WizardSection>
    );
}
