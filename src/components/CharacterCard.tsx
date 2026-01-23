import React from 'react';

interface CharacterCardProps {
    slug: string;
    data: {
        name: string;
        alias?: string;
        description: string;
        image?: string;
        source?: string;
    };
}

const CharacterCard: React.FC<CharacterCardProps> = ({ slug, data }) => {
    return (
        <a href={`/personajes/${slug}`} className="character-card">
            <div className="card-inner">
                <div className="card-front">
                    {data.image ? (
                        <img
                            src={data.image}
                            alt={data.alias || data.name}
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
                        {data.alias || data.name}
                    </h2>
                </div>
                <div className="card-back">
                    <h3>{data.name}</h3>
                    <p className="char-desc">
                        {data.description.slice(0, 150)}
                        {data.description.length > 150 ? "..." : ""}
                    </p>

                    {data.source && (
                        <p className="char-source">{data.source}</p>
                    )}
                </div>
            </div>
            <style>{`
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
            `}</style>
        </a>
    );
};

export default CharacterCard;
