import React from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../../../data/cyborgImplantConfigs';
import { CostBadge } from '../../../shared/CostBadge';
import { DeleteRowButton } from '../../../shared/DeleteRowButton';

interface CyborgImplantRowProps {
    implant: CyborgImplant;
    index: number;
    onRemove: (id: string) => void;
}

export default function CyborgImplantRow({ implant, index, onRemove }: CyborgImplantRowProps) {
    const stat = CYBORG_IMPLANT_STATS.find(s => s.id === implant.statConfigId);
    const str = CYBORG_IMPLANT_STRENGTHS.find(s => s.id === implant.strengthConfigId);
    const cost = (stat?.pcCost || 0) + (str?.pcCost || 0);
    const isEven = index % 2 === 0;

    return (
        <tr className={`cyborg-implant-row ${isEven ? 'even' : ''}`}>
            <td className="cyborg-implant-cell name-cell">
                {implant.name}
            </td>
            <td className="cyborg-implant-cell">
                {stat && (
                    <div className="cyborg-implant-config">
                        <span className="cyborg-implant-pv">PV +{stat.pvBonus}</span>
                        <span className="cyborg-implant-da">DA {stat.daFisico}</span>
                    </div>
                )}
            </td>
            <td className="cyborg-implant-cell">
                {str && (
                    <div className="cyborg-implant-config">
                        <span className="cyborg-implant-fue">FUE {str.fuerza}</span>
                        {str.pcCost === 0 && <span className="cyborg-implant-muted">(Base)</span>}
                    </div>
                )}
            </td>
            <td className="cyborg-implant-cell">
                <CostBadge cost={cost} label="PC" />
            </td>
            <td className="cyborg-implant-cell">
                <DeleteRowButton onDelete={() => onRemove(implant.id)} title="Eliminar implante" />
            </td>
        </tr>
    );
}
