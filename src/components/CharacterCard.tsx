import React from 'react';
import './CharacterCard.css';

interface CharacterCardProps {
    slug: string;
    data: {
        name: string;
        alias?: string;
        description: string;
        image?: string;
        source?: string;
        rpgId?: string;
    };
}

const CharacterCard: React.FC<CharacterCardProps> = ({ slug, data }) => {
    return (
        <a href={`/personajes/${slug}`} className="character-card">
            <div className="card-inner">
                <div className="card-front">
                    {data.rpgId && (
                        <div className="rpg-badge" title="Ficha RPG disponible">
                            🎲 FICHA
                        </div>
                    )}
                    {data.image ? (
                        <img
                            src={data.image}
                            alt={data.alias || data.name}
                            className="char-image"
                            width={400}
                            height={340}
                            loading="lazy"
                            decoding="async"
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
        </a>
    );
};

export default CharacterCard;
