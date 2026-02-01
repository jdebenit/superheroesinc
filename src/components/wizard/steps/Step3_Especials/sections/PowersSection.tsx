import React from 'react';
import PowerRow from './PowerRow';
import type { SelectedPower } from '../types';
import { SectionContainer } from '../../../shared/SectionContainer';
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
    isElfoPsiquico
}: PowersSectionProps) {
    const hasAnyPowerOrigin = isGuardian || isAlterado || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isTerrano || isDotado || isCosmico || isMutante || isTesKhar || isAtlante || isTroll || isPoseido || isEnano || isGrifo || isElfoFisico || isElfoPsiquico;

    if (!hasAnyPowerOrigin) return null;

    const renderHeaderActions = () => (
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {isGuardian && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="primary" className="text-sm">
                    <span>+</span> Guardián
                </PixelButton>
            )}
            {isAlterado && (
                <PixelButton onClick={() => onOpenModal('Alterado')} variant="custom" className="bg-purple-600 text-white hover:bg-purple-700 text-sm">
                    <span>+</span> Alterado
                </PixelButton>
            )}
            {isVampiro && (
                <PixelButton onClick={() => onOpenModal('Vampírico')} variant="danger" className="bg-red-700 hover:bg-red-800 text-sm">
                    <span>+</span> Vampírico
                </PixelButton>
            )}
            {(isSemidemonio || isMaldito || isPoseido) && (
                <PixelButton onClick={() => onOpenModal('Sobrenatural')} variant="custom" className="bg-orange-600 text-white hover:bg-orange-700 text-sm">
                    <span>+</span> Sobrenatural
                </PixelButton>
            )}
            {isThals && (
                <PixelButton onClick={() => onOpenModal('Thals')} variant="custom" className="bg-teal-600 text-white hover:bg-teal-700 text-sm">
                    <span>+</span> Thals
                </PixelButton>
            )}
            {isDivino && (
                <PixelButton onClick={() => onOpenModal('Divino')} variant="warning" className="text-sm">
                    <span>+</span> Divino
                </PixelButton>
            )}
            {isTerrano && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="custom" className="bg-emerald-600 text-white hover:bg-emerald-700 text-sm">
                    <span>+</span> Terrano (Guardian)
                </PixelButton>
            )}
            {isEnano && (
                <PixelButton onClick={() => onOpenModal('Guardian')} variant="custom" className="bg-stone-600 text-white hover:bg-stone-700 text-sm">
                    <span>+</span> Enano (Guardian)
                </PixelButton>
            )}
            {isDotado && (
                <PixelButton onClick={() => onOpenModal('Sobrenatural')} variant="custom" className="bg-amber-600 text-white hover:bg-amber-700 text-sm">
                    <span>+</span> Dotado (Sobrenatural)
                </PixelButton>
            )}
            {isCosmico && (
                <PixelButton onClick={() => onOpenModal('Cósmico')} variant="custom" className="bg-indigo-600 text-white hover:bg-indigo-700 text-sm">
                    <span>+</span> Cósmico
                </PixelButton>
            )}
            {isMutante && (
                <PixelButton onClick={() => onOpenModal('Mutante')} variant="custom" className="bg-pink-600 text-white hover:bg-pink-700 text-sm">
                    <span>+</span> Mutante
                </PixelButton>
            )}
            {isEnte && (
                <PixelButton onClick={() => onOpenModal('Mutante')} variant="custom" className="bg-purple-500 text-white hover:bg-purple-600 text-sm">
                    <span>+</span> Mutante (Ente)
                </PixelButton>
            )}
            {isElfoPsiquico && (
                <PixelButton onClick={() => onOpenModal('Psíquico')} variant="custom" className="bg-cyan-600 text-white hover:bg-cyan-700 text-sm">
                    <span>+</span> Poderes Psíquicos
                </PixelButton>
            )}
        </div>
    );

    return (
        <SectionContainer
            title="Poderes Especiales"
            theme="gray"
            headerAction={renderHeaderActions()}
        >
            {selectedPowers.length > 0 ? (
                <TableContainer
                    headers={['Poder', 'Base / Rango / PCs', 'Base Hab.', 'Origen', 'Acciones']}
                    showTotal={false}
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
                                />
                            );
                        });
                    })()}
                </TableContainer>
            ) : (
                <EmptyState message="No hay poderes seleccionados" />
            )}
        </SectionContainer>
    );
}
