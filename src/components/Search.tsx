import React, { useState, useEffect, useRef } from 'react';

interface SearchResult {
    title: string;
    description: string;
    url: string;
    category: string;
    type: string;
    source?: string;
    alias?: string;
}

const Search: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load search index
    useEffect(() => {
        fetch('/search-index.json')
            .then(res => res.json())
            .then(data => setSearchIndex(data))
            .catch(err => console.error('Error loading search index:', err));
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search function
    const performSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const normalizedQuery = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const filtered = searchIndex.filter(item => {
            const normalizedTitle = item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedDesc = item.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedAlias = item.alias?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

            return normalizedTitle.includes(normalizedQuery) ||
                normalizedDesc.includes(normalizedQuery) ||
                normalizedAlias.includes(normalizedQuery);
        });

        // Sort by relevance (title matches first)
        const sorted = filtered.sort((a, b) => {
            const aTitle = a.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const bTitle = b.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            const aInTitle = aTitle.includes(normalizedQuery);
            const bInTitle = bTitle.includes(normalizedQuery);

            if (aInTitle && !bInTitle) return -1;
            if (!aInTitle && bInTitle) return 1;
            return 0;
        });

        setResults(sorted.slice(0, 8)); // Limit to 8 results
        setIsOpen(true);
        setSelectedIndex(0);
    };

    // Handle input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 200);

        return () => clearTimeout(timer);
    }, [query, searchIndex]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    window.location.href = results[selectedIndex].url;
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    // Highlight matching text
    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;

        const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const index = normalizedText.toLowerCase().indexOf(normalizedQuery.toLowerCase());

        if (index === -1) return text;

        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);

        return (
            <>
                {before}
                <mark className="search-highlight">{match}</mark>
                {after}
            </>
        );
    };

    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Buscar..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setIsOpen(true)}
                />
                {query && (
                    <button
                        className="search-clear"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                        aria-label="Limpiar búsqueda"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="search-results">
                    {results.map((result, index) => (
                        <a
                            key={`${result.type}-${result.url}`}
                            href={result.url}
                            className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="result-header">
                                <span className="result-title">
                                    {highlightText(result.title, query)}
                                </span>
                                <span className="result-category">{result.category}</span>
                            </div>
                            <p className="result-description">
                                {highlightText(result.description.slice(0, 100), query)}
                                {result.description.length > 100 ? '...' : ''}
                            </p>
                        </a>
                    ))}
                </div>
            )}

            {isOpen && query && results.length === 0 && (
                <div className="search-results">
                    <div className="search-no-results">
                        No se encontraron resultados para "{query}"
                    </div>
                </div>
            )}

            <style>{`
        .search-container {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #666;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          font-size: 0.95rem;
          font-family: var(--font-body);
          border: 2px solid var(--color-border);
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(220, 0, 0, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border: none;
          background: var(--color-accent);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .search-clear:hover {
          background: var(--color-primary);
        }

        .search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          display: block;
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: var(--color-background-alt);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .result-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-secondary);
        }

        .result-category {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-accent);
          white-space: nowrap;
        }

        .result-description {
          font-size: 0.875rem;
          color: var(--color-text-light);
          line-height: 1.4;
          margin: 0;
        }

        .search-highlight {
          background: rgba(220, 0, 0, 0.2);
          color: var(--color-primary);
          font-weight: 600;
          padding: 0 2px;
          border-radius: 2px;
        }

        .search-no-results {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-light);
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .search-container {
            max-width: 100%;
          }

          .search-results {
            max-height: 300px;
          }

          .result-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
        </div>
    );
};

export default Search;
