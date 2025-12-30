export interface TechModuleDefinition {
    id: string;
    name: string;
    cost: number;
    description: string;
    locations: string[]; // Sugerencias de localización
    type: 'General' | 'Mejora Interna';
}

export const TECH_MODULES: TechModuleDefinition[] = [
    {
        id: "alta_autonomia",
        name: "Alta autonomía",
        type: "General",
        cost: 2,
        description: "Amplían el tiempo de supervivencia hasta los cinco días de completa operatividad, pero conservan el mismo rango de temperaturas de funcionamiento.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "amortiguador_cinetico",
        name: "Amortiguador cinético",
        type: "General",
        cost: 4,
        description: "Protección extra a los impactos físicos basada en la dispersión de la energía cinética del proyectil mediante fibrilaciones plásticas que reparten el daño en toda la estructura de la armadura. Suma 25 PVs extras al daño absorbido causado por ataques de tipo cinético.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "autodestruccion",
        name: "Autodestrucción",
        type: "General",
        cost: 1,
        description: "Como complemento al sistema anterior se suele establecer un dispositivo que efectúa una detonación de la pila nuclear de la armadura en el caso de que ésta sea abierta sin autorización previa. La autodestrucción produce una explosión que arrasa un área circular de 500 metros de radio alrededor de la armadura.",
        locations: ["Torso", "Espalda"]
    },
    {
        id: "autoreparado",
        name: "Autoreparado",
        type: "General",
        cost: 3,
        description: "Este sistema permite a las armaduras autorrepararse, tanto en sus sistemas internos, como en la estructura del blindaje. La velocidad de reparación es de 30 PV/h o bien un Sistema/ hora. No afecta a zonas o sistemas afectados por un Crítico.",
        locations: ["Cualquiera"]
    },
    {
        id: "camuflaje",
        name: "Camuflaje",
        type: "General",
        cost: 2,
        description: "Sistema que permite que una tecnoarmadura pase desapercibida en el entorno que le rodea. Produce un efecto de mimetismo con el medio. La tecnoarmadura o piel adopta el color del lugar en que se encuentra de forma automática, proporcionando un modificador +30 a las habilidades Esconderse y Acechar/Discreción del personaje.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "camuflaje_avanzado",
        name: "Camuflaje avanzado",
        type: "General",
        cost: 4,
        description: "Este módulo más avanzado imita visualmente el entorno alrededor del personaje con un breve retardo proporcionando un modificador de +60 a las habilidades de Esconderse y Acechar/Discreción del personaje.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "computadora_tactica",
        name: "Computadora táctica",
        type: "General",
        cost: 4,
        description: "Es un sistema que convierte a la armadura en el más mortal sistema de armas jamás concebido por el hombre. Una microcomputadora se incorpora a la armadura y se mantiene permanentemente activa. En caso de ataque contra ella, la computadora analiza todos los factores tácticos que intervienen en la acción de forma que salvaguarde la vida de su piloto primero y destruya a su atacante después. Con una computadora táctica no es necesario invertir una acción en la activación o desactivación de ninguno de los sistemas, puesto que es la propia computadora la que se encarga de tornar estas decisiones y ejecutarlas. El jugador simplemente declara que se activan o desactivan dichos sistemas. Además añade +30 a la iniciativa en todas las situaciones siempre que tenga activa la computadora táctica.",
        locations: ["Cabeza", "Torso"]
    },
    {
        id: "comunicaciones",
        name: "Comunicaciones",
        type: "General",
        cost: 0,
        description: "Dispositivo de comunicación que cuenta con tecnología de un móvil inteligente con cobertura nacional y un emisor / receptor de radio de alcance limitado a 50 kilómetros. Puede acceder también a canales de radio cifrados digitales de servicios básicos como policía, 112 etc.",
        locations: ["Cabeza", "Oreja"]
    },
    {
        id: "comunicaciones_avanzadas",
        name: "Comunicaciones avanzadas",
        type: "General",
        cost: 1,
        description: "Son mucho más potentes, permitiendo mantener comunicaciones por radio hasta una distancia de 500 kilómetros, pero disponiendo además de mecanismos que permiten enlace con satélites, con lo que virtualmente pueden conectarse con cualquier punto del planeta e incluso más allá.",
        locations: ["Cabeza", "Espalda", "Torso"]
    },
    {
        id: "condiciones_extremas",
        name: "Condiciones extremas",
        type: "General",
        cost: 4,
        description: "Son capaces, además de todo lo anterior, de resistir temperaturas de entre -273 y 1.500ºC y soportar la existencia de radiación exterior de alta intensidad (Rayos X, radioactividad, etc.). Aumenta en 75 D.A. Físico el daño de ataques de tipo calorífico.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "control_automatico",
        name: "Control automático",
        type: "General",
        cost: 1,
        description: "Este subsistema se incorpora generalmente a las armaduras más avanzadas con el fin de recuperar ésta aún después de la muerte de su tripulante. El funcionamiento automático consiste en que la armadura efectúe una retirada inmediata en caso de fallecimiento de su piloto. El punto al que la armadura se dirige es programado anteriormente.",
        locations: ["Torso", "Cabeza"]
    },
    {
        id: "equipacion_combate",
        name: "Equipación de combate",
        type: "General",
        cost: 0,
        description: "Este módulo integra un arma para que funcione con los sistemas tecnificados del personaje en caso de una tecnoarmadura, tecnovehículo o robot este arma pasa a controlarse mediante la habilidad de sistemas de armamento. En el caso de los cyborgs se tendrá que adquirir la habilidad a cada arma correspondiente. Los puntos de creación de este módulo se calculan en función a lo indicado en el apartado EQUIPAMIENTO.",
        locations: ["Cualquiera"]
    },
    {
        id: "escudo_energetico",
        name: "Escudo energético",
        type: "General",
        cost: 2,
        description: "Emisión controlada de la energía interna de la armadura formando un escudo invisible que absorbe ataques de tipo energético causando una disrrupción electromagnética momentánea. El límite máximo de tiempo que se puede mantener el escudo es de 5 asaltos. No puede reutilizarse hasta pasadas 24 horas.",
        locations: ["Brazo", "Torso"]
    },
    {
        id: "impulsor_baja",
        name: "Impulsor baja potencia",
        type: "General",
        cost: 4,
        description: "Muchas de las armaduras incorporan un Impulsor para permitirles desplazarse por el aire. Los impulsores pueden utilizarse debajo del agua, a un tercio de su velocidad. El impulsor de baja potencia puede alcanzar Match 0.5.",
        locations: ["Espalda", "Piernas"]
    },
    {
        id: "impulsor_media",
        name: "Impulsor media potencia",
        type: "General",
        cost: 6,
        description: "El impulsor de media potencia puede alcanzar Match 1.0.",
        locations: ["Espalda", "Piernas"]
    },
    {
        id: "impulsor_alta",
        name: "Impulsor alta potencia",
        type: "General",
        cost: 8,
        description: "El impulsor de alta potencia puede alcanzar Match 2.0.",
        locations: ["Espalda", "Piernas"]
    },
    {
        id: "impulsor_silencioso",
        name: "Impulsor silencioso",
        type: "General",
        cost: 2,
        description: "Los Impulsores silenciosos de aire son un novedoso sistema que permite que la armadura se desplace sin emitir el más mínimo ruido. Su velocidad máxima queda limitada a 150 km/h y su principal limitación es que solo funcionan bajo condiciones atmosféricas favorables.",
        locations: ["Espalda", "Piernas"]
    },
    {
        id: "magnetizador",
        name: "Magnetizador",
        type: "General",
        cost: 1,
        description: "Permiten cargar cualquier objeto metálico con una polaridad magnética determinada que luego puede ser controlada por el portador de la armadura. El peso máximo que se puede mover con este sistema es de 10 Ton. A una distancia efectiva de 20 m.",
        locations: ["Brazo", "Torso"]
    },
    {
        id: "rayo_tractor",
        name: "Rayo tractor",
        type: "General",
        cost: 1,
        description: "De efecto parecido a los magnetizadores, con la diferencia que este dispositivo actúa sobre cualquier tipo de material, aunque solo es capaz de afectar a objetos de hasta 1 ton a una distancia nunca superior a 100 m.",
        locations: ["Brazo", "Torso"]
    },
    {
        id: "medidas_electronicas",
        name: "Medidas electrónicas",
        type: "General",
        cost: 2,
        description: "Es un sistema de interferencias electromagnéticas que permite confundir a otros elementos electrónicos del enemigo. Las medidas electrónicas impiden completamente el funcionamiento de: Camuflaje, Computadora táctica, Comunicaciones y Sensores. Además, cualquier sistema de armas tendrá un modificador -50 en su uso y bajará a la mitad la fiabilidad de los artefactos mientras las medidas electrónicas estén activadas. Dos sistemas de Medidas Electrónicas enfrentados anulan sus efectos.",
        locations: ["Cabeza", "Torso", "Espalda"]
    },
    {
        id: "proteccion_refractante",
        name: "Protección refractante",
        type: "General",
        cost: 2,
        description: "Los microcristales refractantes descomponen el haz de luz del láser, dividiéndolo en luz inofensiva hasta un 96% de la energía emitida. Además confieren a la armadura la posibilidad de ser indetectable a los rayos infrarrojos al descomponer las emisiones de los sistemas. Suma un 50% extra al daño absorbido físico contra ataques de energía del tipo luz.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "proteccion_sonora",
        name: "Protección contra ondas sonoras",
        type: "General",
        cost: 1,
        description: "Los polímeros de ferrita (que dan a la armadura un aspecto envejecido y oxidado) protegen contra ataques sónicos y evitan su detección mediante medios convencionales de Radar y Sonar (Sensores). Suma un 50% extra al daño absorbido contra ataques de energía del tipo sónica.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "prototipo_alta_tecnologia",
        name: "Prototipo de alta tecnología",
        type: "General",
        cost: 0,
        description: "Este tipo de módulo es capaz de integrar con los sistemas tecnificados un artefacto. Los puntos a invertir en dicho artefacto se calculan como indica el apartado EQUIPAMIENTO.",
        locations: ["Cualquiera"]
    },
    {
        id: "sensores",
        name: "Sensores",
        type: "General",
        cost: 1,
        description: "Dispone de un radar de hasta 25 km, mediciones a una distancia de 100 m de temperatura, humedad, oxigeno etc.",
        locations: ["Cabeza", "Ojos"]
    },
    {
        id: "sensores_avanzados",
        name: "Sensores avanzados",
        type: "General",
        cost: 2,
        description: "Radar y sonar de hasta 50 km, análisis de estructuras, materiales, mediciones hasta en un radio de 200 m de condiciones ambientales. ",
        locations: ["Cabeza", "Ojos"]
    },
    {
        id: "soporte_vital",
        name: "Soporte Vital",
        type: "General",
        cost: 1,
        description: "permite que un ser humano se mantenga vivo aún sin atmósfera externa respirable (incluye inmersión) por un tiempo de hasta 12 horas, siempre y cuando la temperatura externa se encuentre dentro del rango de temperaturas comprendido entre -20 y 50ºC.",
        locations: ["Torso"]
    },
    // MEJORAS INTERNAS
    {
        id: "endoesqueleto",
        name: "Endoesqueleto",
        type: "Mejora Interna",
        cost: 5,
        description: "Este es un sistema independiente, que sustituye de una manera total el esqueleto del personaje por uno de carácter metálico. No varia para nada el aspecto exterior del personaje. Protege de la rotura de miembros y añade +20 al daño en combate físico.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "endomusculos",
        name: "Endomúsculos",
        type: "Mejora Interna",
        cost: 4,
        description: "Servofibras miniaturizadas sustituyen a los músculos internos del sujeto dotándole de una fuerza de 105 y una constitución de 105.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "endomusculos_avanzados",
        name: "Endomúsculos avanzados",
        type: "Mejora Interna",
        cost: 8,
        description: "Similar a su versión menos avanzada otorgando al cyborg una fuerza de 110 y una constitución de 110.",
        locations: ["Cuerpo completo"]
    },
    {
        id: "hiperactividad",
        name: "Hiperactividad",
        type: "Mejora Interna",
        cost: 6,
        description: "Se mejora el sistema nervioso del receptor incluyendo nervios sintéticos en todas sus terminaciones nerviosas y se añaden receptores sinápticos en su cerebro y columna. Aumenta la Agilidad hasta 110.",
        locations: ["Sistema Nervioso", "Columna"]
    },
    {
        id: "memoria_artificial",
        name: "Memoria artificial",
        type: "Mejora Interna",
        cost: 3,
        description: "Una operación cerebral que complementa la memoria del sujeto añadiendo un microcomputador con bancos de memoria artificial (+50 a Conocimientos Generales).",
        locations: ["Cabeza"]
    },
    {
        id: "percepcion_aumentada",
        name: "Percepción Aumentada",
        type: "Mejora Interna",
        cost: 5,
        description: "Refuerza los receptores sensoriales con potenciadores electroquímicos para aportar una mayor nitidez en el procesamiento de los diferentes tipos de interacciones sensitivas aumentando la percepción del sujeto hasta 110.",
        locations: ["Cabeza", "Sistema Nervioso"]
    }
];
