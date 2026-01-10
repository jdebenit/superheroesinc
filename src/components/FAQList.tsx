import React, { useState, useMemo, useEffect } from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface FAQ {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  category?: string;
  order?: number;
}

interface FAQListProps {
  faqs: FAQ[];
}

const ITEMS_PER_PAGE = 10;

export default function FAQList({ faqs }: FAQListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Todos"]);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all unique tags from FAQs
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    faqs.forEach(faq => {
      faq.tags.forEach(tag => tags.add(tag));
    });
    return ["Todos", ...Array.from(tags).sort()];
  }, [faqs]);

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

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQs(newExpanded);
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      // Filter by tags
      const matchesTags = selectedTags.includes("Todos") ||
        faq.tags.some(tag => selectedTags.includes(tag));

      // Filter by search term (search in both question and answer)
      const matchesSearch = searchTerm === "" ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTags && matchesSearch;
    });
  }, [faqs, selectedTags, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTags]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredFAQs.length / ITEMS_PER_PAGE);
  const paginatedFAQs = filteredFAQs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of list smoothly if needed, or just let users scroll
    const listElement = document.querySelector('.faq-list-container');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle URL hash on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      // Check if this ID exists in our FAQs
      const faqExists = faqs.some(f => f.id === id);

      if (faqExists) {
        // Expand the FAQ
        setExpandedFAQs(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });

        // Find the page this FAQ belongs to
        // We need to calculate which page this FAQ is on given the current filters
        // But initially, filters are default ("Todos"), so we can find it in the full list
        // However, if we want to be robust we should ensure we are showing the right page

        // Simpler approach: If we have a hash, maybe we should ignore pagination for a second or jump to that page?
        // Let's find the index in the *current* filtered list (which is all initially)
        const index = filteredFAQs.findIndex(f => f.id === id);
        if (index !== -1) {
          const page = Math.floor(index / ITEMS_PER_PAGE) + 1;
          setCurrentPage(page);

          // Wait for render then scroll
          setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('highlight-faq');
              setTimeout(() => element.classList.remove('highlight-faq'), 2000);
            }
          }, 100);
        }
      }
    }
  }, [faqs, filteredFAQs]); // filteredFAQs dependence ensures we find it if it's in the initial list

  const copyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent toggling the FAQ
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      // Could show a toast here, for now let's change the button temporarily
      const btn = e.currentTarget as HTMLButtonElement;
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1500);
    });
  };

  return (
    <div className="faq-list-container">
      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar en preguntas y respuestas..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="results-count">
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>

        <div className="filter-section">
          <span className="filter-label">Filtrar por tags:</span>
          <div className="tag-buttons">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="faq-list">
        {paginatedFAQs.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron FAQs que coincidan con tu búsqueda.</p>
            <p>Intenta con otros términos o tags.</p>
          </div>
        ) : (
          <>
            {paginatedFAQs.map((faq) => (
              <div key={faq.id} id={faq.id} className="faq-item">
                <div className="faq-header">
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={expandedFAQs.has(faq.id)}
                  >
                    <span className="question-icon">
                      {expandedFAQs.has(faq.id) ? '▼' : '▶'}
                    </span>
                    <span className="question-text">{faq.question}</span>
                  </button>
                  <button
                    className="copy-link-btn"
                    onClick={(e) => copyLink(e, faq.id)}
                    title="Copiar enlace directo"
                  >
                    🔗
                  </button>
                </div>

                {expandedFAQs.has(faq.id) && (
                  <div className="faq-answer">
                    <div
                      className="answer-content"
                      dangerouslySetInnerHTML={{ __html: md.render(faq.answer) }}
                    />
                    <div className="faq-tags">
                      {faq.tags.map(tag => (
                        <span key={tag} className="faq-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt; Anterior
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .faq-list-container {
          font-family: var(--font-body, system-ui, sans-serif);
          max-width: 1000px;
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
          border-radius: 8px;
        }

        .search-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .search-input {
          padding: 0.8rem 1.2rem;
          border: 2px solid var(--color-secondary, #000);
          font-family: var(--font-body, sans-serif);
          width: 100%;
          border-radius: 8px;
          font-size: 1rem;
          transition: box-shadow 0.2s;
        }

        .search-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
        }

        .results-count {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .filter-section {
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

        .tag-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-button {
          padding: 0.5rem 1rem;
          border: 2px solid var(--color-secondary, #000);
          background: white;
          font-family: var(--font-comic, sans-serif);
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .tag-button:hover {
          background: #f5f5f5;
          transform: translateY(-1px);
        }

        .tag-button.active {
          background: var(--color-secondary, #000);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border: 2px solid var(--color-secondary, #000);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .faq-item:hover {
          transform: translateX(-2px);
        }

        .faq-header {
          display: flex;
          align-items: stretch;
          background: white;
          transition: background 0.2s;
        }

        .faq-header:hover {
          background: #f9f9f9;
        }

        .faq-question {
          flex: 1;
          padding: 1.2rem 0 1.2rem 1.5rem;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: var(--font-comic, sans-serif);
          font-size: 1.1rem;
          font-weight: bold;
          color: var(--color-primary, #000);
        }

        .copy-link-btn {
          padding: 0 1.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          opacity: 0.3;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faq-header:hover .copy-link-btn {
          opacity: 1;
        }

        .copy-link-btn:hover {
          background: #f0f0f0;
          transform: scale(1.1);
        }

        @keyframes highlightFade {
          0% { background-color: rgba(255, 255, 0, 0.3); }
          100% { background-color: transparent; }
        }

        .highlight-faq {
          animation: highlightFade 2s ease-out;
        }

        .faq-question[aria-expanded="true"] {
          /* background is now on header */
        }
        
        .faq-header:has(.faq-question[aria-expanded="true"]) {
           background: #f0f0f0;
        }

        .question-icon {
          font-size: 0.8rem;
          color: var(--color-secondary, #000);
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .question-text {
          flex: 1;
        }

        .faq-answer {
          padding: 0 1.5rem 1.5rem 1.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .answer-content {
          line-height: 1.7;
          color: #333;
          margin-bottom: 1rem;
        }

        .answer-content h2 {
          font-size: 1.3rem;
          margin-top: 1.5rem;
          margin-bottom: 0.8rem;
          color: var(--color-primary, #000);
          font-family: var(--font-comic, sans-serif);
        }

        .answer-content h3 {
          font-size: 1.1rem;
          margin-top: 1.2rem;
          margin-bottom: 0.6rem;
          color: var(--color-secondary, #000);
          font-family: var(--font-comic, sans-serif);
        }

        .answer-content ul, .answer-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .answer-content li {
          margin-bottom: 0.5rem;
        }

        .answer-content p {
          margin-bottom: 1rem;
        }

        .answer-content strong {
          font-weight: bold;
          color: var(--color-primary, #000);
        }

        .answer-content a {
          color: var(--color-primary, #e74c3c);
          text-decoration: underline;
        }

        .answer-content a:hover {
          color: var(--color-secondary, #000);
        }

        .answer-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .answer-content th,
        .answer-content td {
          border: 1px solid #ddd;
          padding: 0.6rem;
          text-align: left;
        }

        .answer-content th {
          background: #f0f0f0;
          font-weight: bold;
        }

        .faq-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .faq-tag {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          background: #e8e8e8;
          border: 1px solid #ccc;
          border-radius: 12px;
          font-weight: 500;
        }

        .no-results {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border: 2px solid var(--color-secondary, #000);
          border-radius: 8px;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
        }

        .no-results p {
          margin: 0.5rem 0;
          color: #666;
        }

        .no-results p:first-child {
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }

        .pagination-btn {
            background: white;
            border: 2px solid var(--color-secondary, #000);
            padding: 0.5rem 1rem;
            font-family: var(--font-comic, sans-serif);
            font-weight: bold;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
            background: #f5f5f5;
            transform: translateY(-2px);
            box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
        }

        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: #ccc;
        }

        .pagination-pages {
            display: flex;
            gap: 0.5rem;
        }

        .pagination-page-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border: 2px solid var(--color-secondary, #000);
            font-family: var(--font-comic, sans-serif);
            font-weight: bold;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s;
        }
        
        .pagination-page-btn:hover:not(.active) {
            background: #f5f5f5;
            transform: translateY(-2px);
        }

        .pagination-page-btn.active {
            background: var(--color-secondary, #000);
            color: white;
            transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .controls-section {
            padding: 1rem;
          }

          .faq-question {
            padding: 1rem;
            font-size: 1rem;
          }

          .faq-answer {
            padding: 0 1rem 1rem 1rem;
          }

          .tag-buttons {
            gap: 0.4rem;
          }

          .tag-button {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
          
          .pagination {
            gap: 0.5rem;
          }
          
          .pagination-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
