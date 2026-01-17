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
        <tr style={{ backgroundColor: isEven ? 'white' : '#f9fafb' }}>
            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1f2937' }}>
                {implant.name}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#4b5563' }}>
                {stat && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span className="font-bold text-blue-600">PV +{stat.pvBonus}</span>
                        <span className="text-xs text-gray-500">DA {stat.daFisico}</span>
                    </div>
                )}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#4b5563' }}>
                {str && (
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-purple-600">FUE {str.fuerza}</span>
                        {str.pcCost === 0 && <span className="text-xs text-gray-500">(Base)</span>}
                    </div>
                )}
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <CostBadge cost={cost} label="PC" />
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <DeleteRowButton onDelete={() => onRemove(implant.id)} title="Eliminar implante" />
            </td>
        </tr>
    );
}
