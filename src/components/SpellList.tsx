
import React, { useState, useMemo, useEffect } from 'react';
import { SPELLS, type Spell } from '../data/spells';
import { SPELLS_DETAILS } from '../data/spells/index';

export default function SpellList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [reqFilter, setReqFilter] = useState<'all' | 'with_req' | 'no_req'>('all');
    const [selectedSpell, setSelectedSpell] = useState<any>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedSpell(null);
            }
        };
        if (selectedSpell) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedSpell]);

    const filteredSpells = useMemo(() => {
        return SPELLS.filter(spell => {
            const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesReq =
                reqFilter === 'all' ? true :
                    reqFilter === 'with_req' ? spell.hasRequirements :
                        !spell.hasRequirements;

            return matchesSearch && matchesReq;
        });
    }, [searchTerm, reqFilter]);

    return (
        <div className="spell-list-container">
            <div className="controls-section">
                <div className="filters-primary">
                    <div className="filter-group">
                        <span className="filter-label">Requisitos:</span>
                        <div className="origin-buttons">
                            <button
                                className={`filter-button ${reqFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setReqFilter('all')}
                            >
                                Todos
                            </button>
                            <button
                                className={`filter-button ${reqFilter === 'with_req' ? 'active' : ''}`}
                                onClick={() => setReqFilter('with_req')}
                            >
                                Con Requisitos
                            </button>
                            <button
                                className={`filter-button ${reqFilter === 'no_req' ? 'active' : ''}`}
                                onClick={() => setReqFilter('no_req')}
                            >
                                Sin Requisitos
                            </button>
                        </div>
                    </div>

                    <div className="search-row">
                        <input
                            type="text"
                            placeholder="Buscar hechizo..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="view-controls">
                    <div className="view-toggles">
                        <button
                            className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Vista en Cuadrícula"
                        >
                            ⊞
                        </button>
                        <button
                            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Vista en Tabla"
                        >
                            ≡
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="spells-grid">
                    {filteredSpells.map((spell) => (
                        <div key={spell.name} className="spell-card">
                            <div className="spell-card-header">
                                <h3>{spell.name}</h3>
                                {SPELLS_DETAILS[spell.id] && (
                                    <button
                                        className="spell-info-button"
                                        onClick={() => setSelectedSpell({ ...spell, details: SPELLS_DETAILS[spell.id] })}
                                        title="Ver detalles"
                                        aria-label={`Ver detalles de ${spell.name}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="spell-details">
                                <span className="spell-cost">Coste: {spell.cost} EM por rango</span>
                                <div className="spell-requirements">
                                    <strong>Requisitos:</strong> {spell.requirements}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="spells-table-wrapper">
                    <table className="spells-table">
                        <thead>
                            <tr>
                                <th>Hechizo</th>
                                <th>Coste</th>
                                <th>Requisitos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSpells.map((spell) => (
                                <tr key={spell.name}>
                                    <td className="col-name">
                                        <div className="col-name-container">
                                            <span>{spell.name}</span>
                                            {SPELLS_DETAILS[spell.id] && (
                                                <button
                                                    className="spell-info-button table-info-btn"
                                                    onClick={() => setSelectedSpell({ ...spell, details: SPELLS_DETAILS[spell.id] })}
                                                    title="Ver detalles"
                                                    aria-label={`Ver detalles de ${spell.name}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="11" cy="11" r="8"></circle>
                                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="col-cost">{spell.cost} EM por rango</td>
                                    <td className="col-req">{spell.requirements}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSpell && (
                <div className="spell-modal-overlay" onClick={() => setSelectedSpell(null)}>
                    <div className="spell-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="spell-modal-header">
                            <h2>{selectedSpell.name}</h2>
                            <button className="spell-modal-close" onClick={() => setSelectedSpell(null)}>&times;</button>
                        </div>
                        <div className="spell-modal-body">
                            <div className="spell-modal-meta">
                                <span className="spell-modal-cost">Coste: {selectedSpell.cost} EM por rango</span>
                                <span className="spell-modal-req"><strong>Requisitos:</strong> {selectedSpell.requirements}</span>
                            </div>
                            
                            {selectedSpell.details.description && (
                                <p className="spell-modal-description">{selectedSpell.details.description}</p>
                            )}

                            {selectedSpell.details.ranks && selectedSpell.details.ranks.length > 0 && (
                                <div className="spell-modal-ranks-section">
                                    <h4>Rangos del Hechizo</h4>
                                    <ol className="spell-modal-ranks-list">
                                        {selectedSpell.details.ranks.map((rankText: string, idx: number) => (
                                            <li key={idx} className="spell-modal-rank-item">
                                                <span className="rank-number">{idx + 1}</span>
                                                <p className="rank-text">{rankText}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {selectedSpell.details.mastery && (
                                <div className="spell-modal-mastery-section">
                                    <h4>Maestría</h4>
                                    <p className="spell-modal-mastery-text">{selectedSpell.details.mastery}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .spell-list-container {
          font-family: var(--font-body, system-ui, sans-serif);
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .controls-section {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: #fff;
          padding: 1.5rem;
          border: 2px solid var(--color-secondary, #000);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
        }

        .filters-primary {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-label {
            font-weight: bold;
            font-family: var(--font-comic, sans-serif);
            font-size: 1.1rem;
            color: var(--color-primary, #000);
        }

        .origin-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-button {
          padding: 0.5rem 1rem;
          border: 2px solid var(--color-secondary, #000);
          background: white;
          font-family: var(--font-comic, sans-serif);
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .filter-button:hover {
          background: #f5f5f5;
          transform: translateY(-1px);
        }

        .filter-button.active {
          background: var(--color-secondary, #000);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .search-row {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 0.5rem;
        }

        .search-input {
          padding: 0.8rem 1.2rem;
          border: 2px solid var(--color-secondary, #000);
          font-family: var(--font-body, sans-serif);
          width: 100%;
          border-radius: 8px;
          font-size: 1rem;
        }

        .view-controls {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            border-top: 1px solid #eee;
            padding-top: 1rem;
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
            transition: all 0.2s;
        }

        .view-button.active {
            background: var(--color-secondary, #000);
            color: white;
        }

        .spells-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .spell-card {
          border: 2px solid var(--color-secondary, #000);
          padding: 1.2rem;
          background: white;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-radius: 8px;
          transition: transform 0.2s;
        }

        .spell-card:hover {
            transform: translateY(-2px);
            box-shadow: 6px 6px 0px rgba(0,0,0,0.1);
        }

        .spell-card h3 {
          margin: 0;
          font-family: var(--font-comic, sans-serif);
          color: var(--color-primary, #000);
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .spell-details {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .spell-cost {
          font-weight: bold;
          color: #444;
          background: #f0f0f0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          align-self: flex-start;
          font-size: 0.9rem;
        }

        .spell-requirements {
            font-size: 0.9rem;
            color: #555;
            line-height: 1.4;
        }

        /* Table View Styles */
        .spells-table-wrapper {
            overflow-x: auto;
            border: 2px solid var(--color-secondary, #000);
            border-radius: 8px;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
            background: white;
        }

        .spells-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .spells-table th {
            background: var(--color-secondary, #000);
            color: white;
            padding: 1rem;
            font-family: var(--font-comic, sans-serif);
            letter-spacing: 0.5px;
        }

        .spells-table td {
            padding: 0.8rem 1rem;
            border-bottom: 1px solid #eee;
        }

        .spells-table tr:last-child td {
            border-bottom: none;
        }

        .spells-table tr:hover {
            background-color: #f9f9f9;
        }

        .col-name {
            font-weight: bold;
            color: var(--color-primary, #000);
            width: 30%;
        }

        .col-cost {
            font-family: var(--font-mono, monospace);
            color: #444;
            width: 20%;
        }
        
        .col-req {
            width: 50%;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .controls-section {
                padding: 1rem;
            }
            .view-controls {
                justify-content: center;
            }
        }

        /* Detail styles */
        .spell-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 0.5rem;
            gap: 0.5rem;
        }

        .spell-card-header h3 {
            margin: 0;
            font-family: var(--font-comic, sans-serif);
            color: var(--color-primary, #000);
            font-size: 1.2rem;
            border-bottom: none;
            padding-bottom: 0;
        }

        .col-name-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .spell-info-button {
            background: none;
            border: none;
            color: var(--color-secondary, #000);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 50%;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .spell-info-button:hover {
            background: #f1f5f9;
            color: var(--color-primary, #000);
            transform: scale(1.15);
        }

        .table-info-btn {
            padding: 3px;
        }

        /* Spell Details Modal */
        .spell-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            animation: modalFadeInBg 0.2s ease-out;
        }

        .spell-modal-content {
            background: white;
            width: 100%;
            max-width: 650px;
            max-height: 85vh;
            border-radius: 8px;
            box-shadow: 8px 8px 0px var(--color-secondary, #000);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border: 4px solid var(--color-secondary, #000);
            animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .spell-modal-header {
            padding: 1.2rem 1.5rem;
            background: var(--color-secondary, #000);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid var(--color-secondary, #000);
        }

        .spell-modal-header h2 {
            margin: 0;
            font-family: var(--font-comic, sans-serif);
            font-size: 1.6rem;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .spell-modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            transition: transform 0.15s ease;
        }

        .spell-modal-close:hover {
            transform: scale(1.2) rotate(90deg);
        }

        .spell-modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .spell-modal-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            border-bottom: 2px dashed #e2e8f0;
            padding-bottom: 1rem;
        }

        .spell-modal-cost {
            font-weight: bold;
            background: #ffe066;
            border: 2px solid var(--color-secondary, #000);
            color: #000;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            font-size: 0.9rem;
            box-shadow: 2px 2px 0px var(--color-secondary, #000);
        }

        .spell-modal-req {
            font-size: 0.95rem;
            color: #475569;
        }

        .spell-modal-description {
            font-size: 1.05rem;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            background: #f8fafc;
            padding: 1rem;
            border-left: 4px solid var(--color-primary, #000);
            border-radius: 0 6px 6px 0;
        }

        .spell-modal-ranks-section h4,
        .spell-modal-mastery-section h4 {
            margin: 0 0 1rem 0;
            font-family: var(--font-comic, sans-serif);
            color: var(--color-primary, #000);
            font-size: 1.25rem;
        }

        .spell-modal-ranks-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .spell-modal-rank-item {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            padding: 0.8rem;
            border-radius: 6px;
            transition: all 0.2s ease;
        }

        .spell-modal-rank-item:hover {
            border-color: var(--color-secondary, #000);
            box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.05);
            transform: translateY(-1px);
        }

        .rank-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: var(--color-secondary, #000);
            color: white;
            font-weight: bold;
            border-radius: 50%;
            font-size: 0.9rem;
            flex-shrink: 0;
            box-shadow: 2px 2px 0px rgba(0,0,0,0.15);
        }

        .rank-text {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
            color: #334155;
        }

        .spell-modal-mastery-section {
            background: #f0fdf4;
            border: 2px solid #bbf7d0;
            padding: 1.2rem;
            border-radius: 8px;
            box-shadow: 4px 4px 0px #bbf7d0;
        }

        .spell-modal-mastery-text {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.6;
            color: #166534;
        }

        @keyframes modalFadeInBg {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes modalPop {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
      `}</style>
        </div>
    );
}
