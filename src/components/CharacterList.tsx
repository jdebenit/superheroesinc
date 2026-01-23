import React, { useState, useMemo } from 'react';
import ListControls from './shared/ListControls';
import CharacterCard from './CharacterCard';

interface Character {
    slug: string;
    data: {
        name: string;
        alias?: string;
        description: string;
        image?: string;
        tags?: string[];
        source?: string;
        updatedDate?: string | Date;
    };
}

interface CharacterListProps {
    initialCharacters: Character[];
}

export default function CharacterList({ initialCharacters }: CharacterListProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(["Todos"]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "recent">("name");


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

            const matchesTags = selectedTags.includes("Todos") ||
                selectedTags.some(tag => charTags.includes(tag));

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                char.data.name.toLowerCase().includes(searchLower) ||
                (char.data.alias && char.data.alias.toLowerCase().includes(searchLower)) ||
                (char.data.description && char.data.description.toLowerCase().includes(searchLower));

            return matchesTags && matchesSearch;
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
    }, [initialCharacters, selectedTags, searchTerm, sortBy]);


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
                    <CharacterCard key={char.slug} slug={char.slug} data={char.data} />
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
