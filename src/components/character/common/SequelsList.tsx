import React from 'react';
import { SEQUELS } from '../../../data/sequels';

export interface SequelEntry {
    id: string;
    description?: string;
}

interface SequelsListProps {
    sequels: SequelEntry[];
    variant: 'alterado' | 'mutante';
}

export const SequelsList: React.FC<SequelsListProps> = ({ sequels, variant }) => {
    if (!sequels || sequels.length === 0) return null;

    return (
        <li className="sequels-container">
            <span className={`sequels-header ${variant}`}>Secuelas</span>
            <ul className={`sequels-list ${variant}`}>
                {sequels.map((s, idx) => {
                    const def = SEQUELS.find(d => d.id === s.id);
                    if (!def) return null;
                    return (
                        <li key={idx} className="sequel-item">
                            <div className="sequel-name">
                                {def.label} <span className={`sequel-cost ${variant}`}>(-{def.cost} PC)</span>
                            </div>
                            <div className="sequel-description">
                                {s.description ? (
                                    <>
                                        <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '0.25rem' }}>
                                            {s.description}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                            ({def.description})
                                        </span>
                                    </>
                                ) : (
                                    def.description
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </li>
    );
};
