export type PowerType = "Físico" | "Psíquico" | "Energético";

export interface Power {
    name: string;
    cost: string;
    types: PowerType[];
    origins: string[];
}

export const POWERS: Power[] = [
    {
        name: "Ablación",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Absorción de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Absorción de poderes",
        cost: "10+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Vampírico"]
    },
    {
        name: "Absorción de vida",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Agresión psiónica",
        cost: "8+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        name: "Anulación de poderes",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        name: "Ataque especial",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Blindaje natural",
        cost: "10+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Cambio de estado",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Cambio de la densidad",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Cambio de tamaño",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Sobrenatural"]
    },
    {
        name: "Campo de fuerza",
        cost: "5+(Rango/10)",
        types: ["Energético", "Físico", "Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Thals"]
    },
    {
        name: "Congelación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Control de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Control de la geodinámica",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Control de la probabilidad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        name: "Control de la vegetación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Control de moléculas ajenas",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Control del agua",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Control del clima",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Control del fuego",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Control del organismo",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante"]
    },
    {
        name: "Conversión de materia",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Dominación mental",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        name: "Donación de vida",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        name: "Elasticidad",
        cost: "7+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        name: "Emisión de energía",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Empatía animal",
        cost: "4+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Empatía mental",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Thals"]
    },
    {
        name: "Empatía tecnológica",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante"]
    },
    {
        name: "Explosividad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Furia",
        cost: "7+(Rango/10)",
        types: ["Físico"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Fusión",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Grito sónico",
        cost: "6+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian"]
    },
    {
        name: "Incremento vital",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Invisibilidad",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico"]
    },
    {
        name: "Invulnerabilidad",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Multiformidad",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Plasticidad",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Polilocación",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Postcognición",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Potenciar",
        cost: "7+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Precognición",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Sobrenatural"]
    },
    {
        name: "Regeneración de tejidos",
        cost: "5+(Rango/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Superagilidad",
        cost: "(AGI Final - AGI Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Superapariencia",
        cost: "(APA Final - APA Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Superconstitución",
        cost: "(CON Final - CON Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        name: "Superfuerza",
        cost: "(FUE Final - FUE Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Sobrenatural"]
    },
    {
        name: "Superhabilidad",
        cost: "5+(Rango/10)",
        types: ["Psíquico", "Físico"],
        origins: ["Alterado", "Mutante", "Vampírico", "Sobrenatural"]
    },
    {
        name: "Superinteligencia",
        cost: "(INT Final - INT Inicial)/10",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Cósmico", "Divino"]
    },
    {
        name: "Superpercepción",
        cost: "(PER Final - PER Inicial)/10",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Supervelocidad",
        cost: "5+((AGI Final - AGI Inicial)/10)",
        types: ["Físico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino"]
    },
    {
        name: "Supervoluntad",
        cost: "(VOL Final - VOL Inicial)/10",
        types: ["Psíquico"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Telepatía",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        name: "Teleportación",
        cost: "5+(Rango/10)",
        types: ["Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico", "Divino", "Sobrenatural"]
    },
    {
        name: "Telequinesis",
        cost: "7+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Thals"]
    },
    {
        name: "Traducción de lenguas",
        cost: "5+(Rango/10)",
        types: ["Psíquico"],
        origins: ["Alterado", "Mutante", "Guardian", "Cósmico"]
    },
    {
        name: "Vincular",
        cost: "4+(Rango/10)",
        types: ["Energético"],
        origins: ["Sobrenatural"]
    },
    {
        name: "Volar",
        cost: "3+(Rango/10)",
        types: ["Psíquico", "Físico", "Energético"],
        origins: ["Alterado", "Mutante", "Guardian", "Vampírico", "Divino", "Sobrenatural"]
    }
];
