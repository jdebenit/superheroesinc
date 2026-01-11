import React from 'react';
import { TECH_MODULES } from '../../../data/techModules';

interface TechModulesSectionProps {
    techModules: any[];
}

export const TechModulesSection: React.FC<TechModulesSectionProps> = ({ techModules }) => {
    if (!techModules || techModules.length === 0) return null;

    return (
        <div className="sheet-section tech-modules">
            <div className="section-header">
                <h4>Módulos Tecnológicos</h4>
                {/* Calculate total cost just for display if needed, though usually included in global total */}
                <span className="cost">
                    ({techModules.reduce((acc: number, m: any) => acc + (m.pcCost || 0), 0)} PCs)
                </span>
            </div>
            <ul className="clean-list">
                {techModules.map((module: any, idx: number) => {
                    const definition = TECH_MODULES.find(d => d.id === module.definitionId);
                    const type = definition?.type || 'General';

                    return (
                        <li key={`${module.id}-${idx}`} className="tech-module-item">
                            <div className="tech-module-row">
                                <span className="tech-module-name">{module.name}</span>

                                <span className={`tech-type-tag ${type === 'Mejora Interna' ? 'tech-type-internal' : 'tech-type-external'}`}>
                                    {type}
                                </span>

                                <div style={{ flexGrow: 1 }}></div>

                                {module.location && (
                                    <span className="tech-location">
                                        {module.location}
                                    </span>
                                )}

                                <span className="tech-cost">
                                    {module.pcCost} PC
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
