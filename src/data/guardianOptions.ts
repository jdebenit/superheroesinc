export interface GuardianQuality {
    id: string;
    label: string;
    description: string;
    cost: number;
}

export interface GuardianOptionItem {
    id: string;
    label: string;
}

export const GUARDIAN_QUALITIES: readonly GuardianQuality[] = [
    {
        id: 'object_has_powers',
        label: 'Los poderes los tiene el objeto',
        description: 'Requiere tiradas de habilidad para usar los poderes. El % inicial es igual a la Voluntad.',
        cost: -2
    },
    {
        id: 'object_grants_powers',
        label: 'El objeto proporciona los poderes',
        description: 'Debe estar en contacto continuo. Control basado en características del PJ.',
        cost: 0
    },
    {
        id: 'object_bonded',
        label: 'Objeto unido al personaje',
        description: 'No puede ser robado. Control basado en características del PJ.',
        cost: 2
    }
] as const;

export const GUARDIAN_OBJECTS: readonly GuardianOptionItem[] = [
    { id: 'ring', label: 'Anillo' },
    { id: 'weapon', label: 'Arma' },
    { id: 'armor', label: 'Armadura' },
    { id: 'clothing', label: 'Prenda de vestir' },
    { id: 'pendant', label: 'Colgante' },
    { id: 'statuette', label: 'Estatuilla' },
    { id: 'gem', label: 'Gema o joya' },
    { id: 'instrument', label: 'Instrumento musical' },
    { id: 'otro', label: 'Otro' }
] as const;

export const GUARDIAN_FEATURES: readonly GuardianOptionItem[] = [
    { id: 'glowing', label: 'Brilla con luz propia al activarse' },
    { id: 'color_shift', label: 'Cambia de color o se vuelve traslúcido' },
    { id: 'energy_swirl', label: 'Energías se arremolinan en torno al objeto' },
    { id: 'made_of_energy', label: 'El objeto parece hecho de energía' },
    { id: 'alien_shape', label: 'Forma extraña, casi alienígena' },
    { id: 'unknown_material', label: 'Material desconocido' },
    { id: 'inscriptions', label: 'Tiene inscripciones, runas o glifos' },
    { id: 'sound', label: 'Emite un sonido característico' },
    { id: 'autonomous_movement', label: 'Tiene movimiento autónomo' },
    { id: 'abnormal_weight', label: 'Tiene un peso anormal' }
] as const;

export const GUARDIAN_TRANSFORMATIONS: readonly GuardianOptionItem[] = [
    { id: 'no_change_persists', label: 'Sin cambios físicos, persiste personalidad' },
    { id: 'no_change_psyche', label: 'Sin cambios físicos, cambia la psique' },
    { id: 'transform_contact', label: 'Transformación física al contacto' },
    { id: 'transform_permanent', label: 'Transformación física permanente' },
    { id: 'transform_psyche_contact', label: 'Transformación física/psique al contacto' },
    { id: 'transform_psyche_permanent', label: 'Transformación física/psique permanente' }
] as const;

export type GuardianQualityId = typeof GUARDIAN_QUALITIES[number]['id'];
export type GuardianObjectId = typeof GUARDIAN_OBJECTS[number]['id'];
