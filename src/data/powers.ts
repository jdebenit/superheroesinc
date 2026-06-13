export type PowerType = "Físico" | "Psíquico" | "Energético";
export type PowerCharacteristic = "AGI" | "CON" | "INT" | "PER" | "FUE" | "APA" | "VOL";

export interface Power {
    id: string;
    name: string;
    formula: string;
    cost: number;
    characteristic?: PowerCharacteristic;
    options?: string[];
    skillCalc?: string;
    types: PowerType[];
    origins: string[];
}

export const POWERS: Power[] = [
    {
        id: "ablacion",
        name: "Ablación",
        formula: "6+(Rango/10)",
        cost: 6,
        types: ["Energético"],
        skillCalc: "FUE/2",
        origins: ["Sobrenatural"]
    },
    {
        id: "absorcion_de_energia",
        name: "Absorción de energía",
        formula: "5+(Rango/10)",
        cost: 5,
        types: ["Energético"],
        options: ["Ejm tipo de energia y habilidad"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        id: "absorcion_de_poderes",
        name: "Absorción de poderes",
        formula: "10+(Rango/10)",
        cost: 10,
        skillCalc: "CON/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Vampírico"]
    },
    {
        id: "absorcion_de_vida",
        name: "Absorción de vida",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(PER+CON)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "agresion_psionica",
        name: "Agresión psiónica",
        formula: "8+(Rango/10)",
        cost: 8,
        skillCalc: "(VOL+INT)/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "anulacion_de_poderes",
        name: "Anulación de poderes",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "CON/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        id: "ataque_especial",
        name: "Ataque especial",
        formula: "5+(Rango/10)",
        cost: 5,
        options: ["Arma Natural"],
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "blindaje_natural",
        name: "Blindaje natural",
        formula: "10+(Rango/10)",
        cost: 10,
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "cambio_de_estado",
        name: "Cambio de estado",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(VOL+CON)/2",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "cambio_de_la_densidad",
        name: "Cambio de la densidad",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "CON/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "cambio_de_tamano",
        name: "Cambio de tamaño",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "CON",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        id: "campo_de_fuerza",
        name: "Campo de fuerza",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "VOL",
        types: ["Energético", "Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Thals"]
    },
    {
        id: "congelacion",
        name: "Congelación",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "control_de_energia",
        name: "Control de energía",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "VOL/2",
        options: ["Cinética", "Luz", "Sonido"],
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "control_de_la_geodinamica",
        name: "Control de la geodinámica",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "(CON+PER)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_de_la_probabilidad",
        name: "Control de la probabilidad",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(VOL+PER)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "control_de_la_vegetacion",
        name: "Control de la vegetación",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_de_moleculas_ajenas",
        name: "Control de moléculas ajenas",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "PER/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "control_del_agua",
        name: "Control del agua",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(PER+AGI)/3",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_del_clima",
        name: "Control del clima",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "(PER+VOL)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_del_fuego",
        name: "Control del fuego",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "(PER+INT)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "control_del_organismo",
        name: "Control del organismo",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "(VOL+PER)/4",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "conversion_de_materia",
        name: "Conversión de materia",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "VOL/2",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "dominacion_mental",
        name: "Dominación mental",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(VOL+INT)/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "donacion_de_vida",
        name: "Donación de vida",
        formula: "4+(Rango/10)",
        cost: 4,
        skillCalc: "CON",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        id: "elasticidad",
        name: "Elasticidad",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "AGI",
        types: ["Físico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "emision_de_energia",
        name: "Emisión de energía",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        options: ["Cinética", "Luz", "Sonido"],
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "empatia_animal",
        name: "Empatía animal",
        formula: "4+(Rango/10)",
        cost: 4,
        skillCalc: "PER/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "empatia_mental",
        name: "Empatía mental",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(VOL+INT)/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Thals"]
    },
    {
        id: "empatia_tecnologica",
        name: "Empatía tecnológica",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "explosividad",
        name: "Explosividad",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "CON",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "furia",
        name: "Furia",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "CON/2",
        types: ["Físico"],
        origins: ["Sobrenatural"]
    },
    {
        id: "fusion",
        name: "Fusión",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(CON+FUE)/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "grito_sonico",
        name: "Grito sónico",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "CON",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "incremento_vital",
        name: "Incremento vital",
        formula: "5+(Rango/10)",
        cost: 5,
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "invisibilidad",
        name: "Invisibilidad",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "CON/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico"]
    },
    {
        id: "invulnerabilidad",
        name: "Invulnerabilidad",
        formula: "4+(Rango/10)",
        cost: 4,
        options: ["Magia", "Temperaturas extremas"],
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "multiformidad",
        name: "Multiformidad",
        formula: "5+(Rango/10)",
        cost: 5,
        options: ["CON", "AGI", "INT", "PER"],
        skillCalc: "(AGI+CON)/2",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        id: "plasticidad",
        name: "Plasticidad",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "CON/2",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "polilocacion",
        name: "Polilocación",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "CON/2",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "postcognicion",
        name: "Postcognición",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "potenciar",
        name: "Potenciar",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "PER/2",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "precognicion",
        name: "Precognición",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "regeneracion_de_tejidos",
        name: "Regeneración de tejidos",
        formula: "5+(Rango/10)",
        cost: 5,
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "superagilidad",
        name: "Superagilidad",
        formula: "(AGI Final - AGI Inicial)/10",
        cost: 0,
        characteristic: "AGI",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "superapariencia",
        name: "Superapariencia",
        formula: "(APA Final - APA Inicial)/10",
        cost: 0,
        characteristic: "APA",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "superconstitucion",
        name: "Superconstitución",
        formula: "(CON Final - CON Inicial)/10",
        cost: 0,
        characteristic: "CON",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        id: "superfuerza",
        name: "Superfuerza",
        formula: "(FUE Final - FUE Inicial)/10",
        cost: 0,
        characteristic: "FUE",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        id: "superhabilidad",
        name: "Superhabilidad",
        formula: "5+(Rango/10)",
        cost: 5,
        options: ["Habilidad"],
        types: ["Físico", "Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "superinteligencia",
        name: "Superinteligencia",
        formula: "(INT Final - INT Inicial)/10",
        cost: 0,
        characteristic: "INT",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        id: "superpercepcion",
        name: "Superpercepción",
        formula: "(PER Final - PER Inicial)/10",
        cost: 0,
        characteristic: "PER",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "supervelocidad",
        name: "Supervelocidad",
        formula: "5+((AGI Final - AGI Inicial)/10)",
        cost: 5,
        skillCalc: "AGI",
        characteristic: "AGI",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "supervoluntad",
        name: "Supervoluntad",
        formula: "(VOL Final - VOL Inicial)/10",
        cost: 0,
        characteristic: "VOL",
        types: ["Psíquico"],
        origins: ["Sobrenatural"]
    },
    {
        id: "telepatia",
        name: "Telepatía",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(INT+VOL)/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "teleportacion",
        name: "Teleportación",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "PER/2",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "telequinesis",
        name: "Telequinesis",
        formula: "7+(Rango/10)",
        cost: 7,
        skillCalc: "PER",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "traduccion_de_lenguas",
        name: "Traducción de lenguas",
        formula: "5+(Rango/10)",
        cost: 5,
        skillCalc: "(PER+INT)/2",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico"]
    },
    {
        id: "vincular",
        name: "Vincular",
        formula: "6+(Rango/10)",
        cost: 6,
        skillCalc: "(VOL+PER)/3",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "volar",
        name: "Volar",
        formula: "3+(Rango/10)",
        cost: 3,
        skillCalc: "AGI/2",
        types: ["Psíquico", "Físico", "Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Divino", "Sobrenatural", "Cósmico"]
    }
];
