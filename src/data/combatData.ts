
export const SITUATIONS = [
    { id: 'normal', label: 'Normal / Frontal', mod: 0, parry: 'normal' },
    { id: 'inconsciente', label: 'Defensor inconsciente', mod: 0, parry: 'none', note: 'Solo falla con pifia' },
    { id: 'aturdido', label: 'Defensor aturdido', mod: 50, parry: 'half' },
    { id: 'espaldas', label: 'Defensor de espaldas', mod: 70, parry: 'normal' },
    { id: 'costado', label: 'Defensor de costado', mod: 30, parry: 'normal' },
    { id: 'desequilibrado', label: 'Defensor desequilibrado', mod: 20, parry: 'normal' },
    { id: 'debajo', label: 'Defensor por debajo', mod: 15, parry: 'normal' },
    { id: 'inmovilizado', label: 'Defensor inmovilizado', mod: 0, parry: 'none', note: 'Solo falla con pifia' },
];

export const COVERAGES = [
    { id: 'ninguna', label: 'Ninguna', mod: 0 },
    { id: 'ligera', label: 'Ligera', mod: -25 },
    { id: 'media', label: 'Media', mod: -50 },
    { id: 'alta', label: 'Alta', mod: -75 },
    { id: 'completa', label: 'Completa', mod: -100 },
];

export const DISTANCE_SITUATIONS = [
    { id: 'normal', label: 'Normal', mod: 0 },
    { id: 'atacante_mov', label: 'Atacante en movimiento', mod: -15 },
    { id: 'objetivo_mov', label: 'Objetivo en movimiento', mod: -15 },
    { id: 'objetivo_pared', label: 'Objetivo pegado a pared', mod: -10 },
    { id: 'objetivo_suelo', label: 'Objetivo tumbado', mod: -10 },
    { id: 'noche', label: 'Noche', mod: -20 },
];

export const RANGES = [
    { id: 'media', label: 'Distancia Media (DM)', mod: 0 },
    { id: 'quemarropa', label: 'Quemarropa (Q)', mod: 40 },
    { id: 'corta', label: 'Distancia Corta (DC)', mod: 15 },
    { id: 'larga', label: 'Distancia Larga (DL)', mod: -30 },
];

// --- Hit Locations for Distance Combat ---
export const HIT_LOCATIONS: { [key: number]: { location: string, effect: string } } = {
    1: { location: 'Pierna/pie derecho', effect: 'Tirada de Constitución/2 para no desequilibrarse.' },
    2: { location: 'Pierna/pie izquierdo', effect: 'Tirada de Constitución/2 para no desequilibrarse.' },
    3: { location: 'Muslo derecho', effect: 'Tirada de Constitución para no desequilibrarse.' },
    4: { location: 'Muslo derecho', effect: 'Tirada de Constitución para no desequilibrarse.' },
    5: { location: 'Muslo izquierdo', effect: 'Tirada de Constitución para no desequilibrarse.' },
    6: { location: 'Muslo izquierdo', effect: 'Tirada de Constitución para no desequilibrarse.' },
    7: { location: 'Mano/antebrazo derecho', effect: 'Tirada de Agilidad/2 para no dejar caer objetos.' },
    8: { location: 'Mano/antebrazo izquierdo', effect: 'Tirada de Agilidad/2 para no dejar caer objetos.' },
    9: { location: 'Brazo/hombro derecho', effect: 'Tirada de Agilidad para no dejar caer objetos.' },
    10: { location: 'Brazo/hombro izquierdo', effect: 'Tirada de Agilidad para no dejar caer objetos.' },
    11: { location: 'Abdomen', effect: 'Sin efecto.' },
    12: { location: 'Abdomen', effect: 'Sin efecto.' },
    13: { location: 'Abdomen', effect: 'Sin efecto.' },
    14: { location: 'Pecho', effect: 'Sin efecto.' },
    15: { location: 'Pecho', effect: 'Sin efecto.' },
    16: { location: 'Pecho', effect: 'Sin efecto.' },
    17: { location: 'Pecho', effect: 'Sin efecto.' },
    18: { location: 'Cuello', effect: 'Se doblan las posibilidades de un crítico.' },
    19: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
    20: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
};

// --- Hit Locations for Melee Combat ---
export const MELEE_HIT_LOCATIONS: { [key: number]: { location: string, effect: string } } = {
    1: { location: 'Muslo derecho', effect: 'Tirada de Constitución para no desequilibrarse.' },
    2: { location: 'Muslo derecho', effect: 'Tirada de Constitución para no desequilibrarse.' },
    3: { location: 'Muslo izquierdo', effect: 'Tirada de Constitución para no desequilibrarse.' },
    4: { location: 'Muslo izquierdo', effect: 'Tirada de Constitución para no desequilibrarse.' },
    5: { location: 'Genitales', effect: 'Posible aturdimiento.' },
    6: { location: 'Brazo/hombro derecho', effect: 'Tirada de Agilidad para no dejar caer objetos.' },
    7: { location: 'Brazo/hombro izquierdo', effect: 'Tirada de Agilidad para no dejar caer objetos.' },
    8: { location: 'Abdomen', effect: 'Sin efecto.' },
    9: { location: 'Abdomen', effect: 'Sin efecto.' },
    10: { location: 'Abdomen', effect: 'Sin efecto.' },
    11: { location: 'Abdomen', effect: 'Sin efecto.' },
    12: { location: 'Pecho', effect: 'Sin efecto.' },
    13: { location: 'Pecho', effect: 'Sin efecto.' },
    14: { location: 'Pecho', effect: 'Sin efecto.' },
    15: { location: 'Pecho', effect: 'Sin efecto.' },
    16: { location: 'Cuello', effect: 'Se doblan las posibilidades de un crítico.' },
    17: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
    18: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
    19: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
    20: { location: 'Cabeza', effect: 'Posible aturdimiento o inconsciencia.' },
};

export const DIFFICULTIES = [
    { value: -100, label: 'Imposible (-100)' },
    { value: -75, label: 'Extrema (-75)' },
    { value: -50, label: 'Difícil (-50)' },
    { value: -25, label: 'Poca (-25)' },
    { value: 0, label: 'Normal (0)' },
    { value: 15, label: 'Fácil (+15)' },
    { value: 30, label: 'Bastante (+30)' },
    { value: 50, label: 'Muy fácil (+50)' },
];
