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
        label: 'Mendigo',
        cost: -3,
        description: 'Sin ningún tipo de ingreso regular.',
        effect: 'Mendigo'
    },
    {
        id: 'clase_baja',
        label: 'Clase baja',
        cost: -2,
        description: 'Vive gracias a la ayuda de algún subsidio o tiene un trabajo eventual.',
        effect: 'Clase baja'
    },
    {
        id: 'clase_medio_baja',
        label: 'Clase medio-baja',
        cost: -1,
        description: 'Tiene un trabajo que le permite ir tirando (mozo de carga, repartidor...).',
        effect: 'Clase medio-baja'
    },
    {
        id: 'clase_media',
        label: 'Clase media',
        cost: 0,
        description: 'La mayoría de la gente (oficinistas, vendedores...).',
        effect: 'Clase media'
    },
    {
        id: 'clase_media_alta',
        label: 'Clase media-alta',
        cost: 1,
        description: 'Ejecutivos de empresa y profesionales de vida desahogada.',
        effect: 'Clase media-alta'
    },
    {
        id: 'clase_alta',
        label: 'Clase alta',
        cost: 2,
        description: 'Profesional mundialmente reconocido (médico, abogado, editor...).',
        effect: 'Clase alta'
    },
    {
        id: 'multimillonario',
        label: 'Multimillonario',
        cost: 4,
        description: 'Dueño de una gran corporación o sólida fortuna familiar. Disponibilidad de equipo un nivel menor.',
        effect: 'Multimillonario'
    },
];

export const LEGAL_STATUS: BackgroundOption[] = [
    {
        id: 'sin_antecedentes',
        label: 'Sin antecedentes',
        cost: 0,
        description: 'Ciudadano sin antecedentes penales.'
    },
    {
        id: 'con_antecedentes',
        label: 'Con antecedentes',
        cost: -1,
        description: 'Ciudadano con algún tipo de antecedentes penales. -15 a las tiradas de influencia con agentes de la ley.'
    },
    {
        id: 'buscado',
        label: 'Buscado por la ley',
        cost: -2,
        description: 'Buscado por la ley. Tirada de suerte para no ser reconocido. -30 influencia con agentes.'
    },
    {
        id: 'enemigo_publico',
        label: 'Enemigo público',
        cost: -3,
        description: 'Su cara es conocida. Tirada de suerte para no ser reconocido. -30 influencia general (+30 intimidar, -50 agentes).'
    },
    {
        id: 'terrorista',
        label: 'Terrorista mundial',
        cost: -4,
        description: 'Crítico en suerte para no ser reconocido. -50 a todas las tiradas de influencia.'
    }
];

export const SOCIAL_STATUS: BackgroundOption[] = [
    {
        id: 'supervillano',
        label: 'Supervillano',
        cost: -2,
        description: 'Conocido y temido como un supervillano.'
    },
    {
        id: 'amenaza_publica',
        label: 'Amenaza pública',
        cost: -1,
        description: 'Considerado peligroso para la sociedad.'
    },
    {
        id: 'anonimo',
        label: 'Anónimo',
        cost: 0,
        description: 'Nadie conoce sus actividades o identidad secreta.'
    },
    {
        id: 'heroe_pueblo',
        label: 'Héroe del pueblo)',
        cost: 1,
        description: 'Querido por la gente común.'
    },
    {
        id: 'heroe_reconocido',
        label: 'Héroe reconocido',
        cost: 2,
        description: 'Héroe reconocido y avalado por instituciones gubernamentales.'
    }
];

export const FRIENDS_AND_ASSOCIATES: BackgroundOption[] = [
    {
        id: 'solitario',
        label: 'Solitario',
        cost: -2,
        description: 'Es un tipo solitario. No se relaciona con la familia ni tiene amigos.'
    },
    {
        id: 'solo_familia',
        label: 'Solo familia',
        cost: -1,
        description: 'Tan solo su familia directa cuenta con él.'
    },
    {
        id: 'conocido',
        label: 'Conocido',
        cost: 0,
        description: 'Algún conocido, pero no se fía especialmente.'
    },
    {
        id: 'grupo_reducido',
        label: 'Grupo reducido',
        cost: 1,
        description: 'Tiene un grupo reducido de amigos (1d4) en los que confía y que lo apoyan.'
    },
    {
        id: 'lazos_todos',
        label: 'Lazos con todos',
        cost: 2,
        description: 'Mantiene lazos de amistad con todos aquellos a los que les ha unido algo especial, y puede recibir ayuda de ellos.'
    },
    {
        id: 'conocido_poderoso',
        label: 'Conocido poderoso',
        cost: 3,
        description: 'Conocido poderoso. Le apoyará debido a alguna deuda pendiente, o a un vínculo fuerte entre ellos.'
    }
];

export const BASE_COVERAGE: BackgroundOption[] = [
    {
        id: 'no_base',
        label: 'Sin base',
        cost: 0,
        description: 'En el momento de la creación del personaje o grupo éstos carecen de base.'
    },
    {
        id: 'shi_base',
        label: 'Superhéroes Inc.',
        cost: 2,
        description: 'Superhéroes Inc. Tendrán acceso a una base de altas prestaciones.'
    },
    {
        id: 'tercera_persona',
        label: 'Financiador anónimo',
        cost: 3,
        description: 'Una tercera persona financia las actividades del grupo. El Guionista debe determinar de forma cuidadosa cuales son las intenciones de este personaje, deberá crear su ficha de personaje y prestando atención a su resistencia a prejuicios. Tendrán acceso a una base de altas prestaciones.'
    },
    {
        id: 'entidad_altas_prestaciones',
        label: 'Entidad oficial (altas prestaciones)',
        cost: 4,
        description: 'Entidad. Tendrán acceso a una base de altas prestaciones.'
    },
    {
        id: 'entidad_lujo',
        label: 'Entidad oficial (lujo)',
        cost: 5,
        description: 'Entidad. Tendrán acceso a una base de lujo.'
    },
    {
        id: 'independiente_bruto',
        label: 'Base propia (en bruto)',
        cost: 6,
        description: 'No dependerán de ninguna entidad, tercera persona o estamento oficial, pero solo tendrán acceso a una base en bruto.'
    },
    {
        id: 'independiente_altas_prestaciones',
        label: 'Base propia (altas prestaciones)',
        cost: 8,
        description: 'Igual que la anterior, pero tendrán acceso a una base de altas prestaciones.'
    },
    {
        id: 'historial_equipada',
        label: 'Base por historial (equipada)',
        cost: 10,
        description: 'Debido a una situación derivada de su historial disponen de una base equipada sin depender de ninguna entidad, tercera persona o estamento oficial.'
    },
    {
        id: 'historial_altas_prestaciones',
        label: 'Base por historial (altas prestaciones)',
        cost: 12,
        description: 'Igual que la anterior, pero tendrán acceso a una base de altas prestaciones.'
    },
    {
        id: 'historial_lujo',
        label: 'Base por historial (lujo)',
        cost: 16,
        description: 'El grupo o personaje debido a una situación derivada de su historial disponen de una base de lujo sin depender de ninguna entidad, tercera persona o estamento oficial.'
    }
];

