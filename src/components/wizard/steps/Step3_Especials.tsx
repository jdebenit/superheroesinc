import React, { useState, useMemo } from 'react';
import { POWERS, type Power } from '../../../data/powers';
import { SPELLS, type Spell } from '../../../data/spells';

interface Step3Props {
    data: any;
    onChange: (updates: any) => void;
}

interface SelectedPower {
    id: string;
    origin: string;
}

// Helpers for data access
const hasOrigin = (data: any, originName: string) => {
    return data.origin?.items?.some((item: any) => Object.keys(item)[0] === originName);
};

const hasSubtype = (data: any, originName: string, subtypeName: string) => {
    return data.origin?.items?.some((item: any) => {
        const key = Object.keys(item)[0];
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
};

const getCharacteristicValue = (data: any, charName: string) => {
    return data.attributes?.values?.[charName] || 0;
};

const calculateEM = (data: any) => {
    const int = Number(getCharacteristicValue(data, 'Inteligencia')) || 0;
    const per = Number(getCharacteristicValue(data, 'Percepción')) || 0;
    const vol = Number(getCharacteristicValue(data, 'Voluntad')) || 0;
    return int + per + vol;
};

const POWER_TYPES = ["Todos", "Físico", "Psíquico", "Energético"];

const ORIGIN_ICONS: Record<string, string> = {
    'Guardián': '/logos/guardianes.png',
    'Alterado': '/logos/alterados.png',
    'Arcano': '/logos/arcanos.png',
    'Mago': '/logos/arcanos.png',
    'Dotado': '/logos/arcanos.png',
};

export default function Step3_Especials({ data, onChange }: Step3Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'powers' | 'spells' | null>(null);
    const [modalOriginFilter, setModalOriginFilter] = useState<string | null>(null);

    // Modal State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("Todos");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Powers are now stored as objects { id, origin }
    // We handle potential migration from string[] by filtering or mapping if needed, 
    // but strict typing assumes the new structure.
    const selectedPowers: SelectedPower[] = useMemo(() => {
        if (!Array.isArray(data.powers?.selected)) return [];
        // Safety check if we have legacy strings, though we'll assume clear state for now or filter them out/migrate
        return data.powers.selected.filter((p: any) => typeof p === 'object' && p.id && p.origin);
    }, [data.powers?.selected]);

    // Spells are now stored as objects { id, rank }
    const selectedSpellsWithRank: Array<{ id: string, rank: number }> = useMemo(() => {
        if (!Array.isArray(data.spells?.selected)) return [];
        return data.spells.selected.filter((s: any) => typeof s === 'object' && s.id && s.rank);
    }, [data.spells?.selected]);

    const updatePowers = (newSelected: SelectedPower[]) => {
        onChange({ ...data, powers: { ...data.powers, selected: newSelected } });
    };

    const updateSpells = (newSelected: Array<{ id: string, rank: number }>) => {
        onChange({ ...data, spells: { ...data.spells, selected: newSelected } });
    };

    const openPowerModal = (originContext: string) => {
        setModalType('powers');
        setModalOriginFilter(originContext);
        setSearchTerm("");
        setSelectedTypeFilter("Todos");
        setModalOpen(true);
    };

    const openSpellModal = () => {
        setModalType('spells');
        setModalOriginFilter(null);
        setSearchTerm("");
        setSelectedTypeFilter("Todos");
        setModalOpen(true);
    };

    const togglePowerSelection = (powerId: string) => {
        if (!modalOriginFilter) return; // Should not happen for powers

        const existingIndex = selectedPowers.findIndex(p => p.id === powerId && p.origin === modalOriginFilter);

        let newSelected: SelectedPower[];
        if (existingIndex >= 0) {
            // Remove
            newSelected = [...selectedPowers];
            newSelected.splice(existingIndex, 1);
        } else {
            // Add
            newSelected = [...selectedPowers, { id: powerId, origin: modalOriginFilter }];
        }
        updatePowers(newSelected);
    };

    const toggleSpellSelection = (id: string) => {
        const existingIndex = selectedSpellsWithRank.findIndex(s => s.id === id);
        let newSelected: Array<{ id: string, rank: number }>;

        if (existingIndex >= 0) {
            // Remove
            newSelected = [...selectedSpellsWithRank];
            newSelected.splice(existingIndex, 1);
        } else {
            // Add with rank 1
            newSelected = [...selectedSpellsWithRank, { id, rank: 1 }];
        }
        updateSpells(newSelected);
    };

    const updateSpellRank = (id: string, rank: number) => {
        const newSelected = selectedSpellsWithRank.map(s =>
            s.id === id ? { ...s, rank } : s
        );
        updateSpells(newSelected);
    };

    // Filter items for the modal
    const modalItems = useMemo(() => {
        if (!modalType) return [];
        const lowerSearch = searchTerm.toLowerCase();

        if (modalType === 'powers') {
            return POWERS.filter(p => {
                // Must belong to the origin context 
                if (modalOriginFilter && !p.origins.includes(modalOriginFilter)) return false;

                if (selectedTypeFilter !== "Todos" && !p.types.includes(selectedTypeFilter as any)) {
                    return false;
                }

                const matchesSearch = p.name.toLowerCase().includes(lowerSearch);
                return matchesSearch;
            });
        } else if (modalType === 'spells') {
            return SPELLS.filter(s => {
                return s.name.toLowerCase().includes(lowerSearch);
            });
        }
        return [];
    }, [modalType, modalOriginFilter, searchTerm, selectedTypeFilter]);

    // Derived State for Display
    const isGuardian = hasOrigin(data, 'Guardián');
    const isAlterado = hasOrigin(data, 'Alterado');
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const hasEM = isMago || isDotado;

    // Spells - enrich with full spell data and rank
    const selectedSpells = selectedSpellsWithRank.map(sw => {
        const spell = SPELLS.find(s => s.id === sw.id);
        return spell ? { ...spell, rank: sw.rank } : null;
    }).filter((s): s is (Spell & { rank: number }) => s !== null);

    return (
        <div className="space-y-8 p-6 max-w-5xl mx-auto">
            <h2 className="text-3xl font-black mb-8 uppercase text-center font-comic tracking-wide text-gray-800">
                Poderes y Habilidades
            </h2>

            {!isGuardian && !isAlterado && !hasEM && (
                <div className="text-center py-12 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <p className="text-xl text-gray-500 font-bold">
                        No has seleccionado ningún origen que requiera configuración de poderes especial en este paso.
                    </p>
                    <p className="text-gray-400 mt-2 font-comic">(Guardián, Alterado o Arcano)</p>
                </div>
            )}

            {/* UNIFIED POWERS SECTION (Guardian & Alterado) */}
            {(isGuardian || isAlterado) && (
                <div className="bg-gray-50 border-4 border-gray-800 rounded-xl overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.8)]">
                    <div className="p-6 border-b-4 border-gray-800 bg-white flex flex-col md:flex-row justify-between items-center gap-4">

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 uppercase italic font-comic text-center sm:text-left">Poderes Especiales</h3>
                                <p className="text-sm font-bold text-gray-400 text-center sm:text-left">Habilidades de origen</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            {isGuardian && (
                                <button onClick={() => openPowerModal('Guardian')} className="pixel-button bg-blue-600 text-white hover:bg-blue-700 text-sm flex items-center gap-2">
                                    <span>+</span> Guardián
                                </button>
                            )}
                            {isAlterado && (
                                <button onClick={() => openPowerModal('Alterado')} className="pixel-button bg-purple-600 text-white hover:bg-purple-700 text-sm flex items-center gap-2">
                                    <span>+</span> Alterado
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
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>PCs</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Tipo</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Origen</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPowers.map((selection, idx) => {
                                        const p = POWERS.find(power => power.id === selection.id);
                                        if (!p) return null;
                                        const isEven = idx % 2 === 0;

                                        return (
                                            <tr key={`${selection.id}-${selection.origin}-${idx}`} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {p.name}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                    {p.formula}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                                        {p.types.map(t => (
                                                            <span key={t} style={{
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase',
                                                                fontWeight: 'bold',
                                                                backgroundColor: '#eef2ff',
                                                                color: '#4f46e5',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                border: '1px solid #e0e7ff'
                                                            }}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    {selection.origin === 'Guardian' && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: '900',
                                                            letterSpacing: '0.05em',
                                                            backgroundColor: '#dbeafe',
                                                            color: '#1d4ed8',
                                                            padding: '2px 8px',
                                                            borderRadius: '9999px',
                                                            border: '1px solid #bfdbfe'
                                                        }}>
                                                            Guardián
                                                        </span>
                                                    )}
                                                    {selection.origin === 'Alterado' && (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: '900',
                                                            letterSpacing: '0.05em',
                                                            backgroundColor: '#f3e8ff',
                                                            color: '#7e22ce',
                                                            padding: '2px 8px',
                                                            borderRadius: '9999px',
                                                            border: '1px solid #e9d5ff'
                                                        }}>
                                                            Alterado
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newSelected = [...selectedPowers];
                                                            newSelected.splice(idx, 1);
                                                            updatePowers(newSelected);
                                                        }}
                                                        style={{
                                                            color: '#ef4444',
                                                            padding: '8px',
                                                            borderRadius: '9999px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                        title="Eliminar poder"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                No hay poderes seleccionados
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* MAGIC SECTION (Mago & Dotado) */}
            {
                hasEM && (
                    <div className="bg-indigo-50 border-4 border-indigo-600 rounded-xl overflow-hidden shadow-[8px_8px_0px_#4f46e5]">
                        <div className="p-6 border-b-4 border-indigo-600 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-900 uppercase italic font-comic">Magia</h3>
                                    <p className="text-sm font-bold text-indigo-400">Canalización de Energía</p>
                                </div>
                            </div>
                            {/* Old EM display removed */}
                        </div>

                        <div className="p-6 bg-indigo-50/50">
                            <div style={{
                                marginBottom: '1.5rem',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <button onClick={openSpellModal} className="pixel-button bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap px-4 py-2">
                                    + Abrir Lista de Hechizos
                                </button>

                                {/* Counter Box - Step 4 Style */}
                                <div style={{
                                    backgroundColor: '#eef2ff',
                                    border: '2px solid #6366f1',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    flex: 1
                                }}>
                                    {(() => {
                                        const totalCost = selectedSpells.reduce((acc, s) => {
                                            const baseCost = parseInt(s.cost, 10) || 0;
                                            return acc + (baseCost * s.rank);
                                        }, 0);
                                        const maxEM = calculateEM(data);
                                        const isOver = totalCost > maxEM;
                                        const extraPC = isOver ? ((totalCost - maxEM) * 0.1).toFixed(1) : '0.0';

                                        return (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                                                    Uso de Energía Mágica
                                                </span>
                                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '1.125rem' }}>
                                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isOver ? '#ef4444' : '#6366f1' }}>
                                                            {totalCost}
                                                        </span>
                                                        <span style={{ color: '#9ca3af', margin: '0 0.25rem' }}>/</span>
                                                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4b5563' }}>
                                                            {maxEM}
                                                        </span>
                                                        <span style={{ fontSize: '0.875rem', color: '#6366f1', marginLeft: '0.25rem', fontWeight: 'bold' }}>
                                                            EM
                                                        </span>
                                                    </span>
                                                    {isOver && (
                                                        <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ef4444' }}>
                                                            Coste Extra: +{extraPC} PC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {selectedSpells.length > 0 ? (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    marginTop: '1.5rem'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <tr>
                                                <th style={{ padding: '1rem', textAlign: 'left', color: '#374151' }}>Hechizo</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Rango</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Coste</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Requisitos</th>
                                                <th style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSpells.map((s, idx) => {
                                                const isEven = idx % 2 === 0;
                                                const baseCost = parseInt(s.cost, 10) || 0;
                                                const totalCost = baseCost * s.rank;

                                                return (
                                                    <tr key={s.id} style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
                                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                            {s.name}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <select
                                                                value={s.rank}
                                                                onChange={(e) => updateSpellRank(s.id, parseInt(e.target.value, 10))}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    border: '1px solid #d1d5db',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: 'white',
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold',
                                                                    color: '#4f46e5',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {Array.from({ length: s.maxRank }, (_, i) => i + 1).map(rank => (
                                                                    <option key={rank} value={rank}>{rank}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                fontSize: '0.875rem',
                                                                fontWeight: 'bold',
                                                                backgroundColor: '#eef2ff',
                                                                color: '#4f46e5',
                                                                padding: '4px 12px',
                                                                borderRadius: '9999px',
                                                                border: '1px solid #e0e7ff',
                                                                display: 'inline-block'
                                                            }}>
                                                                {baseCost} × {s.rank} = {totalCost} EM
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                                            {s.requirements !== "No especificado" ? s.requirements : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>-</span>}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const newSelected = selectedSpellsWithRank.filter(spell => spell.id !== s.id);
                                                                    updateSpells(newSelected);
                                                                }}
                                                                style={{
                                                                    color: '#ef4444',
                                                                    padding: '8px',
                                                                    borderRadius: '9999px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                title="Olvidar hechizo"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 'bold', fontStyle: 'italic' }}>
                                    No hay hechizos memorizados
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* MODAL */}
            {
                modalOpen && (
                    <div className="wizard-modal-overlay">
                        <div className="wizard-modal-content">

                            {/* Header */}
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {modalType === 'powers' ? `Seleccionar Poderes (${modalOriginFilter})` : 'Seleccionar Hechizos'}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="modal-close">&times;</button>
                            </div>

                            {/* PowerList-like Controls */}
                            <div className="controls-section">
                                <div className="filters-primary">
                                    {modalType === 'powers' && (
                                        <div className="filter-group">
                                            <span className="filter-label">Tipo:</span>
                                            <div className="type-buttons">
                                                {POWER_TYPES.map(type => (
                                                    <button
                                                        key={type}
                                                        className={`filter-button type ${selectedTypeFilter === type ? 'active' : ''}`}
                                                        onClick={() => setSelectedTypeFilter(type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="search-row">
                                        <input
                                            type="text"
                                            placeholder={modalType === 'powers' ? "Buscar poder..." : "Buscar hechizo..."}
                                            className="search-input"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="view-controls">
                                    <div className="view-toggles">
                                        <button
                                            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                                            onClick={() => setViewMode('grid')}
                                            title="Vista en Cuadrícula"
                                        >⊞</button>
                                        <button
                                            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => setViewMode('table')}
                                            title="Vista en Tabla"
                                        >≡</button>
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="modal-scroll-area">
                                {viewMode === 'grid' ? (
                                    <div className="powers-grid">
                                        {modalItems.map((item: any) => {
                                            let isSelected = false;
                                            if (modalType === 'powers') {
                                                isSelected = selectedPowers.some(p => p.id === item.id && p.origin === modalOriginFilter);
                                            } else {
                                                isSelected = selectedSpellsWithRank.some(s => s.id === item.id);
                                            }

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`power-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => modalType === 'powers' ? togglePowerSelection(item.id) : toggleSpellSelection(item.id)}
                                                >
                                                    <h3>{item.name}</h3>
                                                    <div className="power-details">
                                                        <span className="power-cost">
                                                            {modalType === 'powers' ? `${item.formula} PC` : `Coste: ${item.cost}`}
                                                        </span>

                                                        {modalType === 'powers' && (
                                                            <div className="power-tags">
                                                                <div className="power-types">
                                                                    {item.types?.map((t: string) => (
                                                                        <span key={t} className="type-tag">{t}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {modalType === 'spells' && item.requirements && item.requirements !== "No especificado" && (
                                                            <div className="range-note" style={{ textAlign: 'left', color: 'red' }}>
                                                                Req: {item.requirements}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isSelected && <div className="selected-badge">✓</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="powers-table-wrapper">
                                        <table className="powers-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '50px' }}></th>
                                                    <th>Nombre</th>
                                                    <th>Coste</th>
                                                    {modalType === 'powers' && <th>Tipos</th>}
                                                    {modalType === 'spells' && <th>Requisitos</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalItems.map((item: any) => {
                                                    let isSelected = false;
                                                    if (modalType === 'powers') {
                                                        isSelected = selectedPowers.some(p => p.id === item.id && p.origin === modalOriginFilter);
                                                    } else {
                                                        isSelected = selectedSpellsWithRank.some(s => s.id === item.id);
                                                    }

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => modalType === 'powers' ? togglePowerSelection(item.id) : toggleSpellSelection(item.id)}
                                                            className={isSelected ? 'selected-row' : ''}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    readOnly
                                                                    style={{ width: '20px', height: '20px' }}
                                                                />
                                                            </td>
                                                            <td className="col-name">{item.name}</td>
                                                            <td className="col-cost">{modalType === 'powers' ? item.formula : item.cost}</td>
                                                            {modalType === 'powers' && (
                                                                <td className="col-types">
                                                                    <div className="table-types">
                                                                        {item.types?.map((t: string) => (
                                                                            <span key={t} className="type-tag tiny">{t}</span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            )}
                                                            {modalType === 'spells' && (
                                                                <td>
                                                                    {item.requirements === "No especificado" ? "-" : item.requirements}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {modalItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="confirm-button"
                                >
                                    Confirmar Selección
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .pixel-button {
                    padding: 0.75rem 1.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    border: 4px solid rgba(0,0,0,0.1);
                    border-radius: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    cursor: pointer;
                    font-family: var(--font-comic, sans-serif);
                }
                .pixel-button:hover {
                    border-color: rgba(0,0,0,0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                }
                .pixel-button:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                /* Modal Overlay Styles */
                .wizard-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 1rem;
                }

                .wizard-modal-content {
                    background: white;
                    width: 100%;
                    max-width: 1200px;
                    max-height: 90vh;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 4px solid var(--color-secondary, #000);
                }

                .modal-header {
                    padding: 1rem 1.5rem;
                    background: var(--color-secondary, #000);
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    font-family: var(--font-comic, sans-serif);
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                }

                .modal-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                    background: #f5f5f5;
                }

                .modal-footer {
                    padding: 1rem;
                    background: white;
                    border-top: 2px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                }

                .confirm-button {
                    background: #22c55e;
                    color: white;
                    padding: 0.8rem 2rem;
                    border: 2px solid #166534;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 4px 4px 0px #166534;
                    transition: all 0.2s;
                    font-family: var(--font-comic, sans-serif);
                }

                .confirm-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 6px 6px 0px #166534;
                }

                .confirm-button:active {
                    transform: translateY(0);
                    box-shadow: 2px 2px 0px #166534;
                }

                /* PowerList Styles Adapted */
                .controls-section {
                    padding: 1.5rem;
                    background: #fff;
                    border-bottom: 2px solid #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                @media(min-width: 768px) {
                    .controls-section {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                .filters-primary {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    flex: 1;
                }

                 .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .filter-label {
                    font-weight: bold;
                    font-family: var(--font-comic, sans-serif);
                }

                .type-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .filter-button {
                    padding: 0.4rem 1rem;
                    border: 2px solid var(--color-secondary, #000);
                    background: white;
                    font-family: var(--font-comic, sans-serif);
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .filter-button.active {
                    background: var(--color-secondary, #000);
                    color: white;
                }

                .search-input {
                    padding: 0.6rem 1rem;
                    border: 2px solid var(--color-secondary, #000);
                    border-radius: 8px;
                    width: 100%;
                    max-width: 300px;
                }

                .view-toggles {
                    display: flex;
                    gap: 0.5rem;
                }

                .view-button {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--color-secondary, #000);
                    background: white;
                    cursor: pointer;
                    font-size: 1.2rem;
                    border-radius: 8px;
                }

                .view-button.active {
                    background: var(--color-secondary, #000);
                    color: white;
                }

                /* Grid & Card Styles */
                .powers-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .power-card {
                    border: 2px solid var(--color-secondary, #000);
                    padding: 1.2rem;
                    background: white;
                    box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .power-card:hover {
                    box-shadow: 6px 6px 0px rgba(0,0,0,0.15);
                    transform: translateY(-2px);
                }

                .power-card.selected {
                    background: #ecfdf5; /* green-50 */
                    border-color: #059669;
                    box-shadow: 6px 6px 0px #059669;
                }

                .selected-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #059669;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }

                .power-card h3 {
                    margin: 0;
                    font-family: var(--font-comic, sans-serif);
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 0.5rem;
                    font-size: 1.1rem;
                    color: var(--color-primary, #000);
                }

                .power-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .power-cost {
                    font-weight: bold;
                    background: #f0f0f0;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                    align-self: flex-start;
                    font-size: 0.85rem;
                }

                .power-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                }

                .type-tag, .origin-tag {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    border: 1px solid #ccc;
                    background: #eee;
                }

                .type-tag {
                    background: #e3f2fd;
                    border-color: #90caf9;
                    color: #1565c0;
                }

                /* Table Styles */
                .powers-table-wrapper {
                    border: 2px solid var(--color-secondary, #000);
                    border-radius: 8px;
                    overflow: hidden;
                    background: white;
                }

                .powers-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .powers-table th {
                    background: var(--color-secondary, #000);
                    color: white;
                    padding: 0.8rem;
                    text-align: left;
                    font-family: var(--font-comic, sans-serif);
                }

                .powers-table td {
                    padding: 0.8rem;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                }

                .powers-table tr:hover {
                    background: #f9f9f9;
                }

                .selected-row {
                    background: #ecfdf5 !important;
                }

                .col-name {
                    font-weight: bold;
                }

                .col-cost {
                    font-family: var(--font-mono, monospace);
                }
            `}</style>
        </div >
    );
}
