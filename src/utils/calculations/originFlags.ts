import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';
import type { CharacterOriginFlags } from '../../types/character';

/**
 * Normaliza la lista de items de origen de un personaje (soporta `origin.items` y `origins`)
 */
export function getOriginItems(data: any): Array<Record<string, string[]>> {
    if (!data) return [];
    if (Array.isArray(data.origin?.items)) return data.origin.items;
    if (Array.isArray(data.origins)) return data.origins;
    return [];
}

/**
 * Comprueba si el personaje tiene un origen principal específico.
 */
export function hasOrigin(data: any, originName: string): boolean {
    const items = getOriginItems(data);
    return items.some((item: any) => {
        if (!item || typeof item !== 'object') return false;
        const key = Object.keys(item)[0];
        if (originName === 'Guardián' || originName === 'Guardian') {
            return key === 'Guardián' || key === 'Guardian';
        }
        return key === originName;
    });
}

/**
 * Comprueba si el personaje tiene un subtipo específico dentro de un origen
 * (o si el subtipo aparece directamente como clave de origen en fichas legacy).
 */
export function hasSubtype(data: any, originName: string, subtypeName: string): boolean {
    const items = getOriginItems(data);
    return items.some((item: any) => {
        if (!item || typeof item !== 'object') return false;
        const key = Object.keys(item)[0];
        // En algunas fichas legacy el subtipo puede venir como clave directa
        if (key === subtypeName) return true;
        if (key !== originName) return false;
        const subtypes = item[key];
        return Array.isArray(subtypes) && subtypes.includes(subtypeName);
    });
}

/**
 * Comprueba si el personaje tiene Guardián (con o sin tilde)
 */
export function isGuardian(data: any): boolean {
    return hasOrigin(data, 'Guardián') || hasOrigin(data, 'Guardian');
}

/**
 * Comprueba si el personaje tiene el subtipo Maldito
 */
export function isMaldito(data: any): boolean {
    return hasSubtype(data, 'Sobrenatural', 'Maldito') || hasOrigin(data, 'Maldito');
}

/**
 * Comprueba si el personaje tiene el subtipo Poseído
 */
export function isPoseido(data: any): boolean {
    return hasSubtype(data, 'Sobrenatural', 'Poseído');
}

/**
 * Obtiene las especialidades reales de Vigilante seleccionadas (excluyendo defaultEffects)
 */
export function getVigilanteSpecialties(data: any): string[] {
    const items = getOriginItems(data);
    const vigItem = items.find((item: any) => Object.keys(item)[0] === 'Vigilante');
    if (!vigItem) return [];

    const allValues: string[] = vigItem['Vigilante'] || [];
    const vigilanteDef = ORIGIN_CATEGORIES['Vigilante'];
    const defaultEffects = vigilanteDef?.defaultEffects || [];
    const validSubtypes = vigilanteDef?.subtypes ? Object.keys(vigilanteDef.subtypes) : [];

    return allValues.filter(v => validSubtypes.includes(v) && !defaultEffects.includes(v));
}

/**
 * Devuelve la lista de sendas de Liberado activas en el personaje
 */
export function getActiveLiberadoSubtypes(data: any): string[] {
    const items = getOriginItems(data);
    const result: string[] = [];

    items.forEach((item: any) => {
        if (!item || typeof item !== 'object') return;
        const originName = Object.keys(item)[0];
        if (typeof originName === 'string' && originName.startsWith('Liberado')) {
            if (!result.includes(originName)) result.push(originName);
        }
        const content = item[originName];
        if (Array.isArray(content)) {
            content.forEach((s: string) => {
                if (typeof s === 'string' && s.startsWith('Liberado')) {
                    if (!result.includes(s)) result.push(s);
                }
            });
        }
    });

    return result;
}

/**
 * Calcula de una sola vez todos los flags booleanos de orígenes y subtipos del personaje.
 */
export function getCharacterOriginFlags(data: any): CharacterOriginFlags {
    const isGuardianChar = isGuardian(data);
    const isAlterado = hasOrigin(data, 'Alterado');
    const isParahumano = hasOrigin(data, 'Parahumano');
    const isParahumanoHybrid = Boolean(
        data?.isParahumanoHybrid ||
        (isParahumano && data?.parahumanoParams?.isHybridWithHuman === true)
    );
    const isMutante = hasOrigin(data, 'Mutante');
    const isVigilante = hasOrigin(data, 'Vigilante');
    const isCosmico = hasOrigin(data, 'Cósmico');
    const isTecnologico = hasOrigin(data, 'Tecnológico');

    // Arcano
    const isMago = hasSubtype(data, 'Arcano', 'Mago');
    const isDotado = hasSubtype(data, 'Arcano', 'Dotado');
    const isHibrido = hasSubtype(data, 'Arcano', 'Híbrido mitológico');
    const isTerrano = hasSubtype(data, 'Arcano', 'Terrano');
    const isElfoMagico = hasSubtype(data, 'Arcano', 'Elfo Mágico');
    const isElfoFisico = hasSubtype(data, 'Arcano', 'Elfo Físico');
    const isElfoPsiquico = hasSubtype(data, 'Arcano', 'Elfo Psíquico');
    const isHadaEter = hasSubtype(data, 'Arcano', 'Hada Eter');
    const isHadaAire = hasSubtype(data, 'Arcano', 'Hada Aire');
    const isHadaFuego = hasSubtype(data, 'Arcano', 'Hada Fuego');
    const isHadaAgua = hasSubtype(data, 'Arcano', 'Hada Agua');
    const isHadaTierra = hasSubtype(data, 'Arcano', 'Hada Tierra');
    const isHada = isHadaEter || isHadaAire || isHadaFuego || isHadaAgua || isHadaTierra;
    const isGrifo = hasSubtype(data, 'Arcano', 'Grifo');
    const isTroll = hasSubtype(data, 'Arcano', 'Troll');
    const isMinotauro = hasSubtype(data, 'Arcano', 'Minotauro');
    const isEnano = hasSubtype(data, 'Arcano', 'Enano');

    // Sobrenatural
    const isPoseidoChar = isPoseido(data);
    const isMalditoChar = isMaldito(data);
    const isVampiro = hasSubtype(data, 'Sobrenatural', 'Vampiro');
    const isHombreLobo = hasSubtype(data, 'Sobrenatural', 'Hombre Lobo') || hasOrigin(data, 'Hombre Lobo');
    const isSemidemonio = hasSubtype(data, 'Sobrenatural', 'Semidemonio');
    const isEnte = hasSubtype(data, 'Sobrenatural', 'Ente');
    const isLiberadoEntropia = hasSubtype(data, 'Sobrenatural', 'Liberado de Entropía');
    const isLiberadoUnidad = hasSubtype(data, 'Sobrenatural', 'Liberado de Unidad');
    const isLiberadoEquidad = hasSubtype(data, 'Sobrenatural', 'Liberado de Equidad');
    const activeLiberados = getActiveLiberadoSubtypes(data);
    const isLiberado = isLiberadoEntropia || isLiberadoUnidad || isLiberadoEquidad || activeLiberados.length > 0;
    const hasConocimientoEsferas = isLiberado && (
        Array.isArray(data?.liberadoParams?.gifts)
            ? data.liberadoParams.gifts.includes('conocimiento_esferas')
            : data?.liberadoParams?.gift === 'conocimiento_esferas'
    );

    // Parahumano
    const isThals = hasSubtype(data, 'Parahumano', 'Thals');
    const isTesKhar = hasSubtype(data, 'Parahumano', 'Tes-khar');
    const isAtlante = hasSubtype(data, 'Parahumano', 'Atlante');

    // Divino
    const isDios = hasSubtype(data, 'Divino', 'Dios');
    const isDiosMenor = hasSubtype(data, 'Divino', 'Dios menor');
    const isSemidios = hasSubtype(data, 'Divino', 'Semidios');
    const isDivino = hasOrigin(data, 'Divino') || isDios || isDiosMenor || isSemidios;

    // Cósmico
    const isHeraldoCosmico = hasSubtype(data, 'Cósmico', 'Heraldo Cósmico');

    // Tecnológico
    const isTecnoarmadura = hasSubtype(data, 'Tecnológico', 'Tecnoarmadura');
    const isCyborg = hasSubtype(data, 'Tecnológico', 'Cyborg');
    const isTecnovehiculo = hasSubtype(data, 'Tecnológico', 'Tecnovehículo');
    const isExoskeleton = hasSubtype(data, 'Tecnológico', 'Exoesqueleto Energético');
    const isInventor = hasSubtype(data, 'Tecnológico', 'Inventor o forjador');
    const isTechnological = isTecnoarmadura || isCyborg || isTecnovehiculo || isInventor;

    // EM & Agrupaciones
    const hasBaseEMOrigin = isMago || isElfoMagico || isHadaEter || isDotado || isHibrido || isTerrano || isPoseidoChar;
    const hasEMFormula = !isMago && !isElfoMagico && !isHadaEter && (isDotado || isHibrido || isTerrano || isPoseidoChar);
    const hasEM = hasBaseEMOrigin || isLiberado;

    const hasAnyOrigin =
        isGuardianChar || isAlterado || hasEM || isVampiro || isSemidemonio || isMalditoChar ||
        isEnte || isThals || isDivino || isCosmico || isMutante || isVigilante || isTechnological || isExoskeleton ||
        isTesKhar || isAtlante || isParahumano || isTroll || isMinotauro || isPoseidoChar || isEnano || isGrifo ||
        isElfoFisico || isElfoPsiquico || isHada || isLiberado || isHombreLobo;

    return {
        isGuardian: isGuardianChar,
        isAlterado,
        isParahumano,
        isParahumanoHybrid,
        isMutante,
        isVigilante,
        isCosmico,
        isDivino,
        isTecnologico,

        isMago,
        isDotado,
        isHibrido,
        isTerrano,
        isElfoMagico,
        isElfoFisico,
        isElfoPsiquico,
        isHadaEter,
        isHadaAire,
        isHadaFuego,
        isHadaAgua,
        isHadaTierra,
        isHada,
        isGrifo,
        isTroll,
        isMinotauro,
        isEnano,

        isPoseido: isPoseidoChar,
        isMaldito: isMalditoChar,
        isVampiro,
        isHombreLobo,
        isSemidemonio,
        isEnte,
        isLiberadoEntropia,
        isLiberadoUnidad,
        isLiberadoEquidad,
        isLiberado,
        activeLiberados,
        hasConocimientoEsferas,

        isThals,
        isTesKhar,
        isAtlante,

        isDios,
        isDiosMenor,
        isSemidios,

        isHeraldoCosmico,

        isTecnoarmadura,
        isCyborg,
        isTecnovehiculo,
        isExoskeleton,
        isInventor,
        isTechnological,

        hasBaseEMOrigin,
        hasEMFormula,
        hasEM,
        hasAnyOrigin
    };
}
