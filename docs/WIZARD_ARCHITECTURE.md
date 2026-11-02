# Arquitectura del Generador de Fichas (Character Wizard) — Guía de Contexto para IA

Este documento es el **punto de entrada técnico** para cualquier desarrollador o agente de IA que necesite entender, mantener o extender el **Generador de Fichas (Character Wizard)** de *Superheroes INC. Tercera Edición*.

---

## Índice de Documentación

1. **[01_STATE_AND_REDUCER.md](./wizard/01_STATE_AND_REDUCER.md)** — Modelo de datos (`CharacterData`), acciones del reducer (`characterReducer.ts`), pipeline de auto-sincronización atómica (`withTransformationsSync`), validación Zod e importación/exportación JSON.
2. **[02_CALCULATION_ENGINES.md](./wizard/02_CALCULATION_ENGINES.md)** — Reglas de negocio y particularidades mecánicas de los motores puros (`src/utils/calculations/` y `src/data/`): orígenes, características, poderes, magia (EM), habilidades, formas alternativas (Hombre Lobo / transformaciones) y estadísticas derivadas.
3. **[03_STEPS_AND_UI_GUIDE.md](./wizard/03_STEPS_AND_UI_GUIDE.md)** — Arquitectura de los 7 pasos de la interfaz (`src/components/wizard/`), `WizardContext`, patrones de hooks (`useStepXLogic`) y **recetas paso a paso** para añadir nuevas mecánicas sin romper invariantes.

---

## 1. Visión General y Principios Arquitectónicos

El Wizard está diseñado bajo una arquitectura **unidireccional en 5 capas** con separación estricta entre **datos estáticos**, **cálculos puros**, **gestión de estado atómica** y **componentes visuales React**:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ CAPA 1: Catálogos Estáticos e Índices O(1) (src/data/)                   │
│   origins, powers, spells, generalSkills, specialSkills, techModules...  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ CAPA 2: Motores de Cálculo Puros (src/utils/calculations/)               │
│   originCalculations, powerCalculations, magicCalculations,              │
│   skillCalculations, formCalculations, derivedStatsCalculations,         │
│   pcCalculations, originFlags                                            │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ CAPA 3: Reducer Central y Sincronizador Atómico (src/utils/)             │
│   characterReducer.ts -> withTransformationsSync(nextState, prevState)   │
│   characterAdapter.ts + dataCleaner.ts (Validación Zod y Saneamiento)    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ CAPA 4: Hooks Globales y Contexto (src/hooks/wizard/ + WizardContext)    │
│   useCharacterState, useCharacterCalculations, useCharacterIO,           │
│   WizardProvider / useWizardContext                                      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ CAPA 5: Componentes UI por Paso (src/components/wizard/)                 │
│   CharacterWizard.tsx -> WizardHeader + STEP_RENDERERS[1..7] + Footer    │
│   Cada paso: index.tsx (vista) + useStepXLogic.ts + sections/            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Oro para IA y Desarrolladores (*Invariantes del Proyecto*)

1. **Fuente Única de Verdad (*Single Source of Truth*)**:
   - El estado del personaje vive **exclusivamente** en el `characterReducer` (`useCharacterState`).
   - **PROHIBIDO** duplicar propiedades de `data` (`attributes`, `skills`, `origin`, `powers`, etc.) en `useState` locales dentro de los pasos y sincronizarlos mediante `useEffect`. Los hooks `useStep1Logic` a `useStep6Logic` deben derivar sus datos con `useMemo` directamente desde `data` y despachar cambios con `onChange`.
2. **Sincronización 100% en el Reducer (`withTransformationsSync`)**:
   - Toda regla reactiva del juego (añadir poderes innatos por origen, recalcular bonos de origen/poder en características, marcar habilidades gratuitas/obligatorias, recalcular el Equilibrio Mágico `EM`, actualizar la Forma de Transición de Hombre Lobo o recalcular estadísticas de combate) **ocurre de forma síncrona y pura dentro de `withTransformationsSync` en `src/utils/characterReducer.ts`**.
   - Gracias a esto, aunque el usuario esté en el Paso 1 y abra directamente la Vista Previa (`CharacterSheet`) o exporte el JSON sin haber visitado los pasos 2, 3, 4 o 6, la ficha está **100% calculada y consistente**.
3. **Lógica de Negocio Pura (Cero React en `src/utils/`)**:
   - Ningún archivo en `src/utils/` o `src/data/` puede importar hooks de React ni manipular el DOM. Toda función de cálculo debe ser determinista, libre de efectos secundarios y testeable en Vitest.
4. **Preservación de Overrides Manuales (`personalizado`)**:
   - En el Paso 6, el usuario puede sobrescribir manualmente cualquier estadística derivada (`combatstats` y `otherstats`). El campo `personalizado` se conserva siempre al recalcular estadísticas dinámicas con `syncDerivedStats`, y se limpia automáticamente con `buildManualStatUpdate` cuando el usuario introduce un valor idéntico al calculado por fórmula.

---

## 2. Mapa Completo de Directorios Relacionados con el Wizard

```text
src/
├── types/
│   └── character.ts                        # Tipos centrales: CharacterData, AttributeBreakdown, etc.
├── data/
│   ├── wizardConfig.ts                     # STEPS (1..7) e initialCharacterState
│   ├── wizardHelp.ts                       # Contenido contextual del modal de ayuda por paso
│   ├── origins.ts                          # Punto de entrada unificado de orígenes + índices O(1)
│   ├── originDefinitions.ts                # Definición de categorías, subtipos y efectos
│   ├── originCosts.ts                      # Costes en PC de orígenes y subtipos
│   ├── originModifiers.ts                  # Modificadores de características por origen/especialidad
│   ├── characteristicLimits.ts             # Límites min/max por origen y bonos elegibles
│   ├── powers.ts                           # Catálogo de poderes + índices POWER_BY_ID
│   ├── spells.ts                           # Catálogo de hechizos + índices SPELL_BY_ID
│   ├── magicalBonds.ts                     # Lazos mágicos para Mago
│   ├── generalSkills.ts                    # Catálogo de habilidades generales + fórmulas
│   ├── specialSkills.ts                    # Catálogo de habilidades de aprendizaje + restricciones
│   ├── freeOriginSkills.ts                 # Habilidades gratuitas por origen/subtipo
│   ├── requiredSpecialtySkills.ts          # Habilidades obligatorias y exclusivas (Vigilante)
│   ├── originSkillModifiers.ts             # Bonos de origen/especialidad a habilidades
│   ├── techModules.ts                      # Módulos tecnológicos (Tecnoarmadura, Cyborg, Vehículo)
│   ├── cyborgImplantConfigs.ts             # Configuraciones de implantes cibernéticos
│   ├── exoskeletonConfigs.ts               # Configuraciones de Exoesqueleto Energético
│   ├── exoskeletonArmorConfigs.ts          # Blindajes de Tecnoarmadura / Tecnovehículo
│   ├── technoSuitStrengthConfigs.ts        # Configuraciones de Fuerza de Tecnoarmadura
│   ├── werewolfOptions.ts                  # Subtipos de Hombre Lobo y transformaciones por poder
│   ├── backgroundTables.ts                 # Tablas económicas, legales, sociales y cobertura
│   └── specialOriginOptions.ts             # Tablas de Ente, Maldito, Poseído, Alterado, Mutante, Guardián, Divino, Liberado
├── utils/
│   ├── characterCalculations.ts            # Fachada (barrel) que re-exporta todos los motores de cálculo
│   ├── characterReducer.ts                 # Reducer atómico + pipeline withTransformationsSync
│   ├── characterAdapter.ts                 # Adaptador Web/Ficha (adaptWebCharacter) + validación Zod
│   ├── dataCleaner.ts                      # mergeWithDefaults y limpieza para exportación JSON
│   └── calculations/
│       ├── pcCalculations.ts               # Motor único de Puntos de Creación (calculateCharacterPCBreakdown)
│       ├── originCalculations.ts           # Costes, límites, modificadores y syncOriginAttributes
│       ├── originFlags.ts                  # Detector centralizado getCharacterOriginFlags (~45 flags)
│       ├── powerCalculations.ts            # Costes de poderes, penalizaciones, syncOriginAutoPowers, syncPowerModsToAttributes
│       ├── magicCalculations.ts            # Cálculo de EM, costes de hechizos y syncMagicalEquilibrium
│       ├── skillCalculations.ts            # Fórmulas de habilidades, costes con bono INT, syncOriginSkills, syncSkillFormattedItems
│       ├── formCalculations.ts             # Proyección de formas activas y syncCharacterTransformations
│       └── derivedStatsCalculations.ts     # Tablas CON/FUE, parada, iniciativa, syncDerivedStats, buildManualStatUpdate
├── hooks/
│   ├── useJsonExport.ts                    # Descarga de archivo .json limpio
│   └── wizard/
│       ├── useCharacterState.ts            # useReducer + persistencia en localStorage + migraciones
│       ├── useCharacterCalculations.ts     # Memoización de totalPCs y pcBreakdown
│       ├── useCharacterIO.ts               # Importación JSON, exportación y reinicio con confirmación
│       └── useCharacterAutoEffects.ts      # Wrappers de compatibilidad
└── components/
    ├── character/
    │   └── CharacterSheet.tsx              # Visor modal/completo de la ficha (consume adaptWebCharacter)
    └── wizard/
        ├── CharacterWizard.tsx             # Orquestador principal + STEP_RENDERERS
        ├── shared/
        │   ├── context/WizardContext.tsx   # Contexto global (WizardProvider, useWizardContext)
        │   ├── layout/                     # WizardHeader, WizardFooter, WizardSection, WizardDialogs, DataTable
        │   ├── forms/                      # WizardField, FormSelect, SearchBar...
        │   └── ui/                         # Badge, CostBadge, WizardHelpModal...
        └── steps/
            ├── Step1_OriginSelection/      # Selección de orígenes y subtipos
            ├── Step2_Characteristics/      # Características base, bonos, puntos libres y pestañas de formas
            ├── Step3_Especials/            # Parámetros de origen, poderes, magia, módulos tech y modales
            ├── Step4_Skills/               # Habilidades generales y de aprendizaje
            ├── Step5_Background/           # Estatus social/económico/legal, prejuicios y notas de trasfondo
            ├── Step6_Details/              # Identidad, nivel, estadísticas manuales, equipo y armas
            └── Step7_Evolution/            # Resumen informativo de reglas de evolución
```

---

## 3. Comandos de Verificación y Calidad

Antes de dar por finalizado cualquier cambio en el Wizard o en los motores de cálculo, ejecuta siempre:

```bash
# 1. Suite completa de tests unitarios y de integración (16 archivos, 151 tests)
npm test

# 2. Verificación estática de tipos en Astro y TypeScript (debe dar 0 errors, 0 warnings)
npm run check

# 3. Reporte de cobertura de código (genera reporte en ./coverage, ignorado por git)
npx vitest run --coverage
```
