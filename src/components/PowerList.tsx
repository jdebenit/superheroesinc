import React, { useState, useMemo } from 'react';
import { POWERS, type Power, type PowerType } from '../data/powers';

const ORIGINS = ["Todos", "Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Thals", "Sobrenatural"];
const POWER_TYPES = ["Todos", "Físico", "Psíquico", "Energético"];

export default function PowerList() {
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(["Todos"]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Todos"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRangeTable, setShowRangeTable] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const toggleOrigin = (origin: string) => {
    if (origin === "Todos") {
      setSelectedOrigins(["Todos"]);
      return;
    }

    let newOrigins = [...selectedOrigins];
    if (newOrigins.includes("Todos")) {
      newOrigins = [];
    }

    if (newOrigins.includes(origin)) {
      newOrigins = newOrigins.filter(o => o !== origin);
    } else {
      newOrigins.push(origin);
    }

    if (newOrigins.length === 0) {
      newOrigins = ["Todos"];
    }

    setSelectedOrigins(newOrigins);
  };

  const toggleType = (type: string) => {
    if (type === "Todos") {
      setSelectedTypes(["Todos"]);
      return;
    }

    let newTypes = [...selectedTypes];
    if (newTypes.includes("Todos")) {
      newTypes = [];
    }

    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }

    if (newTypes.length === 0) {
      newTypes = ["Todos"];
    }

    setSelectedTypes(newTypes);
  };

  const filteredPowers = useMemo(() => {
    return POWERS.filter(power => {
      const matchesOrigin = selectedOrigins.includes("Todos") ||
        power.origins.some(origin => selectedOrigins.includes(origin));

      // Check if power has at least one of the selected types
      // power.types is PowerType[], selectedTypes is string[]
      const matchesType = selectedTypes.includes("Todos") ||
        power.types.some(type => selectedTypes.includes(type));

      const matchesSearch = power.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesOrigin && matchesType && matchesSearch;
    });
  }, [selectedOrigins, selectedTypes, searchTerm]);

  return (
    <div className="power-list-container">
      <div className="controls-section">
        <div className="filters-primary">
          <div className="filter-group">
            <span className="filter-label">Origen:</span>
            <div className="origin-buttons">
              {ORIGINS.map(origin => (
                <button
                  key={origin}
                  className={`filter-button origin ${selectedOrigins.includes(origin) ? 'active' : ''}`}
                  onClick={() => toggleOrigin(origin)}
                >
                  {origin}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Tipo:</span>
            <div className="type-buttons">
              {POWER_TYPES.map(type => (
                <button
                  key={type}
                  className={`filter-button type ${selectedTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="search-row">
            <input
              type="text"
              placeholder="Buscar poder..."
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
          <button
            className="range-toggle-button"
            onClick={() => setShowRangeTable(!showRangeTable)}
          >
            {showRangeTable ? "Ocultar Rangos" : "Ver Tabla de Rangos"}
          </button>
        </div>

        {showRangeTable && (
          <div className="range-table-container">
            <table className="range-table info-table">
              <thead>
                <tr>
                  <th>1d100</th>
                  <th>Coste (PC)</th>
                  <th>Rango</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>01 - 20</td><td>1 PC</td><td>Bajo (11)</td></tr>
                <tr><td>21 - 40</td><td>2 PC</td><td>Medio (21)</td></tr>
                <tr><td>41 - 70</td><td>4 PC</td><td>Elevado (41)</td></tr>
                <tr><td>71 - 95</td><td>8 PC</td><td>Alto (81)</td></tr>
                <tr><td>96 - 100</td><td>10 PC</td><td>Cósmico (100)</td></tr>
              </tbody>
            </table>
            <p className="range-note">* Los poderes que aumentan características no usan esta tabla.</p>
          </div>
        )}
      </div>

      {viewMode === 'grid' ? (
        <div className="powers-grid">
          {filteredPowers.map((power) => (
            <div key={power.name} className="power-card">
              <h3>{power.name}</h3>
              <div className="power-details">
                <span className="power-cost">PC: {power.cost}</span>
                <div className="power-tags">
                  <div className="power-types">
                    {power.types.map(type => (
                      <span key={type} className="type-tag">{type}</span>
                    ))}
                  </div>
                  <div className="power-origins">
                    {power.origins.map(origin => (
                      <span key={origin} className="origin-tag">{origin}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="powers-table-wrapper">
          <table className="powers-table">
            <thead>
              <tr>
                <th>Poder</th>
                <th>Coste (PC)</th>
                <th>Tipo</th>
                <th>Orígenes</th>
              </tr>
            </thead>
            <tbody>
              {filteredPowers.map((power) => (
                <tr key={power.name}>
                  <td className="col-name">{power.name}</td>
                  <td className="col-cost">{power.cost}</td>
                  <td className="col-types">
                    <div className="table-types">
                      {power.types.map(type => (
                        <span key={type} className="type-tag tiny">{type}</span>
                      ))}
                    </div>
                  </td>
                  <td className="col-origins">
                    <div className="table-origins">
                      {power.origins.map(origin => (
                        <span key={origin} className="origin-tag tiny">{origin}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`

        .power-list-container {
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

        .origin-buttons, .type-buttons {
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

        /* Type buttons specific style if needed, e.g. slightly different active color */
        .filter-button.type.active {
            background: #4a4a4a; /* Slightly lighter grey or primary color? */
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
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
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

        .range-toggle-button {
          padding: 0.6rem 1.2rem;
          background: var(--color-primary, #f00);
          color: white;
          border: 2px solid var(--color-secondary, #000);
          font-family: var(--font-comic, sans-serif);
          cursor: pointer;
          font-weight: bold;
          box-shadow: 2px 2px 0px var(--color-secondary, #000);
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .range-toggle-button:hover {
            transform: translateY(-1px);
            box-shadow: 3px 3px 0px var(--color-secondary, #000);
        }
        
        .range-table-container {
          background: #f9f9f9;
          border: 2px solid var(--color-secondary);
          padding: 1rem;
          max-width: 600px;
          margin: 1rem auto 0;
          border-radius: 8px;
        }

        .range-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-mono, monospace);
        }

        .range-table th, .range-table td {
          border: 1px solid #ddd;
          padding: 0.6rem;
          text-align: center;
        }

        .range-table th {
          background: #eee;
          font-weight: bold;
        }

        .range-note {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.5rem;
          font-style: italic;
          text-align: center;
        }

        .powers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
          transition: transform 0.2s;
        }

        .power-card:hover {
            transform: translateY(-2px);
            box-shadow: 6px 6px 0px rgba(0,0,0,0.1);
        }

        .power-card h3 {
          margin: 0;
          font-family: var(--font-comic, sans-serif);
          color: var(--color-primary, #000);
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .power-details {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .power-cost {
          font-weight: bold;
          color: #444;
          background: #f0f0f0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          align-self: flex-start;
          font-size: 0.9rem;
        }

        .power-tags {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .power-types, .power-origins, .table-origins, .table-types {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .origin-tag {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          background: #e8e8e8;
          border: 1px solid #ccc;
          border-radius: 12px;
          font-weight: 500;
        }
        
        .type-tag {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          background: #e3f2fd; /* Light blue for types */
          border: 1px solid #90caf9;
          color: #1565c0;
          border-radius: 12px;
          font-weight: 600;
        }

        .origin-tag.tiny, .type-tag.tiny {
            font-size: 0.7rem;
            padding: 0.1rem 0.4rem;
        }

        /* Table View Styles */
        .powers-table-wrapper {
            overflow-x: auto;
            border: 2px solid var(--color-secondary, #000);
            border-radius: 8px;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
            background: white;
        }

        .powers-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .powers-table th {
            background: var(--color-secondary, #000);
            color: white;
            padding: 1rem;
            font-family: var(--font-comic, sans-serif);
            letter-spacing: 0.5px;
        }

        .powers-table td {
            padding: 0.8rem 1rem;
            border-bottom: 1px solid #eee;
        }

        .powers-table tr:last-child td {
            border-bottom: none;
        }

        .powers-table tr:hover {
            background-color: #f9f9f9;
        }

        .col-name {
            font-weight: bold;
            color: var(--color-primary, #000);
            width: 25%;
        }

        .col-cost {
            font-family: var(--font-mono, monospace);
            color: #444;
            width: 20%;
        }
        
        .col-types {
            width: 25%;
        }
        
        .col-origins {
            width: 30%;
        }

        @media (max-width: 768px) {
            .controls-section {
                padding: 1rem;
            }
            .view-controls {
                flex-direction: column;
                align-items: stretch;
            }
            .view-toggles {
                justify-content: center;
            }
        }
      `}</style>
    </div>
  );
}
