import React, { useMemo } from 'react';
import SequelsSelector from './shared/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';

interface SelectedSequel {
    id: string;
}

export interface MutanteParams {
    sequels: SelectedSequel[];
}

interface MutanteSectionProps {
    mutanteParams: MutanteParams;
    onChange: (updates: any) => void;
}

export default function MutanteSection({ mutanteParams, onChange }: MutanteSectionProps) {
    const { sequels = [] } = mutanteParams;

    const handleSequelsChange = (newSequels: SelectedSequel[]) => {
        onChange({
            mutanteParams: {
                ...mutanteParams,
                sequels: newSequels
            }
        });
    };

    const totalDiscount = useMemo(() => {
        let total = 0;
        sequels.forEach(s => {
            const def = SEQUELS.find(d => d.id === s.id);
            if (def) total += def.cost;
        });
        return total;
    }, [sequels]);

    return (
        <div style={{
            backgroundColor: '#fdf4ff', // Light purple for mutants
            border: '2px solid #c026d3', // Purple border
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e879f9'
            }}>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#86198f'
                }}>Opciones de Origen: Mutante</h3>

                <div style={{
                    backgroundColor: '#c026d3',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {totalDiscount > 0 ? `-${totalDiscount} PC` : '0 PC'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    Como mutante, tu cuerpo ha sufrido alteraciones que pueden conllevar secuelas físicas o mentales.
                    Puedes seleccionar secuelas opcionales para obtener puntos de creación extra.
                </p>

                {/* SEQUELS SELECTOR */}
                <SequelsSelector
                    selectedSequels={sequels}
                    onChange={handleSequelsChange}
                    showWarning={false} // Optional for mutants, no penalty
                />
            </div>
        </div>
    );
}
