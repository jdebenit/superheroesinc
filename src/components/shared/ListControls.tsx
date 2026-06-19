import React from 'react';

interface FilterOption {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
    multiSelect?: boolean;
}

interface ListControlsProps {
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    filters?: FilterOption[];
    children?: React.ReactNode; // For Sort, View toggles, etc.
}

export default function ListControls({ search, filters, children }: ListControlsProps) {
    return (
        <div className="controls-section">
            <div className="filters-primary">
                {filters && filters.map((filter, index) => (
                    <div key={index} className="filter-group">
                        {filter.label && <span className="filter-label">{filter.label}</span>}
                        <div className="tag-buttons">
                            {filter.options.map(option => (
                                <button
                                    key={option}
                                    className={`filter-button ${filter.selected.includes(option) ? 'active' : ''}`}
                                    onClick={() => filter.onToggle(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="toolbar-row">
                    {search && (
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder={search.placeholder || "Buscar..."}
                                className="search-input"
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                            />
                        </div>
                    )}

                    {children && (
                        <div className="additional-controls">
                            {children}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
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
                    gap: 1rem;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .filter-label {
                    font-weight: bold;
                    font-family: var(--font-comic, "Bangers", system-ui, sans-serif);
                    font-size: 1.1rem;
                    color: var(--color-primary, #000);
                    white-space: nowrap;
                }

                .tag-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .filter-button {
                    padding: 0.5rem 1rem;
                    border: 2px solid var(--color-secondary, #000);
                    background: white;
                    font-family: var(--font-comic, "Bangers", system-ui, sans-serif);
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.2s;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    text-transform: capitalize;
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

                .toolbar-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .search-group {
                    flex-grow: 1;
                    min-width: 250px;
                }

                .search-input {
                    padding: 0.8rem 1.2rem;
                    border: 2px solid var(--color-secondary, #000);
                    font-family: var(--font-body, system-ui, sans-serif);
                    width: 100%;
                    border-radius: 8px;
                    font-size: 1rem;
                }
                
                .additional-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .controls-section {
                        padding: 1rem;
                    }
                    .toolbar-row {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                        max-width: 100%;
                    }
                    .search-group {
                        min-width: 0;
                        width: 100%;
                    }
                    .additional-controls {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                        width: 100%;
                        max-width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
