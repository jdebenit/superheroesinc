import { calculateLimits } from '../../../../../utils/characterCalculations';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { WizardField } from '../../../shared/forms/WizardField';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { CHARACTERISTICS_CONFIG } from '../useStep2Logic';

interface CharacteristicsGridSectionProps {
    hasAlternativeForms: boolean;
    isDistributableMode: boolean;
    pointsInfo: { total: number; used: number; remaining: number } | null;
    specialtyPointsInfo: { total: number; used: number; remaining: number } | null;
    totalPC: number;
    unlockManualMod: boolean;
    setUnlockManualMod: (val: boolean) => void;
    characteristics: Record<string, {
        base: number;
        originMod: number;
        specialtyMod: number;
        powerMod: number;
        otherMod: number;
    }>;
    origins: any[];
    chosenCharacteristics: Record<string, string>;
    liberadoParams: any;
    allowedSpecialtyChars: string[] | null;
    pcValues: Record<string, number>;
    getTotal: (charId: string) => number;
    onCharacteristicChange: (charId: string, field: string, value: string) => void;
}

export function CharacteristicsGridSection({
    hasAlternativeForms,
    isDistributableMode,
    pointsInfo,
    specialtyPointsInfo,
    totalPC,
    unlockManualMod,
    setUnlockManualMod,
    characteristics,
    origins,
    chosenCharacteristics,
    liberadoParams,
    allowedSpecialtyChars,
    pcValues,
    getTotal,
    onCharacteristicChange
}: CharacteristicsGridSectionProps) {
    return (
        <WizardSection
            title={hasAlternativeForms ? "Características en Forma Humana" : "Características"}
            rightContent={
                <div className="step2-header-badges">
                    {isDistributableMode && pointsInfo && (
                        <CostBadge
                            cost={`${pointsInfo.used}/${pointsInfo.total}`}
                            label="Ori."
                            variant={pointsInfo.remaining < 0 ? "penalty" : "default"}
                        />
                    )}
                    {specialtyPointsInfo && (
                        <CostBadge
                            cost={`${specialtyPointsInfo.used}/${specialtyPointsInfo.total}`}
                            label="Esp."
                            variant={specialtyPointsInfo.remaining < 0 ? "penalty" : "default"}
                        />
                    )}
                    <CostBadge cost={totalPC} label="PC" variant="penalty" />
                </div>
            }
        >
            <div className="wizard-unlock-container">
                <div className="wizard-unlock-header">
                    <label className="wizard-unlock-label">
                        <input
                            type="checkbox"
                            checked={unlockManualMod}
                            onChange={(e) => setUnlockManualMod(e.target.checked)}
                            className="wizard-unlock-checkbox"
                        />
                        🔓 Desbloquear Modificadores Manuales
                    </label>
                    <span className="wizard-unlock-badge">Avanzado</span>
                </div>
                {unlockManualMod && (
                    <p className="wizard-unlock-description">
                        Usa esta opción para aplicar bonos o penalizadores manuales (objetos mágicos, ajustes del DJ o dotes no automáticas) en la casilla <strong>Mod. Otros</strong> de cada característica. Estos puntos no consumen PC.
                    </p>
                )}
            </div>

            <div className="step2-chars-grid">
                {CHARACTERISTICS_CONFIG.map((char) => {
                    const total = getTotal(char.id);
                    const c = characteristics[char.id];

                    const defaultLimits = calculateLimits(origins, char.id, chosenCharacteristics, liberadoParams);
                    const hasPowerMod = c.powerMod > 0;
                    const unlockedLimit = hasPowerMod || unlockManualMod;
                    const charLimits = {
                        min: defaultLimits.min,
                        max: unlockedLimit ? 200 : defaultLimits.max
                    };

                    const isSpecialtyBlocked = !specialtyPointsInfo || (allowedSpecialtyChars ? !allowedSpecialtyChars.includes(char.id) : false);

                    return (
                        <div key={char.id} className="step2-char-card">
                            <div className="step2-char-header">
                                <div>
                                    <span className="step2-char-name">
                                        {char.name}
                                    </span>
                                    <span className="step2-char-abbr">
                                        ({char.abbr})
                                    </span>
                                </div>
                                <div className="step2-char-header-right">
                                    <div className="step2-char-total-badge">
                                        {total}
                                    </div>
                                    <div className="step2-char-limits">
                                        <div className="step2-char-limit-min">Min: {charLimits.min}</div>
                                        <div className={`step2-char-limit-max ${unlockedLimit ? (hasPowerMod ? 'power' : 'manual') : 'normal'}`}>
                                            Max: {charLimits.max} {hasPowerMod && '⚡'}{(!hasPowerMod && unlockManualMod) && '🔓'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="step2-input-grid">
                                <WizardField
                                    label="Base"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={c.base}
                                    onChange={(val) => onCharacteristicChange(char.id, 'base', val)}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label={isDistributableMode ? 'Mod. Origen (✏️)' : 'Mod. Origen (Auto)'}
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={c.originMod}
                                    readOnly={!isDistributableMode}
                                    onChange={isDistributableMode ? (val) => onCharacteristicChange(char.id, 'originMod', val) : () => { }}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label={
                                        <>
                                            {specialtyPointsInfo ? 'Mod. Especialidad (✏️)' : 'Mod. Especialidad'}
                                            {allowedSpecialtyChars && !allowedSpecialtyChars.includes(char.id) && (
                                                <span className="step2-specialty-locked-icon">🔒</span>
                                            )}
                                        </>
                                    }
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={c.specialtyMod}
                                    readOnly={isSpecialtyBlocked}
                                    disabled={isSpecialtyBlocked}
                                    onChange={(val) => onCharacteristicChange(char.id, 'specialtyMod', val)}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Poder"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={c.powerMod}
                                    readOnly={true}
                                    onChange={() => { }}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                />

                                <WizardField
                                    label="Mod. Otros"
                                    type="number"
                                    min="-200"
                                    max="200"
                                    value={c.otherMod || 0}
                                    readOnly={!unlockManualMod}
                                    disabled={!unlockManualMod}
                                    onChange={(val) => onCharacteristicChange(char.id, 'otherMod', val)}
                                    noMargin
                                    inputWidth="70px"
                                    textAlign="center"
                                    className={unlockManualMod ? 'unlocked-field-wrapper' : ''}
                                />
                            </div>

                            <div className="step2-char-footer">
                                <span className="step2-formula-text">
                                    {c.base} + {c.originMod} + {c.specialtyMod} + {c.powerMod} + {c.otherMod || 0} = <strong className="step2-char-total-highlight">{total}</strong>
                                </span>
                                <CostBadge
                                    cost={pcValues[char.id].toFixed(1)}
                                    label="PC"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── STICKY SUMMARY BAR ── */}
            <div className="step2-sticky-summary">
                {CHARACTERISTICS_CONFIG.map(char => {
                    const total = getTotal(char.id);
                    const limits = calculateLimits(origins, char.id, chosenCharacteristics, liberadoParams);
                    const isValid = total >= limits.min && total <= limits.max;
                    return (
                        <div key={char.id} className={`step2-summary-item ${isValid ? 'valid' : 'invalid'}`}>
                            <span className="step2-summary-abbr">{char.abbr}</span>
                            <span className={`step2-summary-value ${isValid ? '' : 'invalid'}`}>{total}</span>
                        </div>
                    );
                })}
                <div className="step2-summary-spacer" />
                <div className="step2-summary-total">
                    <span className="step2-summary-total-label">Total</span>
                    <span className="step2-summary-total-val">
                        {totalPC.toFixed(1)} PC
                    </span>
                </div>
            </div>
        </WizardSection>
    );
}
