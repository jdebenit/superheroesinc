import React from 'react';
import {
    CYBORG_IMPLANT_STATS,
    CYBORG_IMPLANT_STRENGTHS,
    type CyborgImplant
} from '../../../../../data/cyborgImplantConfigs';
import { CostBadge } from '../../../shared/CostBadge';

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
                <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid #e0e7ff',
                    display: 'inline-block'
                }}>
                    {cost} PC
                </span>
            </td>
            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                    onClick={() => onRemove(implant.id)}
                    style={{
                        color: '#ef4444',
                        padding: '8px',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Eliminar implante"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </td>
        </tr>
    );
}
