import React, { useState, useMemo } from 'react';

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
            <div className="controls-section">
                <div className="filters-primary">
                    {allTags.length > 1 && (
                        <div className="filter-group">
                            <span className="filter-label">Filtrar por etiquetas:</span>
                            <div className="tag-buttons">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        className={`filter-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}



                    <div className="toolbar-row">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Buscar personaje..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                    </div>
                </div>
            </div>

            <div className="characters-grid">
                {filteredCharacters.map((char) => (
                    <a key={char.slug} href={`/personajes/${char.slug}`} className="character-card">
                        <div className="card-inner">

                            <div className="card-front">
                                {char.data.image ? (
                                    <img
                                        src={char.data.image}
                                        alt={char.data.alias || char.data.name}
                                        className="char-image"
                                        width={400}
                                        height={340}
                                    />
                                ) : (
                                    <div className="placeholder-image classified-container">
                                        <div className="classified-content">
                                            <span className="classified-stamp">
                                                CLASIFICADO
                                            </span>
                                            <span className="classified-sub">
                                                SOLO OJOS AUTORIZADOS
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <h2 className="char-name">
                                    {char.data.alias || char.data.name}
                                </h2>


                            </div>
                            <div className="card-back">
                                <h3>{char.data.name}</h3>
                                <p className="char-desc">
                                    {char.data.description.slice(0, 150)}
                                    {char.data.description.length > 150
                                        ? "..."
                                        : ""}
                                </p>

                                {char.data.source && (
                                    <p className="char-source">{char.data.source}</p>
                                )}
                            </div>
                        </div>
                    </a>
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
        
        .sort-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .filter-label {
            font-weight: bold;
            font-family: var(--font-comic, sans-serif);
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

        .characters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--spacing-xl, 2rem);
            margin-top: 2rem;
        }

        .character-card {
            background-color: transparent;
            height: 400px;
            perspective: 1000px;
            text-decoration: none;
            display: block;
            color: inherit;
        }

        .card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.6s;
            transform-style: preserve-3d;
            box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }

        .character-card:hover .card-inner {
            transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border: 3px solid var(--color-secondary, #000);
            background: white;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
        }

        .card-front {
            color: black;
        }

        .card-back {
            background-color: var(--color-secondary, #000);
            color: white;
            transform: rotateY(180deg);
            padding: var(--spacing-lg, 1.5rem);
            justify-content: center;
            align-items: center;
        }

        .char-image {
            width: 100%;
            height: 85%;
            object-fit: cover;
            border-bottom: 3px solid var(--color-secondary, #000);
        }

        .placeholder-image {
            width: 100%;
            height: 85%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 3px solid var(--color-secondary, #000);
        }

        .classified-container {
            background-color: #f0e6d2;
            background-image:
                linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
            position: relative;
            overflow: hidden;
        }

        .classified-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 4px dashed #8b0000;
            padding: 1rem;
            transform: rotate(-5deg);
            opacity: 0.8;
            pointer-events: none;
        }

        .classified-stamp {
            font-size: 2rem;
            font-weight: 900;
            color: #8b0000;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            border: 3px solid #8b0000;
            padding: 0.2rem 1rem;
            margin-bottom: 0.5rem;
            background-color: rgba(139, 0, 0, 0.1);
        }

        .classified-sub {
            font-size: 0.8rem;
            font-weight: bold;
            color: #8b0000;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
        }

        .char-name {
            font-family: var(--font-heading, sans-serif);
            font-size: var(--text-xl, 1.25rem);
            font-weight: 800;
            margin: auto;
            padding: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        .card-back h3 {
            font-size: var(--text-2xl, 1.5rem);
            font-weight: 800;
            margin-bottom: var(--spacing-md, 1rem);
            color: var(--color-primary, #fff);
        }

        .char-desc {
            font-size: var(--text-sm, 0.875rem);
            line-height: 1.6;
            margin-bottom: var(--spacing-md, 1rem);
            flex-grow: 1;
        }

        .char-source {
            font-size: var(--text-xs, 0.75rem);
            color: rgba(255, 255, 255, 0.7);
            font-style: italic;
            margin-top: auto;
        }
        


        @media (max-width: 768px) {
            .characters-grid {
                grid-template-columns: 1fr;
                 gap: var(--spacing-lg, 1.5rem);
            }

            .character-card {
                height: 350px;
            }
            
            .controls-section {
                padding: 1rem;
            }
        }

        .card-front::before {
            content: "CONFIDENCIAL";
            position: absolute;
            top: 10px;
            left: -30px;
            background: var(--color-primary, red);
            color: white;
            font-size: 0.6rem;
            padding: 2px 30px;
            transform: rotate(-45deg);
            z-index: 10;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .card-back::after {
            content: "TOP SECRET";
            position: absolute;
            bottom: 10px;
            right: 10px;
            border: 2px solid var(--color-primary, white);
            color: var(--color-primary, white);
            font-size: 1rem;
            padding: 0.2rem 0.5rem;
            transform: rotate(-10deg);
            opacity: 0.5;
            font-weight: bold;
            font-family: var(--font-display, sans-serif);
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
