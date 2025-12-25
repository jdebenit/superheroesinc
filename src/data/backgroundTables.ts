export interface BackgroundOption {
    id: string;
    label: string;
    cost: number; // Positive adds cost (user pays), negative subtracts cost (user gains points)
    description: string;
    effect?: string;
}

export const ECONOMIC_STATUS: BackgroundOption[] = [
    {
        id: 'mendigo',
        label: 'Mendigo (01-04)',
        cost: -3,
        description: 'Sin ningún tipo de ingreso regular.',
        effect: 'Mendigo'
    },
    {
        id: 'clase_baja',
        label: 'Clase baja (05-14)',
        cost: -2,
        description: 'Vive gracias a la ayuda de algún subsidio o tiene un trabajo eventual.',
        effect: 'Clase baja'
    },
    {
        id: 'clase_medio_baja',
        label: 'Clase medio-baja (15-30)',
        cost: -1,
        description: 'Tiene un trabajo que le permite ir tirando (mozo de carga, repartidor...).',
        effect: 'Clase medio-baja'
    },
    {
        id: 'clase_media',
        label: 'Clase media (31-74)',
        cost: 0,
        description: 'La mayoría de la gente (oficinistas, vendedores...).',
        effect: 'Clase media'
    },
    {
        id: 'clase_media_alta',
        label: 'Clase media-alta (75-89)',
        cost: 1,
        description: 'Ejecutivos de empresa y profesionales de vida desahogada.',
        effect: 'Clase media-alta'
    },
    {
        id: 'clase_alta',
        label: 'Clase alta (90-99)',
        cost: 2,
        description: 'Profesional mundialmente reconocido (médico, abogado, editor...).',
        effect: 'Clase alta'
    },
    {
        id: 'multimillonario',
        label: 'Multimillonario (00)',
        cost: 4,
        description: 'Dueño de una gran corporación o sólida fortuna familiar. Disponibilidad de equipo un nivel menor.',
        effect: 'Multimillonario'
    },
];

export const LEGAL_STATUS: BackgroundOption[] = [
    {
        id: 'sin_antecedentes',
        label: 'Sin antecedentes (01-49)',
        cost: 0,
        description: 'Ciudadano sin antecedentes penales.'
    },
    {
        id: 'con_antecedentes',
        label: 'Con antecedentes (50-79)',
        cost: -1,
        description: 'Ciudadano con algún tipo de antecedentes penales. -15 a las tiradas de influencia con agentes de la ley.'
    },
    {
        id: 'buscado',
        label: 'Buscado por la ley (80-89)',
        cost: -2,
        description: 'Buscado por la ley. Tirada de suerte para no ser reconocido. -30 influencia con agentes.'
    },
    {
        id: 'enemigo_publico',
        label: 'Enemigo público (90-99)',
        cost: -3,
        description: 'Su cara es conocida. Tirada de suerte para no ser reconocido. -30 influencia general (+30 intimidar, -50 agentes).'
    },
    {
        id: 'terrorista',
        label: 'Terrorista mundial (00)',
        cost: -4,
        description: 'Crítico en suerte para no ser reconocido. -50 a todas las tiradas de influencia.'
    }
];

export const SOCIAL_STATUS: BackgroundOption[] = [
    {
        id: 'supervillano',
        label: 'Supervillano (01-05)',
        cost: -2,
        description: 'Conocido y temido como un supervillano.'
    },
    {
        id: 'amenaza_publica',
        label: 'Amenaza pública (06-30)',
        cost: -1,
        description: 'Considerado peligroso para la sociedad.'
    },
    {
        id: 'anonimo',
        label: 'Anónimo (30-60)',
        cost: 0,
        description: 'Nadie conoce sus actividades o identidad secreta.'
    },
    {
        id: 'heroe_pueblo',
        label: 'Héroe del pueblo (61-80)',
        cost: 1,
        description: 'Querido por la gente común.'
    },
    {
        id: 'heroe_reconocido',
        label: 'Héroe reconocido (81-00)',
        cost: 2,
        description: 'Héroe reconocido y avalado por instituciones gubernamentales.'
    }
];
