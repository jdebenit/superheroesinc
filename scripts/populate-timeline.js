
import fs from 'fs';
import path from 'path';

const events = [
    {
        title: "Dante crea Purgatorio",
        date: "2000-01-01",
        description: "El activista mutante Edgar Columbus vuelve del futuro convertido en Dante y ocupa una isla frente a Ecuador. Nace Purgatorio. Primer ataque de Ecuador.",
        tags: ["politica", "purgatorio", "dante"]
    },
    {
        title: "Proyecto TecnoRED",
        date: "2000-06-01",
        description: "El Parlamento Europeo aprueba de manera oficial el Proyecto TecnoRED.",
        tags: ["tecnologia", "europa"]
    },
    {
        title: "Ancient Gods",
        date: "2001-01-01",
        description: "Morgan L. Fay publica Ancient Gods. Boom de la fantasía y la magia.",
        tags: ["cultura", "magia"]
    },
    {
        title: "Los Arcontes y Tratado de No Agresión",
        date: "2002-01-01",
        description: "Fin del Frente de Liberación Mutante. Creación de Los Arcontes en Purgatorio. Segundo ataque de Ecuador y firma de tratado de no agresión.",
        tags: ["politica", "purgatorio", "guerra"]
    },
    {
        title: "Retiro de Jinete Nocturno",
        date: "2003-01-01",
        description: "Jinete Nocturno (David Martín) se retira tras un accidente.",
        tags: ["personaje", "retiro"]
    },
    {
        title: "Nacimiento de Diana Martín (Estrella)",
        date: "2004-01-01",
        description: "Nace Diana Martín Benizellos, hija de Euroman y Europa. Es entregada en adopción a David Martín.",
        tags: ["personaje", "nacimiento"]
    },
    {
        title: "Revelación de Dante",
        date: "2005-01-01",
        description: "Dante desvela ser Edgar Columbus procedente del futuro.",
        tags: ["personaje", "revelacion"]
    },
    {
        title: "Memorias de Audrey Gein",
        date: "2006-01-01",
        description: "Audrey Gein publica 'Yo soy Tech Weapon', revelando su identidad.",
        tags: ["personaje", "publicacion"]
    },
    {
        title: "Tercer Conflicto Ecuador-Purgatorio",
        date: "2007-01-01",
        description: "Tercer conflicto armado entre Ecuador y Purgatorio.",
        tags: ["guerra", "purgatorio"]
    },
    {
        title: "UMBRA ENTERPRISES",
        date: "2008-01-01",
        description: "De Ugarte Communications absorbe IDESS y H.U.M.A.N.S. para formar UMBRA ENTERPRISES. Inicia la Era del Cine Metahumano.",
        tags: ["organizacion", "negocios", "cine"]
    },
    {
        title: "Segundo Ragnarök",
        date: "2009-01-01",
        description: "Heimdall, Sif y Loki llegan a la Tierra. Enfrentamiento en la Antártida con Thor y Tyr. Mueren Tyr, Heimdall y Sif. Loki derrota a Thor y salva el mundo.",
        tags: ["evento", "dioses", "batalla"]
    },
    {
        title: "Guerra de la Media Noche",
        date: "2010-01-01",
        description: "Grupo metahumano (presumiblemente EEUU) asesina a Dante. Desmantelamiento Winter Office.",
        tags: ["guerra", "asesinato", "purgatorio"]
    },
    {
        title: "Nacimiento de Paraíso",
        date: "2011-01-01",
        description: "Orfeo gana las elecciones. Purgatorio pasa a llamarse Paraíso y es aceptada en la ONU. Descubrimiento de Athalne.",
        tags: ["politica", "paraiso", "orfeo"]
    },
    {
        title: "La TecnoGuerra",
        date: "2012-01-01",
        description: "La TecnoGuerra. Incontables muertes. Desmantelamiento de TecnoRED. Estreno de 'EuroForce'.",
        tags: ["evento", "guerra", "tecnored"]
    },
    {
        title: "La Tecnomante y CEAM",
        date: "2013-01-01",
        description: "Fundación del CEAM por la UE. Audrey Gein se transforma en La Tecnomante.",
        tags: ["personaje", "transformacion", "politica"]
    },
    {
        title: "Formación del CISS",
        date: "2014-03-01",
        description: "Formación del Consejo Internacional de Superseguridad (CISS) por la ONU.",
        tags: ["organizacion", "onu"]
    },
    {
        title: "Evento Inframundo",
        date: "2014-11-01",
        description: "Aparece Isis y busca a Geb (Seísmo). Formación Liga del Caos. Seísmo absorbido por grieta dimensional.",
        tags: ["evento", "batalla", "dioses"]
    },
    {
        title: "COSMOS e IRIS",
        date: "2015-01-01",
        description: "Fundación de COSMOS y su grupo dependiente IRIS.",
        tags: ["organizacion", "espacio"]
    },
    {
        title: "Traición de Penumbra",
        date: "2016-01-01",
        description: "Penumbra traiciona a Nature Corps por Sacred Spirit. Atentado de Ocaso Negro.",
        tags: ["personaje", "traicion", "terrorismo"]
    },
    {
        title: "EEUU abandona CISS",
        date: "2017-02-01",
        description: "EEUU abandona el CISS y crea el American Bureau for Post-Humans. CISS se traslada a Ginebra.",
        tags: ["politica", "usa", "ciss"]
    },
    {
        title: "Atentado CISS Ginebra",
        date: "2017-12-01",
        description: "Atentado terrorista en la sede suiza del CISS.",
        tags: ["terrorismo", "ciss"]
    },
    {
        title: "Inercia Directora SHI",
        date: "2018-01-01",
        description: "Inercia es nombrada Directora de Operaciones de Superheroes INC.",
        tags: ["organizacion", "shi", "inercia"]
    },
    {
        title: "Antiheroes Limited",
        date: "2018-02-01",
        description: "Se pone en marcha Antiheroes Limited para cazar superhéroes problemáticos.",
        tags: ["organizacion", "shi"]
    },
    {
        title: "Sociedad Latinoamericana",
        date: "2018-06-01",
        description: "El CLC crea la Sociedad Latinoamericana de Superseres.",
        tags: ["organizacion", "latinoamerica"]
    },
    {
        title: "UNIT3",
        date: "2018-10-01",
        description: "En España se funda UNIT3.",
        tags: ["organizacion", "espana"]
    },
    {
        title: "Asesinato de Euroman",
        date: "2019-01-01",
        description: "Euroman es asesinado por El Apátrida. Desaparece Europa. Movimiento Anti-Humano en Paraíso.",
        tags: ["evento", "muerte", "euroman"]
    },
    {
        title: "Fin del Brexit y CISS",
        date: "2020-01-31",
        description: "Reino Unido deja CEAM. Epsilon Eridani aceptado en UE y CISS.",
        tags: ["politica", "brexit", "epsilon-eridani"]
    },
    {
        title: "King's Knights",
        date: "2020-02-01",
        description: "Fundación de los King's Knights (Reino Unido).",
        tags: ["grupo", "uk"]
    },
    {
        title: "Pandemia 2020",
        date: "2020-03-01", // Primavera
        description: "Pandemia a nivel internacional. Cuarentena. Héroes ayudan a servicios sanitarios.",
        tags: ["evento", "pandemia"]
    },
    {
        title: "Base Erebus y Cerbero",
        date: "2020-06-01", // Verano
        description: "Termina construcción base espacial Erebus y ampliación satélite Cerbero.",
        tags: ["tecnologia", "espacio"]
    },
    {
        title: "Estrella recibe herencia",
        date: "2020-09-01", // Otoño
        description: "Diana Martín recibe Archivos de Euroman y nace la superheroína Estrella.",
        tags: ["personaje", "origen", "estrella"]
    },
    {
        title: "La Llegada de los Jóvenes Dioses",
        date: "2020-12-01",
        description: "La Llegada de los Jóvenes Dioses a las costas de Irlanda.",
        tags: ["evento", "dioses"]
    }
];

const targetDir = path.resolve('d:/dev/shi/src/content/timeline');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

events.forEach(event => {
    const slug = event.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const content = `---
title: "${event.title}"
date: ${event.date}
description: "${event.description.replace(/"/g, '\\"')}"
reality: "Principal"
icon: "star"
tags: ${JSON.stringify(event.tags)}
---
`;

    fs.writeFileSync(path.join(targetDir, `${slug}.md`), content);
    console.log(`Created ${slug}.md`);
});
