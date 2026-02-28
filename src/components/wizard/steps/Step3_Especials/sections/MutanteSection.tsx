import React, { useMemo } from 'react';
import SequelsSelector from '../../../shared/SequelsSelector';
import { SEQUELS } from '../../../../../data/sequels';
import { getMutantType } from '../utils';
import { WizardSection } from '../../../shared/WizardSection';
import { CostBadge } from '../../../shared/CostBadge';

interface SelectedSequel {
    id: string;
    description?: string;
}

export interface MutanteParams {
    sequels: SelectedSequel[];
}

interface MutanteSectionProps {
    mutanteParams: MutanteParams;
    onChange: (updates: any) => void;
    data?: any; // Full character data to get mutant type
}

export default function MutanteSection({ mutanteParams, onChange, data }: MutanteSectionProps) {
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

    const mutantType = data ? getMutantType(data) : null;

    return (
        <WizardSection
            title={`Opciones de Origen: Mutante ${mutantType ? `(${mutantType})` : ''}`}
            description={`Como mutante ${mutantType ? `de tipo ${mutantType}` : ''}, tu cuerpo ha sufrido alteraciones que pueden conllevar secuelas físicas o mentales. Puedes seleccionar secuelas opcionales para obtener puntos de creación extra.`}
            rightContent={
                <CostBadge
                    cost={totalDiscount > 0 ? `-${totalDiscount}` : 0}
                    label="PC"
                    variant={totalDiscount === 0 ? "free" : "bonus"}
                />
            }
        >
            {mutantType && (
                <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1.5rem'
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                        <strong>💡 Selección de poderes:</strong> Puedes elegir poderes de tu tipo ({mutantType}) normalmente,
                        o poderes de otros tipos (Físico, Psíquico, Energético) gastando <strong>+2 PCs adicionales</strong> de coste base por cada poder.
                    </p>
                </div>
            )}

            {/* SEQUELS SELECTOR */}
            <SequelsSelector
                selectedSequels={sequels}
                onChange={handleSequelsChange}
                showWarning={false} // Optional for mutants, no penalty
            />
        </WizardSection>
    );
}

