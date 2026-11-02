import { describe, it, expect } from 'vitest';
import {
    FREE_ORIGIN_SKILLS,
    getFreeSkillsForOrigins
} from '../src/data/freeOriginSkills';
import {
    REQUIRED_SPECIALTY_SKILLS,
    getRequiredSkillsForOrigins
} from '../src/data/requiredSpecialtySkills';

describe('Punto 4: Origen y Habilidades Libres / Requeridas', () => {
    describe('freeOriginSkills - getFreeSkillsForOrigins', () => {
        it('retorna array vacío si origins es null, undefined o vacío', () => {
            expect(getFreeSkillsForOrigins([])).toEqual([]);
            expect(getFreeSkillsForOrigins(null as any)).toEqual([]);
            expect(getFreeSkillsForOrigins(undefined as any)).toEqual([]);
        });

        it('obtiene habilidades cuando el origen principal coincide con una clave en FREE_ORIGIN_SKILLS', () => {
            const origins = [{ 'Tes-khar': [] }];
            const skills = getFreeSkillsForOrigins(origins);
            expect(skills).toEqual(['trampas', 'farmacologia']);
        });

        it('obtiene habilidades cuando un subtipo coincide con FREE_ORIGIN_SKILLS', () => {
            const origins = [{ 'Parahumano': ['Tes-khar'] }];
            const skills = getFreeSkillsForOrigins(origins);
            expect(skills).toEqual(['trampas', 'farmacologia']);
        });

        it('no duplica habilidades si múltiples entradas otorgan las mismas', () => {
            const origins = [
                { 'Tes-khar': [] },
                { 'Parahumano': ['Tes-khar'] }
            ];
            const skills = getFreeSkillsForOrigins(origins);
            expect(skills).toEqual(['trampas', 'farmacologia']);
        });

        it('maneja orígenes con subtipos desconocidos o sin contenido array', () => {
            const origins = [
                { 'Humano': ['Estándar'] },
                { 'Mutante': null as any },
                { 'Arcano': 'Terrano' as any }
            ];
            expect(getFreeSkillsForOrigins(origins)).toEqual([]);
        });

        it('FREE_ORIGIN_SKILLS contiene las definiciones esperadas', () => {
            expect(FREE_ORIGIN_SKILLS['Tes-khar']).toBeDefined();
            expect(FREE_ORIGIN_SKILLS['Tes-khar']).toContain('trampas');
            expect(FREE_ORIGIN_SKILLS['Tes-khar']).toContain('farmacologia');
        });
    });

    describe('requiredSpecialtySkills - getRequiredSkillsForOrigins', () => {
        it('retorna array vacío si origins es null, undefined o vacío', () => {
            expect(getRequiredSkillsForOrigins([])).toEqual([]);
            expect(getRequiredSkillsForOrigins(null as any)).toEqual([]);
            expect(getRequiredSkillsForOrigins(undefined as any)).toEqual([]);
        });

        it('ignora orígenes que no sean Vigilante', () => {
            const origins = [
                { 'Arcano': ['Terrano'] },
                { 'Sobrenatural': ['Hombre Lobo'] },
                { 'Parahumano': ['Atlante'] }
            ];
            expect(getRequiredSkillsForOrigins(origins)).toEqual([]);
        });

        it('obtiene habilidades obligatorias para una especialidad de Vigilante', () => {
            const origins = [{ 'Vigilante': ['Arquero'] }];
            expect(getRequiredSkillsForOrigins(origins)).toEqual(['arcos']);
        });

        it('obtiene múltiples habilidades obligatorias para cazador', () => {
            const origins = [{ 'Vigilante': ['Cazador'] }];
            expect(getRequiredSkillsForOrigins(origins)).toEqual(['trampas', 'rastrear']);
        });

        it('deduplica habilidades compartidas entre especialidades (ej. Artista Marcial y Chi)', () => {
            const origins = [{ 'Vigilante': ['Artista Marcial', 'Artista Marcial con Chi'] }];
            const skills = getRequiredSkillsForOrigins(origins);
            expect(skills).toEqual(['artes_marciales']);
        });

        it('acumula habilidades de varias especialidades de Vigilante', () => {
            const origins = [{
                'Vigilante': [
                    'Espadachín',
                    'Espia/Ladrón',
                    'Francotirador',
                    'Manipulador',
                    'Mente Maestra',
                    'Militar',
                    'Pistolero'
                ]
            }];
            const skills = getRequiredSkillsForOrigins(origins);
            expect(skills).toContain('armas_blancas');
            expect(skills).toContain('robar');
            expect(skills).toContain('armas_largas');
            expect(skills).toContain('otro_idioma');
            expect(skills).toContain('computadoras');
            expect(skills).toContain('armas_militares');
            expect(skills).toContain('armas_cortas');
            expect(skills).toHaveLength(7);
        });

        it('maneja casos donde el contenido de Vigilante no es un array o contiene especialidades desconocidas', () => {
            const origins = [
                { 'Vigilante': null as any },
                { 'Vigilante': ['EspecialidadInexistente'] }
            ];
            expect(getRequiredSkillsForOrigins(origins)).toEqual([]);
        });

        it('REQUIRED_SPECIALTY_SKILLS contiene el mapeo completo de especialidades documentadas', () => {
            expect(REQUIRED_SPECIALTY_SKILLS['Artista Marcial']).toEqual(['artes_marciales']);
            expect(REQUIRED_SPECIALTY_SKILLS['Arquero']).toEqual(['arcos']);
            expect(REQUIRED_SPECIALTY_SKILLS['Cazador']).toEqual(['trampas', 'rastrear']);
            expect(REQUIRED_SPECIALTY_SKILLS['Espadachín']).toEqual(['armas_blancas']);
            expect(REQUIRED_SPECIALTY_SKILLS['Espia/Ladrón']).toEqual(['robar']);
            expect(REQUIRED_SPECIALTY_SKILLS['Francotirador']).toEqual(['armas_largas']);
            expect(REQUIRED_SPECIALTY_SKILLS['Manipulador']).toEqual(['otro_idioma']);
            expect(REQUIRED_SPECIALTY_SKILLS['Mente Maestra']).toEqual(['computadoras']);
            expect(REQUIRED_SPECIALTY_SKILLS['Militar']).toEqual(['armas_militares']);
            expect(REQUIRED_SPECIALTY_SKILLS['Pistolero']).toEqual(['armas_cortas']);
        });
    });
});
