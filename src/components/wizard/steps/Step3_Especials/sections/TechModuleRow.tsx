import React from 'react';
import type { TechModule } from '../types';
import { TECH_MODULES } from '../../../../../data/techModules';
import { CostBadge } from '../../../shared/ui/CostBadge';
import { DeleteRowButton } from '../../../shared/ui/DeleteRowButton';

interface TechModuleRowProps {
    module: TechModule;
    index: number;
    onUpdateLocation: (id: string, location: string) => void;
    onUpdateCost: (id: string, cost: number) => void;
    onRemove: (id: string) => void;
}

export default function TechModuleRow({
    module,
    index,
    onUpdateLocation,
    onUpdateCost,
    onRemove
}: TechModuleRowProps) {
    const definition = TECH_MODULES.find(d => d.id === module.definitionId);
    const type = definition?.type || 'General';
    const isInternal = type === 'Mejora Interna';
    const isVariable = module.definitionId === 'equipacion_combate' || module.definitionId === 'prototipo_alta_tecnologia';
    const isEven = index % 2 === 0;

    return (
        <tr className={`tech-module-row ${isEven ? 'even' : ''}`}>
            {/* Módulo */}
            <td className="tech-module-cell name-cell">
                {module.name}
            </td>

            {/* Tipo */}
            <td className="tech-module-cell nowrap">
                <span className={`type-tag ${isInternal ? 'type-tag-internal' : 'type-tag-external'}`}>
                    {type}
                </span>
            </td>

            {/* Localización */}
            <td className="tech-module-cell">
                <input
                    type="text"
                    value={module.location}
                    onChange={(e) => onUpdateLocation(module.id, e.target.value)}
                    placeholder="Ubicación"
                    className="tech-module-input"
                />
            </td>

            {/* Coste */}
            <td className="tech-module-cell nowrap">
                {isVariable ? (
                    <div className="tech-module-cost-wrapper">
                        <input
                            type="number"
                            min="0"
                            value={module.pcCost}
                            onChange={(e) => onUpdateCost(module.id, parseInt(e.target.value) || 0)}
                            className="tech-module-cost-input"
                        />
                        <span className="tech-module-cost-label">PC</span>
                    </div>
                ) : (
                    <CostBadge cost={module.pcCost} label="PC" />
                )}
            </td>

            {/* Acciones */}
            <td className="tech-module-cell">
                <DeleteRowButton onDelete={() => onRemove(module.id)} title="Desinstalar módulo" />
            </td>
        </tr>
    );
}

