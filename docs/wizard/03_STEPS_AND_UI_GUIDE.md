# 03. Arquitectura de Pasos UI (Steps 1–7) y Guía de Extensión para IA

Este documento explica cómo están organizados los componentes React del Wizard (`src/components/wizard/`) y proporciona **recetas paso a paso** para extender su funcionalidad.

---

## 1. Estructura del Contenedor Principal (`CharacterWizard.tsx`)

`src/components/wizard/CharacterWizard.tsx` es un orquestador ligero (~190 líneas) que coordina:
1. **`WizardProvider` (`src/components/wizard/shared/context/WizardContext.tsx`)**:
   - Provee `character`, `updateCharacter`, `totalPCs`, `currentStep`, `goToStep`, `openHelp`, `showToast` y `askConfirm` a cualquier subcomponente mediante `useWizardContext()` o `useOptionalWizardContext()`.
2. **`WizardHeader` (`src/components/wizard/shared/layout/WizardHeader.tsx`)**:
   - Barra superior (`wizard-topbar`) con título, versión (`APP_VERSIONS.WIZARD`), contador en vivo de PCs, botón de vista previa (`CharacterSheet`), botón de importar JSON y botón de reiniciar.
   - Barra de pestañas de escritorio (`wizard-tabs`) y menú desplegable móvil (`mobile-dropdown-menu`).
3. **Mapa Declarativo `STEP_RENDERERS`**:
   - Asocia cada ID de paso (`1` a `7`) con su componente de paso correspondiente, recordando la posición de scroll de cada paso en `scrollPositions`.
4. **`WizardFooter` (`src/components/wizard/shared/layout/WizardFooter.tsx`)**:
   - Botones `← Anterior`, indicador `paso / 7` y `Siguiente →` (que cambia a `💾 Finalizar y exportar` en el Paso 7).

---

## 2. Anatomía de los 7 Pasos (`src/components/wizard/steps/`)

Todos los pasos interactivos siguen la misma estructura modular:
- **`index.tsx`**: Componente contenedor presentacional. No contiene cálculos complejos ni `useEffect` de negocio.
- **`useStepXLogic.ts`**: Hook del paso. Lee directamente de `data` (mediante `useMemo`) y expone handlers memorizados (`useCallback`) que llaman a `onChange`.
- **`sections/`**: Subcomponentes visuales especializados por dominio.

| Paso | Carpeta | Hook de Lógica | Subcomponentes Clave (`sections/`) |
| :---: | :--- | :--- | :--- |
| **1** | `Step1_OriginSelection/` | `useStep1Logic.ts` | Grid de orígenes y panel inline de subtipos/especialidades. |
| **2** | `Step2_Characteristics/` | `useStep2Logic.ts` | `FormTabsBar.tsx`, `OriginBonusSelectors.tsx`, `CharacteristicsGridSection.tsx`, `TransitionFormSection.tsx`. |
| **3** | `Step3_Especials/` | `hooks/useStep3Logic.ts` + `useCharacterValidation.ts` | `OriginSpecificSections.tsx` (agrupa las 18 secciones condicionales de origen), `PowersSection.tsx`, `MagicSection.tsx`, `MagicalBondsSection.tsx` + `modals/`. |
| **4** | `Step4_Skills/` | `useStep4Logic.ts` | `GeneralSkillsSection.tsx`, `SelectedSkillsSection.tsx`, `AvailableSkillsSection.tsx`, `SkillRow.tsx`. |
| **5** | `Step5_Background/` | `useStep5Logic.ts` | `SocialStatusSection.tsx`, `PrejudiceSection.tsx`, `BackgroundNotesSection.tsx`. |
| **6** | `Step6_Details/` | `useStep6Logic.ts` | `IdentitySection.tsx`, `ManualStatsSection.tsx`, `EquipmentSection.tsx`, `SpecialGearSection.tsx`. |
| **7** | `Step7_Evolution/` | *(Estático)* | Resumen de reglas de subida de nivel y evolución de personaje. |

---

## 3. Recetas Paso a Paso para Extender el Wizard

### Receta A: Cómo añadir un nuevo Poder o Hechizo al catálogo
1. **Para un Poder**:
   - Abre `src/data/powers.ts` y añade la definición en el array `POWERS` (`id`, `name`, `cost`, `origins`, `types`, `characteristic`, `options`, `description`).
   - Los índices `POWER_BY_ID` y `POWERS_BY_ORIGIN` se construyen automáticamente al cargar el módulo.
   - Si el poder otorga una **forma alternativa** (como *Blindaje Natural*), regístralo en `POWER_TRANSFORMATION_CONFIGS` dentro de `src/data/werewolfOptions.ts` y añade su proyección en `src/utils/calculations/formCalculations.ts`.
2. **Para un Hechizo**:
   - Abre `src/data/spells.ts` y añade la entrada en `SPELLS`.

### Receta B: Cómo añadir una nueva Habilidad de Aprendizaje
1. Abre `src/data/specialSkills.ts` y añade la habilidad en `SPECIAL_SKILLS` indicando:
   - `id`, `name`, `category`, `formula`, `formulaText`, `requiresSpecification` (booleano) y opcionalmente `restrictedTo` (si solo ciertos orígenes/especialidades pueden aprenderla).
2. Si algún origen la regala (`isFree`), añade su `id` en `src/data/freeOriginSkills.ts`.
3. Si alguna especialidad de *Vigilante* la exige (`isRequired`), añade su `id` en `src/data/requiredSpecialtySkills.ts`.
4. Si algún origen/especialidad le da un bono porcentual fijo, añádelo en `src/data/originSkillModifiers.ts`.

### Receta C: Cómo añadir una nueva Sección Condicional de Origen en el Paso 3
1. Añade las opciones estáticas y sus costes en `src/data/specialOriginOptions.ts`.
2. Añade el campo de parámetros en `CharacterData` (`src/types/character.ts`) y su valor por defecto en `initialCharacterState` (`src/data/wizardConfig.ts`).
3. Verifica o añade el flag booleano correspondiente en `getCharacterOriginFlags` (`src/utils/calculations/originFlags.ts`).
4. Crea el componente visual en `src/components/wizard/steps/Step3_Especials/sections/MiNuevoOrigenSection.tsx` y rénderizalo dentro de `OriginSpecificSections.tsx`.
5. Si sus opciones tienen coste o descuento en PC, añade el cálculo puro en `src/utils/calculations/pcCalculations.ts`.

### Receta D: Cómo añadir una nueva Estadística Derivada o Regla de Combate
1. Modifica `calculateDerivedStats` en `src/utils/calculations/derivedStatsCalculations.ts`.
2. Si la estadística muestra desglose (`base`, `originMod`, etc.), incluye su clave en `BREAKDOWN_COMBAT_FIELDS` o `BREAKDOWN_STAT_FIELDS` dentro del mismo archivo para que `syncDerivedStats` y `buildManualStatUpdate` la gestionen automáticamente.
3. Añade un test unitario en `tests/combatAndAdapter.test.ts` o `tests/characterReducer.test.ts`.

---

## 4. Checklist Antes de Hacer Commit (Para Agentes IA)

- [ ] ¿Se mantuvo la **Fuente Única de Verdad** (sin copiar `data` en `useState` locales ni crear `useEffect` de sincronización en los pasos)?
- [ ] ¿Se actualizó `withTransformationsSync` en `src/utils/characterReducer.ts` si se añadió un nuevo cálculo derivado?
- [ ] ¿Pasan todos los tests con `npm test`?
- [ ] ¿Pasa `npm run check` con **0 errors y 0 warnings**?
- [ ] ¿Se mantiene la invariante Round-Trip (`tests/roundTripIntegration.test.ts`) al exportar e importar el JSON del personaje?
