import React from 'react';
import { ALTERADO_DATA } from '../../../components/wizard/steps/Step3_Especials/sections/AlteradoSection';
import { SEQUELS } from '../../../data/sequels';

interface AlteradoSectionProps {
    character: any;
}

export const AlteradoSection: React.FC<AlteradoSectionProps> = ({ character }) => {
    if (!character.alteradoParams || (!character.alteradoParams.agent && (!character.alteradoParams.sequels || character.alteradoParams.sequels.length === 0))) return null;

    return (
        <div className="sheet-section alterado-params">
            <div className="section-header">
                <h4>Alterado</h4>
            </div>
            <ul className="clean-list">
                {/* Agent */}
                {character.alteradoParams.agent && (() => {
                    const agent = ALTERADO_DATA.AGENTS.find(a => a.id === character.alteradoParams.agent);
                    return agent && (
                        <li className="no-bullet-item mb-3">
                            <div className="flex-row-baseline">
                                <span className="agent-label">Agente del Cambio</span>
                                <span className="flex-spacer-dotted"></span>
                                <span className="value-highlight-brown">
                                    {agent.label} {agent.cost > 0 && <span className="agent-cost">(-{agent.cost} PC)</span>}
                                </span>
                            </div>
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
                                            {def.description}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                )}
            </ul>
        </div>
    );
};
