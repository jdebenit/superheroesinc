import React from 'react';
import { ALTERADO_DATA } from '../../../components/wizard/steps/Step3_Especials/sections/AlteradoSection';
import { SEQUELS } from '../../../data/sequels';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';

interface AlteradoSectionProps {
    character: any;
}

export const AlteradoSection: React.FC<AlteradoSectionProps> = ({ character }) => {
    if (!character.alteradoParams || (!character.alteradoParams.agent && (!character.alteradoParams.sequels || character.alteradoParams.sequels.length === 0))) return null;

    return (
        <SheetSection title="Alterado" className="alterado-params">
            <ul className="clean-list">
                {/* Agent */}
                {character.alteradoParams.agent && (() => {
                    const agent = ALTERADO_DATA.AGENTS.find(a => a.id === character.alteradoParams.agent);
                    return agent && (
                        <li className="no-bullet-item mb-3">
                            <DetailRow
                                label="Agente del Cambio"
                                value={
                                    <>
                                        {agent.label} {agent.cost > 0 && <span className="agent-cost">(-{agent.cost} PC)</span>}
                                    </>
                                }
                                valueClassName="value-highlight-brown"
                            />
                        </li>
                    );
                })()}

                {/* Sequels */}
                {character.alteradoParams.sequels && character.alteradoParams.sequels.length > 0 && (
                    <li className="sequels-container">
                        <span className="sequels-header alterado">Secuelas</span>
                        <ul className="sequels-list alterado">
                            {character.alteradoParams.sequels.map((s: any, idx: number) => {
                                const def = SEQUELS.find(d => d.id === s.id);
                                if (!def) return null;
                                return (
                                    <li key={idx} className="sequel-item">
                                        <div className="sequel-name">
                                            {def.label} <span className="sequel-cost alterado">(-{def.cost} PC)</span>
                                        </div>
                                        <div className="sequel-description">
                                            {s.description ? (
                                                <>
                                                    <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '0.25rem' }}>{s.description}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>({def.description})</span>
                                                </>
                                            ) : def.description}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                )}
            </ul>
        </SheetSection>
    );
};
