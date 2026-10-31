/**
 * Punto de entrada único y centralizado para la capa de datos de Superhéroes Inc.
 * Agrupa y expone de forma modular todas las tablas de reglas, catálogos y configuraciones.
 */

// ── 1. Metadatos y Versión ──────────────────────────────────────────────────
export * from './appVersions';

// ── 2. Orígenes, Subtipos y Opciones Específicas ────────────────────────────
export * from './originDefinitions';
export * from './originCosts';
export { calculateOriginCost } from '../utils/calculations/originCalculations';
export * from './originOptions';
export * from './divineOptions';
export * from './guardianOptions';
export * from './werewolfOptions';
export * from './sequels';

// ── 3. Características y Modificadores ──────────────────────────────────────
export * from './characteristicModifiers';

// ── 4. Habilidades (Generales, Especiales, Gratuitas y Requeridas) ───────────
export * from './generalSkills';
export * from './specialSkills';
export * from './freeOriginSkills';
export * from './requiredSpecialtySkills';
export * from './skillModifiers';

// ── 5. Poderes ──────────────────────────────────────────────────────────────
export * from './powers';

// ── 6. Magia, Hechizos y Objetos Mágicos ────────────────────────────────────
export * from './spells';
export * from './magicalBonds';
export * from './magicObjects';

// ── 7. Subsistema Tecnológico, Módulos y Artefactos ─────────────────────────
export * from './technologicalData';
export * from './techModules';
export * from './artifacts';

// ── 8. Combate, Trasfondo y Tablas Generales ────────────────────────────────
export * from './combatData';
export * from './backgroundTables';

// ── 9. Configuración y Ayuda del Asistente (Wizard) ─────────────────────────
export * from './wizardConfig';
export * from './wizardHelp';
