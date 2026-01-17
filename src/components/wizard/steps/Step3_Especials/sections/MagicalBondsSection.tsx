import React from 'react';
import { MAGICAL_BONDS } from '../../../../../data/magicalBonds';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';

interface MagicalBondsSectionProps {
    data: any;
    onChange: (updates: any) => void;
    onOpenModal: () => void;
}

export default function MagicalBondsSection({
    data,
    onChange,
    onOpenModal
}: MagicalBondsSectionProps) {
    return (
        <div className="bg-purple-50 border-4 border-purple-900 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)] mb-8">
            <div className="p-6 border-b-4 border-purple-900 bg-white">
                <h3 className="text-2xl font-black text-purple-900 uppercase italic font-comic">Vinculaciones Mágicas</h3>
                <p className="text-gray-600 mt-2">
                    Como Mago, debes elegir al menos una vinculación mágica que canalice tu poder.
                </p>
            </div>
            <div className="flex justify-center mb-8">
                <button
                    onClick={onOpenModal}
                    className="pixel-button bg-purple-600 text-white hover:bg-purple-700 text-lg flex items-center px-8 py-3 gap-3 shadow-lg"
                >
                    <span className="text-2xl font-black">+</span> AÑADIR VINCULACIÓN MÁGICA
                </button>
            </div>
            <div className="p-6 bg-purple-50 space-y-4">
                {/* Selected Bonds List Table */}
                {data.magicalBonds && data.magicalBonds.length > 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        marginBottom: '1.5rem'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Vinculación</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280' }}>Descripción</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.magicalBonds.map((bondId: string, idx: number) => {
                                    const bond = MAGICAL_BONDS.find(b => b.id === bondId);
                                    if (!bond) return null;
                                    const isEven = idx % 2 === 0;
                                    return (
                                        <tr key={bondId} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937', verticalAlign: 'top' }}>
                                                {bond.name}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.9rem', verticalAlign: 'top' }}>
                                                {bond.description}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                                                <DeleteRowButton
                                                    onDelete={() => {
                                                        const current = data.magicalBonds || [];
                                                        onChange({ ...data, magicalBonds: current.filter((id: string) => id !== bondId) });
                                                    }}
                                                    title="Eliminar vinculación"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                <div className="bg-white p-6 rounded-xl border-4 border-purple-100 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
                    <div className="absolute top-0 left-0 w-2 h-full bg-purple-400"></div>
                    <h4 className="text-xl font-black text-purple-900 uppercase font-comic mb-4 flex items-center gap-2">
                        Otra Vinculación (Personalizada)
                    </h4>

                    <div className="space-y-4 pl-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nombre de la Vinculación</label>
                            <input
                                type="text"
                                value={data.magicalBondsCustomName || ''}
                                onChange={(e) => onChange({ ...data, magicalBondsCustomName: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #f3e8ff',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#581c87',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#a855f7';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#f3e8ff';
                                    e.target.style.boxShadow = 'none';
                                }}
                                placeholder="Ej: Pacto con el Dragón Carmesí..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Descripción y efectos</label>
                            <textarea
                                value={data.magicalBondsCustomDescription || ''}
                                onChange={(e) => onChange({ ...data, magicalBondsCustomDescription: e.target.value })}
                                style={{
                                    width: '100%',
                                    height: '8rem',
                                    padding: '0.75rem',
                                    border: '2px solid #f3e8ff',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    color: '#374151',
                                    resize: 'none',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#a855f7';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#f3e8ff';
                                    e.target.style.boxShadow = 'none';
                                }}
                                placeholder="Describe en qué consiste esta vinculación, qué beneficios otorga y qué sacrificios requiere..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
