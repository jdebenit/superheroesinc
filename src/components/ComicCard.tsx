import React from 'react';
import ShareButtons from './ShareButtons';
import './ComicCard.css';

interface ComicCardProps {
    title: string;
    excerpt: string;
    date: string;
    image?: string;
    link: string;
    category?: string;
    categoryLink?: string;
    readingTime?: number;
}

const getEvidenceId = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % 900;
    }
    return hash + 100;
};

const ComicCard: React.FC<ComicCardProps> = ({ title, excerpt, date, image, link, category, categoryLink, readingTime }) => {
    const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('a, button')) return;
        window.location.href = link;
    };

    return (
        <div className="comic-card-wrapper" onClick={handleCardClick}>
            <article className="paper-card comic-card-article">
                {/* Paper clip visual */}
                <div className="comic-card-clip"></div>

                {image && (
                    <div className="comic-card-image-wrap">
                        <img
                            src={image}
                            alt={title}
                            className="comic-card-image"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="comic-card-evidence">
                            EVIDENCIA #{getEvidenceId(link || title)}
                        </div>
                    </div>
                )}

                <div className="comic-card-body">
                    <div className="comic-card-meta">
                        {category && categoryLink && (
                            <div>
                                <a
                                    href={categoryLink}
                                    className="comic-card-category-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    ARCH: {category}
                                </a>
                            </div>
                        )}
                        <div className="comic-card-date-wrap">
                            <time className="comic-card-date">REF: {date}</time>
                        </div>
                    </div>

                    {/* Classified Stamp */}
                    <div className="stamp-classified" style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        fontSize: '10px',
                        padding: '2px 8px',
                        transform: 'rotate(12deg)',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}>
                        CLASIFICADO
                    </div>

                    <h3 className="comic-card-title">
                        <a href={link} className="comic-card-title-link">
                            {title}
                        </a>
                    </h3>

                    <p className="comic-card-excerpt">
                        {excerpt}
                    </p>

                    {readingTime && (
                        <div className="comic-card-reading-time">
                            ⏱️ Tiempo de lectura: <span>{readingTime} min</span>
                        </div>
                    )}

                    <div className="comic-card-footer">
                        <ShareButtons title={title} url={link} />
                        <a href={link} className="comic-card-cta">
                            <span className="comic-card-cta-text">VER EXPEDIENTE</span>
                            <span className="comic-card-cta-arrow">→</span>
                        </a>
                    </div>
                </div>

                {/* Stamp effect on hover */}
                <div className="comic-card-access-stamp">
                    ACCESO CONCEDIDO
                </div>
            </article>
        </div>
    );
};

export default ComicCard;
