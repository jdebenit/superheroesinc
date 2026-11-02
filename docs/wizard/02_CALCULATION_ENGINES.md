# 02. Motores de Cálculo Puros y Particularidades de Reglas (`src/utils/calculations/`)

Este documento describe todas las reglas de negocio y casos especiales de *Superheroes INC. 3ª Edición* implementados en `src/utils/calculations/` y `src/data/`.

---

## 1. Motor de Puntos de Creación (`pcCalculations.ts`)

La función maestra es `calculateCharacterPCBreakdown(character)`:
- Devuelve el coste total (`totalPCs`) y el desglose exacto por categoría:
  - `origins`: Coste base de orígenes y subtipos (`calculateOriginCost`).
  - `characteristics`: Coste de subir características base (`calculateCreationPoints`), a razón de `0.1 PC` por punto por encima de `40` (base inicial = `280` puntos repartidos en 7 características a `40`).
  - `forms`: Coste en PC de formas alternativas (ej. `Hombre Lobo` cuando supera los valores base de la subespecie, o formas de poder).
  - `specialParams`: Costes o descuentos de parámetros de origen:
    - **Parahumano Híbrido con Humano**: `-2 PC` para *Atlante* o *Tes-khar*, `-5 PC` para *Thals*.
    - **Ente**: Forma corpórea/incorpórea y efecto visual.
    - **Maldito**: Magnitud y origen de la maldición (descuentos en PC).
    - **Poseído**: Forma de posesión.
    - **Alterado / Mutante / Híbrido mitológico**: Agente mutagénico y secuelas (otorgan descuentos en PC).
    - **Guardián**: Calidad del objeto, tipo, rasgo y transformación.
    - **Divino (Dios / Dios Menor)**: Foco de poder divino.
    - **Liberado**: Don elegido (`gift`).
    - **Terrano**: Tiradas extra en tablas mágicas (`magicTableRolls`).
  - `powers`: Suma del coste base + coste de rango (`0.1 PC` por punto de rango) + personalizaciones + penalizaciones cruzadas.
  - `spells`: Coste de la fórmula de EM comprada + coste de hechizos seleccionados (`rank * 0.1` + coste de nivel de hechizo) + lazos mágicos (`magicalBonds`).
  - `tech`: Módulos tecnológicos (`techModules`), implantes Cyborg (`cyborgImplants`), configuraciones de Exoesqueleto Energético (`exoskeletonConfig`), blindaje de Tecnoarmadura (`exoskeletonArmorConfig`) y fuerza de Tecnoarmadura (`technoSuitStrengthConfig`).
  - `skills`: Habilidades de aprendizaje pagadas + mejoras de base (`calculateSpecialSkillsPCWithInt`).
  - `background`: Estatus económico, legal, social, amistades, cobertura de base y Resistencia a Prejuicios (`(valor - 50) * 0.1 PC`).
  - `equipment`: Armas, artefactos, vehículos y equipo especial con coste en PC.

---

## 2. Orígenes, Características y Límites (`originCalculations.ts` y `originFlags.ts`)

### 2.1 Detector Centralizado (`getCharacterOriginFlags`)
Ubicado en `src/utils/calculations/originFlags.ts`. Analiza `data.origin.items` y los parámetros especiales y devuelve ~45 flags booleanos listos para usar (`isMago`, `isDotado`, `isHombreLobo`, `isCyborg`, `isLiberado`, `activeLiberados`, `hasEM`, `hasAnyOrigin`, etc.).
- **Regla**: Nunca inspecciones manualmente `data.origin.items` en componentes UI si el flag ya existe en `getCharacterOriginFlags(data)`.

### 2.2 Modificadores y Límites de Características
1. **Modificadores Fijos de Origen (`calculateOriginModifiers`)**:
   - Definidos en `src/data/originModifiers.ts`.
   - Algunos orígenes permiten elegir a qué característica aplicar un bono (`getChoosableCharacteristics`), guardado en `data.chosenCharacteristics[originKey]`.
2. **Puntos Libres Distribuibles de Origen (`hasDistributablePoints` / `getDistributablePointsInfo`)**:
   - Orígenes como *Humano* o ciertos subtipos otorgan una bolsa de puntos para repartir manualmente en la columna `originMod`.
3. **Puntos de Especialidad de Vigilante (`calculateSpecialtyModifiers` / `getSpecialtyDistributablePointsInfo`)**:
   - Cada especialidad de *Vigilante* otorga bonos fijos y/o puntos libres en características permitidas (`calculateSpecialtyAllowedCharacteristics`).
4. **Límites Mínimos y Máximos (`calculateLimits`)**:
   - Definidos en `src/data/characteristicLimits.ts`.
   - Por defecto el límite humano es `Min: 20, Max: 100`.
   - Orígenes sobrehumanos elevan el máximo (hasta `120`, `140`, `160`, `200`).
   - **Caso Especial — Liberado (`liberadoParams.gift`)**: Algunos dones o sendas de Liberado otorgan un bono de límite máximo (`+20` al máximo en la característica elegida).
   - **Desbloqueo a 200**: Si una característica tiene `powerMod > 0` (por un poder como *Superfuerza*) o si el usuario activa `unlockManualCharacteristics`, el tope sube a `200`.

---

## 3. Poderes y Penalizaciones (`powerCalculations.ts`)

1. **Poderes Innatos Automáticos (`syncOriginAutoPowers`)**:
   - Orígenes como *Atlante*, *Troll*, *Tes-khar*, *Hadas*, *Grifo*, *Vampiro*, *Semidemonio* y *Hombre Lobo* inyectan poderes automáticamente en `powers.selected`.
   - En *Hombre Lobo*, los poderes innatos llevan `isWerewolfInnate: true`, son gratuitos hasta su rango base y no pueden subirse de rango salvo que el personaje tenga además otro origen sobrenatural con acceso a poderes (`hasOtherSobrenaturalPowerOrigin`).
2. **Penalizaciones por Tipo u Origen Cruzado (`getPowerPenalty`)**:
   - **Mutante (`isCrossType`)**: Un mutante tiene un tipo principal (*Físico*, *Psíquico*, *Energético*). Comprar un poder fuera de su tipo añade `+2 PC` al coste base.
   - **Guardián (`isCrossOrigin`)**: Comprar poderes de otro origen añade `+3 PC`.
   - **Maldito (`isCrossOriginMaldito`)**: Comprar poderes fuera de su origen añade `+1 PC`.
   - **Divino (`isCrossOriginDivino`)**: Comprar poderes de la categoría `'OtroDivino'` añade `+3 PC`.
3. **Poderes que Modifican Características (`syncPowerModsToAttributes`)**:
   - Poderes como *Superfuerza*, *Superagilidad*, etc., almacenan su bono en `power.powerMod` y se sincronizan automáticamente en `attributes.breakdown[char].powerMod`.

---

## 4. Magia y Equilibrio Mágico (`magicCalculations.ts`)

La función `calculateEM(data)` y el sincronizador `syncMagicalEquilibrium(data)` aplican las siguientes reglas:
- **Base**: `INT + VOL`.
- **Divisor (`emFormula.divisor`)**:
  - **Mago** o **Elfo Mágico**: Divisor fijo `1` (`(INT + VOL) / 1`), coste `0 PC`.
  - **Hada Éter**: Divisor fijo `2` (`(INT + VOL) / 2`), coste `0 PC`.
  - **Otros orígenes con acceso a EM comprable** (*Dotado*, *Híbrido mitológico*, *Terrano*, *Poseído*, *Liberado* con don mágico): El jugador puede elegir divisor `4` (gratis), `2` o `1` pagando su coste en PC.
- **Bonos y Penalizadores Directos a EM**:
  - **Mago**: `+50 EM`.
  - **Poseído**: `+35 EM`.
  - **Ente** o **Elfo Mágico**: `+20 EM`.
  - **Dotado**: `-20 EM` por cada poder seleccionado de origen *Dotado*.

---

## 5. Habilidades Generales y de Aprendizaje (`skillCalculations.ts`)

1. **Habilidades Generales (`calculateGeneralSkillValues`)**:
   - Todo personaje tiene las 10 habilidades generales definidas en `src/data/generalSkills.ts`.
   - Cada punto que se suba la `base` por encima de la fórmula inicial cuesta `0.1 PC` (`0.05 PC` si el personaje tiene origen **Liberado**).
   - **Heraldo Cósmico**: Tiene bloqueadas ciertas habilidades generales según reglamento (`isHeraldoCosmico`).
2. **Habilidades de Aprendizaje (`calculateSpecialSkillValues` y `calculateSpecialSkillsPCWithInt`)**:
   - Definidas en `src/data/specialSkills.ts`. Pueden ser **estándar** (`skills.selected[skillId]`) o **especificadas/parametrizables** (`skills.specified[uniqueId]`, ej. *Ciencia: Física*).
   - Coste por habilidad aprendida: `1 PC` (`0.5 PC` para **Liberado**).
   - **Bonificación por Inteligencia**:
     - `INT 101–120`: **1** habilidad de aprendizaje pagada pasa a ser gratuita.
     - `INT 121–140`: **2** habilidades gratuitas.
     - `INT 141–160`: **3** habilidades gratuitas.
     - `INT 161+`: **4** habilidades gratuitas.
3. **Sincronización Automática (`syncOriginSkills`)**:
   - Añade habilidades gratuitas de origen (`FREE_ORIGIN_SKILLS`, con `isFree: true`).
   - Añade y marca habilidades obligatorias de especialidades de Vigilante (`REQUIRED_SPECIALTY_SKILLS`, con `isRequired: true`, lo que impide borrarlas en la UI, aunque sí consumen PC o huecos de INT salvo que sean gratuitas).
   - Elimina automáticamente cualquier habilidad exclusiva (`restrictedTo` en `SPECIAL_SKILLS`) si el personaje deja de cumplir los requisitos de origen/especialidad.

---

## 6. Formas Alternativas y Estadísticas Derivadas (`formCalculations.ts` y `derivedStatsCalculations.ts`)

1. **Motor de Formas (`syncCharacterTransformations` y `getCharacterForActiveForm`)**:
   - **Hombre Lobo (`werewolf_transition`)**: Calcula las características de la Forma de Transición según la casta (*Renegado*, *Híbrido*, *Lobishome*). La `Voluntad` siempre se sincroniza con la `Voluntad` humana; la `Apariencia` es fija (`20`). Si el jugador incrementa características en la pestaña de Forma de Transición por encima del mínimo de la casta, cada punto extra cuesta `0.1 PC`.
   - **Transformaciones por Poder (`Blindaje Natural`, etc.)**: Se proyectan como entradas adicionales en `data.forms`.
2. **Estadísticas Derivadas (`calculateDerivedStats` y `syncDerivedStats`)**:
   - **Tabla de Constitución (`CON`)**: Determina `Puntos de Vida`, `Daño Absorbido Físico` y `Recuperación` (en `CON <= 100`, `PV = CON - 50`; escala por tramos hasta `CON` completo en `191+`).
   - **Tabla de Fuerza (`FUE`)**: Determina `Modificador de Fuerza` (daño CaC), `Peso Levantado` y `Lanzamiento`.
   - **Iniciativa y Reflejos**: `(AGI + PER) / 4`. **Excepción de Inteligencia**: Si `INT >= 121` e `INT > min(AGI, PER)`, la `INT` sustituye a la menor entre `AGI` y `PER` en la fórmula.
   - **Bono de Artes Marciales**: Si el personaje posee la habilidad *Artes Marciales*, recibe automáticamente `+10` en `Iniciativa y Reflejos` y `+10` en `Parada Física`.
   - **Overrides Manuales (`buildManualStatUpdate`)**: Cualquier edición manual del usuario en el Paso 6 se guarda en `stat.personalizado`. Si el usuario escribe el mismo valor que el `total` calculado, `personalizado` se elimina automáticamente para que la estadística vuelva a ser dinámica.
