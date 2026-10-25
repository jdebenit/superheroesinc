import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/layout/WizardSection';
import { SectionHeaderBadge } from '../../../shared/ui/SectionHeaderBadge';
import { CostBadge } from '../../../shared/ui/CostBadge';

export interface LiberadoParams {
    gifts?: string[];
    gift?: string | null;
    comprensionChoice?: 'second_characteristic' | 'no_limit' | null;
    secondCharacteristic?: string | null;
}

export interface LiberadoConfig {
    name: string;
    entityName: string;
    sendaName: string;
    characteristics: Array<{ id: string; name: string }>;
}

export const LIBERADO_CONFIGS: Record<string, LiberadoConfig> = {
    'Liberado de Entropía': {
        name: 'Liberado de Entropía',
        entityName: 'Entropía',
        sendaName: 'Senda de Entropía',
        characteristics: [
            { id: 'fuerza', name: 'Fuerza (FUE)' },
            { id: 'constitucion', name: 'Constitución (CON)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    },
    'Liberado de Unidad': {
        name: 'Liberado de Unidad',
        entityName: 'Unidad',
        sendaName: 'Senda de Unidad',
        characteristics: [
            { id: 'agilidad', name: 'Agilidad (AGI)' },
            { id: 'apariencia', name: 'Apariencia (APA)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    },
    'Liberado de Equidad': {
        name: 'Liberado de Equidad',
        entityName: 'Equidad',
        sendaName: 'Senda de Equidad',
        characteristics: [
            { id: 'inteligencia', name: 'Inteligencia (INT)' },
            { id: 'percepcion', name: 'Percepción (PER)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    }
};

export function getLiberadoConfig(subtype?: string): LiberadoConfig {
    if (subtype && LIBERADO_CONFIGS[subtype]) {
        return LIBERADO_CONFIGS[subtype];
    }
    return LIBERADO_CONFIGS['Liberado de Entropía'];
}

export const getLiberadoDones = (config: LiberadoConfig) => [
    {
        id: 'conocimiento_esferas',
        name: 'Conocimiento de las esferas',
        cost: 1,
        description: 'Acceso a la magia sin necesidad de los requisitos habituales. Cada PC invertido en magia otorga 10 EM.'
    },
    {
        id: 'comprension_senda',
        name: 'Comprensión de la senda',
        cost: 2,
        description: 'Permite superar el límite en una segunda característica de su senda (+30, hasta 130) o superar el límite sin restricciones en la elegida (hasta 200).'
    },
    {
        id: 'maestro_senda',
        name: 'Maestro de la senda',
        cost: 3,
        description: `Conexión directa con ${config.entityName} cósmica: puede formular una pregunta diaria a ${config.entityName} para discernir verdades universales.`
    }
];

export const LIBERADO_DONES = getLiberadoDones(LIBERADO_CONFIGS['Liberado de Entropía']);

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
