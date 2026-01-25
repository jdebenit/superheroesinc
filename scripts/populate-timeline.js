
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
    },
    // Batch 5 (2001 - 2024)
    {
        title: "Publicación de los Textos de Ort",
        date: "2001-01-01",
        description: "La hechicera Morgan L. Fay, en contra de los designios de la Alianza, publica los textos sagrados de la ciudad de Ort y otros textos arcanos codificados en una serie de novelas.",
        tags: ["morgan-le-fay", "alianza", "2001"]
    },
    {
        title: "La Trampa de Mad Skull",
        date: "2003-01-01",
        description: "Casi todos los miembros de los Cazadores de Sombras mueren en una trampa tramada por Mad Skull.",
        tags: ["cazadores-de-sombras", "mad-skull", "2003"],
        icon: "skull"
    },
    {
        title: "Estallido de Energía Mágica",
        date: "2004-01-01",
        description: "Una gran fuente de energía mágica se detecta brevemente en la Tierra. Muchos seres místicos detectan este estallido y se ponen a buscar su origen.",
        tags: ["magia", "misticismo", "2004"]
    },
    {
        title: "Revelación de los Dioses",
        date: "2006-01-01",
        description: "La conocida Superheroína Primaria, la diosa Diana, revela oficialmente la existencia de los dioses al mundo. Mónica Martín García, alter ego de Kigala, crea la Fundación Divina Mundial.",
        tags: ["diana", "kigala", "dioses", "2006"]
    },
    {
        title: "Profecía de Sibila a Umbra",
        date: "2008-01-01",
        description: "Una joven Sibila revela a Umbra una visión crucial: está destinada a jugar un papel clave en la salvación de su mundo y debe crecer en poder para evitar la destrucción.",
        tags: ["sibila", "umbra", "profecia", "2008"]
    },
    {
        title: "Caída de la Muralla de Ra",
        date: "2009-01-01",
        description: "Cae la muralla de Ra. Apofis, el Destructor, y la divinidad suprema Ra mueren en un cruento enfrentamiento que destruye gran parte del Reino Divino de Asgard.",
        tags: ["ra", "apofis", "asgard", "2009"],
        icon: "skull"
    },
    {
        title: "Muerte de Estrella y Llegada de Nigalión",
        date: "2014-07-01",
        description: "Muere Estrella, la princesa de Terra. El dios Geb (Seísmo) abre un vórtice y Nigalión se abre paso a la Tierra.",
        tags: ["estrella", "seismo", "nigalion", "2014"],
        icon: "skull"
    },
    {
        title: "El Camino de Myrddin",
        date: "2014-10-31",
        description: "Un humano que dice ser la reencarnación del bardo Taliesin abre el camino de Myrddin hacia las tierras de Avalon cerca de Carmarthen.",
        tags: ["taliesin", "myrddin", "avalon", "2014"]
    },
    {
        title: "Diplomacia Avalon-Reino Unido",
        date: "2015-01-01",
        description: "Se inician conversaciones diplomáticas entre Avalon y el Reino Unido.",
        tags: ["avalon", "uk", "diplomacia", "2015"]
    },
    {
        title: "Descubrimiento de la Torre del Mal",
        date: "2018-01-01",
        description: "Los Atlantes descubren una Torre del Mal en una ciudad maldita sumergida milenios antes de la adopción de su vida acuática.",
        tags: ["atlantes", "torre-del-mal", "2018"]
    },
    {
        title: "Tratado de Carmarthen",
        date: "2020-02-01",
        description: "Se firma en secreto el Tratado de Carmarthen entre Oberon y la Reina de Inglaterra, reavivando el Pacto de las Edades.",
        tags: ["oberon", "uk", "tratado", "2020"]
    },
    {
        title: "Fundación de los Irregulares",
        date: "2021-01-01",
        description: "Se fundan los Irregulares.",
        tags: ["irregulares", "grupo", "2021"]
    },
    {
        title: "Nuevos Cazadores de Sombras",
        date: "2022-01-01",
        description: "Jade reúne a los nuevos Cazadores de Sombras tras la aparición de una mujer llamada Medianoche.",
        tags: ["jade", "cazadores-de-sombras", "medianoche", "2022"]
    },
    {
        title: "República Popular de la Antártida y Cruzada de Kigala",
        date: "2024-01-01",
        description: "Nacimiento de la República Popular de la Antártida. Kigala inicia una cruzada para reunir héroes ante la creciente amenaza, reclutando a Reina Mona de los Irregulares.",
        tags: ["antartida", "kigala", "reina-mona", "2024"]
    },
    // Batch Ancient (Ancient eras)
    {
        title: "El Orbe Sagrado y la Gran Barrera",
        date: "-1000-01-01", // Approx Siglo X AC
        displayDate: "Siglo X AC",
        description: "El Orbe Sagrado desaparece, y una Gran Barrera se erige, bloqueando el acceso de los reinos divinos a la Tierra. Los dioses pierden su influencia. En Ort, se redactan textos sagrados con la verdadera historia de los dioses.",
        tags: ["orbe-sagrado", "gran-barrera", "ort", "siglo-x-ac"]
    },
    {
        title: "El Poeta Quin-Jao Sen",
        date: "-0600-01-01", // Approx Siglo VI AC
        displayDate: "Siglo VI AC",
        description: "El poeta Quin-Jao Sen desaparece durante 12 años y vuelve sin haber envejecido, con objetos e instrumentos increíbles. Escribe un poema sobre su encuentro con una ciudad más allá del tiempo y el espacio.",
        tags: ["quin-jao-sen", "siglo-vi-ac"]
    },
    {
        title: "Maldición de Castáphilo",
        date: "0050-01-01", // Approx Siglo I
        displayDate: "Siglo I",
        description: "Castáphilo es maldito por un poderoso Avatar a vivir eternamente sin posesiones ni hogar hasta redimirse. Adopta el nombre de Centurión y se convierte en el soldado eterno.",
        tags: ["castaphilo", "centurion", "siglo-i"]
    },
    {
        title: "Desaparición de la Novena Legión",
        date: "0120-01-01", // Approx Siglo II
        displayDate: "Siglo II",
        description: "La Novena Legión Hispana desaparece en Britania. Según Castáphilo, formaron una alianza con los Pictos para combatir un gran mal emergente.",
        tags: ["novena-legion", "castaphilo", "siglo-ii"]
    },
    {
        title: "Thor y la Gran Barrera",
        date: "0350-01-01", // Approx Siglo IV
        displayDate: "Siglo IV",
        description: "Thor sacrifica a su cabra Tanngrisnir para atravesar la Gran Barrera y buscar el Orbe Sagrado. Viaja por el mundo sin éxito y regresa sacrificando a Tanngnjóstr.",
        tags: ["thor", "gran-barrera", "siglo-iv"]
    },
    {
        title: "Myrddin Wyllt y el Pacto de las Edades",
        date: "0500-01-01", // Siglo V y VI
        displayDate: "Siglo V y VI",
        description: "Myrddin Wyllt establece un vínculo entre Avalon y Gales. Bajo el liderazgo del Rey Arturo se firma 'El Pacto de las Edades', instaurando paz y colaboración entre humanos y seres mágicos, iniciando una era dorada de magia.",
        tags: ["myrddin", "rey-arturo", "avalon", "pacto-de-las-edades", "siglo-v", "siglo-vi"]
    },
    // Batch Middle Ages & Renaissance
    {
        title: "El Ocultamiento de la Biblioteca de Alejandría",
        date: "0650-01-01", // Siglo VII
        displayDate: "Siglo VII",
        description: "Un concilio de magos transfiere los textos de la Biblioteca de Alejandría a una realidad periférica y simula su destrucción en un incendio para proteger el conocimiento arcano.",
        tags: ["biblioteca-alejandria", "magos", "siglo-vii"]
    },
    {
        title: "Batalla del Heraldo de Gea",
        date: "0774-01-01", // Año 774 (Siglo VIII)
        displayDate: "Siglo VIII (774)",
        description: "En 774, un Heraldo de Gea muere combatiendo a 13 demonios de Nigalión. Su energía cósmica se dispersa y los demonios atormentan a la humanidad durante 400 años.",
        tags: ["heraldo-de-gea", "nigalion", "siglo-viii", "774"],
        icon: "skull"
    },
    {
        title: "Expedición de Preste Juan (Medianoche)",
        date: "1150-01-01", // Siglo XII
        displayDate: "Siglo XII",
        description: "Medianoche, conocido como Preste Juan, lidera una expedición con héroes europeos para capturar a los demonios de Nigalión. Desaparecen tras la batalla, dejando el manuscrito Voynich.",
        tags: ["medianoche", "preste-juan", "nigalion", "siglo-xii"]
    },
    {
        title: "Auge de la Inquisición",
        date: "1250-01-01", // Siglo XIII
        displayDate: "Siglo XIII",
        description: "Tras las advertencias de Preste Juan, el miedo a los demonios impulsa a la Inquisición a cazar practicantes de magia y buscar conocimientos arcanos para combatir la amenaza.",
        tags: ["inquisicion", "magia", "siglo-xiii"]
    },
    {
        title: "La Peste Negra y la Caza de Brujas",
        date: "1347-01-01", // Siglo XIV
        displayDate: "Siglo XIV",
        description: "La Peste Negra devasta Europa. Se culpa a la magia negra, intensificando las persecuciones de la Inquisición, que utiliza la crisis para consolidar su poder.",
        tags: ["peste-negra", "inquisicion", "siglo-xiv"],
        icon: "skull"
    },
    {
        title: "Los Buscadores del Orbe",
        date: "1450-01-01", // Siglo XV
        displayDate: "Siglo XV",
        description: "Desaparecen los asentamientos vikingos en Groenlandia. Sus habitantes se convierten en 'Los Buscadores', siguiendo los pasos de Thor en busca del Orbe Sagrado.",
        tags: ["vikingos", "orbe-sagrado", "thor", "siglo-xv"]
    },
    {
        title: "Llegada a Cronópolis",
        date: "1501-01-01",
        description: "Los Buscadores llegan a la ciudad de Cronópolis, más allá del tiempo, esperando encontrar pistas sobre el Orbe Sagrado.",
        tags: ["cronopolis", "buscadores", "1501"]
    },
    {
        title: "Warlock contra T'Kaarnal",
        date: "1513-01-01",
        description: "El mago Warlock, junto a una elfa y un caballero, derrota al demonio T'Kaarnal (Mad Skull) en el Sacro Imperio Romano Germánico.",
        tags: ["warlock", "mad-skull", "1513"]
    },
    {
        title: "Vida de Giordano Bruno",
        date: "1548-01-01",
        displayDate: "1548-1583",
        description: "Giordano Bruno nace en Nola (1548), estudia lo arcano y desarrolla teorías sobre el universo infinito. Huye de la Inquisición en 1583.",
        tags: ["giordano-bruno", "inquisicion", "1548"]
    },
    {
        title: "Giordano Bruno y el Vórtice Temporal",
        date: "1584-01-01",
        description: "Giordano Bruno es arrastrado por un vórtice, viaja en el tiempo y derrota al demonio T'Kaarnal para cerrar una paradoja temporal.",
        tags: ["giordano-bruno", "viaje-temporal", "1584"]
    },
    {
        title: "Ejecución de Giordano Bruno",
        date: "1600-02-17",
        displayDate: "1585 en adelante",
        description: "Bruno continúa su obra en Ginebra e Inglaterra. Finalmente es arrestado y ejecutado en la hoguera en Roma, pero su legado arcano perdura.",
        tags: ["giordano-bruno", "inquisicion", "muerte", "1600"],
        icon: "skull"
    },
    {
        title: "Publicación de Daemonologie",
        date: "1604-01-01",
        description: "El Rey James I publica Daemonologie, exacerbando la persecución sobrenatural. Hombres lobo huyen a América, vampiros al Este, y Avalon cierra sus puertas. Se rumorea que el rey está poseído.",
        tags: ["james-i", "avalon", "hombres-lobo", "vampiros", "1604"]
    },
    // Batch Modern Age & 20th Century
    {
        title: "Princesa Estrella en la Nave Dorkan",
        date: "1609-01-01",
        description: "La princesa Estrella, hija del Rey Santiago I de Iberia, acaba en Tierra Zero tras un hechizo fallido y queda atrapada en una nave Dorkan encerrada en un glaciar durante casi 400 años.",
        tags: ["estrella", "rey-santiago-i", "dorkan", "1609"]
    },
    {
        title: "Juicios de Salem y Samuel Harris",
        date: "1692-01-01",
        description: "Tras la muerte de James I, el espíritu demoníaco posee a Samuel Harris en Salem. Su influencia exacerba la paranoia y los juicios por brujería, resultando en 20 ejecuciones.",
        tags: ["salem", "samuel-harris", "james-i", "brujeria", "1692"],
        icon: "skull"
    },
    {
        title: "Fundación de los Illuminati",
        date: "1776-05-01", // Siglo XVIII
        displayDate: "1776",
        description: "Adam Weishaupt funda la Orden de los Illuminati en Baviera. Inicialmente racionalistas, cambian hacia el control de lo oculto tras encontrar a un soldado inmortal. Un terremoto destruye su sede y el soldado desaparece.",
        tags: ["illuminati", "adam-weishaupt", "soldado-inmortal", "1776"]
    },
    {
        title: "Los Carbonarios",
        date: "1810-01-01", // Siglo XIX
        displayDate: "Siglo XIX (1810-1848)",
        description: "Surgen los Carbonarios en Italia, financiados por un personaje misterioso. Participan en luchas políticas y unificadoras (1820, 1821, 1831, 1848) mientras buscan y roban artefactos mágicos.",
        tags: ["carbonarios", "italia", "artefactos", "siglo-xix"]
    },
    {
        title: "Operativo Antracita",
        date: "1849-01-01",
        description: "El operativo Antracita de los Carbonarios se infiltra en los archivos vaticanos durante la defensa de la República Romana y saquea gran parte de lo que allí guardaban.",
        tags: ["carbonarios", "vaticano", "antracita", "1849"]
    },
    {
        title: "Unificación Italiana y Carbonarios",
        date: "1861-01-01",
        description: "Con la unificación italiana bajo Garibaldi y Cavour, los Carbonarios restantes abandonan la política para dedicarse exclusivamente al robo de artefactos mágicos para fines desconocidos.",
        tags: ["carbonarios", "garibaldi", "italia", "1861"]
    },
    {
        title: "Renacimiento de la Magia Moderna",
        date: "1860-01-01",
        description: "Eliphas Levi publica 'Dogma y ritual de la alta magia', revolucionando el esoterismo. Surgen la Sociedad Teosófica (1875) y la Orden Hermética de la Aurora Dorada.",
        tags: ["eliphas-levi", "magia", "aurora-dorada", "teosofia", "1860", "1875"]
    },
    {
        title: "Aleister Crowley y la Aurora Dorada",
        date: "1899-01-01",
        description: "Aleister Crowley se une a la Orden Hermética de la Aurora Dorada, explorando dimensiones ocultas y contactando entidades sobrenaturales.",
        tags: ["aleister-crowley", "aurora-dorada", "1899"]
    },
    {
        title: "El Libro de la Ley y Thelema",
        date: "1904-01-01", // 1900-1920
        displayDate: "1900-1920",
        description: "Crowley escribe 'El Libro de la Ley' y funda Thelema, afirmando haber contactado con el mago Giordano Bruno. Se publica 'El Kybalion'. Santiago Ramón y Cajal prueba la existencia de metahumanos en España.",
        tags: ["crowley", "thelema", "giordano-bruno", "kybalion", "ramon-y-cajal", "metahumanos"]
    },
    {
        title: "Maldición de Tutankamón",
        date: "1925-01-01",
        description: "Howard Carter descubre la tumba de Tutankamón. La apertura libera una poderosa entidad atrapada, desatando la 'Maldición de Tutankamón'.",
        tags: ["howard-carter", "tutankamon", "maldicion", "1925"],
        icon: "skull"
    },
    {
        title: "Los Últimos Buscadores en Stonehenge",
        date: "1927-01-01",
        description: "En Stonehenge, el grupo 'Los últimos buscadores' intenta derribar la barrera mágica y desaparece durante la ceremonia.",
        tags: ["stonehenge", "buscadores", "1927"]
    },
    {
        title: "Grietas en la Gran Barrera",
        date: "1929-01-01",
        description: "La Alianza intenta disipar una energía elemental controlada por un ente liberado en 1925 y accidentalmente crea grandes grietas en la Gran Barrera, reabriendo caminos a los Reinos Divinos.",
        tags: ["alianza", "gran-barrera", "1929"]
    },
    {
        title: "Preparación para las Guerras Gamadas",
        date: "1930-01-01", // 1930-40s
        displayDate: "1930s-40s",
        description: "La Orden de los Magos Blancos recluta miembros ante la premonición de las Guerras Gamadas. Madame Blavatsky recibe revelaciones tergiversadas. Los Carbonarios se infiltran en la Sociedad Teosófica.",
        tags: ["magos-blancos", "guerras-gamadas", "blavatsky", "carbonarios"]
    },
    {
        title: "Comienzo de las Guerras Gamadas",
        date: "1938-01-01",
        description: "Comienzan las Guerras Gamadas. Demencia y el Círculo del Nigalión crean horrores. Castáphilo se une al Nacional Socialismo para orientarlos en lo oculto.",
        tags: ["guerras-gamadas", "demencia", "nigalion", "castaphilo", "nazi", "1938"],
        icon: "skull"
    },
    {
        title: "Incidente en Cerdeña y Rescate de Flecha Roja",
        date: "1939-01-01",
        description: "El ente demoníaco Lamia es liberado en Cerdeña. Un equipo (Desertor, Blue Phoenix, etc.) rescata a Flecha Roja. La máscara de Lamia se pierde en el mar.",
        tags: ["lamia", "cerdena", "flecha-roja", "desertor", "1939"]
    },
    {
        title: "Tumba del Chamán",
        date: "1940-01-01",
        description: "Descubrimiento de la Tumba del Chamán en Mongolia con artefactos de magia de sangre. Una caja china con una rosa negra desaparece.",
        tags: ["mongolia", "magia-sangre", "1940"]
    },
    {
        title: "Desaparición de Heinrich Krauss",
        date: "1942-01-01",
        description: "El ocultista alemán Heinrich Krauss desaparece tras intentar invocar a un ser de otra esfera durante la Segunda Guerra Mundial.",
        tags: ["heinrich-krauss", "wwii", "1942"]
    },
    {
        title: "Fin de la SGM y Sociedad de los Susurros",
        date: "1945-01-01",
        description: "Finaliza la SGM. Desaparece la Lanza del Destino. Aparece la Sociedad de los Susurros, dedicada a rituales antiguos de invocación.",
        tags: ["wwii", "lanza-destino", "sociedad-susurros", "1945"]
    },
    {
        title: "Grimorio en Islandia",
        date: "1951-01-01",
        description: "Unos niños descubren un antiguo grimorio para controlar el clima en las ruinas de un monasterio en Islandia.",
        tags: ["islandia", "grimorio", "clima", "1951"]
    },
    {
        title: "Incidente en Isla Muró",
        date: "1954-01-01",
        description: "El ejército soviético detona una arma nuclear en la isla Muró para cerrar el acceso a un Nexo. Surgen rumores sobre sociedades secretas en los programas espaciales.",
        tags: ["urss", "isla-muro", "nexo", "nuclear", "1954"]
    },
    // Batch Late 20th Century (1955-2000)
    {
        title: "Llegada de Connor",
        date: "1955-01-01",
        description: "Una refugiada de Terra llega a Tierra Zero huyendo de Nigalión. Esconde a su hijo Connor en las islas Hébridas con una pareja escocesa antes de regresar para despistar a sus perseguidores.",
        tags: ["connor", "terra", "nigalion", "hebridas", "1955"]
    },
    {
        title: "El Barón y la Iglesia de Satán",
        date: "1956-01-01",
        description: "El Barón toma control del vudú en Haití. Anton LaVey funda la Iglesia de Satán como fachada para K'sser, quien intenta un ritual en el Nexo de Terra. Maestro Arcano funda la coalición de héroes. Enigma va a Cronópolis.",
        tags: ["el-baron", "anton-lavey", "iglesia-satan", "ksser", "maestro-arcano", "enigma", "cronopolis", "1956"]
    },
    {
        title: "Cámara de los Ancestros y Kigala",
        date: "1965-01-01",
        description: "Arqueólogos encuentran la Cámara de los Ancestros en Ur, desatando una maldición. La diosa Kigala desciende a la Tierra.",
        tags: ["ur", "camara-ancestros", "kigala", "1965"]
    },
    {
        title: "Fundación Temple of Set",
        date: "1969-01-01",
        description: "Michael A. Aquino funda el Temple of Set, promoviendo un satanismo teísta centrado en el panteón egipcio.",
        tags: ["temple-of-set", "michael-aquino", "satanismo", "1969"]
    },
    {
        title: "Vientos de Erebus",
        date: "1970-01-01",
        description: "Vampiros, Hombres Lobo y Semidemonios firman un pacto en Valladolid para proteger a los seres sobrenaturales, fundando Vientos de Erebus.",
        tags: ["vientos-de-erebus", "valladolid", "vampiros", "hombres-lobo", "1970"]
    },
    {
        title: "Derrota de K'sser",
        date: "1974-01-01",
        description: "K'sser intenta conquistar Terra de nuevo pero es derrotado por la coalición de héroes de Maestro Arcano.",
        tags: ["ksser", "maestro-arcano", "1974"]
    },
    {
        title: "Reaparición del Barón en Lisboa",
        date: "1976-01-01",
        description: "Temblores en Lisboa descubren una cripta en el Castillo de San Jorge. Se ve a El Barón salir con bolsas y desaparecer.",
        tags: ["el-baron", "lisboa", "1976"]
    },
    {
        title: "Resurgimiento Mágico y Fin de Guerras Gamadas",
        date: "1980-01-01",
        description: "Resurgimiento del interés en la magia (Crowley, Wicca). Las Guerras Gamadas se declaran finalizadas sobre papel.",
        tags: ["magia", "wicca", "guerras-gamadas", "1980"]
    },
    {
        title: "Cazadores de Sombras en Ámsterdam",
        date: "1986-01-01",
        description: "Se forma el grupo Cazadores de Sombras en Ámsterdam.",
        tags: ["cazadores-de-sombras", "amsterdam", "1986"]
    },
    {
        title: "Fuga en IDESS y Reaparición de Enigma",
        date: "1993-01-01",
        description: "Un vampiro escapa de experimentos en IDESS. Enigma reaparece con textos de Cronópolis, que entrega a Vértice de Combate, pero los destruye poco después.",
        tags: ["idess", "vampiro", "enigma", "cronopolis", "vertice-de-combate", "1993"]
    },
    {
        title: "Lord Brujo y Mad Skull",
        date: "1996-01-01",
        description: "Lord Brujo libera al demonio Mad Skull para acabar con los héroes. El Vudú es reconocido como religión en Benín.",
        tags: ["lord-brujo", "mad-skull", "vudu", "benin", "1996"],
        icon: "skull"
    },
    {
        title: "Fusión de K'sser con el Nexo",
        date: "1999-01-01",
        description: "K'sser y su hija Jewel se fusionan con el Nexo de Terra. Jewel lo bloquea el tiempo suficiente para que sea derrotado y escapa.",
        tags: ["ksser", "jewel", "nexo", "terra", "1999"]
    },
    {
        title: "Hallazgo del Orbe y Vientos de Erebus",
        date: "2000-08-01",
        description: "Thor y Tyr localizan el Orbe Sagrado gracias a Fuego Estelar. Enigma viaja al Reino de los Sueños. Vientos de Erebus funda una asociación de rol en Valladolid como cobertura y se expande por Europa.",
        tags: ["thor", "tyr", "orbe-sagrado", "fuego-estelar", "enigma", "vientos-de-erebus", "valladolid", "2000"]
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
${event.displayDate ? `displayDate: "${event.displayDate}"` : ''}
description: "${event.description.replace(/"/g, '\\"')}"
reality: "Principal"
icon: "star"
tags: ${JSON.stringify(event.tags)}
---
`;

    fs.writeFileSync(path.join(targetDir, `${slug}.md`), content);
    console.log(`Created ${slug}.md`);
});
