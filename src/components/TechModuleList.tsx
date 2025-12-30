import React, { useState, useMemo } from 'react';
import { TECH_MODULES, type TechModuleDefinition } from '../data/techModules';

const MODULE_TYPES = ["Todos", "General", "Mejora Interna"];

export default function TechModuleList() {
    const [selectedTypes, setSelectedTypes] = useState<string[]>(["Todos"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

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

    const filteredModules = useMemo(() => {
        return TECH_MODULES.filter(module => {
            const type = module.type || 'General';

            const matchesType = selectedTypes.includes("Todos") ||
                selectedTypes.includes(type);

            const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [selectedTypes, searchTerm]);

    return (
        <div className="module-list-container">
            <div className="controls-section">
                <div className="filters-primary">
                    <div className="filter-group">
                        <span className="filter-label">Tipo:</span>
                        <div className="type-buttons">
                            {MODULE_TYPES.map(type => (
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
                            placeholder="Buscar módulo..."
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
                <div className="modules-grid">
                    {filteredModules.map((module) => {
                        const type = module.type || 'General';
                        return (
                            <div key={module.id} className="module-card">
                                <h3>{module.name}</h3>
                                <div className="module-details">
                                    <span className="module-cost">Coste: {module.cost} PC</span>

                                    <div className="module-tags">
                                        <span className={`type-tag ${type === 'Mejora Interna' ? 'internal' : ''}`}>
                                            {type}
                                        </span>
                                        {module.locations && module.locations.length > 0 && (
                                            <span className="location-tag">
                                                {module.locations.join(", ")}
                                            </span>
                                        )}
                                    </div>

                                    {module.description && (
                                        <p className="module-description">{module.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="modules-table-wrapper">
                    <table className="modules-table">
                        <thead>
                            <tr>
                                <th>Módulo</th>
                                <th>Coste (PC)</th>
                                <th>Tipo</th>
                                <th>Localización</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredModules.map((module) => {
                                const type = module.type || 'General';
                                return (
                                    <tr key={module.id}>
                                        <td className="col-name">{module.name}</td>
                                        <td className="col-cost">{module.cost}</td>
                                        <td className="col-type">
                                            <span className={`type-tag tiny ${type === 'Mejora Interna' ? 'internal' : ''}`}>
                                                {type}
                                            </span>
                                        </td>
                                        <td className="col-location">
                                            {module.locations ? module.locations.join(", ") : "-"}
                                        </td>
                                        <td className="col-description">{module.description}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
        .module-list-container {
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

        .type-buttons {
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

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .module-card {
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

        .module-card:hover {
            transform: translateY(-2px);
            box-shadow: 6px 6px 0px rgba(0,0,0,0.1);
        }

        .module-card h3 {
          margin: 0;
          font-family: var(--font-comic, sans-serif);
          color: var(--color-primary, #000);
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .module-details {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .module-cost {
          font-weight: bold;
          color: #444;
          background: #f0f0f0;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          align-self: flex-start;
          font-size: 0.8rem;
        }

        .module-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
        }
        
        .type-tag {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          background: #e3f2fd; /* Light blue for General */
          border: 1px solid #90caf9;
          color: #1565c0;
          border-radius: 12px;
          font-weight: 600;
        }

        .type-tag.internal {
            background: #fce7f3; /* Pink for Mevjora Interna */
            border: 1px solid #fbcfe8;
            color: #be123c;
        }

        .location-tag {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            color: #374151;
            border-radius: 12px;
            font-style: italic;
        }

        .module-description {
            font-size: 0.9rem;
            color: #555;
            line-height: 1.4;
            margin: 0;
        }

        .type-tag.tiny {
            font-size: 0.7rem;
            padding: 0.1rem 0.4rem;
        }

        /* Table View Styles */
        .modules-table-wrapper {
            overflow-x: auto;
            border: 2px solid var(--color-secondary, #000);
            border-radius: 8px;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
            background: white;
        }

        .modules-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .modules-table th {
            background: var(--color-secondary, #000);
            color: white;
            padding: 1rem;
            font-family: var(--font-comic, sans-serif);
            letter-spacing: 0.5px;
        }

        .modules-table td {
            padding: 0.8rem 1rem;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        .modules-table tr:last-child td {
            border-bottom: none;
        }

        .modules-table tr:hover {
            background-color: #f9f9f9;
        }

        .col-name {
            font-weight: bold;
            color: var(--color-primary, #000);
            width: 20%;
        }

        .col-cost {
            font-family: var(--font-mono, monospace);
            color: #444;
            width: 10%;
            text-align: center;
        }
        
        .col-type {
            width: 15%;
            text-align: center;
        }
        
        .col-location {
            width: 15%;
            font-size: 0.9rem;
            font-style: italic;
            color: #666;
        }

        .col-description {
            width: 40%;
            font-size: 0.9rem;
            color: #444;
            line-height: 1.4;
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
