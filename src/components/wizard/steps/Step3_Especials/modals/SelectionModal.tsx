import React, { useState } from 'react';
import type { ModalType, ViewMode, TechTypeFilter } from '../types';

const POWER_TYPES = ["Todos", "Físico", "Psíquico", "Energético"];

interface SelectionModalProps {
    isOpen: boolean;
    type: Exclude<ModalType, 'magical_bonds' | null>;
    originFilter: string | null;
    items: any[];
    selectedItems: any[];
    onClose: () => void;
    onToggleItem: (id: string) => void;
    customPlaceholder?: string;
    customTitle?: string;
}

export default function SelectionModal({
    isOpen,
    type,
    originFilter,
    items,
    selectedItems,
    onClose,
    onToggleItem,
    customPlaceholder,
    customTitle
}: SelectionModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("Todos");
    const [selectedTechTypeFilter, setSelectedTechTypeFilter] = useState<TechTypeFilter>('All');
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    if (!isOpen) return null;

    const getTitle = () => {
        if (customTitle) return customTitle;
        if (type === 'powers') return `Seleccionar Poderes (${originFilter})`;
        if (type === 'techModules') return 'Seleccionar Módulos Tecnológicos';
        return 'Seleccionar Hechizos';
    };

    const getPlaceholder = () => {
        if (customPlaceholder) return customPlaceholder;
        if (type === 'powers') return "Buscar poder...";
        if (type === 'techModules') return "Buscar módulo...";
        return "Buscar hechizo...";
    };

    const isItemSelected = (item: any) => {
        if (type === 'powers') {
            return selectedItems.some((p: any) => p.id === item.id && p.origin === originFilter);
        } else if (type === 'spells') {
            return selectedItems.some((s: any) => s.id === item.id);
        } else if (type === 'techModules') {
            return selectedItems.some((m: any) => m.definitionId === item.id);
        }
        return false;
    };

    return (
        <div className="wizard-modal-overlay">
            <div className="wizard-modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h3 className="modal-title">{getTitle()}</h3>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>

                {/* PowerList-like Controls */}
                <div className="controls-section">
                    <div className="filters-primary">
                        {type === 'powers' && (
                            <div className="filter-group">
                                <span className="filter-label">Tipo:</span>
                                <div className="type-buttons">
                                    {POWER_TYPES.map(powerType => (
                                        <button
                                            key={powerType}
                                            className={`filter-button type ${selectedTypeFilter === powerType ? 'active' : ''}`}
                                            onClick={() => setSelectedTypeFilter(powerType)}
                                        >
                                            {powerType}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {type === 'techModules' && (
                            <div className="filter-group">
                                <span className="filter-label">Tipo:</span>
                                <div className="type-buttons">
                                    <button
                                        className={`filter-button type ${selectedTechTypeFilter === 'All' ? 'active' : ''}`}
                                        onClick={() => setSelectedTechTypeFilter('All')}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        className={`filter-button type ${selectedTechTypeFilter === 'General' ? 'active' : ''}`}
                                        onClick={() => setSelectedTechTypeFilter('General')}
                                    >
                                        General
                                    </button>
                                    <button
                                        className={`filter-button type ${selectedTechTypeFilter === 'Mejora Interna' ? 'active' : ''}`}
                                        onClick={() => setSelectedTechTypeFilter('Mejora Interna')}
                                    >
                                        Mejoras Internas
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="search-row">
                            <input
                                type="text"
                                placeholder={getPlaceholder()}
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
                    {(() => {
                        const filteredItems = items.filter(item => {
                            // 1. Search Filter
                            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                            if (!matchesSearch) return false;

                            // 2. Type Filter (Powers)
                            if (type === 'powers' && selectedTypeFilter !== 'Todos') {
                                if (!item.types || !item.types.includes(selectedTypeFilter)) {
                                    return false;
                                }
                            }

                            // 3. Type Filter (Tech Modules)
                            if (type === 'techModules' && selectedTechTypeFilter !== 'All') {
                                if (item.type !== selectedTechTypeFilter) {
                                    return false;
                                }
                            }

                            return true;
                        });

                        if (filteredItems.length === 0) {
                            return (
                                <div className="text-center py-10 text-gray-500">
                                    No se encontraron resultados
                                </div>
                            );
                        }

                        if (viewMode === 'grid') {
                            return (
                                <div className="powers-grid">
                                    {filteredItems.map((item: any) => {
                                        const isSelected = isItemSelected(item);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`power-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => onToggleItem(item.id)}
                                            >
                                                <h3>{item.name}</h3>
                                                <div className="power-details">
                                                    {type === 'techModules' ? (
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                                                            <span className="power-cost">{item.cost} PC</span>
                                                            <span className="type-tag" style={{
                                                                width: 'fit-content',
                                                                backgroundColor: item.type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                                color: item.type === 'Mejora Interna' ? '#be123c' : undefined,
                                                                borderColor: item.type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                            }}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="power-cost">
                                                            {type === 'powers' ? `${item.formula} PC` : `Coste: ${item.cost}`}
                                                        </span>
                                                    )}

                                                    {type === 'powers' && (
                                                        <div className="power-tags">
                                                            <div className="power-types">
                                                                {item.types?.map((t: string) => (
                                                                    <span key={t} className="type-tag">{t}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {type === 'spells' && item.requirements && item.requirements !== "No especificado" && (
                                                        <div className="range-note" style={{ textAlign: 'left', color: 'red' }}>
                                                            Req: {item.requirements}
                                                        </div>
                                                    )}

                                                    {type === 'techModules' && (
                                                        <div className="range-note" style={{ textAlign: 'left', color: '#6b7280', fontSize: '0.8em', marginTop: '4px', fontStyle: 'italic' }}>
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && <div className="selected-badge">✓</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else {
                            return (
                                <div className="powers-table-wrapper">
                                    <table className="powers-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}></th>
                                                <th>Nombre</th>
                                                <th>Coste</th>
                                                {type === 'powers' && <th>Tipos</th>}
                                                {type === 'spells' && <th>Requisitos</th>}
                                                {type === 'techModules' && <th>Tipo</th>}
                                                {type === 'techModules' && <th>Descripción</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map((item: any) => {
                                                const isSelected = isItemSelected(item);

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => onToggleItem(item.id)}
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
                                                        <td className="col-cost">
                                                            {type === 'powers' ? item.formula :
                                                                type === 'techModules' ? `${item.cost} PC` :
                                                                    item.cost}
                                                        </td>
                                                        {type === 'powers' && (
                                                            <td className="col-types">
                                                                <div className="table-types">
                                                                    {item.types?.map((t: string) => (
                                                                        <span key={t} className="type-tag tiny">{t}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {type === 'spells' && (
                                                            <td>
                                                                {item.requirements === "No especificado" ? "-" : item.requirements}
                                                            </td>
                                                        )}
                                                        {type === 'techModules' && (
                                                            <>
                                                                <td style={{ textAlign: 'center' }}>
                                                                    <span className="type-tag" style={{
                                                                        backgroundColor: item.type === 'Mejora Interna' ? '#fce7f3' : undefined,
                                                                        color: item.type === 'Mejora Interna' ? '#be123c' : undefined,
                                                                        borderColor: item.type === 'Mejora Interna' ? '#fbcfe8' : undefined
                                                                    }}>
                                                                        {item.type}
                                                                    </span>
                                                                </td>
                                                                <td style={{ fontSize: '0.9em', color: '#666' }}>{item.description}</td>
                                                            </>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }
                    })()}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="confirm-button"
                    >
                        Confirmar Selección
                    </button>
                </div>
            </div>
        </div>
    );
}
