---
title: Cómo escribir un SHI Replay Script
pubDate: 2025-12-11
description: Guía técnica para autores de Actual Plays
author: Jorge Francisco de Benito Montoya
tags:
  - noticias
  - tecnología
  - desarrollo
  - web
---
El SHI Replay Script es el formato oficial para escribir Actual Plays en Superhéroes INC. Su objetivo es permitir que cualquier persona pueda registrar una sesión de forma clara y ordenada, sin perder lo que ocurre en la mesa ni lo que ocurre en la historia.

Esta guía explica cómo funciona el formato y qué debe poner exactamente cada línea.

## Estructura general del documento

Un SHI Replay Script se divide en tres partes principales.

1. El frontmatter con los datos de la sesión.
    
2. Las escenas organizadas con metadatos opcionales.
    
3. Las líneas que describen lo que ocurre usando etiquetas simples.
    

Un ejemplo mínimo.

```
---
title: "Título de la sesión"
description: "Descripción de la sesión"
system: "Superhéroes INC 3ª Edición"
arc: "campaña o arco"
session: N
datePlayed: YYYY-MM-DD
gm: "Nombre"
players:
  - name: "Jugador"
    character: "Personaje"
npcs:
  - name: "Personaje"
---

## Escena 1
@scene: 1
@location: Valladolid

NARR: Texto narrativo

GM: Texto del Guionista

PLAYER[Personaje]: Acción del jugador

CHAR[Personaje]: Diálogo del personaje

ROLL[Personaje]: Tiradas y resultados

RULE[Referencia]: Regla usada

META: Aclaración opcional
```

A continuación se explica qué significa cada etiqueta y cómo debe usarse.

# Etiquetas del SHI Replay Script

Todas las líneas comienzan con una etiqueta en mayúsculas seguida de un texto. Esta etiqueta indica cómo debe interpretar la web esa línea.

## **NARR**

Indica narración pura. Describe lo que ocurre en el mundo del juego.

Uso recomendado  
Escenas, atmósfera, movimientos, consecuencias narrativas.

Ejemplo  
`NARR: La lluvia cae sobre la calle mientras La Naga avanza entre sombras.`

No debe contener reglas ni decisiones de mesa. Solo ficción.

## **GM**

Es lo que dice el Guionista en la mesa. Explica situaciones, pide tiradas o responde a acciones.

Ejemplo  
`GM: Los moteros aún no te han visto. Si quieres acercarte sin hacer ruido, necesitas una tirada de Acechar.`

El texto debe reflejar exactamente lo que dijo el Guionista, no una adaptación en tercera persona.

## **PLAYER[Personaje]**

Registra lo que dice el jugador como jugador y las decisiones que toma.

Formato  
`PLAYER[NombreDelPersonaje]`

Ejemplo  
`PLAYER[La Naga]: Me acerco por detrás e intento derribar al que sujeta a la mujer.`

Este bloque es meta-mesa. No corresponde al personaje, sino al jugador.

## **CHAR[Personaje]**

Es el diálogo del personaje dentro de la ficción.

Formato  
`CHAR[NombreDelPersonaje]`

Ejemplo  
`CHAR[La Naga]: Nadie debe obligarte a nada. Ven conmigo.`

A diferencia de PLAYER, esto sí pertenece al mundo narrado.

## **ROLL[Personaje]**

Describe una tirada, un cálculo o un resultado mecánico.

Incluye lo necesario para entender cómo se resolvió la acción.

Recomendación de estructura  
Tipo de habilidad o poder, dificultad o modificadores si los hay, tirada realizada y resultado numérico.

Ejemplo  
`ROLL[La Naga]: Artes Marciales 73 - parada 22 = 51 por ciento 1d100 → 49 Éxito.`

El objetivo es dejar claro qué se tiró y por qué tuvo ese resultado.

## **RULE[Referencia]**

Cita una regla usada durante la acción. Sirve para quien quiera aprender o consultar mecánicas exactas.

El formato no debe incluir enlaces complejos, solo referencia limpia del manual.

Ejemplo  
`RULE[SHI p295] Localización de impacto en combate cuerpo a cuerpo.`

Las reglas no deben mezclarse dentro de NARR ni dentro de CHAR.

## **META**

Información adicional del autor sobre por qué se eligió una mecánica, un comentario sobre diseño o un apunte técnico que ayuda a entender la escena.

No es parte de la mesa ni parte de la ficción.

Ejemplo  
`META: Esta tirada podría haberse tratado como automática, pero la usamos para calentar dados y mostrar el procedimiento.`

El META debe ser breve, útil y no romper la lectura.

# **Metadatos dentro de una escena**

Cada escena puede tener líneas que ayudan a ubicarla, sin interferir con el contenido jugado.

Las más comunes son:

`@scene`  
Identificador de la escena.  
Ejemplo  
`@scene: 2`

`@location`  
Lugar donde ocurre.  
Ejemplo  
`@location: Polígono San Cristóbal`

Se pueden añadir más si aportan contexto, como hora o clima, pero siempre con el mismo estilo sencillo.

# **Buenas prácticas al escribir un SHI Replay Script**

Estas recomendaciones ayudan a que el texto sea más claro y más útil para otros jugadores y Guionistas.

### Escribe cada acción en una línea

Facilita la lectura y el procesado del componente web.

### Evita mezclar capas

No metas reglas dentro de narración ni diálogos dentro de tiradas.

### Mantén las tiradas transparentes

Quien lea debe entender por qué un impacto acierta o falla.

### Usa escenas cortas

Mejor tres escenas de diez líneas que una de treinta.

### Añade META solo cuando aporta

Demasiado META rompe la lectura.

# **Ejemplo completo y limpio**

```
## Escena 1
@scene: 1
@location: Valladolid

NARR: La Naga avanza con paso rápido por la calle oscura.

GM: Oyes un grito apagado detrás de la esquina.

PLAYER[La Naga]: Me acerco sigilosamente.

ROLL[La Naga]: Acechar 130 por ciento   1d100 → 24   Éxito.

RULE[SHI p285] Resolución de acciones.

NARR: Descubres a tres moteros intentando encerrar a una mujer dentro de una furgoneta.

CHAR[La Naga]: Soltadla ahora mismo.

PLAYER[La Naga]: Les ataco con una patada voladora.

ROLL[La Naga]: Artes Marciales 73 - parada 22 = 51 por ciento   1d100 → 49   Éxito.

ROLL[La Naga]: Daño 1d10x2   1d10 → 8   Total 16.

NARR: El golpe impacta y el motero cae soltando a la mujer.

META: Los moteros no tienen protecciones, ni poderes y no tienen daño absorbido físico.
```

El SHI Replay Script es una herramienta diseñada para que escribir Actual Plays sea fácil y para que leerlos sea aún más fácil. Mantiene la claridad necesaria para aprender el sistema y, al mismo tiempo, deja espacio para que la historia brille.

Con este formato cualquier jugador o Guionista puede documentar una sesión y contribuir al crecimiento del universo de Superhéroes INC.

Gracias por leerme.
