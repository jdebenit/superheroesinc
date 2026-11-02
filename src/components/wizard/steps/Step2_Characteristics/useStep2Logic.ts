import { useMemo, useCallback } from 'react';
import {
    calculateOriginModifiers,
    calculateLimits,
    getChoosableCharacteristics,
    hasDistributablePoints,
    getDistributablePointsInfo,
    calculateSpecialtyModifiers,
    hasSpecialtyDistributablePoints,
    getSpecialtyDistributablePointsInfo,
    calculateSpecialtyAllowedCharacteristics,
    calculateCreationPoints
} from '../../../../utils/characterCalculations';

export const CHARACTERISTICS_CONFIG = [
    { id: 'fuerza', name: 'Fuerza', abbr: 'FUE' },
    { id: 'constitucion', name: 'Constitución', abbr: 'CON' },
    { id: 'agilidad', name: 'Agilidad', abbr: 'AGI' },
    { id: 'inteligencia', name: 'Inteligencia', abbr: 'INT' },
    { id: 'percepcion', name: 'Percepción', abbr: 'PER' },
    { id: 'apariencia', name: 'Apariencia', abbr: 'APA' },
    { id: 'voluntad', name: 'Voluntad', abbr: 'VOL' }
];

type CharacteristicBreakdownItem = {
    base: number;
    originMod: number;
    specialtyMod: number;
    powerMod: number;
    otherMod: number;
};

const DEFAULT_BREAKDOWN_ITEM: CharacteristicBreakdownItem = {
    base: 40,
    originMod: 0,
    specialtyMod: 0,
    powerMod: 0,
    otherMod: 0
};

export function useStep2Logic(data: any, onChange: (updates: any) => void) {
    const origins = data?.origin?.items || [];
    const choosableEntries = useMemo(() => getChoosableCharacteristics(origins), [origins]);

    // Derive chosenCharacteristics directly from data (Single Source of Truth)
    const chosenCharacteristics = useMemo<Record<string, string>>(() => {
        const init: Record<string, string> = { ...(data?.chosenCharacteristics || {}) };
        if (data?.chosenBonusCharacteristic && choosableEntries.length > 0 && !init[choosableEntries[0].originKey]) {
            init[choosableEntries[0].originKey] = data.chosenBonusCharacteristic;
        }
        return init;
    }, [data?.chosenCharacteristics, data?.chosenBonusCharacteristic, choosableEntries]);

    // Derive characteristics breakdown directly from data.attributes.breakdown
    const characteristics = useMemo<Record<string, CharacteristicBreakdownItem>>(() => {
        const raw = data?.attributes?.breakdown || {};
        const normalized: Record<string, CharacteristicBreakdownItem> = {};
        CHARACTERISTICS_CONFIG.forEach(({ id }) => {
            const item = raw[id] || DEFAULT_BREAKDOWN_ITEM;
            normalized[id] = {
                base: typeof item.base === 'number' ? item.base : 40,
                originMod: typeof item.originMod === 'number' ? item.originMod : 0,
                specialtyMod: typeof item.specialtyMod === 'number' ? item.specialtyMod : 0,
                powerMod: typeof item.powerMod === 'number' ? item.powerMod : 0,
                otherMod: typeof item.otherMod === 'number' ? item.otherMod : 0
            };
        });
        return normalized;
    }, [data?.attributes?.breakdown]);

    const unlockManualMod = Boolean(data?.uiState?.unlockManualCharacteristics);

    const isDistributableMode = hasDistributablePoints(origins) || choosableEntries.length > 0;
    const pointsInfo = isDistributableMode ? getDistributablePointsInfo(origins, characteristics, chosenCharacteristics) : null;
    const choosableInfo = choosableEntries.length > 0 ? choosableEntries[0] : null;
    const specialtyPointsInfo = hasSpecialtyDistributablePoints(origins) ? getSpecialtyDistributablePointsInfo(origins, characteristics) : null;
    const { pcValues, totalPC } = calculateCreationPoints(characteristics, origins);

    const getTotal = useCallback((charId: string) => {
        const c = characteristics[charId] || DEFAULT_BREAKDOWN_ITEM;
        return c.base + c.originMod + c.specialtyMod + c.powerMod + (c.otherMod || 0);
    }, [characteristics]);

    const handleCharacteristicChange = useCallback((charId: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        const defaultLimits = calculateLimits(origins, charId, chosenCharacteristics, data?.liberadoParams);
        const currentChar = characteristics[charId] || DEFAULT_BREAKDOWN_ITEM;
        const hasPowerMod = currentChar.powerMod > 0;
        const limits = {
            min: defaultLimits.min,
            max: (hasPowerMod || unlockManualMod) ? 200 : defaultLimits.max
        };

        const minAllowed = field === 'otherMod' ? -200 : 0;
        let clampedValue = Math.max(minAllowed, Math.min(limits.max, numValue));

        // Group-wise validation (Specialty Points)
        if (field === 'specialtyMod' && specialtyPointsInfo) {
            const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
            if (allowedChars && !allowedChars.includes(charId)) return;

            const fixedMods = calculateSpecialtyModifiers(origins);
            const fixedMod = fixedMods[charId] || 0;
            if (clampedValue < fixedMod) clampedValue = fixedMod;

            const newManualPoints = Math.max(0, clampedValue - fixedMod);
            const currentManualPoints = Math.max(0, currentChar.specialtyMod - fixedMod);
            const pointsDiff = newManualPoints - currentManualPoints;

            if (specialtyPointsInfo.remaining - pointsDiff < 0) return;
        }

        // Group-wise validation (Origin Points)
        if (field === 'originMod' && isDistributableMode) {
            const fixedOriginMods = calculateOriginModifiers(origins, chosenCharacteristics);
            const minOriginAllowed = fixedOriginMods[charId] || 0;
            if (clampedValue < minOriginAllowed) clampedValue = minOriginAllowed;

            const currentOriginMod = currentChar.originMod;
            const pointsInfoCurrent = getDistributablePointsInfo(origins, characteristics, chosenCharacteristics);
            const difference = clampedValue - currentOriginMod;

            if (pointsInfoCurrent.used + difference > pointsInfoCurrent.total) {
                clampedValue = currentOriginMod + (pointsInfoCurrent.total - pointsInfoCurrent.used);
            }
        }

        // Final total constraint check
        const projectedTotal =
            (field === 'base' ? clampedValue : currentChar.base) +
            (field === 'originMod' ? clampedValue : currentChar.originMod) +
            (field === 'specialtyMod' ? clampedValue : currentChar.specialtyMod) +
            (field === 'powerMod' ? clampedValue : currentChar.powerMod) +
            (field === 'otherMod' ? clampedValue : (currentChar.otherMod || 0));

        if (projectedTotal > limits.max) {
            const otherValues =
                (field !== 'base' ? currentChar.base : 0) +
                (field !== 'originMod' ? currentChar.originMod : 0) +
                (field !== 'specialtyMod' ? currentChar.specialtyMod : 0) +
                (field !== 'powerMod' ? currentChar.powerMod : 0) +
                (field !== 'otherMod' ? (currentChar.otherMod || 0) : 0);
            clampedValue = Math.max(minAllowed, limits.max - otherValues);
        }

        const nextBreakdown = {
            ...characteristics,
            [charId]: { ...currentChar, [field]: clampedValue }
        };

        const nextValues: Record<string, number> = {};
        CHARACTERISTICS_CONFIG.forEach(c => {
            const item = nextBreakdown[c.id];
            nextValues[c.name] = item.base + item.originMod + item.specialtyMod + item.powerMod + (item.otherMod || 0);
        });

        onChange({
            ...data,
            attributes: {
                ...(data?.attributes || {}),
                values: nextValues,
                breakdown: nextBreakdown
            }
        });
    }, [origins, chosenCharacteristics, data, characteristics, unlockManualMod, specialtyPointsInfo, isDistributableMode, onChange]);

    const handleSetChosenCharacteristic = useCallback((originKey: string, charId: string) => {
        const updated = {
            ...chosenCharacteristics,
            [originKey]: charId
        };
        onChange({
            ...data,
            chosenCharacteristics: updated,
            chosenBonusCharacteristic: charId
        });
    }, [chosenCharacteristics, data, onChange]);

    return {
        characteristics,
        chosenCharacteristics,
        choosableEntries,
        setChosenCharacteristic: handleSetChosenCharacteristic,
        chosenBonusCharacteristic: choosableEntries.length > 0 ? (chosenCharacteristics[choosableEntries[0].originKey] || null) : null,
        setChosenBonusCharacteristic: (charId: string) => {
            if (choosableEntries.length > 0) {
                handleSetChosenCharacteristic(choosableEntries[0].originKey, charId);
            }
        },
        isDistributableMode,
        pointsInfo,
        choosableInfo,
        specialtyPointsInfo,
        pcValues,
        totalPC,
        getTotal,
        handleCharacteristicChange,
        origins,
        unlockManualMod,
        setUnlockManualMod: (value: boolean) => {
            onChange({
                ...data,
                uiState: {
                    ...data?.uiState,
                    unlockManualCharacteristics: value
                }
            });
        }
    };
}
