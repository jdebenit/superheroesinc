import React from 'react';

interface ComicCardProps {
    title: string;
    excerpt: string;
    date: string;
    image?: string;
    link: string;
}

const ComicCard: React.FC<ComicCardProps> = ({ title, excerpt, date, image, link }) => {
    return (
        <a href={link} className="block group h-full" style={{ textDecoration: 'none' }}>
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
                    <div className="flex justify-between items-center mb-4 border-b border-dashed border-gray-300 pb-2 w-full">
                        <time className="text-xs font-mono text-gray-500 uppercase whitespace-nowrap">FECHA: {date}</time>
                    </div>

                    {/* Classified Stamp */}
                    <div className="absolute top-0 right-0 transform rotate-12 border-2 border-red-700 text-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest opacity-80 pointer-events-none mix-blend-multiply" style={{ fontFamily: 'var(--font-display)' }}>
                        CLASIFICADO
                    </div>

                    <h3 className="text-xl font-bold mb-3 leading-tight text-secondary group-hover:text-primary transition-colors uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                        {title}
                    </h3>

                    <p className="text-sm text-gray-700 flex-grow leading-relaxed font-mono mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                        {excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-end text-secondary font-bold text-xs uppercase tracking-wide border-t border-secondary pt-2">
                        <span className="group-hover:underline">VER EXPEDIENTE</span>
                        <span className="ml-1">→</span>
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
