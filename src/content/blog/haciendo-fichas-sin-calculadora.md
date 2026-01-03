---
title: Haciendo fichas sin calculadora
pubDate: 2026-01-03
description: Cómo he convertido un sistema complejo en una herramienta viva que todavía se está puliendo
author: Jorge Francisco de Benito Montoya
tags:
  - noticias
---
## Un generador que no nace perfecto ni pretende serlo

Quería escribir esto antes de que empezaran a salir comentarios o dudas.  
El generador de fichas de Superhéroes INC ya está aquí. Y sí, tiene fallos. Bastantes cosas que pulir. No voy a fingir lo contrario.

Pero también tiene muchas horas detrás. De las que se notan en la espalda y en la cabeza. Y me parecía importante decirlo.

Durante años he hecho fichas de Superhéroes INC a mano. Papel, calculadora, apuntes al margen, volver atrás porque un origen te rompe media ficha, recalcular costes, discutir conmigo mismo si algo estaba bien aplicado o no. Y casi siempre acababa igual. Cansado antes de empezar a pensar de verdad en el personaje.

De ahí salió la idea. Quitarme las matemáticas de encima para poder centrarme en lo creativo.
## La idea que lo sostiene

Lo que quería era algo muy simple de explicar.  
Yo decido qué quiero jugar y el sistema me dice qué implica eso.

Elijo un origen, un poder, habilidades  y veo al instante cómo cambian los puntos, las estadísticas derivadas y los límites. Si algo no encaja, lo veo en ese momento. Sin esperar al final. Sin sorpresas raras.

No hay truco. Hay reglas bien pasadas a código. Y muchas pruebas para que no se rompa todo a la mínima.
## Mirando bajo el capo

A nivel técnico he intentado ser coherente. Usar herramientas modernas, sí, pero sobre todo algo que no me ate de manos en el futuro. Que sea rápido, que no dependa de servidores extraños y que pueda crecer sin volverse inmanejable.

El núcleo es un asistente por pasos que mantiene todo el personaje conectado. Si cambio algo importante al principio, el sistema limpia o ajusta lo que deja de tener sentido más adelante. No porque sea listo, sino porque así funcionan las reglas del juego cuando las aplicas bien.

Es lo más parecido a tener a alguien al lado diciendo esto ya no cuadra, revísalo.
## Lo que de verdad ha sido complicado

No ha sido hacer la interfaz.  Ni generar el PDF.  Lo duro ha sido traducir un sistema de rol pensado para humanos a lógica sin cargármelo por el camino.

Superhéroes INC tiene muchas excepciones, orígenes que alteran reglas base, poderes que cambian costes, combinaciones raras que solo aparecen cuando llevas años jugando. Meter todo eso en una aplicación sin simplificarlo a lo bruto ha llevado mucho más tiempo del que parecía al principio.

Ahora mismo el generador ya maneja cientos de elementos y muchos cálculos derivados. Y aun así, sé que hay cosas mal. Algunas las tengo localizadas. Otras aparecerán cuando lo uséis en serio. Eso va a pasar, y no pasa nada.
## Versión actual y estado real del proyecto

Comparto ya el enlace para que lo probéis [Generador Fichas](/recursos/generador-fichas). Lo digo claro para que nadie se lleve a engaño. Esto es una beta 0.1.0. Funciona, se puede crear personajes y exportar fichas, pero no está completa ni cerrada.

Antes de esta beta ha habido una fase alpha que han probado varios jugadores. Y aquí quiero dar las gracias de verdad. A todos los que habéis trasteado con versiones rotas, habéis sufrido errores rarísimos y aun así habéis seguido enviando comentarios y capturas. Sin ese feedback, esta versión no existiría.
## Cosas que ya sé que fallan o faltan

Para evitar malentendidos, dejo claros algunos problemas conocidos que están pendientes de revisión.

Hay poderes con opciones que todavía no están bien resueltos o que no recalculan todo lo que deberían.  
El origen de semidemonios necesita una revisión profunda porque mezcla demasiadas excepciones.  (esos +10 puntos en las características dependiendo de cuanto aumentes).
Faltan algunos orígenes que aún no están implementados (Los hombres lobo, algunos seres mitológicos y los liberados me están dando algo de dolor de cabeza).  
Hay combinaciones concretas que pueden romper costes o dejar valores raros.  
Y seguro que aparecerán más cosas que ahora mismo no estoy viendo.

Nada de esto es definitivo. Todo está en revisión.
## Donde comentar y dar feedback

Si pruebas el generador y algo no te cuadra, o directamente se rompe, lo mejor es comentarlo en el canal de Discord.  Allí podéis dejar feedback tanto del generador como de la web en general, ideas, errores, cosas que no se entienden o propuestas de mejora. Es donde estoy mirando de verdad y donde más fácil es seguir la conversación.
## Esto no está terminado, y no debería estarlo

No quiero vender esto como algo cerrado. No lo es.  Es una primera versión funcional. Y para mí eso ya es importante.

Durante las próximas semanas voy a seguir trabajando en el generador. Corrigiendo errores, ajustando reglas y afinando partes que ahora mismo chirrían. Y gran parte de ese trabajo va a venir del uso real, no de pruebas en vacío.

Si encuentras un fallo, no me estás señalando algo mal hecho. Me estás ayudando a hacerlo mejor.  Si algo no te cuadra, probablemente haya un motivo, y quiero verlo.

El generador no viene a sustituir al juego ni a decidir por nadie. Viene a quitar fricción. A dejar que el esfuerzo esté en crear personajes interesantes, no en pelearse con una calculadora. Si quieres cambiar los costes de algunos poderes, origenes y poner tus reglas de la casa, hazlo (yo lo hago), que el generador no te prive de esa opción.

Gracias por probarlo, por la paciencia y por el tiempo que le estáis dedicando.  
Esto es solo el principio. Y ahora toca currar para que cada versión sea un poco mejor que la anterior.

Gracias por leerme.