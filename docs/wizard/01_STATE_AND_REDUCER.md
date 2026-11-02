# 01. Estado Central (`CharacterData`), Reducer y Pipeline de Sincronización

Este documento detalla cómo se estructura, persiste, valida y sincroniza el estado del personaje en el Wizard.

---

## 1. Estructura de `CharacterData`

Definida en `src/types/character.ts` e inicializada mediante `initialCharacterState` en `src/data/wizardConfig.ts`.

```ts
export interface CharacterData {
    meta: {
        version: string;          // Versión actual desde APP_VERSIONS.WIZARD
        generator: string;        // 'SHI Wizard'
    };
    // Identidad y Nivel (Paso 6)
    name: string;
    alias: string;
    profession: string;
    sexualIdentity: string;
    notes: string;
    level: number;                // Nivel del personaje (por defecto 1)
    modPerLevel: {                // Modificadores elegidos al subir de nivel
        combat: number;
        Calculated: boolean;
        general: number;
        special: number;
    };

    // Orígenes y Parámetros Especiales (Pasos 1, 2 y 3)
    origin: {
        items: Array<Record<string, string[]>>; // Ej: [{ "Sobrenatural": ["Hombre Lobo"] }, { "Vigilante": ["Artista Marcial"] }]
    };
    chosenBonusCharacteristic?: string | null;  // Legacy / primer bono elegido
    chosenCharacteristics?: Record<string, string>; // Mapa { [originKey]: charId } (ej: { "Liberado de la Entropía": "fuerza" })
    parahumanoParams?: { isHybridWithHuman: boolean };
    enteParams?: { formType: string | null; visualEffect: string | null };
    malditoParams?: { magnitude: string | null; source: string | null };
    poseidoParams?: { formType: string | null };
    alteradoParams?: { agent: string | null; sequels: string[] };
    mutanteParams?: { sequels: string[] };
    hibridoParams?: { sequels: string[] };
    guardianParams?: { quality: string | null; objectType: string | null; feature: string | null; transformation: string | null };
    divineParams?: { focus: string | null };
    liberadoParams?: { gift: string };
    werewolfParams?: { subtype: 'renegado' | 'hibrido' | 'lobishome' };
    techParams?: { incomeSource?: string; isArmor?: boolean } | null;
    traumas?: Record<string, string>;           // Mapa { [vigilanteSpecialty]: description }

    // Características (Paso 2)
    attributes: {
        values: {
            Fuerza: number;
            Constitución: number;
            Agilidad: number;
            Inteligencia: number;
            Percepción: number;
            Apariencia: number;
            Voluntad: number;
        };
        breakdown?: Record<string, {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
            otherMod?: number;
        }>;
        manualBonuses?: Record<string, number>;
    };

    // Poderes, Magia y Tecnología (Paso 3)
    powers: {
        selected: SelectedPower[];
    };
    spells: {
        emFormula?: { divisor: number; pcCost: number };
        calculatedEM?: number;
        calculatedEMFormula?: string;
        emBreakdown?: { base: number; divisor: number; originBonus: number; powerPenalty: number; total: number };
        selected: SelectedSpell[];
    };
    magicTableRolls?: string[];
    magicalBonds?: string[];
    techModules?: TechModule[];
    exoskeletonConfig?: string | null;
    exoskeletonArmorConfig?: string | null;
    technoSuitStrengthConfig?: string | null;
    cyborgImplants?: CyborgImplant[];

    // Habilidades (Paso 4)
    skills: {
        generalManualMods?: Record<string, number>;
        manualBases?: Record<string, number>;
        nativeLanguage: string;
        selected: Record<string, { isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number }>;
        specified: Record<string, { skillId: string; specification: string; isFree: boolean; isRequired: boolean; manualMods: number; manualBases: number }>;
        generalItems: SkillDisplayItem[];
        specialItems: SkillDisplayItem[];
    };

    // Trasfondo (Paso 5)
    background: {
        prejudiceResistance: number;
        economicStatus: string;
        legalStatus: string;
        socialStatus: string;
        friendsAndAssociates: string;
        baseCoverage: string;
        items: string[];
    };

    // Estadísticas Derivadas, Formas y Equipo (Paso 6)
    combatstats: Record<string, any>;
    otherstats: Record<string, any>;
    forms?: any[];                // Formas alternativas sincronizadas (Hombre Lobo, Blindaje Natural, etc.)
    activeForm?: string;          // 'base' o ID de la forma activa en el visor
    equipment: { items: any[] };
    weapons: { items: any[] };
    artifacts: { items: any[] };
    vehicles: { items: any[] };
    varios: { items: any[] };
    uiState?: {
        unlockManualCharacteristics?: boolean;
        unlockManualSkills?: boolean;
        unlockManualStats?: boolean;
    };
}
```

---

## 2. El Pipeline de Auto-Sincronización (`withTransformationsSync`)

Ubicado en `src/utils/characterReducer.ts`, `withTransformationsSync(state, prevState)` se ejecuta automáticamente tras cualquier acción que modifique orígenes, parámetros de origen, características, poderes, habilidades, hechizos o nivel.

El orden de ejecución de sus **7 etapas** es estrictamente secuencial porque cada etapa alimenta a las siguientes:

```text
[ Acción despachada al Reducer ]
       │
       ▼
0. syncOriginAttributes(current, prevState)
   ├── Recalcula originMod y specialtyMod en attributes.breakdown
   ├── Ajusta límites máximos si cambió el origen o chosenCharacteristics
   └── Actualiza attributes.values (Fuerza, Constitución, etc.)
       │
       ▼
1. syncOriginAutoPowers(current)
   ├── Añade poderes innatos obligatorios según origen (Atlante, Troll, Tes-khar, Hadas, Vampiro, Semidemonio, Hombre Lobo...)
   └── Elimina poderes innatos cuyos orígenes hayan sido desmarcados
       │
       ▼
2. syncPowerModsToAttributes(current)
   ├── Calcula powerMod para poderes que aumentan características (ej. Superfuerza)
   └── Actualiza attributes.breakdown[char].powerMod y attributes.values
       │
       ▼
3. syncOriginSkills(current) + syncSkillFormattedItems(current)
   ├── Añade habilidades gratuitas de origen (isFree: true)
   ├── Marca/desmarca habilidades obligatorias de especialidad (isRequired: true)
   ├── Elimina habilidades exclusivas si se quitó la especialidad que las desbloqueaba
   └── Regenera skills.generalItems y skills.specialItems con sus porcentajes actualizados
       │
       ▼
4. syncMagicalEquilibrium(current)
   ├── Determina la fórmula de EM (divisor 1 para Mago/Elfo Mágico, 2 para Hada Éter, etc.)
   ├── Aplica bonos (+50 Mago, +35 Poseído, +20 Ente/Elfo Mágico) y penalizadores (-20 por poder en Dotado)
   └── Guarda calculatedEM, calculatedEMFormula y emBreakdown en current.spells
       │
       ▼
5. syncCharacterTransformations(current)
   ├── Genera/actualiza la Forma de Transición de Hombre Lobo (Renegado, Híbrido, Lobishome)
   ├── Genera/actualiza formas de poderes transformables (Blindaje Natural, Tamaño Inusual...)
   └── Calcula el coste en PC de cada forma alternativa
       │
       ▼
6. syncDerivedStats(current)
   ├── Recalcula combatstats y otherstats para la forma base (respetando overrides `personalizado`)
   └── Recalcula combatstats y otherstats internos de cada forma en transformation.forms
```

---

## 3. Persistencia, Importación y Exportación

1. **`useCharacterState.ts` (`localStorage`)**:
   - Al montar en el cliente, lee `localStorage.getItem('characterWizardState')`, aplica `mergeWithDefaults(parsed, initialCharacterState)` y despacha `SET_CHARACTER`.
   - En cada cambio posterior de `character`, persiste el JSON serializado en `localStorage`.
2. **Importación JSON (`useCharacterIO.ts` + `characterAdapter.ts`)**:
   - Valida el JSON entrante con `validateAndSanitizeCharacter(rawImport, fileName)` usando esquemas **Zod**.
   - Si es válido, despacha `loadCharacter(validation.character)` (`SET_CHARACTER`), que pasa por `mergeWithDefaults` y `withTransformationsSync`.
3. **Exportación JSON (`useJsonExport.ts` + `dataCleaner.ts`)**:
   - Limpia campos vacíos o puramente transitorios mediante `cleanCharacterDataForExport` sin alterar la estructura semántica para garantizar **idempotencia estricta (*N-Trip Invariance*)**: importar un JSON exportado produce exactamente los mismos PCs, atributos y estadísticas.
