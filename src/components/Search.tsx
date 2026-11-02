import React, { useState, useEffect, useRef, useCallback } from 'react';
import Logger from '../utils/Logger';
import './Search.css';

interface SearchResult {
  title: string;
  description: string;
  url: string;
  category: string;
  type: string;
  source?: string;
  alias?: string;
}

interface NormalizedSearchResult extends SearchResult {
  _normTitle: string;
  _normDesc: string;
  _normAlias: string;
}

function normalizeText(value: string = ''): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NormalizedSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState<NormalizedSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasRequestedIndex = useRef(false);

  const ensureIndexLoaded = useCallback(() => {
    if (hasRequestedIndex.current) return;
    hasRequestedIndex.current = true;

    fetch('/search-index.json')
      .then(res => res.json())
      .then((data: SearchResult[]) => {
        const preNormalized: NormalizedSearchResult[] = data.map(item => ({
          ...item,
          _normTitle: normalizeText(item.title),
          _normDesc: normalizeText(item.description),
          _normAlias: normalizeText(item.alias || ''),
        }));
        setSearchIndex(preNormalized);
      })
      .catch(err => {
        hasRequestedIndex.current = false;
        Logger.error('Error loading search index:', err);
      });
  }, []);

  // Close dropdown when clicking outside & handle global Ctrl+K / '/' shortcut
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const target = event.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        Boolean(target?.isContentEditable);

      if (isCtrlK || (event.key === '/' && !isEditable)) {
        event.preventDefault();
        ensureIndexLoaded();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [ensureIndexLoaded]);

  // Search function using pre-normalized index fields
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      const normalizedQuery = normalizeText(searchQuery.trim());

      const filtered = searchIndex.filter(
        item =>
          item._normTitle.includes(normalizedQuery) ||
          item._normDesc.includes(normalizedQuery) ||
          item._normAlias.includes(normalizedQuery)
      );

      // Sort by relevance (title matches first)
      const sorted = filtered.sort((a, b) => {
        const aInTitle = a._normTitle.includes(normalizedQuery);
        const bInTitle = b._normTitle.includes(normalizedQuery);

        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        return 0;
      });

      setResults(sorted.slice(0, 8)); // Limit to 8 results
      setIsOpen(true);
      setSelectedIndex(0);
    },
    [searchIndex]
  );

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

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
    }
  };

  // Highlight matching text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(searchQuery);
    const index = normalizedText.indexOf(normalizedQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + searchQuery.length);
    const after = text.slice(index + searchQuery.length);

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
          aria-label="Buscar en Superheroes INC."
          value={query}
          onChange={(e) => {
            ensureIndexLoaded();
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            ensureIndexLoaded();
            if (query) setIsOpen(true);
          }}
        />
        {!query && (
          <kbd className="search-shortcut-hint" aria-hidden="true">
            Ctrl K
          </kbd>
        )}
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

      {isOpen && query && searchIndex.length > 0 && results.length === 0 && (
        <div className="search-results">
          <div className="search-no-results">
            No se encontraron resultados para "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
