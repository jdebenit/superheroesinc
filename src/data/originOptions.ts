import { SEQUELS } from './sequels';

// ── ENTE (Sobrenatural) ─────────────────────────────────────────────────────
export interface OriginOptionItem {
    id: string;
    label: string;
    cost: number;
    description?: string;
}

export const ENTE_FORMS: readonly OriginOptionItem[] = [
    { id: 'humanoid', label: 'Humanoide', cost: 1, description: 'Aspecto humanoide en el plano' },
    { id: 'animal_major', label: 'Animal mayor', cost: 0, description: 'Oso, ciervo, toro...' },
    { id: 'animal_minor', label: 'Animal menor', cost: -1, description: 'Perro, gato, zorro...' }
];

export const ENTE_EFFECTS: readonly OriginOptionItem[] = [
    { id: 'hidden', label: 'Fácil ocultación', cost: 2, description: 'Ojos con brillo, mechones de pelo de otro color...' },
    { id: 'evident', label: 'Más evidentes', cost: 1, description: 'Cola, cuernos, pelaje de otro color llamativo...' },
    { id: 'obvious', label: 'Difíciles de ocultar', cost: 0, description: 'Emite vapor, alas, múltiples apéndices, aura brillante...' }
];

// ── POSEÍDO (Sobrenatural) ──────────────────────────────────────────────────
export const POSEIDO_FORMS: readonly OriginOptionItem[] = [
    { id: 'humano', label: 'Humano', cost: 3, description: 'Apariencia completamente humana.' },
    { id: 'cambia_forma', label: 'Cambia de forma', cost: 0, description: 'Puede alternar entre forma humana y otra forma.' },
    { id: 'no_humana', label: 'Forma no humana', cost: -3, description: 'Apariencia monstruosa o extraña permanentemente. (Descuento de 3 PC)' },
];

// ── MALDITO (Sobrenatural) ──────────────────────────────────────────────────
export const MALDITO_MAGNITUDE: readonly OriginOptionItem[] = [
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

export const MALDITO_SOURCE: readonly { id: string; label: string; description: string }[] = [
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

// ── ALTERADO ────────────────────────────────────────────────────────────────
export const ALTERADO_AGENTS: readonly { id: string; label: string; cost: number }[] = [
    { id: 'nuclear', label: 'Energía nuclear', cost: 0 },
    { id: 'electromagnetic', label: 'Accidente con energía electromagnética', cost: 0 },
    { id: 'space_energy', label: 'Energía espacial desconocida', cost: 0 },
    { id: 'other_energy', label: 'Otras energías', cost: 0 },
    { id: 'radiation', label: 'Radiación diversa', cost: 0 },
    { id: 'biological', label: 'Agente biológico', cost: 0 },
    { id: 'mutagen', label: 'Agente mutágeno', cost: 0 },
    { id: 'chemical', label: 'Sustancia química', cost: 0 },
    { id: 'treatment', label: 'Tratamiento', cost: 2 },
    { id: 'other', label: 'Otro (a determinar con el Guionista)', cost: 0 },
];

export const ALTERADO_SEQUELS = SEQUELS;

export const ALTERADO_DATA = {
    AGENTS: ALTERADO_AGENTS,
    SEQUELS: ALTERADO_SEQUELS
};

// ── LIBERADO (Sobrenatural) ─────────────────────────────────────────────────
export interface LiberadoConfig {
    name: string;
    entityName: string;
    sendaName: string;
    characteristics: Array<{ id: string; name: string }>;
}

export const LIBERADO_CONFIGS: Record<string, LiberadoConfig> = {
    'Liberado de Entropía': {
        name: 'Liberado de Entropía',
        entityName: 'Entropía',
        sendaName: 'Senda de Entropía',
        characteristics: [
            { id: 'fuerza', name: 'Fuerza (FUE)' },
            { id: 'constitucion', name: 'Constitución (CON)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    },
    'Liberado de Unidad': {
        name: 'Liberado de Unidad',
        entityName: 'Unidad',
        sendaName: 'Senda de Unidad',
        characteristics: [
            { id: 'agilidad', name: 'Agilidad (AGI)' },
            { id: 'apariencia', name: 'Apariencia (APA)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    },
    'Liberado de Equidad': {
        name: 'Liberado de Equidad',
        entityName: 'Equidad',
        sendaName: 'Senda de Equidad',
        characteristics: [
            { id: 'inteligencia', name: 'Inteligencia (INT)' },
            { id: 'percepcion', name: 'Percepción (PER)' },
            { id: 'voluntad', name: 'Voluntad (VOL)' }
        ]
    }
};

export const LIBERADO_DONES_COST: Record<string, number> = {
    'conocimiento_esferas': 1,
    'comprension_senda': 2,
    'maestro_senda': 3
};

export function getLiberadoConfig(subtype?: string): LiberadoConfig {
    if (subtype && LIBERADO_CONFIGS[subtype]) {
        return LIBERADO_CONFIGS[subtype];
    }
    return LIBERADO_CONFIGS['Liberado de Entropía'];
}

export const getLiberadoDones = (config: LiberadoConfig) => [
    {
        id: 'conocimiento_esferas',
        name: 'Conocimiento de las esferas',
        cost: LIBERADO_DONES_COST['conocimiento_esferas'],
        description: 'Acceso a la magia sin necesidad de los requisitos habituales. Cada PC invertido en magia otorga 10 EM.'
    },
    {
        id: 'comprension_senda',
        name: 'Comprensión de la senda',
        cost: LIBERADO_DONES_COST['comprension_senda'],
        description: 'Permite superar el límite en una segunda característica de su senda (+30, hasta 130) o superar el límite sin restricciones en la elegida (hasta 200).'
    },
    {
        id: 'maestro_senda',
        name: 'Maestro de la senda',
        cost: LIBERADO_DONES_COST['maestro_senda'],
        description: `Conexión directa con ${config.entityName} cósmica: puede formular una pregunta diaria a ${config.entityName} para discernir verdades universales.`
    }
];

export const LIBERADO_DONES = getLiberadoDones(LIBERADO_CONFIGS['Liberado de Entropía']);
