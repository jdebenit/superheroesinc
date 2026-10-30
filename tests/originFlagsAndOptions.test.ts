import { describe, it, expect } from 'vitest';
import {
    hasOrigin,
    hasSubtype,
    isGuardian,
    isMaldito,
    isPoseido,
    getVigilanteSpecialties,
    getActiveLiberadoSubtypes,
    getCharacterOriginFlags
} from '../src/utils/calculations/originFlags';
import {
    ENTE_FORMS,
    ENTE_EFFECTS,
    POSEIDO_FORMS,
    MALDITO_DATA,
    ALTERADO_DATA,
    LIBERADO_CONFIGS,
    LIBERADO_DONES_COST,
    getLiberadoConfig,
    getLiberadoDones
} from '../src/data/originOptions';

describe('Fase 1: Detector Único de Orígenes y Subtipos (originFlags)', () => {
    it('detecta orígenes simples y maneja variantes como Guardián / Guardian', () => {
        const charGuardianTilde = { origin: { items: [{ 'Guardián': [] }] } };
        const charGuardianSinTilde = { origin: { items: [{ 'Guardian': [] }] } };

        expect(hasOrigin(charGuardianTilde, 'Guardián')).toBe(true);
        expect(hasOrigin(charGuardianTilde, 'Guardian')).toBe(true);
        expect(isGuardian(charGuardianTilde)).toBe(true);
        expect(isGuardian(charGuardianSinTilde)).toBe(true);
        expect(hasOrigin(charGuardianTilde, 'Mutante')).toBe(false);
    });

    it('detecta el subtipo Poseído correctamente', () => {
        const char1 = { origin: { items: [{ Sobrenatural: ['Poseído'] }] } };
        const char2 = { origin: { items: [{ Sobrenatural: ['Vampiro'] }] } };

        expect(isPoseido(char1)).toBe(true);
        expect(isPoseido(char2)).toBe(false);
    });

    it('filtra defaultEffects al obtener las especialidades reales de Vigilante', () => {
        const charVigilante = {
            origin: {
                items: [
                    {
                        Vigilante: [
                            'Disponibilidad de armamento a dificultad reducida',
                            'Artista Marcial',
                            'Francotirador'
                        ]
                    }
                ]
            }
        };

        const specs = getVigilanteSpecialties(charVigilante);
        expect(specs).toEqual(['Artista Marcial', 'Francotirador']);
    });

    it('detecta sendas de Liberado y el don Conocimiento de las esferas', () => {
        const charLiberado = {
            origin: {
                items: [{ Sobrenatural: ['Liberado de Entropía', 'Liberado de Equidad'] }]
            },
            liberadoParams: {
                gifts: ['conocimiento_esferas', 'comprension_senda']
            }
        };

        expect(getActiveLiberadoSubtypes(charLiberado)).toEqual([
            'Liberado de Entropía',
            'Liberado de Equidad'
        ]);

        const flags = getCharacterOriginFlags(charLiberado);
        expect(flags.isLiberado).toBe(true);
        expect(flags.isLiberadoEntropia).toBe(true);
        expect(flags.isLiberadoEquidad).toBe(true);
        expect(flags.isLiberadoUnidad).toBe(false);
        expect(flags.hasConocimientoEsferas).toBe(true);
        expect(flags.hasEM).toBe(true);
        expect(flags.hasBaseEMOrigin).toBe(false);
    });

    it('calcula todos los flags derivados para orígenes complejos (Arcano, Tecnológico, Parahumano Híbrido)', () => {
        const charComplex = {
            origin: {
                items: [
                    { Arcano: ['Dotado', 'Hada Fuego'] },
                    { Tecnológico: ['Tecnoarmadura', 'Cyborg'] },
                    { Parahumano: ['Atlante'] }
                ]
            },
            parahumanoParams: { isHybridWithHuman: true }
        };

        const flags = getCharacterOriginFlags(charComplex);
        expect(flags.isDotado).toBe(true);
        expect(flags.isHadaFuego).toBe(true);
        expect(flags.isHada).toBe(true);
        expect(flags.isTecnologico).toBe(true);
        expect(flags.isTecnoarmadura).toBe(true);
        expect(flags.isCyborg).toBe(true);
        expect(flags.isTechnological).toBe(true);
        expect(flags.isParahumano).toBe(true);
        expect(flags.isAtlante).toBe(true);
        expect(flags.isParahumanoHybrid).toBe(true);
        expect(flags.hasBaseEMOrigin).toBe(true);
        expect(flags.hasEMFormula).toBe(true);
        expect(flags.hasEM).toBe(true);
        expect(flags.hasAnyOrigin).toBe(true);
    });
});

describe('Fase 1: Constantes de Orígenes Compartidas (originOptions)', () => {
    it('expone tablas consistentes para Ente, Poseído, Maldito, Alterado y Liberado', () => {
        expect(ENTE_FORMS.find(f => f.id === 'humanoid')?.cost).toBe(1);
        expect(ENTE_EFFECTS.find(e => e.id === 'hidden')?.cost).toBe(2);
        expect(POSEIDO_FORMS.find(f => f.id === 'no_humana')?.cost).toBe(-3);
        expect(MALDITO_DATA.MAGNITUDE.find(m => m.id === 'marked')?.cost).toBe(5);
        expect(ALTERADO_DATA.AGENTS.find(a => a.id === 'treatment')?.cost).toBe(2);

        const unidadCfg = getLiberadoConfig('Liberado de Unidad');
        expect(unidadCfg.entityName).toBe('Unidad');
        const dones = getLiberadoDones(unidadCfg);
        expect(dones.map(d => d.cost)).toEqual([
            LIBERADO_DONES_COST.conocimiento_esferas,
            LIBERADO_DONES_COST.comprension_senda,
            LIBERADO_DONES_COST.maestro_senda
        ]);
        expect(Object.keys(LIBERADO_CONFIGS).length).toBe(3);
    });
});
