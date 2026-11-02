import React from 'react';
import { ALTERADO_DATA } from '../../../data/originOptions';
import { SheetSection } from '../common/SheetSection';
import { DetailRow } from '../common/DetailRow';
import { SequelsList } from '../common/SequelsList';

interface AlteradoSectionProps {
    character: any;
}

export const AlteradoSection: React.FC<AlteradoSectionProps> = ({ character }) => {
    if (!character.alteradoParams || (!character.alteradoParams.agent && (!character.alteradoParams.sequels || character.alteradoParams.sequels.length === 0))) return null;

    return (
        <SheetSection title="Alterado" className="alterado-params">
            <ul className="clean-list">
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

                <SequelsList sequels={character.alteradoParams.sequels} variant="alterado" />
            </ul>
        </SheetSection>
    );
};
