import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { CostBadge } from '../../../shared/ui/CostBadge';
import {
    LIBERADO_CONFIGS,
    LIBERADO_DONES,
    getLiberadoConfig,
    getLiberadoDones,
    type LiberadoConfig
} from '../../../../../data/originOptions';
import type { LiberadoParams } from '../../../../../types/character';

export { LIBERADO_CONFIGS, LIBERADO_DONES, getLiberadoConfig, getLiberadoDones, type LiberadoConfig, type LiberadoParams };

interface LiberadoSectionProps {
    liberadoParams: LiberadoParams;
    chosenBonusCharacteristic?: string | null;
    subtype?: string;
    onChange: (updates: any) => void;
    onShowToast?: (msg: string, type: 'error' | 'success') => void;
}

export default function LiberadoSection({
    liberadoParams,
    chosenBonusCharacteristic,
    subtype = 'Liberado de Entropía',
    onChange
}: LiberadoSectionProps) {
    const config = useMemo(() => getLiberadoConfig(subtype), [subtype]);
    const dones = useMemo(() => getLiberadoDones(config), [config]);

    const selectedGifts: string[] = useMemo(() => {
        if (Array.isArray(liberadoParams?.gifts)) {
            return liberadoParams.gifts;
        }
        if (liberadoParams?.gift && liberadoParams.gift !== 'none') {
            return [liberadoParams.gift];
        }
        return [];
    }, [liberadoParams?.gifts, liberadoParams?.gift]);

    const totalCost = useMemo(() => {
        return selectedGifts.reduce((sum, giftId) => {
            const item = dones.find(d => d.id === giftId);
            return sum + (item ? item.cost : 0);
        }, 0);
    }, [selectedGifts, dones]);

    const handleToggleGift = (giftId: string) => {
        const isCurrentlySelected = selectedGifts.includes(giftId);
        const nextGifts = isCurrentlySelected
            ? selectedGifts.filter(id => id !== giftId)
            : [...selectedGifts, giftId];

        const hasComprension = nextGifts.includes('comprension_senda');

        onChange({
            liberadoParams: {
                ...(liberadoParams || {}),
                gifts: nextGifts,
                gift: nextGifts[0] || null,
                comprensionChoice: hasComprension ? (liberadoParams?.comprensionChoice || 'second_characteristic') : null,
                secondCharacteristic: hasComprension ? (liberadoParams?.secondCharacteristic || null) : null
            }
        });
    };

    const availableSecondChars = config.characteristics.filter(
        c => c.id !== chosenBonusCharacteristic
    );

    const isSecondCharValid = availableSecondChars.some(c => c.id === liberadoParams?.secondCharacteristic);
    const selectedSecondChar = isSecondCharValid ? liberadoParams?.secondCharacteristic : null;

    return (
        <WizardSection
            title={`Dones de ${config.entityName}`}
            description={`Los Liberados poseen la memoria ancestral de sus vidas pasadas y pueden manifestar dones cósmicos adicionales vinculados a ${config.entityName} (puedes seleccionar varios).`}
            color="#7c3aed"
            rightContent={
                <SectionHeaderBadge
                    cost={totalCost > 0 ? `+${totalCost}` : 0}
                    label="PC"
                    variant={totalCost === 0 ? "free" : "penalty"}
                />
            }
        >
            {/* Lista de Dones con Checkboxes */}
            <div className="liberado-dones-list">
                {dones.map(gift => {
                    const isSelected = selectedGifts.includes(gift.id);
                    return (
                        <div
                            key={gift.id}
                            onClick={() => handleToggleGift(gift.id)}
                            className={`liberado-gift-card ${isSelected ? 'selected' : ''}`}
                        >
                            <div className="liberado-gift-header">
                                <div className="liberado-gift-title-group">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => { }}
                                        className="liberado-gift-checkbox"
                                    />
                                    <span className="liberado-gift-title">
                                        {gift.name}
                                    </span>
                                </div>
                                <CostBadge cost={gift.cost} label="PC" variant="penalty" />
                            </div>
                            <span className="liberado-gift-description">
                                {gift.description}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Sub-configuración si se eligió Comprensión de la senda */}
            {selectedGifts.includes('comprension_senda') && (
                <div className="liberado-subpanel">
                    <span className="liberado-subpanel-title">
                        ⚙️ Elige cómo aplicar "Comprensión de la senda":
                    </span>

                    <div className="liberado-subpanel-options">
                        <label className="liberado-radio-label">
                            <input
                                type="radio"
                                name={`comprensionChoice_${subtype}`}
                                checked={(liberadoParams?.comprensionChoice || 'second_characteristic') === 'second_characteristic'}
                                onChange={() => onChange({
                                    liberadoParams: {
                                        ...liberadoParams,
                                        comprensionChoice: 'second_characteristic'
                                    }
                                })}
                            />
                            <span>Superar el límite en una <strong>segunda característica</strong> de la Senda (+30, hasta 130)</span>
                        </label>

                        {(liberadoParams?.comprensionChoice || 'second_characteristic') === 'second_characteristic' && (
                            <div className="liberado-char-btn-grid">
                                {availableSecondChars.map(char => {
                                    const isSecondSelected = selectedSecondChar === char.id;
                                    return (
                                        <button
                                            key={char.id}
                                            type="button"
                                            onClick={() => onChange({
                                                liberadoParams: {
                                                    ...liberadoParams,
                                                    secondCharacteristic: char.id
                                                }
                                            })}
                                            className={`liberado-char-btn ${isSecondSelected ? 'selected' : ''}`}
                                        >
                                            {char.name} {isSecondSelected && '✓ (Máx. 130)'}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <label className="liberado-radio-label">
                            <input
                                type="radio"
                                name={`comprensionChoice_${subtype}`}
                                checked={liberadoParams?.comprensionChoice === 'no_limit'}
                                onChange={() => onChange({
                                    liberadoParams: {
                                        ...liberadoParams,
                                        comprensionChoice: 'no_limit',
                                        secondCharacteristic: null
                                    }
                                })}
                            />
                            <span>Superar el límite <strong>sin restricciones</strong> en la característica elegida (hasta 200)</span>
                        </label>
                    </div>
                </div>
            )}
        </WizardSection>
    );
}
