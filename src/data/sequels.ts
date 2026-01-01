export const SEQUELS = [
    // Discapacidad (1-4 PC) -> 4 separate entries
    { id: 'disability_1', label: 'Discapacidad (Grado 1)', description: 'Ciego, tuerto, paralítico, etc.', cost: 1 },
    { id: 'disability_2', label: 'Discapacidad (Grado 2)', description: 'Ciego, tuerto, paralítico, etc.', cost: 2 },
    { id: 'disability_3', label: 'Discapacidad (Grado 3)', description: 'Ciego, tuerto, paralítico, etc.', cost: 3 },
    { id: 'disability_4', label: 'Discapacidad (Grado 4)', description: 'Ciego, tuerto, paralítico, etc.', cost: 4 },

    { id: 'compulsion', label: 'Manía compulsiva', description: 'Tics nerviosos, rascarse, bizquear...', cost: 1 },
    { id: 'prosthesis', label: 'Prótesis', description: 'Extremidad protésica, requiere 2h mantenimiento/día.', cost: 2 },
    { id: 'amnesia', label: 'Amnesia', description: 'Sufre ataques de amnesia.', cost: 2 },

    // Pérdida intelectual (1-10 PC) -> 10 separate entries
    { id: 'intellectual_loss_1', label: 'Pérdida intelectual (10 pts INT)', description: 'Reduce en 1d10 su inteligencia.', cost: 1 },
    { id: 'intellectual_loss_2', label: 'Pérdida intelectual (20 pts INT)', description: 'Reduce en 2d10 su inteligencia.', cost: 2 },
    { id: 'intellectual_loss_3', label: 'Pérdida intelectual (30 pts INT)', description: 'Reduce en 3d10 su inteligencia.', cost: 3 },
    { id: 'intellectual_loss_4', label: 'Pérdida intelectual (40 pts INT)', description: 'Reduce en 4d10 su inteligencia.', cost: 4 },
    { id: 'intellectual_loss_5', label: 'Pérdida intelectual (50 pts INT)', description: 'Reduce en 5d10 su inteligencia.', cost: 5 },
    { id: 'intellectual_loss_6', label: 'Pérdida intelectual (60 pts INT)', description: 'Reduce en 6d10 su inteligencia.', cost: 6 },
    { id: 'intellectual_loss_7', label: 'Pérdida intelectual (70 pts INT)', description: 'Reduce en 7d10 su inteligencia.', cost: 7 },
    { id: 'intellectual_loss_8', label: 'Pérdida intelectual (80 pts INT)', description: 'Reduce en 8d10 su inteligencia.', cost: 8 },
    { id: 'intellectual_loss_9', label: 'Pérdida intelectual (90 pts INT)', description: 'Reduce en 9d10 su inteligencia.', cost: 9 },
    { id: 'intellectual_loss_10', label: 'Pérdida intelectual (100 pts INT)', description: 'Reduce en 10d10 su inteligencia.', cost: 10 },

    { id: 'no_vitals', label: 'Signos vitales ausentes', description: 'No tiene pulso, no respira, no necesita comer.', cost: 2 },

    // Alteración estética (1-10 PC) -> 10 separate entries
    { id: 'aesthetic_alteration_1', label: 'Alteración estética (10 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 1 },
    { id: 'aesthetic_alteration_2', label: 'Alteración estética (20 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 2 },
    { id: 'aesthetic_alteration_3', label: 'Alteración estética (30 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 3 },
    { id: 'aesthetic_alteration_4', label: 'Alteración estética (40 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 4 },
    { id: 'aesthetic_alteration_5', label: 'Alteración estética (50 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 5 },
    { id: 'aesthetic_alteration_6', label: 'Alteración estética (60 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 6 },
    { id: 'aesthetic_alteration_7', label: 'Alteración estética (70 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 7 },
    { id: 'aesthetic_alteration_8', label: 'Alteración estética (80 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 8 },
    { id: 'aesthetic_alteration_9', label: 'Alteración estética (90 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 9 },
    { id: 'aesthetic_alteration_10', label: 'Alteración estética (100 pts APA)', description: 'Aspecto marcado irreversiblemente.', cost: 10 },

    // Poder incontrolado (1-4 PC) -> 4 separate entries
    { id: 'uncontrolled_power_1', label: 'Poder incontrolado (Grado 1)', description: 'Uno de los poderes no puede ser controlado.', cost: 1 },
    { id: 'uncontrolled_power_2', label: 'Poder incontrolado (Grado 2)', description: 'Uno de los poderes no puede ser controlado.', cost: 2 },
    { id: 'uncontrolled_power_3', label: 'Poder incontrolado (Grado 3)', description: 'Uno de los poderes no puede ser controlado.', cost: 3 },
    { id: 'uncontrolled_power_4', label: 'Poder incontrolado (Grado 4)', description: 'Uno de los poderes no puede ser controlado.', cost: 4 },

    { id: 'psychosis', label: 'Psicosis', description: 'Odia todo lo relacionado con su mutación.', cost: 1 },
    { id: 'phobia', label: 'Fobia', description: 'Miedo incapacitante hacia algo relacionado.', cost: 1 },
    { id: 'dependency', label: 'Dependencia', description: 'Necesita requisito regular para poderes operativos.', cost: 2 },
    { id: 'social_displacement', label: 'Desplazamiento social', description: 'Incapacitado emocionalmente.', cost: 1 },
    { id: 'unsociableness', label: 'Insociabilidad', description: 'Carácter huraño.', cost: 1 },
    { id: 'character_inversion', label: 'Inversión carácter', description: 'Resistencia a prejuicios modificada (100 - actual).', cost: 1 },
    { id: 'aggressiveness', label: 'Agresividad', description: 'No puede reprimir tendencias violentas.', cost: 1 },
    { id: 'vulnerable_point', label: 'Punto vulnerable', description: 'Punto u objeto letal para el personaje.', cost: 3 },
    { id: 'involuntary_transformation', label: 'Transformación involuntaria', description: 'Pierde control y se transforma.', cost: 3 },
];
