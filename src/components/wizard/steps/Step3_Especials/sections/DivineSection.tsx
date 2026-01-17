import React, { useMemo } from 'react';
import { DIVINE_FOCUS_OPTIONS } from '../../../../../data/divineOptions';
import { OriginOptionsContainer } from '../../../shared/OriginOptionsContainer';

export interface DivineParams {
    focus: string | null;
}

interface DivineSectionProps {
    divineParams: DivineParams;
    onChange: (updates: any) => void;
}

export default function DivineSection({ divineParams, onChange }: DivineSectionProps) {
    const { focus } = divineParams;

    const handleFocusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({
            divineParams: {
                ...divineParams,
                focus: e.target.value || null
            }
        });
    };

    const selectedFocus = useMemo(() =>
        DIVINE_FOCUS_OPTIONS.find(f => f.id === focus),
        [focus]);

    return (
        <OriginOptionsContainer
            title="Opciones de Origen: Divino"
            cost={selectedFocus?.cost || 0}
            themeColor="amber"
            description="Como entidad divina, debes determinar si tu poder requiere un foco para manifestarse o alcanzar su máximo potencial."
        >
            {/* FOCUS SELECTOR */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#b45309',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase'
                }}>
                    Foco del Poder
                </label>
                <select
                    value={focus || ''}
                    onChange={handleFocusChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '2px solid #f59e0b',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">-- Selecciona una opción --</option>
                    {DIVINE_FOCUS_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>
                            {opt.label} ({opt.cost > 0 ? `+${opt.cost}` : '0'} PC)
                        </option>
                    ))}
                </select>
                {selectedFocus && (
                    <p style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        backgroundColor: '#fff7ed',
                        borderRadius: '6px',
                        borderLeft: '4px solid #f97316',
                        color: '#9a3412',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Efecto:</strong> {selectedFocus.description}
                    </p>
                )}
            </div>
        </OriginOptionsContainer>
    );
}

