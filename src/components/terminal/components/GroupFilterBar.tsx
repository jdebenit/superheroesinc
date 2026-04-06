import React from 'react';
import { type TmtGroup } from '../hooks/useTmtStore';

interface GroupFilterBarProps {
    groups: TmtGroup[];
    selectedGroupIds: string[];
    onToggleGroup: (id: string) => void;
    onClearFilters: () => void;
}

const GroupFilterBar: React.FC<GroupFilterBarProps> = ({
    groups,
    selectedGroupIds,
    onToggleGroup,
    onClearFilters
}) => {
    if (groups.length === 0) return null;

    return (
        <div className="tmt-section" style={{ marginBottom: '1rem' }}>
            <div className="tmt-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="tmt-section-title">Filtrar por Grupo</span>
                    {selectedGroupIds.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ({selectedGroupIds.length} seleccionados)
                        </span>
                    )}
                </div>
                <button 
                    className="tmt-header-btn" 
                    onClick={onClearFilters} 
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                >
                    Limpiar Filtros
                </button>
            </div>
            <div className="tmt-groups-filter-bar">
                {groups.map(g => {
                    const active = selectedGroupIds.includes(g.id);
                    return (
                        <button
                            key={g.id}
                            className={`tmt-group-filter-tag ${active ? 'active' : ''}`}
                            onClick={() => onToggleGroup(g.id)}
                            style={{ '--group-color': g.color || '#3b82f6' } as React.CSSProperties}
                        >
                            {g.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GroupFilterBar;
