
import React, { useState, useMemo } from 'react';
import { SPELLS, type Spell } from '../data/spells';

export default function SpellList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [reqFilter, setReqFilter] = useState<'all' | 'with_req' | 'no_req'>('all');

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
                            <h3>{spell.name}</h3>
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
                                    <td className="col-name">{spell.name}</td>
                                    <td className="col-cost">{spell.cost} EM por rango</td>
                                    <td className="col-req">{spell.requirements}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
      `}</style>
        </div>
    );
}
