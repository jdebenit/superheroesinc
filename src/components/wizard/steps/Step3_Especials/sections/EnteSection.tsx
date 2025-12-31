import React, { useMemo } from 'react';

export const ENTE_FORMS = [
    { id: 'humanoid', label: 'Humanoide', cost: 1, description: 'Aspecto humanoide en el plano' },
    { id: 'animal_major', label: 'Animal mayor', cost: 0, description: 'Oso, ciervo, toro...' },
    { id: 'animal_minor', label: 'Animal menor', cost: -1, description: 'Perro, gato, zorro...' }
];

export const ENTE_EFFECTS = [
    { id: 'hidden', label: 'Fácil ocultación', cost: 2, description: 'Ojos con brillo, mechones de pelo de otro color...' },
    { id: 'evident', label: 'Más evidentes', cost: 1, description: 'Cola, cuernos, pelaje de otro color llamativo...' },
    { id: 'obvious', label: 'Difíciles de ocultar', cost: 0, description: 'Emite vapor, alas, múltiples apéndices, aura brillante...' }
];

interface EnteSectionProps {
    enteParams: {
        formType: string | null;
        visualEffect: string | null;
    };
    onChange: (updates: any) => void;
}

export default function EnteSection({ enteParams, onChange }: EnteSectionProps) {
    const handleFormChange = (formId: string) => {
        onChange({
            enteParams: {
                ...enteParams,
                formType: formId
            }
        });
    };

    const handleEffectChange = (effectId: string) => {
        onChange({
            enteParams: {
                ...enteParams,
                visualEffect: effectId
            }
        });
    };

    const getCostLabel = (cost: number) => {
        if (cost > 0) return `+ ${cost} PC`;
        if (cost < 0) return `${cost} PC`;
        return '+0 PC';
    };

    const totalCost = useMemo(() => {
        let total = 0;
        if (enteParams.formType) {
            const form = ENTE_FORMS.find(f => f.id === enteParams.formType);
            if (form) total += form.cost;
        }
        if (enteParams.visualEffect) {
            const effect = ENTE_EFFECTS.find(e => e.id === enteParams.visualEffect);
            if (effect) total += effect.cost;
        }
        return total;
    }, [enteParams]);

    return (
        <div style={{
            backgroundColor: '#faf5ff', // purple-50
            border: '2px solid #6b21a8', // purple-800
            borderRadius: '0.75rem',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>Opciones de Origen: Ente</h3>
                <div style={{
                    backgroundColor: '#7e22ce',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {totalCost > 0 ? '+' : ''}{totalCost} PC
                </div>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Form Type Selection */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#7e22ce', // purple-700
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        Tipo de forma en el plano
                    </label>
                    <select
                        value={enteParams?.formType || ""}
                        onChange={(e) => handleFormChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #a855f7', // purple-500
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#7e22ce', // purple-700
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Selecciona una forma...</option>
                        {ENTE_FORMS.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label} ({option.description}) → {getCostLabel(option.cost)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Visual Effect Selection */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#7e22ce', // purple-700
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        Efectos en la forma adoptada
                    </label>
                    <select
                        value={enteParams?.visualEffect || ""}
                        onChange={(e) => handleEffectChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #a855f7', // purple-500
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#7e22ce', // purple-700
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Selecciona un efecto visual...</option>
                        {ENTE_EFFECTS.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label} ({option.description}) → {getCostLabel(option.cost)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
