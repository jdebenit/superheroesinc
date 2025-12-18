import React, { useState, useEffect } from 'react';
import { ORIGIN_CHARACTERISTIC_MODIFIERS } from '../../../data/characteristicModifiers';

interface Step2Props {
    data: any;
    onChange: (updates: any) => void;
}

const CHARACTERISTICS = [
    { id: 'fuerza', name: 'Fuerza', abbr: 'FUE' },
    { id: 'constitucion', name: 'Constitución', abbr: 'CON' },
    { id: 'agilidad', name: 'Agilidad', abbr: 'AGI' },
    { id: 'inteligencia', name: 'Inteligencia', abbr: 'INT' },
    { id: 'percepcion', name: 'Percepción', abbr: 'PER' },
    { id: 'apariencia', name: 'Apariencia', abbr: 'APA' },
    { id: 'voluntad', name: 'Voluntad', abbr: 'VOL' }
];

export default function Step2_Characteristics({ data, onChange }: Step2Props) {
    const [characteristics, setCharacteristics] = useState<{
        [key: string]: {
            base: number;
            originMod: number;
            specialtyMod: number;
            powerMod: number;
        }
    }>({
        fuerza: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        constitucion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        agilidad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        inteligencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        percepcion: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        apariencia: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 },
        voluntad: { base: 40, originMod: 0, specialtyMod: 0, powerMod: 0 }
    });

    // Estado para guardar la característica elegida para el bonus fijo (ej: Heraldo Cósmico)
    const [chosenBonusCharacteristic, setChosenBonusCharacteristic] = useState<string | null>(null);


    // Detectar si algún origen tiene característica elegible
    const hasChoosableCharacteristic = () => {
        if (!data.origin || !data.origin.items || data.origin.items.length === 0) {
            return null;
        }

        for (const item of data.origin.items) {
            const originName = Object.keys(item)[0];
            const modifierData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
            if (modifierData && modifierData.choosableCharacteristic) {
                return modifierData.choosableCharacteristic;
            }
        }
        return null;
    };

    const calculateOriginModifiers = () => {
        const modifiers: { [key: string]: number } = {
            fuerza: 0,
            constitucion: 0,
            agilidad: 0,
            inteligencia: 0,
            percepcion: 0,
            apariencia: 0,
            voluntad: 0
        };

        if (!data.origin || !data.origin.items || data.origin.items.length === 0) {
            return modifiers;
        }

        // Tomar el MÁXIMO de los modificadores (no sumar) para cada característica
        data.origin.items.forEach((item: any) => {
            const originName = Object.keys(item)[0];
            const modifierData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
            if (modifierData) {
                Object.keys(modifiers).forEach(charId => {
                    const charMod = modifierData[charId as keyof typeof modifierData];
                    // Verificar que charMod es un CharacteristicModifier y no distributablePoints
                    if (charMod && typeof charMod === 'object' && 'modifier' in charMod && charMod.modifier) {
                        // Tomar el MAYOR modificador, no sumar
                        modifiers[charId] = Math.max(modifiers[charId], charMod.modifier);
                    }
                });

                // Si tiene choosableCharacteristic y hay una característica elegida, añadir el bonus
                if (modifierData.choosableCharacteristic && chosenBonusCharacteristic) {
                    modifiers[chosenBonusCharacteristic] = Math.max(
                        modifiers[chosenBonusCharacteristic],
                        modifierData.choosableCharacteristic.bonus
                    );
                }
            }
        });

        return modifiers;
    };

    const calculateLimits = (charId: string) => {
        if (!data.origin || !data.origin.items || data.origin.items.length === 0) {
            return { min: 40, max: 100 };
        }

        // Tomar el máximo de max y el mínimo de min para esta característica
        let maxLimit = 100;
        let minLimit = 40;  // Por defecto 40
        let hasSpecificMin = false;

        data.origin.items.forEach((item: any) => {
            const originName = Object.keys(item)[0];
            const modifierData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
            if (modifierData) {
                const charMod = modifierData[charId as keyof typeof modifierData];
                // Verificar que charMod es un CharacteristicModifier
                if (charMod && typeof charMod === 'object' && 'max' in charMod) {
                    if (charMod.max && charMod.max > maxLimit) {
                        maxLimit = charMod.max;
                    }
                    // Si tiene un min definido, tomar el MENOR (no el mayor)
                    if (charMod.min !== undefined) {
                        if (!hasSpecificMin) {
                            minLimit = charMod.min;
                            hasSpecificMin = true;
                        } else if (charMod.min < minLimit) {
                            minLimit = charMod.min;
                        }
                    }
                }
            }
        });

        return { min: minLimit, max: maxLimit };
    };

    // Detectar si algún origen tiene puntos distribuibles
    const hasDistributablePoints = () => {
        if (!data.origin || !data.origin.items || data.origin.items.length === 0) {
            return false;
        }

        return data.origin.items.some((item: any) => {
            const originName = Object.keys(item)[0];
            const modifierData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
            return modifierData && modifierData.distributablePoints !== undefined;
        });
    };

    // Obtener total de puntos distribuibles disponibles
    const getDistributablePointsInfo = () => {
        let totalAvailable = 0;
        if (!data.origin || !data.origin.items || data.origin.items.length === 0) {
            return { total: 0, used: 0, remaining: 0 };
        }

        data.origin.items.forEach((item: any) => {
            const originName = Object.keys(item)[0];
            const modifierData = ORIGIN_CHARACTERISTIC_MODIFIERS[originName];
            if (modifierData) {
                // Puntos distribuibles normales
                if (modifierData.distributablePoints) {
                    totalAvailable += modifierData.distributablePoints;
                }
                // Puntos distribuibles de choosableCharacteristic
                if (modifierData.choosableCharacteristic && modifierData.choosableCharacteristic.distributablePoints) {
                    totalAvailable += modifierData.choosableCharacteristic.distributablePoints;
                }
            }
        });

        // Calcular puntos usados (excluyendo el bonus fijo de choosableCharacteristic)
        let used = 0;
        const choosable = hasChoosableCharacteristic();
        Object.keys(characteristics).forEach(charId => {
            // Si esta característica tiene el bonus fijo, no contar ese bonus en los puntos usados
            if (choosable && charId === chosenBonusCharacteristic) {
                used += Math.max(0, characteristics[charId].originMod - choosable.bonus);
            } else {
                used += characteristics[charId].originMod;
            }
        });

        return { total: totalAvailable, used, remaining: totalAvailable - used };
    };

    // Actualizar modificadores de origen cuando cambian los orígenes o la característica elegida
    // Solo auto-calcula para orígenes SIN puntos distribuibles
    useEffect(() => {
        if (hasDistributablePoints() || hasChoosableCharacteristic()) {
            // No auto-calcular si hay puntos distribuibles o característica elegible
            // Pero sí aplicar el bonus fijo si hay una característica elegida
            if (hasChoosableCharacteristic() && chosenBonusCharacteristic) {
                const originMods = calculateOriginModifiers();

                setCharacteristics(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        updated[key] = {
                            ...updated[key],
                            originMod: originMods[key] || 0
                        };
                    });
                    return updated;
                });
            }
            return;
        }

        const originMods = calculateOriginModifiers();

        setCharacteristics(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                updated[key] = {
                    ...updated[key],
                    originMod: originMods[key] || 0
                };
            });
            return updated;
        });
    }, [data.origin, chosenBonusCharacteristic]);

    const handleCharacteristicChange = (charId: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        const limits = calculateLimits(charId);

        // NO aplicamos el límite mínimo - es solo informativo
        // Solo validamos que sea >= 0 y <= max
        let clampedValue = Math.max(0, Math.min(limits.max, numValue));

        // Si estamos editando el modificador de origen y hay puntos distribuibles
        if (field === 'originMod' && isDistributableMode) {
            const pointsInfo = getDistributablePointsInfo();

            // Calcular cuántos puntos usaríamos con este nuevo valor
            const currentOriginMod = characteristics[charId].originMod;
            const difference = clampedValue - currentOriginMod;
            const newTotal = pointsInfo.used + difference;

            // Si excedería el total, limitar al máximo permitido
            if (newTotal > pointsInfo.total) {
                clampedValue = currentOriginMod + (pointsInfo.total - pointsInfo.used);
            }
        }

        // Verificar que el total no exceda el límite máximo
        const currentChar = characteristics[charId];
        const projectedTotal =
            (field === 'base' ? clampedValue : currentChar.base) +
            (field === 'originMod' ? clampedValue : currentChar.originMod) +
            (field === 'specialtyMod' ? clampedValue : currentChar.specialtyMod) +
            (field === 'powerMod' ? clampedValue : currentChar.powerMod);

        // Si el total excede el máximo, reducir el valor que se está editando
        if (projectedTotal > limits.max) {
            const otherValues =
                (field !== 'base' ? currentChar.base : 0) +
                (field !== 'originMod' ? currentChar.originMod : 0) +
                (field !== 'specialtyMod' ? currentChar.specialtyMod : 0) +
                (field !== 'powerMod' ? currentChar.powerMod : 0);
            clampedValue = Math.max(0, limits.max - otherValues);
        }

        const newCharacteristics = {
            ...characteristics,
            [charId]: {
                ...characteristics[charId],
                [field]: clampedValue
            }
        };

        setCharacteristics(newCharacteristics);
        updateCharacterData(newCharacteristics);
    };

    const updateCharacterData = (chars: typeof characteristics) => {
        const values: { [key: string]: number } = {};

        CHARACTERISTICS.forEach(char => {
            const c = chars[char.id];
            values[char.name] = c.base + c.originMod + c.specialtyMod + c.powerMod;
        });

        onChange({
            ...data,
            attributes: {
                values
            }
        });
    };

    const getTotal = (charId: string) => {
        const c = characteristics[charId];
        return c.base + c.originMod + c.specialtyMod + c.powerMod;
    };

    const isDistributableMode = hasDistributablePoints() || hasChoosableCharacteristic();
    const pointsInfo = isDistributableMode ? getDistributablePointsInfo() : null;
    const choosableInfo = hasChoosableCharacteristic();

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Características del Personaje
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                {isDistributableMode
                    ? 'Distribuye los puntos de origen entre las características. Cada característica puede tener límites diferentes.'
                    : 'Define las características base y sus modificadores. Los modificadores de origen se calculan automáticamente según los orígenes seleccionados. Cada característica puede tener límites diferentes.'}
            </p>

            {/* Choosable Characteristic Selector */}
            {choosableInfo && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: '#fef3c7',
                    border: '3px solid #f59e0b',
                    borderRadius: '12px'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        color: '#92400e'
                    }}>
                        ⭐ Elige la característica para el bonus de +{choosableInfo.bonus}
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '0.75rem'
                    }}>
                        {CHARACTERISTICS.map(char => (
                            <button
                                key={char.id}
                                onClick={() => setChosenBonusCharacteristic(char.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    borderRadius: '8px',
                                    border: chosenBonusCharacteristic === char.id
                                        ? '3px solid #16a34a'
                                        : '2px solid #d1d5db',
                                    backgroundColor: chosenBonusCharacteristic === char.id
                                        ? '#dcfce7'
                                        : 'white',
                                    color: chosenBonusCharacteristic === char.id
                                        ? '#166534'
                                        : '#4b5563',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {char.name} {chosenBonusCharacteristic === char.id && '✓'}
                            </button>
                        ))}
                    </div>
                    {choosableInfo.distributablePoints && (
                        <p style={{
                            marginTop: '0.75rem',
                            fontSize: '0.875rem',
                            color: '#92400e'
                        }}>
                            Además, puedes distribuir {choosableInfo.distributablePoints} puntos adicionales entre todas las características.
                        </p>
                    )}
                </div>
            )}

            {/* Distributable Points Counter */}
            {isDistributableMode && pointsInfo && (
                <div style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    backgroundColor: pointsInfo.remaining >= 0 ? '#dbeafe' : '#fee2e2',
                    border: `3px solid ${pointsInfo.remaining >= 0 ? '#2563eb' : '#dc2626'}`,
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    fontSize: '1.125rem',
                    fontWeight: 'bold'
                }}>
                    📊 Puntos de Origen: {pointsInfo.used}/{pointsInfo.total}
                    <span style={{
                        marginLeft: '1rem',
                        color: pointsInfo.remaining >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                        ({pointsInfo.remaining >= 0 ? `${pointsInfo.remaining} restantes` : `${Math.abs(pointsInfo.remaining)} excedido`})
                    </span>
                </div>
            )}

            {/* Characteristics Grid */}
            <div style={{
                display: 'grid',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {CHARACTERISTICS.map((char) => {
                    const total = getTotal(char.id);
                    const c = characteristics[char.id];
                    const charLimits = calculateLimits(char.id);

                    return (
                        <div
                            key={char.id}
                            style={{
                                padding: '1.5rem',
                                backgroundColor: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '2px solid #e5e7eb'
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        color: '#1f2937'
                                    }}>
                                        {char.name}
                                    </span>
                                    <span style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#9ca3af',
                                        fontWeight: 'bold'
                                    }}>
                                        ({char.abbr})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: '#2563eb',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#eff6ff',
                                        borderRadius: '8px',
                                        minWidth: '80px',
                                        textAlign: 'center'
                                    }}>
                                        {total}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        lineHeight: '1.2'
                                    }}>
                                        <div style={{ color: '#dc2626' }}>Min: {charLimits.min}</div>
                                        <div style={{ color: '#16a34a' }}>Max: {charLimits.max}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Inputs Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem'
                            }}>
                                {/* Base */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4b5563',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Base
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.base}
                                        onChange={(e) => handleCharacteristicChange(char.id, 'base', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            border: '2px solid #d1d5db',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </div>

                                {/* Origin Modifier - Editable in distributable mode */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4b5563',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {isDistributableMode ? 'Mod. Origen' : 'Mod. Origen (Auto)'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.originMod}
                                        readOnly={!isDistributableMode}
                                        onChange={isDistributableMode ? (e) => handleCharacteristicChange(char.id, 'originMod', e.target.value) : undefined}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            border: `2px solid ${isDistributableMode ? '#2563eb' : '#f59e0b'}`,
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: isDistributableMode ? 'white' : '#fef3c7',
                                            cursor: isDistributableMode ? 'text' : 'not-allowed',
                                            color: isDistributableMode ? '#1f2937' : '#92400e'
                                        }}
                                    />
                                </div>

                                {/* Specialty Modifier */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4b5563',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Mod. Especialidad
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.specialtyMod}
                                        onChange={(e) => handleCharacteristicChange(char.id, 'specialtyMod', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            border: '2px solid #d1d5db',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: '#dbeafe'
                                        }}
                                    />
                                </div>

                                {/* Power Modifier */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        color: '#4b5563',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Mod. Poder
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="200"
                                        value={c.powerMod}
                                        onChange={(e) => handleCharacteristicChange(char.id, 'powerMod', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            border: '2px solid #d1d5db',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: '#fce7f3'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Formula */}
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                textAlign: 'center',
                                fontFamily: 'monospace'
                            }}>
                                {c.base} + {c.originMod} + {c.specialtyMod} + {c.powerMod} = <strong style={{ color: '#2563eb' }}>{total}</strong>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f0f9ff',
                border: '2px solid #2563eb',
                borderRadius: '12px'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e40af' }}>
                    Resumen de Características
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem'
                }}>
                    {CHARACTERISTICS.map(char => (
                        <div
                            key={char.id}
                            style={{
                                textAlign: 'center',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '2px solid #bfdbfe'
                            }}
                        >
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {char.abbr}
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                                {getTotal(char.id)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
