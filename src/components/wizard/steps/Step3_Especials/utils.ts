import { getCharacterOriginFlags } from '../../../../utils/calculations/originFlags';

export {
    hasOrigin,
    hasSubtype,
    isGuardian,
    isMaldito,
    getVigilanteSpecialties,
    getCharacterOriginFlags
} from '../../../../utils/calculations/originFlags';

export type CharacterOriginFlags = ReturnType<typeof getCharacterOriginFlags>;

export {
    calculateEM
} from '../../../../utils/calculations/magicCalculations';

export {
    getCharacteristicValue,
    calculateSkillBase,
    getRankLevel,
    type PowerContext,
    type PowerCostConfig,
    getPowerCostConfig,
    getBaseCostAdjustment,
    calculatePowerBaseCost,
    getMutantPowerTypes,
    getMutantType,
    isPowerCrossType,
    getPowerPenalty
} from '../../../../utils/calculations/powerCalculations';
