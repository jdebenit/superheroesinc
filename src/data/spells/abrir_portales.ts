import type { SpellDetail } from '../spells';

export const abrir_portales: SpellDetail = {
    description: "El místico es capaz de abrir portales entre dos puntos de entre las esferas. Este hechizo será más o menos poderoso dependiendo del rango:",
    ranks: [
        "El lanzador dentro de la esfera puede trasladarse a una distancia máxima de 20 metros. Necesita ver la localización a la que se transporta.",
        "La distancia aumenta a 50 m y además el mago no necesita ver el lugar al que se transporta.",
        "La distancia aumenta 500 m.",
        "La distancia aumenta a 500 km.",
        "Se teleporta a cualquier lugar que desee (dentro de este mundo) y puede acceder a otras esferas."
    ],
    mastery: "El mago es capaz de abrir varios portales al mismo tiempo en distintos puntos del Multiverso. Asimismo, es capaz de percibir mágicamente los portales que se abran por obra de otros magos a una distancia máxima de 100 km por nivel del mago. También puede detectar el momento en el que se crean universos rasgados."
};
