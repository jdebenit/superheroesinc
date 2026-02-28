import React from 'react';
import PowerRow from './PowerRow';
import type { SelectedPower } from '../types';
import { WizardSection } from '../../../shared/WizardSection';

import { PixelButton } from '../../../shared/PixelButton';
import { TableContainer } from '../../../shared/TableContainer';
import { EmptyState } from '../../../shared/EmptyState';

interface PowersSectionProps {
    data: any;
    selectedPowers: SelectedPower[];
    onOpenModal: (origin: string) => void;
    onUpdateRank: (index: number, rank: number) => void;
    onUpdateMod: (index: number, mod: number) => void;
    onUpdateSkillValue: (index: number, value: number) => void;
    onUpdateOption: (index: number, option: string) => void;
    onUpdateCustomizations: (index: number, customizations: { id: string; description: string; cost: number }[]) => void;
    onRemove: (index: number) => void;
    // Origin flags
    isGuardian: boolean;
    isAlterado: boolean;
    isVampiro: boolean;
    isSemidemonio: boolean;
    isMaldito: boolean;
    isEnte: boolean;
    isThals: boolean;
    isDivino: boolean;
    isTerrano: boolean;
    isDotado: boolean;
    isCosmico: boolean;
    isMutante: boolean;
    isTesKhar?: boolean;
    isAtlante?: boolean;
    isParahumanoHybrid?: boolean;
    isTroll?: boolean;
    isPoseido?: boolean;
    isEnano?: boolean;
    isGrifo?: boolean;
    isElfoFisico?: boolean;
    isElfoPsiquico?: boolean;
    isHadaEter?: boolean;
    isHadaAire?: boolean;
    isHadaFuego?: boolean;
    isHadaAgua?: boolean;
    isHadaTierra?: boolean;
}

export default function PowersSection({
    data,
    selectedPowers,
    onOpenModal,
    onUpdateRank,
    onUpdateMod,
    onUpdateSkillValue,
    onUpdateOption,
    onUpdateCustomizations,
    onRemove,
    isGuardian,
    isAlterado,
    isVampiro,
    isSemidemonio,
    isMaldito,
    isEnte,
    isThals,
    isDivino,
    isTerrano,
    isDotado,
    isCosmico,
    isMutante,
    isTesKhar,
    isAtlante,
    isParahumanoHybrid,
    isTroll,
    isPoseido,
    isEnano,
    isGrifo,
    isElfoFisico,
    isElfoPsiquico,
    isHadaEter,
    isHadaAire,
    isHadaFuego,
    isHadaAgua,
    isHadaTierra
}: PowersSectionProps) {
    const hasAnyPowerOrigin = isGuardian || isAlterado || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isTerrano || isDotado || isCosmico || isMutante || isTesKhar || isAtlante || isTroll || isPoseido || isEnano || isGrifo || isElfoFisico || isElfoPsiquico || isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;

    if (!hasAnyPowerOrigin) return null;

    const renderHeaderActions = () => (
        <div className="powers-section-actions">
            {isGuardian && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="guardian" className="small">
                    <span>+</span> Guardián
                </PixelButton>
            )}
            {isAlterado && (
                <PixelButton onClick={() => onOpenModal('Alterado')} variant="alterado" className="small">
                    <span>+</span> Alterado
                </PixelButton>
            )}
            {isVampiro && (
                <PixelButton onClick={() => onOpenModal('Vampírico')} variant="vampirico" className="small">
                    <span>+</span> Vampírico
                </PixelButton>
            )}
            {(isSemidemonio || isMaldito || isPoseido) && (
                <PixelButton onClick={() => onOpenModal('Sobrenatural')} variant="sobrenatural" className="small">
                    <span>+</span> Sobrenatural
                </PixelButton>
            )}
            {isThals && (
                <PixelButton onClick={() => onOpenModal('Thals')} variant="thals" className="small">
                    <span>+</span> Thals
                </PixelButton>
            )}
            {isDivino && (
                <PixelButton onClick={() => onOpenModal('Divino')} variant="divino" className="small">
                    <span>+</span> Divino
                </PixelButton>
            )}
            {isTerrano && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="terrano" className="small">
                    <span>+</span> Terrano (Guardian)
                </PixelButton>
            )}
            {isEnano && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="guardian" className="small">
                    <span>+</span> Enano (Guardian)
                </PixelButton>
            )}
            {isDotado && (
                <PixelButton onClick={() => onOpenModal('Sobrenatural')} variant="dotado" className="small">
                    <span>+</span> Dotado (Sobrenatural)
                </PixelButton>
            )}
            {isCosmico && (
                <PixelButton onClick={() => onOpenModal('Cósmico')} variant="cosmico" className="small">
                    <span>+</span> Cósmico
                </PixelButton>
            )}
            {isMutante && (
                <PixelButton onClick={() => onOpenModal('Mutante')} variant="mutante" className="small">
                    <span>+</span> Mutante
                </PixelButton>
            )}
            {isEnte && (
                <PixelButton onClick={() => onOpenModal('Mutante')} variant="ente" className="small">
                    <span>+</span> Mutante (Ente)
                </PixelButton>
            )}
            {isElfoPsiquico && (
                <PixelButton onClick={() => onOpenModal('Psíquico')} variant="psiquico" className="small">
                    <span>+</span> Poderes Psíquicos
                </PixelButton>
            )}
        </div>
    );

    return (
        <WizardSection
            title="Poderes Especiales"
            color="#0f172a"
            rightContent={renderHeaderActions()}
        >

            {selectedPowers.length > 0 ? (
                <TableContainer
                    headers={['Poder', 'Base / Rango / PCs', 'Base Hab.', 'Origen', 'Acciones']}
                    showTotal={false}
                    tableClassName="wizard-table--powers"
                >
                    {(() => {
                        let thalsCount = 0;
                        return selectedPowers.map((selection, idx) => {
                            const isThalsPower = isThals && selection.origin === 'Thals';
                            if (isThalsPower) thalsCount++;

                            const isThalsFree = isThalsPower && thalsCount === 1;
                            const isThalsDiscount = isThalsPower && thalsCount > 1;

                            return (
                                <PowerRow
                                    key={`${selection.id}-${selection.origin}-${idx}`}
                                    selection={selection}
                                    data={data}
                                    index={idx}
                                    onUpdateRank={onUpdateRank}
                                    onUpdateMod={onUpdateMod}
                                    onUpdateSkillValue={onUpdateSkillValue}
                                    onUpdateOption={onUpdateOption}
                                    onUpdateCustomizations={onUpdateCustomizations}
                                    onRemove={onRemove}
                                    isParahumanoHybrid={isParahumanoHybrid}
                                    isTesKhar={isTesKhar}
                                    isAtlante={isAtlante}
                                    isTroll={isTroll}
                                    isSemidemonio={isSemidemonio}
                                    isThalsFree={isThalsFree}
                                    isThalsDiscount={isThalsDiscount}
                                    isEnano={isEnano}
                                    isGrifo={isGrifo}
                                    isElfoFisico={isElfoFisico}
                                    isHadaEter={isHadaEter}
                                    isHadaAire={isHadaAire}
                                    isHadaFuego={isHadaFuego}
                                    isHadaAgua={isHadaAgua}
                                    isHadaTierra={isHadaTierra}
                                />
                            );
                        });
                    })()}
                </TableContainer>
            ) : (
                <EmptyState message="No hay poderes seleccionados" />
            )}
        </WizardSection>

    );
}
