import React, { useState, useMemo } from 'react';
import ListControls from './shared/ListControls';
import CharacterCard from './CharacterCard';

interface Character {
    id: string;
    data: {
        name: string;
        alias?: string;
        description: string;
        image?: string;
        tags?: string[];
        groups?: string[];
        grupos?: string[];
        source?: string;
        updatedDate?: string | Date;
        rpgId?: string;
    };
}

interface GroupInfo {
    id: string;
    title: string;
}

interface CharacterListProps {
    initialCharacters: Character[];
    allGroups: GroupInfo[];
}

export default function CharacterList({ initialCharacters, allGroups }: CharacterListProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(["Todos"]);
    const [selectedGroup, setSelectedGroup] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "recent">("name");
    const [onlyWithRpg, setOnlyWithRpg] = useState(false);


    // Extract unique tags from all characters
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        initialCharacters.forEach(char => {
            if (char.data.tags) {
                char.data.tags.forEach(tag => tags.add(tag));
            }
        });
        return ["Todos", ...Array.from(tags).sort()];
    }, [initialCharacters]);

    const toggleTag = (tag: string) => {
        if (tag === "Todos") {
            setSelectedTags(["Todos"]);
            return;
        }

        let newTags = [...selectedTags];
        if (newTags.includes("Todos")) {
            newTags = [];
        }

        if (newTags.includes(tag)) {
            newTags = newTags.filter(t => t !== tag);
        } else {
            newTags.push(tag);
        }

        if (newTags.length === 0) {
            newTags = ["Todos"];
        }

        setSelectedTags(newTags);
    };

    const filteredCharacters = useMemo(() => {
        const filtered = initialCharacters.filter(char => {
            const charTags = char.data.tags || [];
            const charGroups = [
                ...(char.data.groups || []),
                ...(char.data.grupos || [])
            ];

            const matchesTags = selectedTags.includes("Todos") ||
                selectedTags.some(tag => charTags.includes(tag));

            const matchesGroup = selectedGroup === "Todos" ||
                charGroups.includes(selectedGroup);

            const matchesRpg = !onlyWithRpg || !!char.data.rpgId;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                char.data.name.toLowerCase().includes(searchLower) ||
                (char.data.alias && char.data.alias.toLowerCase().includes(searchLower)) ||
                (char.data.description && char.data.description.toLowerCase().includes(searchLower));

            return matchesTags && matchesGroup && matchesSearch && matchesRpg;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'recent') {
                const dateA = a.data.updatedDate ? new Date(a.data.updatedDate).getTime() : 0;
                const dateB = b.data.updatedDate ? new Date(b.data.updatedDate).getTime() : 0;
                return dateB - dateA;
            } else {
                const nameA = a.data.alias || a.data.name;
                const nameB = b.data.alias || b.data.name;
                return nameA.localeCompare(nameB);
            }
        });
    }, [initialCharacters, selectedTags, selectedGroup, searchTerm, sortBy, onlyWithRpg]);


    return (
        <div className="character-list-container">
            <ListControls
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Buscar personaje..."
                }}
                filters={allTags.length > 1 ? [{
                    label: "Filtrar por etiquetas:",
                    options: allTags,
                    selected: selectedTags,
                    onToggle: toggleTag
                }] : []}
            >
                {allGroups && allGroups.length > 0 && (
                    <div className="filter-select-group">
                        <span className="filter-label">Grupo:</span>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="group-select"
                        >
                            <option value="Todos">Todos los grupos</option>
                            {allGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="rpg-filter-group">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={onlyWithRpg}
                            onChange={(e) => setOnlyWithRpg(e.target.checked)}
                            className="rpg-checkbox"
                        />
                        <span className="checkbox-text">Ficha disponible</span>
                    </label>
                </div>

                <div className="sort-group">
                    <span className="filter-label">Ordenar:</span>
                    <div className="tag-buttons">
                        <button
                            className={`filter-button ${sortBy === 'name' ? 'active' : ''}`}
                            onClick={() => setSortBy('name')}
                        >
                            Nombre
                        </button>
                        <button
                            className={`filter-button ${sortBy === 'recent' ? 'active' : ''}`}
                            onClick={() => setSortBy('recent')}
                        >
                            Recientes
                        </button>
                    </div>
                </div>
            </ListControls>

            <div className="characters-grid">
                {filteredCharacters.map((char) => (
                    <CharacterCard key={char.id} slug={char.id} data={char.data} />
                ))}

                {filteredCharacters.length === 0 && (
                    <div className="no-results">
                        <p>No se encontraron personajes que coincidan con los filtros.</p>
                    </div>
                )}
            </div>

            <style>{`
         .character-list-container {
           font-family: var(--font-body, system-ui, sans-serif);
           max-width: 1400px;
           margin: 0 auto;
         }

         .filter-select-group {
             display: flex;
             align-items: center;
             gap: 0.5rem;
         }

         .group-select {
             padding: 0.5rem 1rem;
             border: 2px solid var(--color-secondary, #000);
             background: white;
             font-family: var(--font-body, system-ui, sans-serif);
             font-weight: bold;
             border-radius: 20px;
             font-size: 0.9rem;
             cursor: pointer;
             outline: none;
             text-transform: capitalize;
             transition: all 0.2s;
         }

         .group-select:hover {
             background: #f5f5f5;
         }

         .rpg-filter-group {
             display: flex;
             align-items: center;
         }

         .checkbox-container {
             display: flex;
             align-items: center;
             gap: 0.5rem;
             cursor: pointer;
             user-select: none;
         }

         .rpg-checkbox {
             appearance: none;
             -webkit-appearance: none;
             width: 18px;
             height: 18px;
             border: 2px solid var(--color-secondary, #000);
             background: white;
             border-radius: 4px;
             cursor: pointer;
             position: relative;
             transition: all 0.2s;
             outline: none;
             margin: 0;
         }

         .rpg-checkbox:checked {
             background: var(--color-accent, #2c5f8d);
             border-color: var(--color-secondary, #000);
         }

         .rpg-checkbox:checked::after {
             content: "✓";
             position: absolute;
             color: white;
             font-size: 0.75rem;
             font-weight: bold;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
         }

         .checkbox-text {
             font-size: 0.9rem;
             font-weight: bold;
             text-transform: uppercase;
             font-family: var(--font-heading, monospace);
             color: var(--color-text, #000);
         }

         .sort-group {
             display: flex;
             align-items: center;
             gap: 0.5rem;
         }

        .characters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--spacing-xl, 2rem);
            margin-top: 2rem;
        }

        @media (max-width: 768px) {
            .characters-grid {
                grid-template-columns: 1fr;
                 gap: var(--spacing-lg, 1.5rem);
            }
            
            .controls-section {
                padding: 1rem;
            }

            .filter-select-group {
                width: 100%;
                max-width: 100%;
            }

            .group-select {
                max-width: calc(100% - 75px);
            }
        }
        
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 2rem;
            font-size: 1.2rem;
            color: #666;
        }
      `}</style>
        </div >
    );
}
