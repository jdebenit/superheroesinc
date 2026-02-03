import React from 'react';
import ShareButtons from './ShareButtons';

interface ComicCardProps {
    title: string;
    excerpt: string;
    date: string;
    image?: string;
    link: string;
    category?: string;
    categoryLink?: string;
}

const ComicCard: React.FC<ComicCardProps> = ({ title, excerpt, date, image, link, category, categoryLink }) => {
    return (
        <a href={link} className="block group h-full" style={{ textDecoration: 'none', backgroundColor: 'transparent' }}>
            <article className="paper-card h-full flex flex-col transition-all transform hover:-translate-y-1 hover:shadow-lg relative bg-white border border-[#d3d0c2]">
                {/* Paper clip visual */}
                <div className="absolute -top-3 left-8 w-4 h-10 border-2 border-gray-400 rounded-full z-10 bg-transparent"></div>

                {image && (
                    <div className="h-48 overflow-hidden relative border-b-2 border-secondary mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 border-2 border-white text-white px-2 py-0.5 font-bold text-xs uppercase tracking-wider bg-black/50 backdrop-blur-sm">
                            EVIDENCIA #{(Math.random() * 1000).toFixed(0)}
                        </div>
                    </div>
                )}

                <div className="flex-grow flex flex-col relative">
                    <div className="flex justify-between items-start mb-4 border-b border-dashed border-gray-300 pb-2 w-full">
                        <div className="flex flex-col w-full">
                            {category && categoryLink && (
                                <div className="w-full mb-1">
                                    <a
                                        href={categoryLink}
                                        className="inline-block bg-gray-100 border border-gray-300 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold text-gray-600 hover:bg-secondary hover:text-white hover:border-secondary transition-colors duration-300 w-fit"
                                        style={{ fontFamily: 'var(--font-mono)' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        ARCH: {category}
                                    </a>
                                </div>
                            )}
                            <div className="w-full text-right">
                                <time className="text-xs font-mono text-gray-500 uppercase whitespace-nowrap">REF: {date}</time>
                            </div>
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

                    <h3 className="text-xl font-bold mb-3 leading-tight text-secondary group-hover:text-primary transition-colors uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                        {title}
                    </h3>

                    <p className="text-sm text-gray-700 flex-grow leading-relaxed font-mono mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                        {excerpt}
                    </p>

                    <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-secondary pt-3 gap-3">
                        <ShareButtons title={title} url={link} className="origin-left" />
                        <div className="flex items-center text-secondary font-bold text-xs uppercase tracking-wide self-end sm:self-auto">
                            <span className="group-hover:underline">VER EXPEDIENTE</span>
                            <span className="ml-1">→</span>
                        </div>
                    </div>
                </div>

                {/* Stamp effect on hover */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-primary text-primary px-4 py-1 text-xl font-bold uppercase opacity-0 group-hover:opacity-20 rotate-12 transition-opacity duration-300 pointer-events-none whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                    ACCESO CONCEDIDO
                </div>
            </article>
        </a>
    );
};

export default ComicCard;
