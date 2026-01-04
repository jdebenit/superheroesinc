export interface Artifact {
    id: string;
    name: string;
    description: string;
    reliability: string;
    pcCost: number;
}

export const ARTIFACTS: Artifact[] = [
    {
        id: "mochila_propulsora",
        name: "Mochila propulsora",
        reliability: "90%",
        pcCost: 12,
        description: "Permite al portador usar el poder Volar a rango bajo."
    },
    {
        id: "botas_propulsoras",
        name: "Botas propulsoras",
        reliability: "70%",
        pcCost: 14,
        description: "Permite al portador usar el poder Volar a rango elevado."
    },
    {
        id: "casco_amortiguador",
        name: "Casco amortiguador mental",
        reliability: "90%",
        pcCost: 16,
        description: "El portador recibe los beneficios del poder Invulnerabilidad a poderes psíquicos a rango bajo."
    },
    {
        id: "chip_intracraneal",
        name: "Chip intracraneal amortiguador mental",
        reliability: "100%",
        pcCost: 24,
        description: "El portador recibe los beneficios del poder Invulnerabilidad a poderes psíquicos a rango alto."
    },
    {
        id: "reloj_inductor",
        name: "Reloj con inductor de imagen",
        reliability: "50%",
        pcCost: 12,
        description: "El portador puede cambiar su imagen a una predefinida previamente para así ocultar su apariencia extraña. Usando el poder de Control de energía: Luz a rango elevado y una personalización negativa que solo le permite mostrar una imagen que le envuelva a el precargada en el reloj (con un color de piel diferente, que le oculte su inusuales rasgos faciales, o le ponga un traje no superheroico)"
    },
    {
        id: "gafas_detectoras",
        name: "Gafas detectoras de metahumanos",
        reliability: "90%",
        pcCost: 18,
        description: "Con este artefacto el portador conoce la naturaleza del ser que mira, su origen, posibles habilidades, poderes... emulando el poder de Precognición a rango cósmico, con la personalización negativa que solo puede detectar la verdadera naturaleza de los seres y no usar ninguno de los otros beneficios"
    },
    {
        id: "pistola_portales",
        name: "Pistola de portales",
        reliability: "90%",
        pcCost: 26,
        description: "Una pistola que genera portales a otras localizaciones o incluso dimensiones. La pistola usará el poder de teleportación a rango cósmico y una personalización positiva que abre un portal en vez teleportarse al instante."
    },
    {
        id: "munequera_traductora",
        name: "Muñequera Traductora universal",
        reliability: "70%",
        pcCost: 18,
        description: "El portador podrá usar el poder de traducción de lenguas a rango elevado mientras use esta muñequera."
    },
    {
        id: "vara_teletransportadora",
        name: "Vara Teletransportadora",
        reliability: "100%",
        pcCost: 40,
        description: "Esta vara puede teleportarse donde quiera su dueño junto con el y 10 personas más a cualquier parte del universo, también puede teleportarse sin su dueño a donde él diga y volver al ser llamada."
    },
    {
        id: "casco_potencia",
        name: "Casco Potencia Mental",
        reliability: "90%",
        pcCost: 18,
        description: "Aumenta en 100 puntos de inteligencia al sujeto que lo porta hasta un límite de 170."
    },
    {
        id: "pistola_resonador",
        name: "Pistola con Resonador Psiónico",
        reliability: "80%",
        pcCost: 19,
        description: "Esta pistola tiene los mismos efectos que el poder de Agresión Psiónica a rango elevado."
    },
    {
        id: "traje_invisibilidad",
        name: "Traje invisibilidad",
        reliability: "70%",
        pcCost: 12,
        description: "El portador puede volverse invisible como si tuviese el poder de invisibilidad a rango bajo."
    },
    {
        id: "ordenador_probabilistico",
        name: "Ordenador Probabilístico",
        reliability: "60%",
        pcCost: 22,
        description: "El portador de este ordenador del tamaño de un smartphone podrá saber de las probabilidades de que un suceso se produzca en 10 minutos o menos. A Efectos del juego cada vez que lo use es como si usase el poder de Precognición a rango cósmico."
    }
];
