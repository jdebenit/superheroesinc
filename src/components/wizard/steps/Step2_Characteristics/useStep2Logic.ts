import { useState, useEffect, useCallback } from 'react';
import { POWERS } from '../../../../data/powers';
import {
    calculateOriginModifiers,
    calculateLimits,
    hasChoosableCharacteristic,
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

export function useStep2Logic(data: any, onChange: (updates: any) => void) {
    const [characteristics, setCharacteristics] = useState<{
        [key: string]: {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
            otherMod: number;
        }
    }>(() => {
        if (data.attributes?.breakdown) {
            const restored = { ...data.attributes.breakdown };
            Object.keys(restored).forEach(key => {
                if (typeof restored[key].otherMod !== 'number') {
                    restored[key].otherMod = 0;
                }
            });
            return restored;
        }
        return {
            fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 },
            voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0, otherMod: 0 }
        };
    });

    const [unlockManualMod, setUnlockManualMod] = useState<boolean>(() => {
        return !!data.uiState?.unlockManualCharacteristics;
    });

    const [chosenBonusCharacteristic, setChosenBonusCharacteristic] = useState<string | null>(null);

    // Derived values
    const origins = data.origin?.items || [];
    const isDistributableMode = hasDistributablePoints(origins) || !!hasChoosableCharacteristic(origins);
    const pointsInfo = isDistributableMode ? getDistributablePointsInfo(origins, characteristics, chosenBonusCharacteristic) : null;
    const choosableInfo = hasChoosableCharacteristic(origins);
    const specialtyPointsInfo = hasSpecialtyDistributablePoints(origins) ? getSpecialtyDistributablePointsInfo(origins, characteristics) : null;
    const { pcValues } = calculateCreationPoints(characteristics, origins);

    const getTotal = useCallback((charId: string) => {
        const c = characteristics[charId];
        return c.base + c.originMod + c.specialtyMod + c.powerMod + (c.otherMod || 0);
    }, [characteristics]);

    // Update modifiers when origins or chosen bonus changes
    useEffect(() => {
        const originMods = calculateOriginModifiers(origins, chosenBonusCharacteristic);
        const specialtyMods = calculateSpecialtyModifiers(origins);

        setCharacteristics(prev => {
            const updated = { ...prev };
            let hasChanges = false;
            
            const isDist = hasDistributablePoints(origins) || !!hasChoosableCharacteristic(origins);
            const pInfo = isDist ? getDistributablePointsInfo(origins, prev, chosenBonusCharacteristic) : { total: 0, used: 0 };
            const sInfo = hasSpecialtyDistributablePoints(origins) ? getSpecialtyDistributablePointsInfo(origins, prev) : { total: 0, used: 0 };

            const keepManualOM = pInfo.used <= pInfo.total && pInfo.total > 0;
            const keepManualSM = sInfo.used <= sInfo.total && sInfo.total > 0;

            Object.keys(updated).forEach(key => {
                const newOM = originMods[key] || 0;
                const newSM = specialtyMods[key] || 0;
                
                let targetOM = newOM;
                let targetSM = newSM;
                
                if (keepManualOM && updated[key].originMod > newOM) {
                    targetOM = updated[key].originMod;
                } else if (updated[key].originMod < newOM || pInfo.total === 0) {
                    targetOM = newOM;
                }
                
                if (keepManualSM && updated[key].specialtyMod > newSM) {
                    targetSM = updated[key].specialtyMod;
                } else if (updated[key].specialtyMod < newSM || sInfo.total === 0) {
                    targetSM = newSM;
                }

                if (updated[key].originMod !== targetOM || updated[key].specialtyMod !== targetSM) {
                    updated[key] = {
                        ...updated[key],
                        originMod: targetOM,
                        specialtyMod: targetSM
                    };
                    hasChanges = true;
                }
            });
            return hasChanges ? updated : prev;
        });
    }, [data.origin, chosenBonusCharacteristic]);

    // Update power modifiers
    useEffect(() => {
        const selectedPowers = data.powers?.selected || [];
        const powerMods: { [key: string]: number } = {};

        selectedPowers.forEach((p: any) => {
            const powerData = POWERS.find(pd => pd.id === p.id);
            if (powerData?.characteristic) {
                const charMap: Record<string, string> = {
                    'FUE': 'fuerza', 'AGI': 'agilidad', 'CON': 'constitucion',
                    'INT': 'inteligencia', 'PER': 'percepcion', 'APA': 'apariencia',
                    'VOL': 'voluntad'
                };
                const charId = charMap[powerData.characteristic];
                if (charId) {
                    const mod = Number(p.powerMod) || 0;
                    powerMods[charId] = (powerMods[charId] || 0) + mod;
                }
            }
        });

        setCharacteristics(prev => {
            let hasChanges = false;
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                const newMod = powerMods[key] || 0;
                if (updated[key].powerMod !== newMod) {
                    updated[key] = { ...updated[key], powerMod: newMod };
                    hasChanges = true;
                }
            });
            return hasChanges ? updated : prev;
        });
    }, [JSON.stringify(data.powers?.selected)]);

    // Sync with otherMod from data
    useEffect(() => {
        if (data.attributes?.breakdown) {
            setCharacteristics(prev => {
                const newState = { ...prev };
                let hasChanges = false;
                Object.keys(data.attributes.breakdown).forEach(key => {
                    const otherModVal = data.attributes.breakdown[key].otherMod || 0;
                    if (newState[key].otherMod !== otherModVal) {
                        newState[key] = { ...newState[key], otherMod: otherModVal };
                        hasChanges = true;
                    }
                });
                return hasChanges ? newState : prev;
            });
        }
    }, [data.attributes?.breakdown]);

    // Push changes back to parent
    useEffect(() => {
        const values: { [key: string]: number } = {};
        let changed = false;

        CHARACTERISTICS_CONFIG.forEach(char => {
            const total = getTotal(char.id);
            values[char.name] = total;
            if (data.attributes?.values?.[char.name] !== total) {
                changed = true;
            }
        });

        // Also check if breakdown matches
        if (JSON.stringify(data.attributes?.breakdown) !== JSON.stringify(characteristics)) {
            changed = true;
        }

        if (changed) {
            onChange({
                ...data,
                attributes: {
                    values,
                    breakdown: characteristics
                }
            });
        }
    }, [characteristics]);

    const handleCharacteristicChange = (charId: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        const defaultLimits = calculateLimits(origins, charId);
        const hasPowerMod = characteristics[charId].powerMod > 0;
        const limits = {
            min: defaultLimits.min,
            max: (hasPowerMod || unlockManualMod) ? 200 : defaultLimits.max
        };

        let clampedValue = Math.max(0, Math.min(limits.max, numValue));

        // Group-wise validation (Specialty Points)
        if (field === 'specialtyMod' && specialtyPointsInfo) {
            const allowedChars = calculateSpecialtyAllowedCharacteristics(origins);
            if (allowedChars && !allowedChars.includes(charId)) return;

            const fixedMods = calculateSpecialtyModifiers(origins);
            const fixedMod = fixedMods[charId] || 0;
            if (clampedValue < fixedMod) clampedValue = fixedMod;

            const newManualPoints = Math.max(0, clampedValue - fixedMod);
            const currentManualPoints = Math.max(0, characteristics[charId].specialtyMod - fixedMod);
            const pointsDiff = newManualPoints - currentManualPoints;

            if (specialtyPointsInfo.remaining - pointsDiff < 0) return;
        }

        // Group-wise validation (Origin Points)
        if (field === 'originMod' && isDistributableMode) {
            const fixedOriginMods = calculateOriginModifiers(origins, chosenBonusCharacteristic);
            const minAllowed = fixedOriginMods[charId] || 0;
            if (clampedValue < minAllowed) clampedValue = minAllowed;

            const currentOriginMod = characteristics[charId].originMod;
            const pointsInfoCurrent = getDistributablePointsInfo(origins, characteristics, chosenBonusCharacteristic);
            const difference = clampedValue - currentOriginMod;

            if (pointsInfoCurrent.used + difference > pointsInfoCurrent.total) {
                clampedValue = currentOriginMod + (pointsInfoCurrent.total - pointsInfoCurrent.used);
            }
        }

        // Final total constraint check
        const currentChar = characteristics[charId];
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
            clampedValue = Math.max(0, limits.max - otherValues);
        }

        setCharacteristics(prev => ({
            ...prev,
            [charId]: { ...prev[charId], [field]: clampedValue }
        }));
    };

    return {
        characteristics,
        chosenBonusCharacteristic,
        setChosenBonusCharacteristic,
        isDistributableMode,
        pointsInfo,
        choosableInfo,
        specialtyPointsInfo,
        pcValues,
        getTotal,
        handleCharacteristicChange,
        origins,
        unlockManualMod,
        setUnlockManualMod: (value: boolean) => {
            setUnlockManualMod(value);
            onChange({
                ...data,
                uiState: {
                    ...data.uiState,
                    unlockManualCharacteristics: value
                }
            });
        }
    };
}
