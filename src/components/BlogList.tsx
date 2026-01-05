import React, { useState, useMemo, useEffect } from 'react';
import ComicCard from './ComicCard';

interface BlogPost {
    slug: string;
    data: {
        title: string;
        description: string;
        pubDate: Date;
        image?: string;
        tags?: string[];
    };
}

interface BlogListProps {
    posts: BlogPost[];
}

const ITEMS_PER_PAGE = 9;

export default function BlogList({ posts }: BlogListProps) {
    const [selectedTag, setSelectedTag] = useState<string>("Todos");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        posts.forEach(post => {
            if (post.data.tags) {
                post.data.tags.forEach(tag => tags.add(tag));
            }
        });
        return ["Todos", ...Array.from(tags).sort()];
    }, [posts]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesTag = selectedTag === "Todos" || (post.data.tags && post.data.tags.includes(selectedTag));
            const matchesSearch = searchTerm === "" ||
                post.data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.data.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTag && matchesSearch;
        });
    }, [posts, selectedTag, searchTerm]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTag, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="blog-list-container">
            <div className="controls-section">
                <input
                    type="text"
                    placeholder="Buscar artículos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />

                <div className="tag-buttons">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="results-info">
                Mostrando {filteredPosts.length} artículos {selectedTag !== "Todos" && `etiquetados como "${selectedTag}"`}
            </div>

            {paginatedPosts.length > 0 ? (
                <div className="posts-grid">
                    {paginatedPosts.map((post) => (
                        <ComicCard
                            key={post.slug}
                            title={post.data.title}
                            excerpt={post.data.description}
                            date={new Date(post.data.pubDate).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                            image={post.data.image}
                            link={`/blog/${post.slug}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No se encontraron artículos con estos filtros.</p>
                    <button
                        onClick={() => { setSelectedTag("Todos"); setSearchTerm(""); }}
                        className="btn-link"
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Anterior
                    </button>

                    <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <style>{`
        .blog-list-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .controls-section {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar {
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          border: 2px solid #ccc;
          border-radius: 6px;
          font-family: inherit;
        }

        .search-bar:focus {
          border-color: var(--color-secondary, #000);
          outline: none;
        }

        .tag-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-button {
          padding: 0.4rem 1rem;
          border: 2px solid var(--color-secondary, #000);
          background: white;
          color: var(--color-secondary, #000);
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.9rem;
          transition: all 0.2s;
          font-family: var(--font-comic, sans-serif);
          text-transform: uppercase;
        }

        .tag-button:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }

        .tag-button.active {
          background: var(--color-secondary, #000);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .results-info {
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #666;
          font-weight: bold;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .no-results {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border: 2px solid var(--color-secondary, #000);
          border-radius: 8px;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.1);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
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
          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
