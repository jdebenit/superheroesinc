import React, { useMemo } from 'react';
import { WizardSection } from '../../../shared/WizardSection';
import { FormSelect } from '../../../shared/FormSelect';
import { CostBadge } from '../../../shared/CostBadge';
import { SectionHeaderBadge } from '../../../shared/SectionHeaderBadge';

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
    const handleMagnitudeChange = (value: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                magnitude: value || null
            }
        });
    };

    const handleSourceChange = (value: string) => {
        onChange({
            malditoParams: {
                ...malditoParams,
                source: value || null
            }
        });
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
        <WizardSection
            title="Opciones de Origen: Maldito"
            color="#c2410c"
            rightContent={
                <SectionHeaderBadge
                    cost={(totalCost || 0) > 0 ? `+${totalCost}` : (totalCost || 0)}
                    label="PC"
                    variant={!(totalCost) ? "free" : (totalCost > 0 ? "penalty" : "bonus")}
                />
            }
        >
            <div className="wizard-flex-column wizard-gap-lg">
                <FormSelect
                    label="Magnitud de la maldición"
                    value={malditoParams?.magnitude || ''}
                    onChange={handleMagnitudeChange}
                    options={MALDITO_MAGNITUDE}
                    placeholder="Selecciona la magnitud..."
                    labelColor="#c2410c"
                />


                <FormSelect
                    label="Origen de la maldición"
                    value={malditoParams?.source || ''}
                    onChange={handleSourceChange}
                    options={MALDITO_SOURCE.map(s => ({ ...s, cost: 0 }))}
                    placeholder="Selecciona el origen..."
                    labelColor="#c2410c"
                    showCostInOption={false}
                />
            </div>
        </WizardSection>
    );
}


