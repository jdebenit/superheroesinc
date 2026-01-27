export interface HelpContent {
    title: string;
    content: string[];
}

export const WIZARD_HELP: { [stepId: number]: HelpContent } = {
    1: {
        title: "Selección de Origen",
        content: [
            "Elige uno o más orígenes. Ten en cuenta que Divino, Cósmico y Parahumano son exclusivos (solo puedes elegir un tipo dentro de ellos).",
            "Los orígenes definen tus poderes básicos y bonificaciones. Algunos otorgan acceso a listas de poderes específicas.",
            "Si eliges múltiples orígenes (ej: Vigilante + Tecnológico), tendrás acceso a las ventajas de ambos.",
        ]
    },
    2: {
        title: "Distribución de Características",
        content: [
            "Recuerda que las características base afectan a tus habilidades y estadísticas derivadas (como la Iniciativa o los Puntos de Vida).",
            "El Mod. Origen se aplica cuando por origen tienes algun modificador, si eres tienes diferentes modificadores a la misma caracteristica por diferentes origenes se aplica solo el mas alto.",
            "El Mod. Especialidad se aplica cuando por especialidad de Vigilante tienes algun modificador, tambien se tiene en cuenta el mas alto pero se complementa con el de origen."
        ]
    },
    3: {
        title: "Poderes y especiales",
        content: [
            "Aquí seleccionas tus opciones segun tus origenes, tambien si tienes poderes, hechizos o tecnología.",
            "El coste de los poderes depende de tu Origen. Si eres un Guardian, podrías tener penalizaciones en poderes de otro origen.",
            "Energía Mágica (EM): Si tienes poderes mágicos, podras adquirir poderes usando la EM.",
            "Puedes personalizar tus poderes para ajustar su coste y efecto."
        ]
    },
    4: {
        title: "Habilidades",
        content: [
            "Las habilidades se dividen en Generales (todos las tienen) y de Aprendizaje (debes comprarlas).",
            "El nivel base de una habilidad depende de tus características + bonos de origen y especialidad.",
            "Aumentar las habilidades cuesta PCs. Especializarte es clave para definir el rol de tu personaje.",
            "No olvides las habilidades de combate si planeas luchar."
        ]
    },
    5: {
        title: "Trasfondo",
        content: [
            "Define quién es tu personaje: su estatus social, económico y legal.",
            "Esto afecta a cómo te percibe el mundo y qué recursos iniciales tienes.",
            "Los contactos, aliados y recursos pueden ser tan útiles como un superpoder en ciertas situaciones.",
            "La 'Resistencia al Prejuicios' indica la capacidad para hacer actos contrarios a los prejuicios sociales, sin perder Equilibrio Mental."
        ]
    },
    6: {
        title: "Detalles y equipo",
        content: [
            "Revisa tus estadísticas derivadas (PV, Iniciativa, etc.). Estas se calculan automáticamente.",
            "Equipa a tu personaje con armas, armaduras y vehículos.",
            "Puedes cargar equipo predefinido o crear objetos personalizados.",
            "Asegúrate de tener un arma (y la habilidad de usarla) si tu personaje es combatiente."
        ]
    },
    7: {
        title: "Evolución",
        content: [
            "Este paso es para el futuro del personaje. Aquí podrás subir de nivel.",
            "Por ahora, revisa que todo esté correcto antes de exportar tu ficha.",
            "¡Listo para jugar!"
        ]
    }
};
