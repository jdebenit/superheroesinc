import React, { useMemo } from 'react';

interface MalditoParams {
    magnitude: string | null;
    source: string | null;
}

interface MalditoSectionProps {
    malditoParams: MalditoParams;
    onChange: (updates: any) => void;
}

const MALDITO_MAGNITUDE = [
    { id: 'use_power', label: 'Consecuencias al usar poder', description: 'Cada vez que usa su poder alguien sufre al completo las consecuencias de este. Ejemplo: teletransporta a otro al azar.', cost: 0 },
    { id: 'own_consequences', label: 'Sufre consecuencias propias', description: 'Puede sufrir las consecuencias de su propio poder. Ejemplo: si domina a alguien, cualquiera puede ordenarle a él.', cost: 0 },
    { id: 'hard_to_hide', label: 'Difíciles de ocultar', description: 'Emite vapor, alas, múltiples apéndices, tiene un aura brillante, etc.', cost: 2 },
    { id: 'uncontrolable', label: 'Control inestable', description: 'No puede controlar sus poderes en ciertas condiciones. Ejemplo: cuando ve sangre, siempre es invisible, etc.', cost: 2 },
    { id: 'daily_condition', label: 'Condición diaria (EQM)', description: 'Debe cumplir una condición diaria para no perder EQM por hora. Ejemplo: dormir en terreno consagrado.', cost: 3 },
    { id: 'weekly_need', label: 'Necesidad semanal', description: 'La necesidad o la condición debe ser cubierta cada semana.', cost: 3 },
    { id: 'noticeable', label: 'No pasa desapercibido', description: 'Por apariencia física o incomodidad a otros (fuerte olor, color verde).', cost: 4 },
    { id: 'monthly_condition', label: 'Condición mensual (PVs)', description: 'Debe cumplir condición cada mes para evitar perder 1d10 PVs por día.', cost: 4 },
    { id: 'marked', label: 'Marca reconocible', description: 'Marca visible (ojo negro, marca en pecho). Alguien con Magia/Ocultismo puede detectar que está maldito.', cost: 5 },
];

const MALDITO_SOURCE = [
    { id: 'family_burden', label: 'Carga familiar', description: 'Su familia siempre ha sido portadora de la maldición.' },
    { id: 'arcane_curse', label: 'Hechizo Arcano', description: 'Un arcano lanzó un hechizo con rango de Maestría en "Maldecir" sobre él.' },
    { id: 'contagion', label: 'Contagio', description: 'Otro maldito le contagió la maldición.' },
    { id: 'deceived', label: 'Engañado', description: 'Fue engañado para portar la maldición de otro.' },
    { id: 'crime', label: 'Castigo por afrenta', description: 'Cometió una afrenta o delito muy grave y fue castigado.' },
    { id: 'magic_fail', label: 'Accidente mágico', description: 'Una Vinculación mágica o un hechizo salió mal.' },
];

export const MALDITO_DATA = {
    MAGNITUDE: MALDITO_MAGNITUDE,
    SOURCE: MALDITO_SOURCE
};

export default function MalditoSection({ malditoParams, onChange }: MalditoSectionProps) {
    const handleMagnitudeChange = (id: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                magnitude: id
            }
        });
    };

    const handleSourceChange = (id: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                source: id
            }
        });
    };

    const getCostLabel = (cost: number) => {
        if (cost > 0) return `+${cost} PC`;
        if (cost < 0) return `${cost} PC`;
        return '+0 PC';
    };

    const totalCost = useMemo(() => {
        let total = 0;
        if (malditoParams.magnitude) {
            const mag = MALDITO_MAGNITUDE.find(m => m.id === malditoParams.magnitude);
            if (mag) total += mag.cost;
        }
        return total;
    }, [malditoParams]);

    return (
        <div style={{
            backgroundColor: '#fff7ed', // orange-50
            border: '2px solid #c2410c', // orange-700
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
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>Opciones de Origen: Maldito</h3>
                <div style={{
                    backgroundColor: '#c2410c',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}>
                    {totalCost > 0 ? '+' : ''}{totalCost} PC
                </div>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Magnitude Selection */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#c2410c', // orange-700
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        Magnitud de la maldición
                    </label>
                    <select
                        value={malditoParams?.magnitude || ""}
                        onChange={(e) => handleMagnitudeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #f97316', // orange-500
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#c2410c', // orange-700
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Selecciona la magnitud...</option>
                        {MALDITO_MAGNITUDE.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label} ({option.description}) → {getCostLabel(option.cost)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Source Selection */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: '#c2410c', // orange-700
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                    }}>
                        Fuente de la maldición
                    </label>
                    <select
                        value={malditoParams?.source || ""}
                        onChange={(e) => handleSourceChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #f97316', // orange-500
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            color: '#c2410c', // orange-700
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="" disabled>Selecciona la fuente...</option>
                        {MALDITO_SOURCE.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label} ({option.description})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
