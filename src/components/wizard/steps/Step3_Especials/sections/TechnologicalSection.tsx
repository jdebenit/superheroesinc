import React, { useMemo } from 'react';
import { INCOME_SOURCES } from '../../../../../data/technologicalOptions';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';

interface TechnologicalSectionProps {
    techParams: { incomeSource: string } | null;
    onChange: (params: { incomeSource: string }) => void;
}

export default function TechnologicalSection({ techParams, onChange }: TechnologicalSectionProps) {
    const selectedId = techParams?.incomeSource || '';

    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ incomeSource: e.target.value });
    };

    const selectedSource = useMemo(() =>
        INCOME_SOURCES.find(s => s.id === selectedId),
        [selectedId]);

    return (
        <OriginOptionsContainer
            title="Tecnológico"
            cost={selectedSource?.pc || 0}
            themeColor="cyan"
            description="Selecciona cómo financia el personaje su tecnología. Esto afecta al coste en Puntos de Creación."
        >
            {/* SOURCE SELECTOR */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#0369a1', // Sky 700
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase'
                }}>
                    Fuente de Ingresos
                </label>
                <select
                    value={selectedId}
                    onChange={handleSourceChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '2px solid #0ea5e9', // Sky 500
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">-- Selecciona una fuente --</option>
                    {INCOME_SOURCES.map(src => (
                        <option key={src.id} value={src.id}>
                            {src.label} (+{src.pc} PC)
                        </option>
                    ))}
                </select>
                {selectedSource && (
                    <p style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#e0f2fe', // Sky 100
                        borderRadius: '6px',
                        borderLeft: '4px solid #0284c7',
                        color: '#0c4a6e',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Descripción:</strong> {selectedSource.description}
                    </p>
                )}
            </div>
        </OriginOptionsContainer>
    );
}
