import React from 'react';
import PowerRow from './PowerRow';
import type { SelectedPower } from '../types';
import { SectionContainer } from '../components/atomic/SectionContainer';
import { PixelButton } from '../components/atomic/PixelButton';

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
    isGrifo
}: PowersSectionProps) {
    const hasAnyPowerOrigin = isGuardian || isAlterado || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isTerrano || isDotado || isCosmico || isMutante || isTesKhar || isAtlante || isTroll || isPoseido || isEnano || isGrifo;

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
        </div>
    );

    return (
        <SectionContainer
            title="Poderes Especiales"
            theme="gray"
            headerAction={renderHeaderActions()}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
            }}>
                {selectedPowers.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Poder</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Base / Rango / PCs</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Base Hab.</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Origen</th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
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
                                        />
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                        No hay poderes seleccionados
                    </div>
                )}
            </div>
        </SectionContainer>
    );
}
