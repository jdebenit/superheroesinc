export interface MagicObject {
    id: string;
    name: string;
    description: string;
    em: number;
}

export const MAGIC_OBJECTS: MagicObject[] = [
    {
        id: "filtros_respiracion",
        name: "Filtros de respiración para ambientes hostiles",
        description: "Protegen contra gases de potencia Muy Fuerte.",
        em: 40
    },
    {
        id: "pocion_curacion",
        name: "Poción de curación",
        description: "Recupera todos los puntos de vida que le falten al personaje o cura la herida y los efectos causados por un impacto crítico.",
        em: 50
    },
    {
        id: "anillo_luz",
        name: "Anillo de luz",
        description: "Emite un haz de luz capaz de alcanzar 1d10x10 metros.",
        em: 60
    },
    {
        id: "piedra_laara",
        name: "Piedra Laara",
        description: "Absorbe 1 Crítico, tras lo cual se rompe y queda inservible.",
        em: 60
    },
    {
        id: "flechas_inteligentes",
        name: "Flechas inteligentes",
        description: "Suman +50 al porcentaje de éxito que rige la habilidad de este arma.",
        em: 75
    },
    {
        id: "amuleto_regulacion",
        name: "Amuleto de regulación de temperatura corporal",
        description: "Quien lo lleva no siente los rigores de las temperaturas extremas. Para él es como si estuviera a 20ºC. Reduce a la mitad el daño causado por fuego o congelación.",
        em: 80
    },
    {
        id: "botas_lert",
        name: "Botas de Lert",
        description: "Doblan la capacidad de salto de quien las lleva.",
        em: 80
    },
    {
        id: "llave_maestra",
        name: "Llave maestra",
        description: "Abre cualquier cerradura no mágica.",
        em: 80
    },
    {
        id: "saco_sin_fondo",
        name: "Saco sin fondo",
        description: "En él se pueden llevar todos los objetos que se quiera, con el único requisito de que deben entrar por la boca del saco.",
        em: 90
    },
    {
        id: "carcaj_iona",
        name: "Carcaj de Iona",
        description: "Nunca se le acaban las flechas.",
        em: 100
    },
    {
        id: "cuerno_abundancia",
        name: "Cuerno de la abundancia",
        description: "Es un recipiente que puede presentarse de muy diversas formas. Su principal característica es que de él se puede sacar toda la comida que se desee, puesto que siempre habrá más.",
        em: 100
    },
    {
        id: "odre_insaciable",
        name: "Odre del insaciable",
        description: "Por mucha agua que se beba de este pequeño odre siempre seguirá lleno. Si se agujerea o rompe, pierde sus sorprendentes capacidades para siempre.",
        em: 100
    },
    {
        id: "ojo_volador",
        name: "Ojo volador",
        description: "Es un pequeño orbe que vuela y a través del cual el personaje puede ver a distancia.",
        em: 100
    },
    {
        id: "pie_lince",
        name: "Pie de lince",
        description: "Son unas botas que no dejan rastro alguno, aunque se camine por nieve o barro.",
        em: 100
    },
    {
        id: "cristal_conciencia",
        name: "Cristal de conciencia",
        description: "Desvela la verdadera naturaleza de las personas",
        em: 110
    },
    {
        id: "gema_verdad",
        name: "Gema de la verdad",
        description: "El PJ que posea una puede saber, sin ninguna duda, cuando le dicen la verdad y cuando le mienten.",
        em: 110
    },
    {
        id: "espejo_transparencia",
        name: "Espejo de transparencia",
        description: "Colocado sobre una superficie permite ver lo que hay al otro lado.",
        em: 120
    },
    {
        id: "pluma_levitacion",
        name: "Pluma de levitación",
        description: "Permite a su poseedor levitar lentamente. No sirve para volar sino que otorga un estado de ingravidez transitorio.",
        em: 120
    },
    {
        id: "amuleto_velocidad",
        name: "Amuleto de velocidad en combate",
        description: "+1 acción en dicha situación.",
        em: 130
    },
    {
        id: "guantelete_constitucion",
        name: "Guantelete de constitución",
        description: "Otorga a quien lo lleve +50 a la CON, hasta un límite de 200. Protege automáticamente, actuando solo 10 veces al día, tras lo cual sus efectos se desvanecen hasta la llegada del alba.",
        em: 130
    },
    {
        id: "guantelete_fuerza",
        name: "Guantelete de fuerza",
        description: "Otorga a quien lo lleve +50 a la fuerza, hasta un límite de 200. Solo puede utilizarse 10 asaltos cada día.",
        em: 130
    },
    {
        id: "medallon_proteccion",
        name: "Medallón de protección mágica",
        description: "Los daños causados por medios mágicos le causan la mitad de daño.",
        em: 130
    },
    {
        id: "baston_surt",
        name: "Bastón de Surt",
        description: "Está cargado de EM. Usado a larga distancia, emite una descarga por asalto de una potencia variable (tirar el Rango de Emisión de Energía Mágica como si se tratase de un poder, entre Medio y Elevado) y que está regida por la PER del personaje. También puede usarse como bastón de combate (Armas especiales) causando el mismo daño con cada golpe.",
        em: 140
    },
    {
        id: "brazaletes_cambiante",
        name: "Brazaletes del cambiante",
        description: "Permiten a su poseedor cambiar de forma tantas veces al día como nivel de PJ y durante un máximo de 10 asaltos, siempre y cuando no exista una diferencia mayor de 15 puntos entre su CON y la de la nueva forma. Manteniendo su cuerpo puede asumir cualquier rostro.",
        em: 150
    },
    {
        id: "tiara_mental",
        name: "Tiara mental",
        description: "Refuerza la resistencia psíquica del personaje, reduciendo cualquier ataque a su equilibrio mental al 10% de su daño, o del valor del ataque.",
        em: 150
    },
    {
        id: "capa_espectro",
        name: "Capa de espectro",
        description: "Una vez al día y durante un máximo de 10 asaltos hace que quien la lleve se vuelva intangible.",
        em: 160
    },
    {
        id: "manto_invisibilidad",
        name: "Manto de invisibilidad",
        description: "Es una tela o capa que, colocada sobre un personaje, le vuelve invisible durante un máximo de 10 asaltos cada día.",
        em: 160
    }
];
