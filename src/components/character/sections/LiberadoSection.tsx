import React from 'react';
import { SheetSection } from '../common/SheetSection';
import { getLiberadoConfig, getLiberadoDones } from '../../wizard/steps/Step3_Especials/sections/LiberadoSection';

interface LiberadoSectionProps {
    character: any;
}

export const LiberadoSection: React.FC<LiberadoSectionProps> = ({ character }) => {
    const origins = character.origin?.items || character.origins || [];
    const liberadoSubtypes: string[] = [];

    origins.forEach((item: any) => {
        const originName = Object.keys(item)[0];
        if (typeof originName === 'string' && originName.startsWith('Liberado')) {
            if (!liberadoSubtypes.includes(originName)) {
                liberadoSubtypes.push(originName);
            }
        }
        const content = item[originName];
        if (Array.isArray(content)) {
            content.forEach((s: string) => {
                if (typeof s === 'string' && s.startsWith('Liberado')) {
                    if (!liberadoSubtypes.includes(s)) {
                        liberadoSubtypes.push(s);
                    }
                }
            });
        }
    });

    if (liberadoSubtypes.length === 0) return null;

    const liberadoParams = character.liberadoParams;
    const selectedGiftIds: string[] = Array.isArray(liberadoParams?.gifts)
        ? liberadoParams.gifts
        : (liberadoParams?.gift && liberadoParams.gift !== 'none' ? [liberadoParams.gift] : []);

    return (
        <>
            {liberadoSubtypes.map(subtype => {
                const config = getLiberadoConfig(subtype);
                const dones = getLiberadoDones(config);
                const selectedGifts = dones.filter(d => selectedGiftIds.includes(d.id));
                const totalGiftsCost = selectedGifts.reduce((acc, g) => acc + (g.cost || 0), 0);

                let themeClass = 'liberado-card-entropia';
                if (subtype.includes('Unidad')) themeClass = 'liberado-card-unidad';
                else if (subtype.includes('Equidad')) themeClass = 'liberado-card-equidad';

                return (
                    <SheetSection
                        key={subtype}
                        title={`Dones de ${config.entityName}`}
                        className="liberado-params"
                        cost={totalGiftsCost > 0 ? <span>(+{totalGiftsCost} PC)</span> : null}
                    >
                        <div className="liberado-cards-list">
                            {/* Rasgo Innato */}
                            <div className={`liberado-card ${themeClass}`}>
                                <div className="liberado-card-header">
                                    <span className="liberado-card-title">Renacimiento</span>
                                    <span className="liberado-badge liberado-badge-innate">Innato</span>
                                </div>
                                <p className="liberado-card-desc">
                                    El alma conserva los recuerdos y sabiduría de vidas pasadas. Al morir, puede renacer de nuevo por designio de {config.entityName}.
                                </p>
                            </div>

                            {/* Dones Adicionales Seleccionados */}
                            {selectedGifts.map(gift => (
                                <div key={gift.id} className={`liberado-card ${themeClass}`}>
                                    <div className="liberado-card-header">
                                        <span className="liberado-card-title">{gift.name}</span>
                                        <span className="liberado-badge liberado-badge-cost">+{gift.cost} PC</span>
                                    </div>
                                    <p className="liberado-card-desc">{gift.description}</p>

                                    {gift.id === 'comprension_senda' && (
                                        <div className="liberado-subchoice-box">
                                            <span className="liberado-subchoice-label">Elección de Senda:</span>
                                            <span className="liberado-subchoice-val">
                                                {liberadoParams?.comprensionChoice === 'no_limit'
                                                    ? 'Sin restricciones en la característica elegida (hasta 200)'
                                                    : `Segunda característica con límite +30 (hasta 130): ${
                                                          liberadoParams?.secondCharacteristic
                                                              ? liberadoParams.secondCharacteristic.toUpperCase()
                                                              : 'No elegida'
                                                      }`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SheetSection>
                );
            })}
        </>
    );
};
