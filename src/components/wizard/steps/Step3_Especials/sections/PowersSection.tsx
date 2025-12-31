import React from 'react';
import PowerRow from './PowerRow';
import type { SelectedPower } from '../types';

interface PowersSectionProps {
    data: any;
    selectedPowers: SelectedPower[];
    onOpenModal: (origin: string) => void;
    onUpdateRank: (id: string, origin: string, rank: number) => void;
    onUpdateMod: (id: string, origin: string, mod: number) => void;
    onUpdateSkillValue: (id: string, origin: string, value: number) => void;
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
}

export default function PowersSection({
    data,
    selectedPowers,
    onOpenModal,
    onUpdateRank,
    onUpdateMod,
    onUpdateSkillValue,
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
    isMutante
}: PowersSectionProps) {
    const hasAnyPowerOrigin = isGuardian || isAlterado || isVampiro || isSemidemonio || isMaldito ||
        isEnte || isThals || isDivino || isTerrano || isDotado || isCosmico || isMutante;

    if (!hasAnyPowerOrigin) return null;

    return (
        <div className="bg-gray-50 border-4 border-gray-800 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)]">
            <div className="p-6 border-b-4 border-gray-800 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 uppercase italic font-comic text-center sm:text-left">Poderes Especiales</h3>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {isGuardian && (
                        <button onClick={() => onOpenModal('Guardian')} className="pixel-button bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-2">
                            <span>+</span> Guardián
                        </button>
                    )}
                    {isAlterado && (
                        <button onClick={() => onOpenModal('Alterado')} className="pixel-button bg-purple-600 text-white hover:bg-purple-700 text-sm flex items-center gap-2">
                            <span>+</span> Alterado
                        </button>
                    )}
                    {isVampiro && (
                        <button onClick={() => onOpenModal('Vampírico')} className="pixel-button bg-red-700 text-white hover:bg-red-800 text-sm flex items-center gap-2">
                            <span>+</span> Vampírico
                        </button>
                    )}
                    {(isSemidemonio || isMaldito) && (
                        <button onClick={() => onOpenModal('Sobrenatural')} className="pixel-button bg-orange-600 text-white hover:bg-orange-700 text-sm flex items-center gap-2">
                            <span>+</span> Sobrenatural
                        </button>
                    )}
                    {isThals && (
                        <button onClick={() => onOpenModal('Thals')} className="pixel-button bg-teal-600 text-white hover:bg-teal-700 text-sm flex items-center gap-2">
                            <span>+</span> Thals
                        </button>
                    )}
                    {isDivino && (
                        <button onClick={() => onOpenModal('Divino')} className="pixel-button bg-yellow-500 text-white hover:bg-yellow-600 text-sm flex items-center gap-2">
                            <span>+</span> Divino
                        </button>
                    )}
                    {isTerrano && (
                        <button onClick={() => onOpenModal('Guardian')} className="pixel-button bg-emerald-600 text-white hover:bg-emerald-700 text-sm flex items-center gap-2">
                            <span>+</span> Terrano (Guardian)
                        </button>
                    )}
                    {isDotado && (
                        <button onClick={() => onOpenModal('Sobrenatural')} className="pixel-button bg-amber-600 text-white hover:bg-amber-700 text-sm flex items-center gap-2">
                            <span>+</span> Dotado (Sobrenatural)
                        </button>
                    )}
                    {isCosmico && (
                        <button onClick={() => onOpenModal('Cósmico')} className="pixel-button bg-indigo-600 text-white hover:bg-indigo-700 text-sm flex items-center gap-2">
                            <span>+</span> Cósmico
                        </button>
                    )}
                    {isMutante && (
                        <button onClick={() => onOpenModal('Mutante')} className="pixel-button bg-pink-600 text-white hover:bg-pink-700 text-sm flex items-center gap-2">
                            <span>+</span> Mutante
                        </button>
                    )}
                    {isEnte && (
                        <button onClick={() => onOpenModal('Mutante')} className="pixel-button bg-purple-500 text-white hover:bg-purple-600 text-sm flex items-center gap-2">
                            <span>+</span> Mutante (Ente)
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                marginBottom: '3rem'
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
                            {selectedPowers.map((selection, idx) => (
                                <PowerRow
                                    key={`${selection.id}-${selection.origin}-${idx}`}
                                    selection={selection}
                                    data={data}
                                    index={idx}
                                    onUpdateRank={onUpdateRank}
                                    onUpdateMod={onUpdateMod}
                                    onUpdateSkillValue={onUpdateSkillValue}
                                    onRemove={onRemove}
                                />
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                        No hay poderes seleccionados
                    </div>
                )}
            </div>
        </div>
    );
}
