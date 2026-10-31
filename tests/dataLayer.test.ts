import { describe, it, expect } from 'vitest';
import * as DataLayer from '../src/data';
import * as TechModule from '../src/data/technologicalData';
import * as CyborgLegacy from '../src/data/cyborgImplantConfigs';
import * as ExoArmorLegacy from '../src/data/exoskeletonArmorConfigs';
import * as ExoSuitLegacy from '../src/data/exoskeletonConfigs';
import * as TechSuitLegacy from '../src/data/technoSuitStrengthConfigs';
import * as TechOptionsLegacy from '../src/data/technologicalOptions';

describe('Capa de Datos Centralizada (Data Layer)', () => {
    describe('Barrel Export (src/data/index.ts)', () => {
        it('exporta correctamente los catálogos y tablas maestras del sistema', () => {
            // Orígenes y costes
            expect(DataLayer.ORIGIN_CATEGORIES).toBeDefined();
            expect(DataLayer.ORIGIN_COSTS).toBeDefined();
            expect(DataLayer.calculateOriginCost).toBeDefined();

            // Opciones específicas
            expect(DataLayer.ENTE_FORMS).toBeDefined();
            expect(DataLayer.POSEIDO_FORMS).toBeDefined();
            expect(DataLayer.MALDITO_MAGNITUDE).toBeDefined();
            expect(DataLayer.WEREWOLF_SUBTYPES).toBeDefined();

            // Habilidades y poderes
            expect(DataLayer.GENERAL_SKILLS.length).toBeGreaterThan(0);
            expect(DataLayer.SPECIAL_SKILLS.length).toBeGreaterThan(0);
            expect(DataLayer.POWERS.length).toBeGreaterThan(0);

            // Magia y equipo
            expect(DataLayer.SPELLS.length).toBeGreaterThan(0);
            expect(DataLayer.TECH_MODULES.length).toBeGreaterThan(0);
            expect(DataLayer.ARTIFACTS.length).toBeGreaterThan(0);

            // Asistente (Wizard)
            expect(DataLayer.STEPS.length).toBe(7);
            expect(DataLayer.initialCharacterState).toBeDefined();
        });
    });

    describe('Subsistema Tecnológico Cohesionado (technologicalData.ts)', () => {
        it('expone todas las configuraciones tecnológicas con integridad de datos', () => {
            // Fuentes de ingreso
            expect(TechModule.INCOME_SOURCES.length).toBe(5);
            TechModule.INCOME_SOURCES.forEach(s => {
                expect(s.id).toBeDefined();
                expect(s.label).toBeTruthy();
                expect(typeof s.pc).toBe('number');
            });

            // Exoesqueleto
            expect(TechModule.EXOSKELETON_CONFIGS.length).toBe(11);
            TechModule.EXOSKELETON_CONFIGS.forEach(exo => {
                expect(exo.id).toMatch(/^exo_config_/);
                expect(exo.pcCost).toBeGreaterThan(0);
                expect(exo.fue).toBeGreaterThanOrEqual(100);
            });

            // Tecnoarmadura
            expect(TechModule.EXOSKELETON_ARMOR_CONFIGS.length).toBe(6);
            TechModule.EXOSKELETON_ARMOR_CONFIGS.forEach(armor => {
                expect(armor.id).toMatch(/^exo_armor_/);
                expect(armor.pcCost).toBeGreaterThan(0);
            });

            expect(TechModule.TECHNOSUIT_STRENGTH_CONFIGS.length).toBe(11);
            TechModule.TECHNOSUIT_STRENGTH_CONFIGS.forEach(str => {
                expect(str.id).toMatch(/^ts_str_/);
                expect(str.fuerza).toBeGreaterThanOrEqual(100);
            });

            // Cyborg
            expect(TechModule.CYBORG_IMPLANT_STATS.length).toBe(6);
            expect(TechModule.CYBORG_IMPLANT_STRENGTHS.length).toBe(6);
        });

        it('mantiene retrocompatibilidad exacta (100%) con los 5 micro-archivos legacy', () => {
            expect(CyborgLegacy.CYBORG_IMPLANT_STATS).toBe(TechModule.CYBORG_IMPLANT_STATS);
            expect(CyborgLegacy.CYBORG_IMPLANT_STRENGTHS).toBe(TechModule.CYBORG_IMPLANT_STRENGTHS);
            expect(ExoArmorLegacy.EXOSKELETON_ARMOR_CONFIGS).toBe(TechModule.EXOSKELETON_ARMOR_CONFIGS);
            expect(ExoSuitLegacy.EXOSKELETON_CONFIGS).toBe(TechModule.EXOSKELETON_CONFIGS);
            expect(TechSuitLegacy.TECHNOSUIT_STRENGTH_CONFIGS).toBe(TechModule.TECHNOSUIT_STRENGTH_CONFIGS);
            expect(TechOptionsLegacy.INCOME_SOURCES).toBe(TechModule.INCOME_SOURCES);
        });
    });
});
