export type PowerType = "Físico" | "Psíquico" | "Energético";

export interface Power {
    id: string;
    name: string;
    cost: string;
    types: PowerType[];
    origins: string[];
}

export const POWERS: Power[] = [
    {
        id: "ablacion",
        name: "Ablación",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "absorcion_de_energia",
        name: "Absorción de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        id: "absorcion_de_poderes",
        name: "Absorción de poderes",
        cost: "10+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Vampírico"]
    },
    {
        id: "absorcion_de_vida",
        name: "Absorción de vida",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "agresion_psionica",
        name: "Agresión psiónica",
        cost: "8+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "anulacion_de_poderes",
        name: "Anulación de poderes",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        id: "ataque_especial",
        name: "Ataque especial",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "blindaje_natural",
        name: "Blindaje natural",
        cost: "10+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "cambio_de_estado",
        name: "Cambio de estado",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "cambio_de_la_densidad",
        name: "Cambio de la densidad",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "cambio_de_tamano",
        name: "Cambio de tamaño",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        id: "campo_de_fuerza",
        name: "Campo de fuerza",
        cost: "5+(Rango/10)",
        types: ["Energético", "Físico", "Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Thals"]
    },
    {
        id: "congelacion",
        name: "Congelación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "control_de_energia",
        name: "Control de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "control_de_la_geodinamica",
        name: "Control de la geodinámica",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_de_la_probabilidad",
        name: "Control de la probabilidad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "control_de_la_vegetacion",
        name: "Control de la vegetación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_de_moleculas_ajenas",
        name: "Control de moléculas ajenas",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "control_del_agua",
        name: "Control del agua",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_del_clima",
        name: "Control del clima",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "control_del_fuego",
        name: "Control del fuego",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "control_del_organismo",
        name: "Control del organismo",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "conversion_de_materia",
        name: "Conversión de materia",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "dominacion_mental",
        name: "Dominación mental",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "donacion_de_vida",
        name: "Donación de vida",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        id: "elasticidad",
        name: "Elasticidad",
        cost: "7+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "emision_de_energia",
        name: "Emisión de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "empatia_animal",
        name: "Empatía animal",
        cost: "4+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "empatia_mental",
        name: "Empatía mental",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Thals"]
    },
    {
        id: "empatia_tecnologica",
        name: "Empatía tecnológica",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        id: "explosividad",
        name: "Explosividad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "furia",
        name: "Furia",
        cost: "7+(Rango/10)",
        types: ["Físico"],
        origins: ["Sobrenatural"]
    },
    {
        id: "fusion",
        name: "Fusión",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "grito_sonico",
        name: "Grito sónico",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        id: "incremento_vital",
        name: "Incremento vital",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "invisibilidad",
        name: "Invisibilidad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico"]
    },
    {
        id: "invulnerabilidad",
        name: "Invulnerabilidad",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "multiformidad",
        name: "Multiformidad",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        id: "plasticidad",
        name: "Plasticidad",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "polilocacion",
        name: "Polilocación",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "postcognicion",
        name: "Postcognición",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "potenciar",
        name: "Potenciar",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "precognicion",
        name: "Precognición",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        id: "regeneracion_de_tejidos",
        name: "Regeneración de tejidos",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "superagilidad",
        name: "Superagilidad",
        cost: "(AGI Final - AGI Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "superapariencia",
        name: "Superapariencia",
        cost: "(APA Final - APA Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "superconstitucion",
        name: "Superconstitución",
        cost: "(CON Final - CON Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        id: "superfuerza",
        name: "Superfuerza",
        cost: "(FUE Final - FUE Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        id: "superhabilidad",
        name: "Superhabilidad",
        cost: "5+(Rango/10)",
        types: ["Psíquico", "Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        id: "superinteligencia",
        name: "Superinteligencia",
        cost: "(INT Final - INT Inicial)/10",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        id: "superpercepcion",
        name: "Superpercepción",
        cost: "(PER Final - PER Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "supervelocidad",
        name: "Supervelocidad",
        cost: "5+((AGI Final - AGI Inicial)/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        id: "supervoluntad",
        name: "Supervoluntad",
        cost: "(VOL Final - VOL Inicial)/10",
        types: ["Psíquico"],
        origins: ["Sobrenatural"]
    },
    {
        id: "telepatia",
        name: "Telepatía",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "teleportacion",
        name: "Teleportación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        id: "telequinesis",
        name: "Telequinesis",
        cost: "7+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        id: "traduccion_de_lenguas",
        name: "Traducción de lenguas",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico"]
    },
    {
        id: "vincular",
        name: "Vincular",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        id: "volar",
        name: "Volar",
        cost: "3+(Rango/10)",
        types: ["Psíquico", "Físico", "Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Divino", "Sobrenatural"]
    }
];
